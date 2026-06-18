<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sleepAction } from '~/utils/sleep'
import type { ProgressProps } from '@bitrix24/b24ui-nuxt'
import type { IStep } from '#shared/types/base'
import type { B24Frame } from '@bitrix24/b24jssdk'
import AppLogo from '~/components/AppLogo.vue'

definePageMeta({
  layout: 'index-page'
})

const { t } = useI18n()

useHead({
  title: t('install.seoTitle')
})

/**
 * @memo get appUrl from url
 */
function getBaseUrl(): string {
  const currentUrl = window.location.href
  const lastSlashIndex = currentUrl.lastIndexOf('/')
  return currentUrl.substring(0, lastSlashIndex + 1)
}

const appUrl = getBaseUrl()

const { $logger, processErrorGlobal } = useAppInit('Install')
const { $initializeB24Frame } = useNuxtApp()
const $b24: B24Frame = await $initializeB24Frame()

const confetti = useConfetti()

const isShowDebug = ref(false)

const progressColor = ref<ProgressProps['color']>('air-primary')
const progressValue = ref<null | number>(null)

const config = useRuntimeConfig().public
// endregion ////

// region Steps ////
const steps = ref<Record<string, IStep>>({
  init: {
    caption: 'install.step.init',
    action: makeInit
  },
  placement: {
    caption: 'install.step.placement',
    action: async () => {
      await $b24.callBatch([
        {
          method: 'placement.unbind',
          params: {
            PLACEMENT: `CRM_DYNAMIC_${config.smartProcessIdPayment}_DETAIL_TAB`
          }
        },
        {
          method: 'placement.bind',
          params: {
            PLACEMENT: `CRM_DYNAMIC_${config.smartProcessIdPayment}_DETAIL_TAB`,
            HANDLER: `${appUrl}handler/smart-proc-payment-sync`,
            TITLE: `[${import.meta.dev ? 'dev' : 'prod'}] Распределение`,
            DESCRIPTION: 'Распределяем деньги по сделкам',
            GROUP_NAME: `[${import.meta.dev ? 'dev' : 'prod'}] Оплаты`,
            LANG_ALL: {
              ru: {
                TITLE: `[${import.meta.dev ? 'dev' : 'prod'}] Распределение`,
                DESCRIPTION: 'Распределяем деньги по сделкам',
                GROUP_NAME: `[${import.meta.dev ? 'dev' : 'prod'}] Оплаты`
              }
            }
          }
        }
      ])
    }
  },
  finish: {
    caption: 'install.step.finish',
    action: makeFinish
  }
})
const stepCode = ref<string>('init' as const)
// endregion ////

// region Actions ////
async function makeInit(): Promise<void> {
  return sleepAction()
}

async function makeFinish(): Promise<void> {
  progressColor.value = 'air-primary-success'
  progressValue.value = 100

  confetti.fire()
  await sleepAction(3000)

  await $b24.installFinish()
}

const stepsData = computed(() => {
  return Object.entries(steps.value).map(([index, row]) => {
    return {
      step: index,
      data: row?.data
    }
  })
})

const currentStepCaption = computed(() => {
  const caption = steps.value[stepCode.value]?.caption
  return caption ? t(caption) : '...'
})
// endregion ////

// region Lifecycle Hooks ////
onMounted(async () => {
  $logger.info('Hi from install page')

  try {
    await $b24.parent.setTitle(t('install.seoTitle'))

    for (const [key, step] of Object.entries(steps.value)) {
      stepCode.value = key
      await step.action()
    }
  } catch (error) {
    processErrorGlobal(error, {
      homePageIsHide: true,
      isShowClearError: false,
      clearErrorHref: '/install.html'
    })
  }
})
// endregion ////
</script>

<template>
  <div class="mx-3 flex flex-col items-center justify-center gap-1 h-dvh">
    <AppLogo
      class="size-[208px]"
      :class="[
        stepCode === 'finish'
          ? 'text-(--ui-color-accent-main-success)'
          : 'text-(--ui-color-accent-soft-green-1)'
      ]"
    />
    <B24Progress
      v-model="progressValue"
      size="xs"
      animation="elastic"
      :color="progressColor"
      class="w-1/2 sm:w-1/3"
    />
    <div class="mt-6 flex flex-col items-center justify-center gap-2">
      <ProseH1 class="text-nowrap mb-0"> {{ $t('install.heading') }} </ProseH1>
      <ProseP small accent="less">
        {{ currentStepCaption }}
      </ProseP>
    </div>

    <ProsePre v-if="isShowDebug">
      {{ stepsData }}
    </ProsePre>
  </div>
</template>
