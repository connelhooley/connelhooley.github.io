<template>
  <PageHeader>
    <PageTitle>Experience</PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection>
      <PageItems>
        <ContentQuery path="experience" :sort="{'start': -1}" v-slot="{ data }">
          <PageItem v-for="item in data" :key="item._path">
            <Copy>
              <PageItemTitle>
                {{ item.title }}
                <template #suffix>{{ item.start }} - {{ item.end ?? "Now" }}</template>
              </PageItemTitle>
              <PageItemSubtitle>
                {{ item.role }}
              </PageItemSubtitle>
              <PageItemWebsite :website="item.website" />
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
