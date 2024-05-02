<script lang="ts" setup>
import type { QueryBuilderParams } from "@nuxt/content/types";
import { faCode } from "@fortawesome/free-solid-svg-icons";

const { params } = useRoute();
const languageName = useParam(params.name);
const pageNumber = parseInt(useParam(params.page) || "1");
const queryParams: QueryBuilderParams = {
  where: [
    {
      _path: { $regex: "^/blog/.*" },
      languages: { $contains: languageName },
    },
  ],
  sort: [
    { _path: 1 },
  ],
};
const { totalCount, items, nextPage, prevPage } = usePaging({ 
  queryName: `language-${languageName}`,
  queryParams,
  pageSize: 3,
  pageNumber,
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
    <PageSection>
      <p>Total count: {{ totalCount }}</p>
      <p>Items length: {{ items?.length }}</p>
      <p v-for="item in items">{{ item._path }}</p>
      <p v-if="nextPage">
        <NuxtLink :to="`/languages/${encodeURIComponent(languageName)}/${nextPage}`">
          Next page: {{ nextPage }}
        </NuxtLink>
      </p>
      <p v-if="prevPage && prevPage === 1">
        <NuxtLink :to="`/languages/${encodeURIComponent(languageName)}`">
          Prev page: {{ prevPage }}
        </NuxtLink>
      </p>
      <p v-if="prevPage && prevPage > 1">
        <NuxtLink :to="`/languages/${encodeURIComponent(languageName)}/${prevPage}`">
          Prev page: {{ prevPage }}
        </NuxtLink>
      </p>
    </PageSection>
  </PageContainer>
</template>
