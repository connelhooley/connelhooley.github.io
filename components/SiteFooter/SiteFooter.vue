<script lang="ts" setup>
import { faCopyright, faEnvelope, faRss } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faMastodon } from "@fortawesome/free-brands-svg-icons";

const { title, email, social: { mastodon, linkedIn } } = useAppConfig();
const year = computed(() => new Date().getUTCFullYear());
</script>

<template>
  <SiteFooterContainer>
    <SiteFooterOwnership>
      {{title}}&nbsp;<font-awesome-icon :icon=faCopyright />&nbsp;{{ year }}
    </SiteFooterOwnership>
    <SiteFooterLinks>
      <SiteFooterLink :to="`mailto:${email}`" target="_blank">
        <font-awesome-icon :icon=faEnvelope />&nbsp;Email
      </SiteFooterLink>
      <SiteFooterLink :to=mastodon target="_blank">
        <font-awesome-icon :icon=faMastodon />&nbsp;Mastodon
      </SiteFooterLink>
      <SiteFooterLink :to="`https://uk.linkedin.com/in/${linkedIn}`" target="_blank">
        <font-awesome-icon :icon=faLinkedin />&nbsp;LinkedIn
      </SiteFooterLink>
      <SiteFooterLink to="/rss.xml" target="_blank">
        <font-awesome-icon :icon=faRss />&nbsp;RSS
      </SiteFooterLink>
    </SiteFooterLinks>
  </SiteFooterContainer>
</template>