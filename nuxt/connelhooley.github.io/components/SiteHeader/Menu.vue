<script setup>
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const open = ref(false);
</script>

<template>
  <div class="flex sm:hidden flex-grow justify-end items-center p-6">
    <button class="p-3 border border-gray-700 text-white transition-colors duration-300 hover:text-primary" @click.prevent="open = !open">
      <font-awesome-icon fixed-width :icon="open ? faXmark : faBars" />
      <span class="sr-only">{{ open ? "Close" : "Open" }} menu</span>
    </button>
  </div>
  <div :class="{
    'flex-grow justify-end items-stretch': true,
    'flex flex-col w-full sm:flex-row': open,
    'hidden sm:flex': !open
  }">
    <slot />
  </div>
</template>