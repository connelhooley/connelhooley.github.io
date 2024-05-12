<script lang="ts" setup>
import { Button } from '#components';

withDefaults(defineProps<{ is?: string | Component }>(), {
  is: Button,
});
</script>

<template>
  <component :is="is" class="p-2 text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-400">
    <slot />
  </component>
</template>