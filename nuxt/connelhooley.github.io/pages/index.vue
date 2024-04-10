<script type="ts" setup>
import { faArrowRight, faCaretUp, faCopyright, faEnvelope, faFileLines, faFilePdf, faFileWord, faPrint } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faMastodon } from "@fortawesome/free-brands-svg-icons";

import pdf from "~/assets/cv/ConnelHooleyCV.pdf";
import doc from "~/assets/cv/ConnelHooleyCV.docx";
import docPrinter from "~/assets/cv/ConnelHooleyCV-Printer-Friendly.docx";

definePageMeta({ layout: false });
const { title, logo, email, social: { linkedIn, mastodon } } = useAppConfig();
const year = new Date().getUTCFullYear();
</script>

<template>
  <HomePageContainer>
    <HomePageSection mode="primary" grow>
      <HomePageTitle>{{logo}}</HomePageTitle>
      <HomePageTagline>
        .NET/Web developer based in Norwich, UK
      </HomePageTagline>
      <HomePageButtons>
        <HomePageButton mode="primary" to="/blog/">
          <font-awesome-icon :icon=faArrowRight />&nbsp;Go to Blog
        </HomePageButton>
      </HomePageButtons>
    </HomePageSection>
    <HomePageSection mode="secondary">
      <HomePageButtons>
        <HomePageButton mode="secondary" :to="`mailto:${email}`" target="_BLANK">
          <font-awesome-icon :icon=faEnvelope />&nbsp;Email
        </HomePageButton>
        <HomePageButton mode="secondary" :to=mastodon target="_BLANK">
          <font-awesome-icon :icon=faMastodon />&nbsp;Mastodon
        </HomePageButton>
        <HomePageButton mode="secondary" :to="`https://uk.linkedin.com/in/${linkedIn}`" target="_BLANK">
          <font-awesome-icon :icon=faLinkedin />&nbsp;LinkedIn
        </HomePageButton>
        <HomePageDropdown mode="secondary">
          <template #button-content>
            <font-awesome-icon :icon=faFileLines />&nbsp;CV&nbsp;<font-awesome-icon :icon=faCaretUp />            
          </template>
          <template #dropdown-content>
            <HomePageDropdownItem :to=pdf noPrefetch target="_BLANK">
              <font-awesome-icon :icon=faFilePdf />&nbsp;PDF
            </HomePageDropdownItem>
            <HomePageDropdownItem :to=doc noPrefetch target="_BLANK">
              <font-awesome-icon :icon=faFileWord />&nbsp;Word
            </HomePageDropdownItem>
            <HomePageDropdownItem :to=docPrinter noPrefetch target="_BLANK">
              <font-awesome-icon :icon=faPrint />&nbsp;Word (Printer friendly)
            </HomePageDropdownItem>
          </template>
        </HomePageDropdown>
      </HomePageButtons>
      <HomePageFooter>
        {{title}}&nbsp;<font-awesome-icon :icon=faCopyright />&nbsp;{{year}}
      </HomePageFooter>
    </HomePageSection>      
  </HomePageContainer>
</template>