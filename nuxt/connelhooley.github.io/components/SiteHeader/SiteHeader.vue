<script setup>
const { logo } = useAppConfig();
</script>

<template>
  <SiteHeaderContainer>
    <SiteHeaderHomeLink to="/">
      {{ logo }}
    </SiteHeaderHomeLink>
    <SiteHeaderMenu>
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
