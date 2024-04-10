<script setup>
const props = defineProps({
  is: {
    type: String,
    default: "div",
  },
});
</script>

<template>
  <component :is="is" class="container mx-auto px-4">
    <slot />
  </component>
</template>
