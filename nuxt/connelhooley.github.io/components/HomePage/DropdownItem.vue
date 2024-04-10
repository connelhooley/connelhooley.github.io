<script setup>
import { NuxtLink } from "#components";

const props = defineProps({
  is: {
    default: NuxtLink,
  },
});

</script>

<template>
  <component :is="is" role="menuitem" class="text-left block w-full bg-white text-black hover:bg-primary-light px-6 py-3 text-lg">
    <slot />
  </component>
</template>
