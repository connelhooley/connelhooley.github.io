<template>
  <ContentDoc v-slot="{ doc }">
    <PageHeader>
      <PageTitle>
        {{ doc.title }}
      </PageTitle>
      <p>{{ doc.description }}</p>
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
