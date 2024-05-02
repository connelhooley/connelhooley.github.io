<template>
  <h1 class="text-white">
    <span v-if="$slots.prefix" class="bg-black text-xs inline-block p-1">
      <slot name="prefix" />
    </span>
    <span class="text-6xl sm:text-8xl truncate block">
      <slot />
    </span>
  </h1>
</template>
