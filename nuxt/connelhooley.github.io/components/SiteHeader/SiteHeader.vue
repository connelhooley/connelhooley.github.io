<script setup>
const { logo } = useAppConfig();
</script>

<template>
  <SiteHeaderContainer>
    <SiteHeaderHomeLink to="/">
      {{ logo }}
    </SiteHeaderHomeLink>
    <SiteHeaderMenu>
      <template #mobile-button="{ open }">
        <SiteHeaderMobileMenuButton :open="open" />
      </template>
      <SiteHeaderMenuLink to="/blog">
        Blog
      </SiteHeaderMenuLink>
      <SiteHeaderMenuLink to="/projects">
        Projects
      </SiteHeaderMenuLink>
      <SiteHeaderMenuLink to="/experience">
        Experience
      </SiteHeaderMenuLink>
    </SiteHeaderMenu>
  </SiteHeaderContainer>
</template>
