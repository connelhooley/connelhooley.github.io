<script lang="ts" setup>
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'
import { faTag } from "@fortawesome/free-solid-svg-icons";

const route = useRoute();
const technologyName = route.params.name as string;
const pageNumber = parseInt(route.params.page as string || "1");
const queryParams: QueryBuilderParams = {
  where: [
    {
      _path: { $regex: "^/blog/.*" },
      technologies: { $contains: technologyName },
    },
  ],
  sort: [
    { _path: -1 },
  ],
};

useSeoMeta({
  title: technologyName,
});
</script>

<template>
  <PageHeader>
    <PageTitle>
      <template #prefix>
        <font-awesome-icon :icon=faTag />&nbsp;Technology
      </template>
      {{ technologyName }}
    </PageTitle>
  </PageHeader>
  <PageContainer>
    <PagedContentQuery
      :queryName="`technology-${technologyName}`"
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
            :baseUrl="`/technologies/${encodeURIComponent(technologyName)}`"
            :prevPage="prevPage"
            :nextPage="nextPage"
          />
        </PageSection>
      </template>
      <template #not-found>
        <PageSection narrow>
          <PageItemsEmpty>No blog posts found for this technology&hellip;</PageItemsEmpty>
        </PageSection>
      </template>
    </PagedContentQuery>
  </PageContainer>
</template>
