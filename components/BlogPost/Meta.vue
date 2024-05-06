<script lang="ts" setup>
defineProps<{ large?: boolean }>();
</script>

<template>
  <div :class="['text-black', { 'text-md': !large, 'text-lg': large }]">
    <slot />
  </div>
</template>