<script lang="ts" setup>
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

defineProps<{ open: boolean }>();
</script>

<template>
  <button class="p-3 border border-gray-700 text-white transition-colors duration-300 hover:text-primary">
    <font-awesome-icon fixed-width :icon="open ? faXmark : faBars" />
    <span class="sr-only">{{ open ? "Close" : "Open" }} menu</span>
  </button>
</template>
