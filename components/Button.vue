<script lang="ts" setup>
withDefaults(defineProps<{ is?: string | Component }>(), {
  is: "button",
});
</script>

<template>
  <component :is="is" class="inline-block p-4 text-center bg-primary text-white hover:bg-primary-dark transition-colors duration-400 invert-selection">
    <slot />
  </component>
</template>
