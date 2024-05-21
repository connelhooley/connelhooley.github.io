<script lang="ts" setup>
import { NuxtLink } from "#components";
interface Props {
  is?: string | Component,
  mode: string,
  active?: boolean,
}

withDefaults(defineProps<Props>(), {
  is: NuxtLink,
});
</script>

<template>
  <component :is="is" :class="[
    'block text-center w-full transition-colors duration-400 p-6 text-xl mb-4 last:mb-0',
    {
      'bg-black text-white hover:text-primary': mode === 'primary',
      'text-primary': mode === 'primary' && active,
      'bg-gray-700 text-primary border border-primary hover:bg-primary hover:text-white': mode === 'secondary',
      'bg-primary text-white': mode === 'secondary' && active,
    }
  ]">
    <slot />
  </component>
</template>
