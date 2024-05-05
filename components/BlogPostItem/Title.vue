<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <PageItemTitle>
    <NuxtLink class="text-primary no-underline hover:underline" v-bind="$attrs">
      <slot />
    </NuxtLink>
  </PageItemTitle>
</template>
