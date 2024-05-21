<script lang="ts" setup>
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

defineProps<{ open: boolean, mode: string }>();

</script>

<template>
  <HomePageButton is="button" :mode="mode" :active="open" class="relative z-50">
    <slot />&nbsp;<font-awesome-icon :icon="open ? faCaretDown : faCaretUp" />
  </HomePageButton>
</template>
