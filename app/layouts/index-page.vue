<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: `light`
  }
})
</script>

<template>
  <B24SidebarLayout
    ref="currentSidebarRef"
    :use-light-content="false"
    :b24ui="{ root: 'overflow-y-hidden' }"
  >
    <!-- Content -->
    <slot />
  </B24SidebarLayout>
</template>
