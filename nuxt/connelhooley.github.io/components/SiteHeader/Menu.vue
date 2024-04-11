<script setup>
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

const open = ref(false);
</script>

<template>
  <div class="flex sm:hidden flex-grow justify-end items-center p-6" @click.prevent="open = !open">
    <slot name="mobile-button" :open="open" />
  </div>
  <div :class="{
    'flex-grow justify-end items-stretch': true,
    'flex flex-col w-full sm:flex-row': open,
    'hidden sm:flex': !open
  }">
    <slot />
  </div>
</template>