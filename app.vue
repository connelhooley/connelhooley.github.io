<script lang="ts" setup>
import { createSitePathResolver } from '#imports'

const { name } = useSiteConfig();
const { path } = useRoute();
const resolvePath = createSitePathResolver({ absolute: true });

useHead({
  titleTemplate: titleChunk => name + (titleChunk ?  ` - ${titleChunk}` : ""),
  meta: [
    { rel: "manifest", href: resolvePath("/manifest.json") }
  ],
  link: [
    { rel: "canonical", href: resolvePath(path) },
    {
      rel: "alternate",
      type: "application/rss+xml",
      title: name,
      href: resolvePath("/rss.xml"),
    },
  ],
});

useSeoMeta({
  ogImage: resolvePath("/logo.png"),
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
