<script setup>
  const emit = defineEmits(["esc"]);
  const handler = (e) => {
    if (e.key === "Escape") {
      emit("esc");
    }
  };
  onMounted(() => document.addEventListener("keyup", handler));
  onUnmounted(() => document.removeEventListener("keyup", handler));
</script>

<template>
</template>