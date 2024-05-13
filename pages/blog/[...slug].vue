<script lang="ts" setup>
import { NuxtLink } from "#components";
import {
  faArrowUp,
  faClock,
  faCode,
  faComment,
  faExternalLinkAlt,
  faShareAlt,
  faTag } from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faReddit,
  faMastodon } from "@fortawesome/free-brands-svg-icons";
</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <PageHeader>
      <BlogPostTitle>
        {{ doc.title }}
      </BlogPostTitle>
      <BlogPostMeta large>
        {{ doc.description }}
      </BlogPostMeta>
      <BlogPostMeta>
        <Date :date="doc.date" />
      </BlogPostMeta>
      <BlogPostMeta v-if="doc.readingTime && !doc.disableReadingTime">
        <font-awesome-icon :icon=faClock />&nbsp;{{ doc.readingTime.text }}
      </BlogPostMeta>
      <BlogPostMeta>
        <Tags :languages="doc.languages" :technologies="doc.technologies" />
      </BlogPostMeta>
    </PageHeader>
    <PageContainer>
      <PageSection>
        <BlogPostTableOfContents v-if="doc.toc && !doc.disableToc" :value="doc.toc" />
        <Copy>
          <ContentRenderer :value="doc" />
        </Copy>
      </PageSection>
    </PageContainer>
    <PageSection>
      <BlogPostPresentationToolbar v-if="doc.presentation">
        <Button :is="NuxtLink" :to="doc.presentation" target="_blank">
          <font-awesome-icon :icon=faExternalLinkAlt />&nbsp;Open presentation
        </Button>
      </BlogPostPresentationToolbar>
    </PageSection>
  </ContentDoc>
</template>
