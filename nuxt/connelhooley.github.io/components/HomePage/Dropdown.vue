<script lang="ts" setup>
defineProps<{ id: string }>();
const open = ref(false);
</script>

<template>
  <div class="relative mb-4 last:mb-0" role="menu" tabindex="-1" aria-haspopup="true" :aria-expanded=open>
    <div @click="open = !open">
      <slot name="button" :id="id" :open="open" />
    </div>
    <div :aria-labelledby="id" :class="{
      'hidden': !open,
      'z-50 border border-gray-900 block absolute bottom-full': open,
    }">
      <slot />
    </div>
  </div>
  <HomePageDropdownBackdrop v-if="open" class="fixed z-40 inset-0 bg-gray-500/75" @close="open = false" />
</template>
