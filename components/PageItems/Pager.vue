<script lang="ts" setup>
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { NuxtLink } from "#components";

interface Props {
  baseUrl: string;
  prevPage: number | null;
  nextPage: number | null;
}

const { baseUrl, prevPage, nextPage } = defineProps<Props>();
</script>

<template>
  <div class="text-center">
    <Button :is="NuxtLink" v-if="prevPage" :to="prevPage === 1 ? baseUrl : `${baseUrl}/${prevPage}`" class="first:mr-4 last:ml-4">
      <font-awesome-icon :icon=faAnglesLeft />&nbsp;Newer
    </Button>
    <Button :is="NuxtLink" v-if="nextPage" :to="`${baseUrl}/${nextPage}`" class="first:mr-4 last:ml-4">
      Older&nbsp;<font-awesome-icon :icon=faAnglesRight />
    </Button>
  </div>
</template>
