<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-[#09090B] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500"
  >
    <Sidebar />

    <main
      class="flex-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
      :class="isSidebarOpen ? 'ml-60' : 'ml-20'"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/layout/Sidebar.vue";

const isSidebarOpen = ref(true);

const handleSidebarToggle = (event: Event) => {
  const customEvent = event as CustomEvent;
  isSidebarOpen.value = customEvent.detail;
};

onMounted(() => {
  window.addEventListener("sidebar-toggle", handleSidebarToggle);
});

onUnmounted(() => {
  window.removeEventListener("sidebar-toggle", handleSidebarToggle);
});
</script>

<style>
/* 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
