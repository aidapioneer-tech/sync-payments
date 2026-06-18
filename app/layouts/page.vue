<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'bg-tertiary font-b24-system text-base-900 antialiased w-full'
  }
})

const route = useRoute()
</script>

<template>
  <div class="flex flex-col">
    <div class="px-lg mb-xs2">
      <div
        class="min-h-7xl h-7xl w-full flex flex-row items-center justify-normal gap-lg2 border-b border-b-base-900/0.1"
      >
        <div class="pl-xs2 text-4xl font-light font-b24-secondary text-base-master">
          {{ route.meta.title }}
        </div>
        <div
          v-if="route.path === '/'"
          class="pr-xs2 grow flex gap-4 flex-row items-end justify-end text-lg"
        />
      </div>
    </div>
    <slot />
  </div>
</template>
