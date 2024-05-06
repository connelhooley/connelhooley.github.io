<script lang="ts" setup>
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
      <BlogPostMeta v-if="doc.readingTime">
        <font-awesome-icon :icon=faClock />&nbsp;{{doc.readingTime.text }}
      </BlogPostMeta>
      <BlogPostMeta>
        <Tags :languages="doc.languages" :technologies="doc.technologies" />
      </BlogPostMeta>
    </PageHeader>  
    <PageContainer>
      <PageSection>
        <Copy>
          <ContentRenderer :value="doc" />
        </Copy>
      </PageSection>      
    </PageContainer>
  </ContentDoc>
</template>
