<script lang="ts" setup>
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'
import { faCode } from "@fortawesome/free-solid-svg-icons";

const route = useRoute();
const languageName = route.params.name as string;
const pageNumber = parseInt(route.params.page as string || "1");
const queryParams: QueryBuilderParams = {
  where: [
    {
      _path: { $regex: "^/blog/.*" },
      languages: { $contains: languageName },
    },
  ],
  sort: [
    { _path: -1 },
  ],
};

useSeoMeta({
  title: languageName,
});
</script>

<template>
  <PageHeader>
    <PageTitle>
      <template #prefix>
        <font-awesome-icon :icon=faCode />&nbsp;Language
      </template>
      {{ languageName }}
    </PageTitle>
  </PageHeader>
  <PageContainer>
    <PagedContentQuery
      :queryName="`language-${languageName}`"
      :queryParams="queryParams"
      :pageSize="5"
      :pageNumber="pageNumber"
    >
      <template #default="{ list, nextPage, prevPage }">
        <PageSection narrow>
          <PageItems>
            <BlogPostItem v-for="item in list" :item="item" :key=item._path />
          </PageItems>
        </PageSection>
        <PageSection narrow>
          <PageItemsPager
            :baseUrl="`/languages/${encodeURIComponent(languageName)}`"
            :prevPage="prevPage"
            :nextPage="nextPage"
          />
        </PageSection>
      </template>
      <template #not-found>
        <PageSection narrow>
          <PageItemsEmpty>No blog posts found for this language&hellip;</PageItemsEmpty>
        </PageSection>
      </template>
    </PagedContentQuery>
  </PageContainer>
</template>
