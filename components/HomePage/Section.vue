<script lang="ts" setup>
withDefaults(defineProps<{ grow?: boolean, mode: string }>(), {
  grow: false,
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
