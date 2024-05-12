<script lang="ts" setup>
import { faArrowTurnDown } from "@fortawesome/free-solid-svg-icons";
defineProps<{ value: [{ id: string, text: string, depth: number }] }>();
</script>

<template>
  <nav class="text-sm sm:w-72 mb-4 sm:ml-4 sm:float-right sm:relative sm:z-10">
    <h1 class="text-3xl p-2 bg-gray-900 text-white">Contents</h1>
    <ul>
      <li v-for="item in value" :key="item.id" class="px-2 bg-gray-800 even:bg-gray-900 text-primary">
        <NuxtLink
          :class="[
            'py-2 block no-underline hover:underline',
            { 'pl-2': item.depth === 2 },
            { 'pl-4': item.depth === 3 }
          ]"
          :to="`#${item.id}`"
        >
          {{ item.text }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
