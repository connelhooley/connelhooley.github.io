<script setup>
import { faTag } from "@fortawesome/free-solid-svg-icons";
</script>

<template>
  <PageHeader>
    <PageTitle>
      <template #prefix>
        <font-awesome-icon :icon=faTag />&nbsp;Technology
      </template>
      {{ $route.params.name }}
    </PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection>
      <PageItems>
        <ContentQuery path="blog" :where="{ technologies: {$contains: $route.params.name} }">
          <template #default="{ data }">
            <PageItem v-for="post in data" :key="post._path">
              <NuxtLink :to="post._path">{{ post.title }}</NuxtLink>
            </PageItem>
          </template>
          <template #not-found>
            <PageItemsEmpty>No blog posts found for this technology&hellip;</PageItemsEmpty>
          </template>
        </ContentQuery>
      </PageItems>
    </PageSection>
  </PageContainer>
</template>
