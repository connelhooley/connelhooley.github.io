<template>
  <h1>
    <slot /><small v-if="$slots.suffix">&nbsp;<slot name="suffix" /></small>
  </h1>
</template>
