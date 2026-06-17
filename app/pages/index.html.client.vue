<script setup lang="ts">
import { ref, type Ref, onMounted, onUnmounted } from 'vue'
import { LoggerBrowser, B24Frame } from '@bitrix24/b24jssdk'
import SpinnerIcon from '@bitrix24/b24icons-vue/specialized/SpinnerIcon'

definePageMeta({
	layout: 'page',
	title: 'Распределение платежей'
})

// region Init ////
const $logger = LoggerBrowser.build(
	'sync-payments',
	true
)

let $b24: B24Frame
const isInit: Ref<boolean> = ref(false)

onMounted(async() =>
{
	try
	{
		const { $initializeB24Frame } = useNuxtApp()
		$b24 = await $initializeB24Frame()
		$b24.setLogger(LoggerBrowser.build('Core', true))
		
		await $b24.parent.setTitle('Распределение платежей')
		
		isInit.value = true
		
		await makeFitWindow()
	}
	catch(error: any)
	{
		$logger.error(error)
		showError({
			statusCode: 404,
			statusMessage: error?.message || error,
			data: {
				description: 'Problem in app',
				homePageIsHide: true,
				isShowClearError: true,
				clearErrorHref: '/'
			},
			cause: error,
			fatal: true
		})
	}
})

onUnmounted(() =>
{
	$b24?.destroy()
})
// endregion ////

// region Actions ////

const makeFitWindow = async() =>
{
	window.setTimeout(() =>
	{
		$b24.parent.fitWindow() ////
		//$b24.parent.resizeWindowAuto()
	}, 200)
}

</script>

<template>
	<ClientOnly>
		<div class="mx-lg my-sm flex flex-col">
		<div class=""
		     :class="{
				'overflow-hidden': !isInit
			}"
		>
			<div
				v-if="!isInit"
				class="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center"
			>
				<div class="absolute z-10 text-info">
					<SpinnerIcon class="animate-spin stroke-2 size-44"/>
				</div>
			</div>
			<div v-else>
				Ok. Open smart process
			</div>
		</div>
		</div>
	</ClientOnly>
</template>