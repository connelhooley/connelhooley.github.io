<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>
    <h2>{{ item.title }}</h2>
    <h3>{{ item.role }}</h3>
    <p>Start: {{ item.start }}</p>
    <p>End: {{ item.end }}</p>
    <ContentRenderer :value="item" />
  </div>
</template>