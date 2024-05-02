<script setup>
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const props = defineProps({
  website: String,
  github: Boolean,
});
</script>

<template>
  <p v-if="website" class="truncate">
    <font-awesome-icon :icon="github ? faGithub : faGlobe" />&nbsp;
    <NuxtLink :to="website" target="_blank">{{ website }}</NuxtLink>
  </p>
</template>
