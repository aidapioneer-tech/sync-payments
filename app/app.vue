<script setup lang="ts">
import { ru } from '@bitrix24/b24ui-nuxt/locale'
</script>

<template>
	<B24App :locale="ru">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</B24App>
</template>
