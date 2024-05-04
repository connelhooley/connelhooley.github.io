<template>
  <PageHeader>
    <PageTitle>Projects</PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection narrow>
      <PageItems>
        <ContentQuery path="projects" :sort="{'order': 1}" v-slot="{ data }">
          <PageItem v-for="item in data" :key="item._path">
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
        </ContentQuery>
      </PageItems>
    </PageSection>
  </PageContainer>
</template>