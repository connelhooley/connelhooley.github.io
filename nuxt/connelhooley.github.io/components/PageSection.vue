<script lang="ts" setup>
defineProps<{ narrow?: boolean }>();
</script>

<template>
  <section :class="['my-8', { 'max-w-[700px]': narrow }]">
    <slot />
  </section>
</template>
