<script lang="ts" setup>
defineProps<{ to: string }>();
</script>

<template>
  <NuxtLink :to="to" :class="[
    'px-6 py-3 items-center justify-center transition-colors duration-300 text-base text-right sm:p-6 sm:text-center sm:flex hover:text-primary',
    { 'text-primary font-bold sm:shadow-primary-b': $route.path.startsWith(to) }]">
    <slot />
  </NuxtLink>
</template>