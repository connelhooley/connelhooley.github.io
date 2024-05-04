<script lang="ts" setup>
import { faCode, faTag } from "@fortawesome/free-solid-svg-icons";

defineProps<{ languages: string[], technologies: string[] }>();
</script>

<template>
  <div>
    <Tag v-for="language in languages" :to="`/languages/${encodeURIComponent(language)}`">
      <font-awesome-icon :icon=faCode />&nbsp;{{ language }}
    </Tag>
    <Tag v-for="technology in technologies" :to="`/technologies/${encodeURIComponent(technology)}`">
      <font-awesome-icon :icon=faTag />&nbsp;{{ technology }}
    </Tag>
  </div>
</template>
