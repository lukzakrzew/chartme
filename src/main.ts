import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import { createPinia } from "pinia";
import quasarIconSet from "quasar/icon-set/material-icons";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { useLogsStore } from "./stores/Logs";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const app = createApp(App);
const pinia = createPinia();

app.use(Quasar, {
  plugins: {
    Notify,
  },
  iconSet: quasarIconSet,
});
app.use(router);
app.use(pinia);

app.mount("#app");

// Add global debug functions for development
if (import.meta.env.DEV) {
  // Make debug functions available globally in dev tools
  (window as any).debugShiftLogs = (days: number = -1) => {
    const logsStore = useLogsStore();
    logsStore.shiftAllLogsDays(days);
    console.log(`✅ Shifted all logs by ${days} days`);
  };

  (window as any).debugShiftLogsBack = () => {
    const logsStore = useLogsStore();
    logsStore.debugShiftLogsOneDayEarlier();
    console.log("✅ Shifted all logs one day earlier");
  };

  (window as any).debugShiftLogsForward = () => {
    const logsStore = useLogsStore();
    logsStore.debugShiftLogsOneDayLater();
    console.log("✅ Shifted all logs one day later");
  };

  (window as any).debugResetAndLoadTestData = () => {
    const logsStore = useLogsStore();
    logsStore.debugResetAndLoadTestData();
    console.log("✅ Cleared all data and loaded test data");
  };

  console.log("🔧 Debug functions available:");
  console.log(
    "  debugShiftLogs(days) - Shift all logs by N days (negative for past)"
  );
  console.log("  debugShiftLogsBack() - Shift all logs one day earlier");
  console.log("  debugShiftLogsForward() - Shift all logs one day later");
  console.log(
    "  debugResetAndLoadTestData() - Clear all data and load test data"
  );
  console.log(
    "  Example: debugShiftLogs(-1) to shift all logs one day earlier"
  );
}
