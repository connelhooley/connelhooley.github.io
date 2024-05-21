<script lang="ts" setup>
defineProps<{ active?: boolean }>();
</script>

<template>
  <div :class="['h-screen w-screen hidden', { 'block': active }]">
    <slot />
  </div>
</template>
