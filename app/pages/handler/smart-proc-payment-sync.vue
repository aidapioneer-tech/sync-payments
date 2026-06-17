<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  LoggerBrowser,
  Result,
  B24LangList,
  EnumCrmEntityTypeId,
  useB24Helper,
  LoadDataType,
  Text
} from '@bitrix24/b24jssdk'
import type { B24Frame, ISODate, BoolString } from '@bitrix24/b24jssdk'
import SpinnerIcon from '@bitrix24/b24icons-vue/specialized/SpinnerIcon'
import CheckIcon from '@bitrix24/b24icons-vue/main/CheckIcon'
import InvoiceIcon from '@bitrix24/b24icons-vue/crm/InvoiceIcon'
import MailMoneyIcon from '@bitrix24/b24icons-vue/main/MailMoneyIcon'
import InsertIcon from '@bitrix24/b24icons-vue/crm/InsertIcon'
import Refresh5Icon from '@bitrix24/b24icons-vue/actions/Refresh5Icon'

definePageMeta({
  layout: 'tab',
  title: 'Распределяем деньги по сделкам'
})

const config = useRuntimeConfig().public

const isDevelopment = ref<boolean>(import.meta.env?.DEV === true)

const $logger = LoggerBrowser.build('sync-payments', isDevelopment.value)

// region Types ////
type RqData = {
  id: number
  rqId: number
  bankDetailId: number
}

type Distribution = {
  id: number
  opportunity: number
  currencyId: string
  paymentId: number
  dealId: number
  bankPayment: number
}

type EntityInfo = {
  typeId: number
  id: number
  myCompanyId: number
  companyId: number
  opportunity: number
  currencyId: string
  needDistributionsSum: number
  dealList: DealInfo[]
  distributionList: Distribution[]
}

type DealInfo = {
  code: string
  id: number
  title: string
  orderStage: string
  stageId: string
  stageSemanticId: string
  currencyId: string
  opportunity: number
  myCompanyInfo: RqData
  paymentsInfo: PaymentInfo[]
}

type PaymentInfo = {
  accountNumber: string
  currency: string
  datePaid: ISODate
  empPaidId: number
  id: number
  paid: BoolString
  paySystemId: number
  paySystemName: string
  sum: number
  distributionsSum: number
}

// endregion ////

// region Init ////
let $b24: B24Frame
const isInit: Ref<boolean> = ref(false)
const isProcess: Ref<boolean> = ref(false)
const entity = ref<EntityInfo>({
  typeId: 0,
  id: 0,
  myCompanyId: 0,
  companyId: 0,
  opportunity: 0.0,
  currencyId: '',
  needDistributionsSum: 0.0,
  dealList: [],
  distributionList: []
})

const { initB24Helper, destroyB24Helper, getB24Helper } = useB24Helper()
const $isInitB24Helper = ref(false)
const b24CurrentLang: Ref<string> = ref(B24LangList.en)

onMounted(async () => {
  try {
    const { $initializeB24Frame } = useNuxtApp()
    $b24 = await $initializeB24Frame()
    $b24.setLogger(LoggerBrowser.build('Core'))
    b24CurrentLang.value = $b24.getLang()

    await $b24.parent.setTitle('Распределение платежей')

    await initB24Helper($b24, [LoadDataType.App, LoadDataType.Currency])
    $isInitB24Helper.value = true

    entity.value.typeId = Number.parseInt(`${config.smartProcessIdPayment}`)
    entity.value.id = Text.toInteger($b24.placement.options?.ID)

    if (entity.value.id < 1) {
      throw new Error('Оплату нужно сохранить. Потом с ней можно тут работать')
    }

    await loadEntityData()
    await loadClientPayments()

    isInit.value = true
  } catch (error) {
    $logger.error(error)

    processError(new Result().addError(toError(error)), toError(error))
  }
})

onUnmounted(() => {
  $b24?.destroy()
  destroyB24Helper()
})

defineShortcuts({
  shift_q: () => loadData()
})

const b24Helper = computed(() => {
  if ($isInitB24Helper.value) {
    return getB24Helper()
  }

  return null
})
// endregion ////

// region Actions ////
// const makeFitWindow = async () =>
// {
// 	window.setTimeout(() =>
// 	{
// 		$b24.parent.fitWindow() ////
// 		//$b24.parent.resizeWindowAuto()
// 	}, 200)
// }

const loadData = async () => {
  isProcess.value = true

  try {
    await loadEntityData()
    await loadClientPayments()
  } catch (error) {
    $logger.error(error)

    processError(new Result().addError(toError(error)), toError(error))
  }

  isProcess.value = false
}

/**
 * Грузит сущность
 * @return {Promise<void>}
 */
const loadEntityData = async (): Promise<void> => {
  const result = new Result()

  try {
    const commands = {
      getBankPaymentEntity: {
        method: 'crm.item.get',
        params: {
          entityTypeId: entity.value.typeId,
          id: entity.value.id
        }
      },
      getBankPaymentDistributions: {
        method: 'crm.item.list',
        params: {
          entityTypeId: config.smartProcessIdDistributions,
          filter: {
            parentId1036: entity.value.id
          },
          select: [
            'id',
            'ufCrm13PaymentId',
            'parentId1036',
            'parentId2',
            'opportunity',
            'currencyId'
          ]
        }
      }
    }

    const response = await $b24.callBatch(commands, true)

    const data: {
      id: number
      companyId: number
      mycompanyId: number
      stageId: string
      opportunity: number
      currencyId: string
      ufCrm11NeedDistributionsSum: number
    } = response.getData().getBankPaymentEntity.item

    if (data.stageId === config.smartProcessStatusPaymentFail) {
      result.addError(new Error('Оплата забракована.'))
    } else if (data.stageId === config.smartProcessStatusPaymentSuccess) {
      result.addError(new Error('Оплата успешно закрыта'))
    }

    if (result.isSuccess) {
      if (data.mycompanyId < 1) {
        result.addError(new Error('Стоит заполнить поле [Реквизиты вашей компании].'))
      } else {
        entity.value.myCompanyId = data.mycompanyId
      }
    }

    if (result.isSuccess) {
      if (data.companyId < 1) {
        result.addError(new Error('Стоит в поле [Клиент] указать того кто платил.'))
      } else {
        entity.value.companyId = data.companyId
      }
    }

    if (result.isSuccess) {
      entity.value.opportunity = data.opportunity
      entity.value.currencyId = data.currencyId
      entity.value.needDistributionsSum = data.ufCrm11NeedDistributionsSum
    }

    if (!result.isSuccess) {
      throw new Error('some problems')
    }
  } catch (error) {
    if (result.isSuccess) {
      result.addError(toError(error))
    }

    $logger.error(error)
    processError(result, toError(error))
  }
}

/**
 * Грузит связанные сделки / заказы / оплаты
 * @return {Promise<void>}
 */
const loadClientPayments = async (): Promise<void> => {
  const result = new Result()

  try {
    // region Load deal ////
    const generator = $b24.fetchListMethod(
      'crm.item.list',
      {
        entityTypeId: EnumCrmEntityTypeId.deal,
        filter: {
          '=categoryId': config.dealForWorkCategoryId,
          '=companyId': entity.value.companyId,
          '=closed': 'N'
        }
      },
      'id',
      'items'
    )

    entity.value.dealList = []
    for await (const entities of generator) {
      for (const row of entities) {
        let dealMyCompanyInfo: RqData = {
          id: 0,
          rqId: 0,
          bankDetailId: 0
        }

        try {
          dealMyCompanyInfo = JSON.parse(row.ufCrmDealShpayment)?.myCompany || {
            id: 0,
            rqId: 0,
            bankDetailId: 0
          }
        } catch {
          dealMyCompanyInfo = {
            id: 0,
            rqId: 0,
            bankDetailId: 0
          }
        }

        const deal = {
          code: `deal-${Text.toInteger(row.id)}`,
          id: Text.toInteger(row.id),
          title: row.title,
          orderStage: row.orderStage,
          stageId: row.stageId,
          stageSemanticId: row.stageSemanticId,
          currencyId: row.currencyId,
          opportunity: Text.toNumber(row.opportunity),
          myCompanyInfo: dealMyCompanyInfo,
          paymentsInfo: []
        } as DealInfo

        // @todo ? ////
        /*/
				if(deal.orderStage === 'PAID')
				{
				  continue
				}
				//*/

        if (deal.myCompanyInfo.id !== entity.value.myCompanyId) {
          continue
        }

        entity.value.dealList.push(deal)
      }
    }

    if (!result.isSuccess) {
      throw new Error('some problems')
    }
    // endregion ////

    // region Load Payments ////
    const commands = []
    const commandsMap = new Map()
    let iterator = 0
    for (const deal of entity.value.dealList) {
      commands.push({
        method: 'crm.item.payment.list',
        params: {
          entityTypeId: EnumCrmEntityTypeId.deal,
          entityId: deal.id
        }
      })

      commandsMap.set(iterator, {
        entityTypeId: EnumCrmEntityTypeId.deal,
        entityId: deal.id
      })

      iterator++
    }

    const response = await $b24.callBatchByChunk(commands, true)
    const paymentsForDealList = response.getData() as PaymentInfo[][]

    iterator = 0
    for (const dealPayments of paymentsForDealList) {
      const { entityId } = commandsMap.get(iterator)
      const firstDeal = entity.value.dealList.find((deal) => deal.id == entityId)

      if (!firstDeal) {
        throw new Error(`Для оплат не нашли связанную сделку`)
      }

      firstDeal.paymentsInfo = dealPayments
      firstDeal.paymentsInfo.forEach((row) => {
        row.distributionsSum = 0.0
      })

      iterator++
    }
    // endregion ////
  } catch (error) {
    if (result.isSuccess) {
      result.addError(toError(error))
    }

    $logger.error(error)
    processError(result, toError(error))
  }
}

const makeSaveDistributions = async (): Promise<void> => {
  isProcess.value = true
  const commands = []

  for (const dealRow of entity.value.dealList) {
    for (const payment of dealRow.paymentsInfo) {
      const sum = Text.toNumber(payment.distributionsSum)
      if (sum > 0.0) {
        commands.push({
          method: 'crm.item.add',
          params: {
            entityTypeId: config.smartProcessIdDistributions,
            fields: {
              parentId1036: entity.value.id,
              opportunity: sum,
              currencyId: entity.value.currencyId,
              isManualOpportunity: 'Y',
              ufCrm13PaymentId: payment.id
            }
          }
        })
      }
    }
  }

  if (commands.length === 0) {
    isProcess.value = false
    return
  }

  try {
    await $b24.callBatchByChunk(commands, true)

    await loadData()
  } catch (error) {
    $logger.error(error)

    processError(new Result().addError(toError(error)), toError(error))
  }

  isProcess.value = false
}
// endregion ////

const distributionsSum = computed(() => {
  let result = 0.0

  for (const dealRow of entity.value.dealList) {
    for (const payment of dealRow.paymentsInfo) {
      result = result + Text.toNumber(payment.distributionsSum)
    }
  }

  return result
})

const isDistributionsSumWarning = computed(() => {
  const result = new Result()

  if (distributionsSum.value > entity.value.needDistributionsSum) {
    result.addError(new Error('Вы хотите распределить сумму большую чем требуется'))
  }

  return result
})

// region Tools ////
/** Безопасно приводит значение из catch (тип unknown) к Error. */
function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function processError(result: Result, error: null | Error = null): void {
  showError({
    statusCode: 404,
    message: 'Проблемы с распределением денег',
    data: {
      description: result.getErrorMessages().join('; '),
      homePageIsHide: true,
      isShowClearError: true,
      clearErrorHref: '/handler/smart-proc-payment-sync'
    },
    cause: error ? error : new Error(),
    fatal: true
  })
}

const makeOpenSliderDeal = async (entityId: number) => {
  return $b24.slider.openPath($b24.slider.getUrl(`/crm/deal/details/${entityId}/`), 950)
}
// endregion ////
</script>

<template>
  <ClientOnly>
    <div class="w-full flex flex-col">
      <div :class="{ 'overflow-hidden': !isInit }">
        <div
          v-if="!isInit || isProcess"
          class="w-full h-screen flex flex-col items-center justify-center"
        >
          <SpinnerIcon class="animate-spin text-base-500 stroke-2 size-52" />
        </div>
        <template v-else>
          <B24Separator class="mt-2 mb-3" type="dashed" label="Список сделок" />
          <div
            v-for="(dealRow, dealKey) in entity.dealList"
            :key="dealKey"
            class="px-lg flex flex-col flex-nowrap items-start justify-between gap-3"
          >
            <B24Separator v-if="dealKey > 0" class="my-2" type="dashed" />
            <div class="font-b24-secondary flex flex-col items-start justify-between gap-1">
              <B24Tooltip :text="`id: ${dealRow.id}`">
                <div
                  class="text-base-900 text-h4 font-light cursor-pointer hover:underline hover:text-info underline-offset-4"
                  @click.stop="makeOpenSliderDeal(dealRow.id)"
                >
                  {{ dealRow.title }}
                </div>
              </B24Tooltip>
              <B24Badge use-fill color="ai" depth="dark">
                <template #default>
                  {{
                    b24Helper?.currency
                      .format(dealRow.opportunity, dealRow.currencyId, b24CurrentLang)
                      .replaceAll('&amp;nbsp;', ' ')
                  }}
                </template>
              </B24Badge>
            </div>
            <div
              class="mb-3 w-full grid grid-cols-[repeat(auto-fill,minmax(266px,1fr))] gap-y-sm gap-x-xs"
            >
              <div
                v-for="payment in dealRow.paymentsInfo"
                :key="payment.id"
                class="bg-base-30 py-sm2 px-xs2 rounded-md flex flex-row gap-sm border-2 hover:shadow-lg relative"
                :class="
                  payment.paid === 'Y'
                    ? 'border-success-text'
                    : 'border-base-50 hover:border-primary'
                "
              >
                <div
                  v-if="payment.paid === 'Y'"
                  class="absolute -top-2 -right-2 rounded-full bg-success-text size-5 text-success-on flex items-center justify-center"
                >
                  <CheckIcon class="size-md" />
                </div>
                <div
                  class="rounded-full bg-blue-200 size-14 min-w-14 min-h-14 flex items-center justify-center"
                >
                  <component
                    :is="payment.paySystemId === 9 ? MailMoneyIcon : InvoiceIcon"
                    class="size-12 text-info-text"
                  />
                </div>
                <div class="max-w-11/12">
                  <div
                    class="font-b24-secondary text-black text-h6 leading-4 mb-xs font-semibold line-clamp-2"
                  >
                    {{ payment.paySystemName }} {{ payment.accountNumber }}
                    <small class="text-gray-500">[id: {{ payment.id }}]</small>
                  </div>
                  <div class="font-b24-primary text-sm line-clamp-6">
                    <div class="font-semibold">
                      {{
                        b24Helper?.currency
                          .format(payment.sum, payment.currency, b24CurrentLang)
                          .replaceAll('&amp;nbsp;', ' ')
                      }}
                    </div>
                    <div v-if="payment.paid === 'Y'" class="mt-2">
                      <B24Badge use-fill color="collab" label="Оплачено" />
                    </div>
                    <div v-else class="mt-2">
                      <div v-if="entity.currencyId === payment.currency">
                        <B24Button
                          v-if="!(payment.distributionsSum > 0)"
                          color="primary"
                          rounded
                          size="sm"
                          :icon="InsertIcon"
                          label="Выбрать"
                          @click.stop="payment.distributionsSum = payment.sum"
                        />
                        <B24InputNumber
                          v-else
                          v-model="payment.distributionsSum"
                          :min="0.0"
                          :max="payment.sum"
                          :step="0.01"
                          size="sm"
                          :locale="`ru-RU`"
                          :format-options="{
                            style: 'currency',
                            currency: payment.currency,
                            currencyDisplay: 'code',
                            currencySign: 'standard'
                          }"
                        />
                      </div>
                      <B24Badge
                        v-else-if="
                          entity.currencyId !== payment.currency &&
                          entity.needDistributionsSum === entity.opportunity
                        "
                        use-fill
                        color="warning"
                        label="Валюты отличаются"
                        data-info="Если очень нужно, то можно через БП сконвертировать пришедшие деньги в
												другую валюту"
                      />
                      <B24Badge
                        v-else-if="
                          entity.currencyId !== payment.currency &&
                          entity.needDistributionsSum < entity.opportunity
                        "
                        use-fill
                        color="danger"
                        label="Валюты отличаются"
                        data-info="Нельзя распределять на другую валюту"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-[250px]" />
          <div
            class="fixed bg-white min-h-[60px] bottom-0 w-full shadow-top-sm pr-(--scrollbar-width)"
          >
            <div
              class="px-4 relative w-full flex flex-row flex-nowrap items-center justify-between gap-2"
            >
              <div class="inline-flex items-center justify-center px-4">
                <B24Advice
                  v-if="!isDistributionsSumWarning.isSuccess"
                  :avatar="{ src: '/avatar/employee.png' }"
                  :description="isDistributionsSumWarning.getErrorMessages().join(';')"
                />
              </div>
              <B24DescriptionList
                class="w-1/2"
                size="sm"
                :items="[
                  {
                    label: 'Всего:',
                    description: b24Helper?.currency
                      .format(entity.opportunity, entity.currencyId, b24CurrentLang)
                      .replaceAll('&amp;nbsp;', ' '),
                    orientation: 'horizontal',
                    actions: [
                      {
                        icon: Refresh5Icon,
                        color: 'link' as const,
                        class: 'text-base-400',
                        onClick() {
                          loadData()
                        }
                      }
                    ]
                  },
                  {
                    label: 'Осталось распределить:',
                    description: b24Helper?.currency
                      .format(entity.needDistributionsSum, entity.currencyId, b24CurrentLang)
                      .replaceAll('&amp;nbsp;', ' ')
                  },
                  {
                    label: 'Вы хотите распределить:',
                    description: b24Helper?.currency
                      .format(distributionsSum, entity.currencyId, b24CurrentLang)
                      .replaceAll('&amp;nbsp;', ' '),
                    orientation: 'horizontal',
                    actions: [
                      {
                        label: 'Распределить',
                        color: 'success' as const,
                        rounded: true,
                        size: 'lg',
                        disabled: !(distributionsSum > 0.0 && isDistributionsSumWarning.isSuccess),
                        onClick() {
                          makeSaveDistributions()
                        }
                      }
                    ]
                  }
                ]"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </ClientOnly>
</template>
