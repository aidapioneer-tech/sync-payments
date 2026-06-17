import {computed, type ComputedRef, ref} from "vue";
import { LoggerBrowser, AjaxError, LoadDataType, useB24Helper } from '@bitrix24/b24jssdk'
import type { B24Frame } from '@bitrix24/b24jssdk'

export interface ProcessErrorData {
  description?: string
  isShowClearError?: boolean
  clearErrorHref?: string
  clearErrorTitle?: string
  homePageIsHide?: boolean
  homePageHref?: string
  homePageTitle?: string
}

const { initB24Helper, getB24Helper, destroyB24Helper: destroyB24HelperOry, usePullClient, useSubscribePullClient, startPullClient } = useB24Helper()
const isInitB24Helper = ref(false)

const moduleId = 'main'

/**
 * Composable handling application initialization
 * Coordinates data loading via batch request
 */
export const useAppInit = (loggerTitle?: string) => {
  const $logger = LoggerBrowser.build(
    loggerTitle ?? 'App',
    import.meta.dev
  )

  // Stores
  const user = useUserStore()

  /**
   * Initialize application data
   * Performs batch request and updates all stores
   */
  async function initApp(
    $b24: B24Frame
  ) {
    $logger.info('InitApp start')

    /**
     * @todo init data from helper
     */
    await initB24Helper(
      $b24,
      [
        LoadDataType.App,
        LoadDataType.Currency,
        LoadDataType.Profile
      ]
    )
    isInitB24Helper.value = true

    const data = {
      appInfo: getB24Helper().appInfo,
      profileData: getB24Helper().profileInfo,
    }
    $logger.log('Init data >>', data)

    // Update stores with received data
    user.initFromBatch({
      name: data.profileData?.data.name ?? undefined,
      lastName: data.profileData?.data.lastName ?? undefined,
      isAdmin: data.profileData?.data.isAdmin
    })

    $logger.info('InitApp stop')
  }

  /**
   * Reloads data
   */
  async function reloadData() {
    await b24Helper.value?.loadData([
      LoadDataType.Currency
    ])

    const data = {
      appSettings: getB24Helper().appOptions,
      userSettings: getB24Helper().userOptions
    }

    $logger.log('Reload data >>', data)

    $logger.info('reloadData stop')
  }

  const b24Helper = computed(() => {
    if (isInitB24Helper.value) {
      return getB24Helper()
    }

    return null
  })

  const destroyB24Helper = () => {
    isInitB24Helper.value = false
    destroyB24HelperOry()
  }

  function processErrorGlobal(
    error: unknown | string | Error,
    processErrorData?: ProcessErrorData
  ) {
    $logger.error(error)

    let title = 'Error'
    let description = ''

    if (error instanceof AjaxError) {
      title = `[${error.name}] ${error.code} (${error.status})`
      description = `${error.message}`
    } else if (error instanceof Error) {
      description = error.message
    } else {
      description = error as string
    }

    showError({
      statusCode: 404,
      statusMessage: title,
      data: Object.assign({
        description: description,
        homePageIsHide: true,
        isShowClearError: true,
        clearErrorHref: '/main'
      }, (processErrorData ?? {})),
      cause: error,
      fatal: true
    })
  }

  return {
    $logger,
    moduleId,
    initApp,
    reloadData,
    b24Helper,
    usePullClient,
    useSubscribePullClient,
    startPullClient,
    destroyB24Helper,
    processErrorGlobal
  }
}
