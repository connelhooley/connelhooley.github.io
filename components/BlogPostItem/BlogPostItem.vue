<script lang="ts" setup>
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import type { ParsedContent } from '@nuxt/content/types';

defineProps<{ item: ParsedContent }>();
</script>

<template>
  <PageItem>
    <Copy>
      <BlogPostItemTitle :to="item._path">
        {{ item.title }}&nbsp;<font-awesome-icon :icon="faAnglesRight" />
      </BlogPostItemTitle>
      <BlogPostItemContent>
        {{ item.description }}
      </BlogPostItemContent>
    </Copy>
    <BlogPostItemFooter>
      <BlogPostItemDate :date="item.date" />
      <Tags :languages=item.languages :technologies=item.technologies />
    </BlogPostItemFooter>
  </PageItem>
</template>