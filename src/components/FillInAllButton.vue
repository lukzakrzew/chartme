<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToFillInAll = () => {
  router.push("/fill-in-all");
};
</script>

<template>
  <button @click="navigateToFillInAll" class="fill-in-all-btn">
    <span class="icon">✨</span>
    <span class="text">Fill</span>
  </button>
</template>

<style scoped>
.fill-in-all-btn {
  width: 120px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  justify-content: center;
}

.fill-in-all-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.fill-in-all-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.fill-in-all-btn .icon {
  font-size: 1.3em;
  transition: transform 0.3s ease;
}

.fill-in-all-btn:hover .icon {
  animation: sparkle 0.6s ease-in-out;
}

.fill-in-all-btn .text {
  letter-spacing: 0.5px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.8;
  }
}
</style>
