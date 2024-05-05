<script lang="ts" setup>
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
const props = defineProps<{ date: string }>();
const parsed = computed(() => moment(props.date));
</script>

<template>
  <div class="text-gray-500 font-light">
    <font-awesome-icon :icon="faCalendarAlt" />&nbsp;{{ parsed.format("DD/MM/YYYY") }}
    <span>&nbsp;({{ parsed.fromNow() }})</span>
  </div>
</template>
