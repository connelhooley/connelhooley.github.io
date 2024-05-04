<script lang="ts" setup>
import type { QueryBuilderParams } from "@nuxt/content/types";
interface Props {
  queryName: string,
  queryParams: QueryBuilderParams,
  pageNumber: number,
  pageSize: number,
}

const { queryName, queryParams, pageNumber, pageSize } = defineProps<Props>();

const { data: totalCount } = useAsyncData(`${queryName}-count`, () =>
  queryContent(queryParams).count());
const { data: list } = useAsyncData(`${queryName}-page-${pageNumber}-${pageSize}`, () =>
  queryContent(queryParams).skip(pageSize * (pageNumber - 1)).limit(pageSize).find());
const pageCount = computed(() => Math.ceil((totalCount.value ?? 0) / pageSize));
const prevPage = computed(() => pageNumber <= 1 ? null : pageNumber - 1);
const nextPage = computed(() => pageNumber >= pageCount.value ? null : pageNumber + 1);
</script>

<template>
  <slot v-if="list == null" name="loading" />
  <slot v-else-if="list.length === 0" name="not-found" />
  <slot v-else v-bind="{ totalCount, list, nextPage, prevPage }" />
</template>
