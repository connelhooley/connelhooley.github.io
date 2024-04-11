<script setup>
  const emit = defineEmits(["close"]);
  const handler = (e) => {
    if (e.key === "Escape") {
      emit("close");
    }
  };
  onMounted(() => document.addEventListener("keyup", handler));
  onUnmounted(() => document.removeEventListener("keyup", handler));
</script>

<template>
  <div tabindex="-1" @focusin="$emit('close')"></div>
</template>