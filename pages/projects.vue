<template>
  <PageHeader>
    <PageTitle>Projects</PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection narrow>
      <PageItems>
        <ContentList path="projects" v-slot="{ list }">
          <PageItem v-for="item in list" :key="item._path">
            <Copy>
              <PageItemTitle>
                {{ item.title }}
              </PageItemTitle>
              <PageItemWebsite :website="item.website" :github="item.github" />
            </Copy>
            <Copy>
              <ContentRenderer :value=item />
            </Copy>
            <Tags :languages=item.languages :technologies=item.technologies />
          </PageItem>
        </ContentList>
      </PageItems>
    </PageSection>
  </PageContainer>
</template>