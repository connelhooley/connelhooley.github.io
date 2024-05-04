<script lang="ts" setup>
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

import type { ParsedContent } from '@nuxt/content/types';

defineProps<{ item: ParsedContent }>();
</script>

<template>
  <PageItem>
    <Copy>
      <PageItemTitle>
        <NuxtLink class="text-primary no-underline hover:underline" :to="item._path">
          {{ item.title }}&nbsp;<font-awesome-icon :icon="faAnglesRight" />
        </NuxtLink>
      </PageItemTitle>
      <div>
        {{ item.description }}
      </div>
    </Copy>
    <Tags :languages=item.languages :technologies=item.technologies />
  </PageItem>
</template>