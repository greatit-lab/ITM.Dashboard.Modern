<template>
  <header
    class="h-14 flex items-center justify-end px-6 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-500 z-40 sticky top-0"
  >
    <div class="flex items-center gap-3">
      <button
        @click="toggleDarkMode"
        class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none border-2 border-slate-200 dark:border-zinc-700"
        :class="isDark ? 'bg-zinc-800' : 'bg-slate-100'"
      >
        <div class="w-full flex justify-between px-2 z-0">
          <i class="pi pi-sun text-[9px] text-slate-400 dark:text-zinc-500"></i>
          <i
            class="pi pi-moon text-[9px] text-slate-400 dark:text-zinc-500"
          ></i>
        </div>
        <div
          class="absolute top-0.5 w-6 h-6 bg-white dark:bg-zinc-600 rounded-full shadow-sm transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center z-10 border border-slate-100 dark:border-zinc-500"
          :class="isDark ? 'translate-x-[26px]' : 'translate-x-0.5'"
        >
          <i
            class="pi text-[9px]"
            :class="isDark ? 'pi-moon text-white' : 'pi-sun text-amber-500'"
          ></i>
        </div>
      </button>

      <div class="h-6 w-px bg-slate-200 dark:bg-zinc-700 mx-2"></div>

      <button
        class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative"
      >
        <i class="pi pi-bell text-lg"></i>
        <span
          class="absolute top-1 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-[#09090B]"
        ></span>
      </button>

      <button
        class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <i class="pi pi-cog text-lg"></i>
      </button>

      <div
        class="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div class="text-right hidden sm:block">
          <p
            class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight"
          >
            Admin
          </p>
          <p class="text-[10px] text-slate-400 font-medium">Manager</p>
        </div>
        <div
          class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-zinc-800 text-xs"
        >
          A
        </div>
        <i class="pi pi-chevron-down text-[10px] text-slate-400"></i>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }
};

onMounted(() => {
  isDark.value =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark.value) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
});
</script>
