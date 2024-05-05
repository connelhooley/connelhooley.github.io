<script lang="ts" setup>
withDefaults(defineProps<{ is?: string | Component }>(), {
  is: "div"
});
</script>

<template>
  <component :is="is" class="container mx-auto px-4">
    <slot />
  </component>
</template>
