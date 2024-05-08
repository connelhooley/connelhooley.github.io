<script setup lang="ts">
import { faCopy } from "@fortawesome/free-solid-svg-icons";
interface Props {
  code: string;
  language?: string;
  filename?: string;
  highlights?: number[],
  meta?: string;
  class?: string;
}
withDefaults(defineProps<Props>(), {
  code: "",
  highlights: () => [],
});
</script>

<template>
  <div class="relative">
    <div class="p-2 text-xs bg-gray-800 text-white" v-if="filename">{{ filename }}</div>
    <pre :class="['mt-0', $props.class]"><slot /></pre>
    <Button class="absolute top-0 right-0 text-xs p-2  bg-gray-500">
      <font-awesome-icon fixed-width :icon="faCopy" />
      <span class="sr-only">Copy</span>
    </Button>
  </div>
</template>

<style>
pre code .line {
  display: block;
}
</style>