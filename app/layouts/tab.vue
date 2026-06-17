<script setup lang="ts">
useHead({
	bodyAttrs: {
		class: 'text-base-master dark:text-base-150 bg-white dark:bg-base-dark font-b24-system antialiased',
	}
})
</script>

<template>
	<div class="relative flex flex-col items-start justify-start gap-4 h-screen">
		<slot />
	</div>
</template>