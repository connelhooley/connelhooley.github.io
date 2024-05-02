import type { QueryBuilderParams } from "@nuxt/content/types"

type UsePagingOptions = {
  queryName: string,
  queryParams: QueryBuilderParams,
  pageNumber: number,
  pageSize: number,
}

export default ({ queryName, queryParams, pageNumber, pageSize }: UsePagingOptions) => {
  const { data: totalCount } = useAsyncData(`${queryName}-count`, () =>
    queryContent(queryParams).count());
  const { data: items } = useAsyncData(`${queryName}-page-${pageNumber}-${pageSize}`, () =>
    queryContent(queryParams).skip(pageSize * (pageNumber - 1)).limit(pageSize).find());
  const pageCount = computed(() => Math.ceil((totalCount.value ?? 0) / pageSize));
  const prevPage = computed(() => pageNumber <= 1 ? null : pageNumber - 1);
  const nextPage = computed(() => pageNumber >= pageCount.value ? null : pageNumber + 1);
  return {
    totalCount,
    items,
    prevPage,
    nextPage,
  };
};
