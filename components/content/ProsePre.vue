<script setup lang="ts">
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ref } from "vue";

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

const codeRef = ref<HTMLPreElement | null>(null);
const copied = ref(false);

function copy() {
  navigator.clipboard.writeText(codeRef.value?.textContent ?? "");
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3_000);
}
</script>

<template>
  <div class="relative">
    <div class="p-2 text-xs bg-gray-800 text-white" v-if="filename">{{ filename }}</div>
    <pre ref="codeRef" :class="['mt-0', $props.class]"><slot /></pre>
    <button @click="copy" :class="[
      'inline-block p-2 text-center text-xs absolute top-0 right-0',
      { 'bg-gray-500 text-white hover:bg-primary-dark': !copied },
      { 'bg-green-500 text-white': copied },
      'transition-colors duration-400',
      'invert-selection']">
      <font-awesome-icon fixed-width :icon="copied ? faCheck : faCopy" />
      <span class="sr-only">{{ copied ? "Copied" : "Copy" }}</span>
    </button>
  </div>
</template>

<style lang="postcss">
pre code .line {
  display: block;
}

pre code .line.highlight {
  @apply bg-gray-800;
}
</style>