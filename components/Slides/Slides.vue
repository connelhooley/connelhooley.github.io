<script lang="ts" setup>
// https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity
const current = ref(0);
provide('current', current);

function prev() {
  current.value--;
}

function next() {
  current.value++;
}

</script>

<template>
  <div @keyup.left="prev" @keyup.right="next" @keyup.space="next">
    <slot />
  </div>
</template>
