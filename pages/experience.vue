<template>
  <PageHeader>
    <PageTitle>Experience</PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection narrow>
      <PageItems>
        <ContentList path="experience" v-slot="{ list }">
          <PageItem v-for="item in list" :key="item._path">
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
        </ContentList>
      </PageItems>
    </PageSection>
  </PageContainer>
</template>
