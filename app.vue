<script lang="ts" setup>
const { siteBaseAddress } = useAppConfig();
const { path } = useRoute();

useHead({
  titleTemplate: title => "Connel Hooley" + (title ?  ` - ${title}` : ""),
  meta: [
    { rel: "manifest", href: "manifest.json" }
  ],
  link: [
    { rel: "canonical", href: siteBaseAddress + path }
  ],
});

useSeoMeta({
  ogImage: `${siteBaseAddress}/logo.png`,
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
