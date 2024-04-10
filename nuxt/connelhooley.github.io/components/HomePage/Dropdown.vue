<script setup>
const props = defineProps({
  id: {
    type: String,
  },
  mode: {
    type: String,
  },
});

const open = ref(false);
</script>

<template>
  <div class="relative mb-4 last:mb-0" role="menu" tabindex="-1" aria-haspopup="true" :aria-expanded=open>
    <HomePageButton :id="id" class="relative z-50" :is="'button'" :mode="mode" @click="open = !open">
      <slot name="button-content" />
    </HomePageButton>
    <div :aria-labelledby="id" :class="{
      'hidden': !open,
      'z-50 border border-gray-900 block absolute bottom-full': open,
    }">
      <slot name="dropdown-content" />
    </div>
  </div>
  <div v-if="open" class="fixed z-40 inset-0 bg-gray-500/75" tabindex="-1" @focusin="open = false"></div>
  <EscPress v-if="open" @esc="open=false" />
</template>
