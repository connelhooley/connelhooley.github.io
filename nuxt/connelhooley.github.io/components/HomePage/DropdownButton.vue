<script setup>
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  open: {
    type: Boolean,
  },
});

</script>

<template>
  <HomePageButton is="button" class="relative z-50">
    <slot />&nbsp;<font-awesome-icon :icon="open ? faCaretDown : faCaretUp" />
  </HomePageButton>
</template>
