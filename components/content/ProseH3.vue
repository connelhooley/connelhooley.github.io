<script lang="ts" setup>
import { faLink } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ id?: string }>();
const { headings } = useRuntimeConfig().public.mdc;
const generate = computed(() => props.id && headings?.anchorLinks?.h3);
</script>

<template>
  <h3 class="group" :id="id">
    <slot />
    <a class="hidden group-hover:inline-block ml-2 text-sm" v-if="generate" :href="`#${id}`">
      <font-awesome-icon :icon=faLink />
    </a>
  </h3>
</template>