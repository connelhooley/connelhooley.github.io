<template>
  <PageHeader>
    <PageTitle>Experience</PageTitle>
  </PageHeader>
  <PageContainer>
    <PageSection>
      <ContentQuery path="/experience" :sort="{'start': -1}" v-slot="{ data }">
        <ExperiencePageItem v-for="item in data" :key="item._path" :item="item" />
      </ContentQuery>
    </PageSection>
  </PageContainer>
</template>
