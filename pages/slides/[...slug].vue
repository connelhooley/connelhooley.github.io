<script lang="ts" setup>
import { SlidesTest } from '#components';

definePageMeta({ layout: false });

const route = useRoute();
const { data } = await useAsyncData(() => queryContent(route.path).findOne());
const components = {
  "hr": SlidesTest,
}
</script>

<template>
  <main>
    <div>
      <ContentRendererMarkdown :value="data" :components="components" />
    </div>
  </main>
</template>
