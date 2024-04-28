<script setup>
const route = useRoute();
const { data } = await useAsyncData(route.path, () => queryContent(route.path).findOne());
</script>

<template>
  <h1>{{ data?.title }}</h1>
  <p>{{ data?.description }}</p>
  <ContentRenderer :value="data" />
</template>
