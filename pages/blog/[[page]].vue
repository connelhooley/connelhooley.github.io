<script lang="ts" setup>
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'

const route = useRoute();
const pageNumber = parseInt(route.params.page as string || "1");
const queryParams: QueryBuilderParams = {
  where: [
    {
      _path: { $regex: "^/blog/.*" },
    },
  ],
  sort: [
    { _path: -1 },
  ],
};
</script>

<template>
  <PageHeader>
    <PageTitle>
      Blog
    </PageTitle>
  </PageHeader>
  <PageContainer>
    <PagedContentQuery
      queryName="blog"
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
            baseUrl="/blog"
            :prevPage="prevPage"
            :nextPage="nextPage"
          />
        </PageSection>
      </template>
      <template #not-found>
        <PageSection narrow>
          <PageItemsEmpty>No blog posts found&hellip;</PageItemsEmpty>
        </PageSection>
      </template>
    </PagedContentQuery>
  </PageContainer>
</template>
