// Service Worker for ChartMe notifications
const CACHE_NAME = "chartme-v1";
const NOTIFICATION_TAG = "chartme-daily-reminder";

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service worker installing");
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service worker activating");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// This will be replaced by workbox with the manifest
self.__WB_MANIFEST;

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    scheduleNotification(event.data.time);
  } else if (event.data && event.data.type === "CANCEL_NOTIFICATION") {
    cancelScheduledNotification();
  }
});

// Schedule a notification for a specific time
function scheduleNotification(notificationTime) {
  const now = new Date();
  const [hours, minutes] = notificationTime.split(":").map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  console.log(
    `Scheduling notification for ${scheduledTime.toISOString()} (in ${Math.round(
      delay / 1000 / 60
    )} minutes)`
  );

  // Use a timeout to schedule the notification
  // Note: This will only work while the service worker is running
  // For more reliable scheduling, we'd need periodic background sync
  setTimeout(() => {
    showNotification();
  }, delay);
}

// Cancel any scheduled notifications
function cancelScheduledNotification() {
  // In a more sophisticated implementation, we'd track timeout IDs
  console.log("Notification scheduling cancelled");
}

// Show the actual notification
function showNotification() {
  const options = {
    body: "Don't forget to track your progress.",
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    silent: false,
    actions: [
      {
        action: "open",
        title: "Open ChartMe",
      },
    ],
  };

  self.registration.showNotification("ChartMe Daily Reminder", options);

  // Reschedule for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const notificationTime = getStoredNotificationTime();
  if (notificationTime) {
    scheduleNotification(notificationTime);
  }
}

// Get stored notification time from IndexedDB or similar
// This is a simplified version - in practice you'd use a proper storage mechanism
function getStoredNotificationTime() {
  // For now, return a default time - this should be configurable
  return "19:00"; // 7 PM default
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "open") {
    // Open the app
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there is already a window/tab open with the target URL
          for (let client of windowClients) {
            if (client.url.includes("/chartme/") && "focus" in client) {
              return client.focus();
            }
          }
          // If not, open a new window/tab with the target URL
          if (clients.openWindow) {
            return clients.openWindow("/chartme/");
          }
        })
    );
  }
});

// Handle periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-reminder") {
    event.waitUntil(checkAndShowNotification());
  }
});

// Check if it's time to show notification
async function checkAndShowNotification() {
  const notificationTime = getStoredNotificationTime();
  if (!notificationTime) return;

  const now = new Date();
  const [hours, minutes] = notificationTime.split(":").map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);

  // Check if it's within a reasonable window of the scheduled time
  const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
  const fiveMinuteWindow = 5 * 60 * 1000; // 5 minutes

  if (timeDiff <= fiveMinuteWindow) {
    showNotification();
  }
}
