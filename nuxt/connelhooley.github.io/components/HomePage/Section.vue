<script setup>
const props = defineProps({
  grow: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
  },
});
</script>

<template>
  <section :class="
    {
      'flex-grow flex flex-col justify-center': grow,
      'bg-primary': mode === 'primary',
      'bg-gray-700': mode === 'secondary'
    }"
  >
    <div class="px-4 py-12 mx-auto text-center max-w-[700px]">
      <slot />
    </div>
  </section>
</template>
