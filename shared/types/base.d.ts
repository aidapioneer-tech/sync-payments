// region Install ////
export interface IStep {
  action: () => Promise<void>
  caption?: string
  data?: Record<string, unknown>
}
// endregion ////

// region UfSmartLinkType ////
export type UfSmartLinkType = {
  // это Uf в который запишем/прочитаем результат
  ufDestination: string
  // это цель - то к чему мы линкуемся
  target: {
    entityTypeId: number
    customFilter?: Record<string, unknown>
    clientFields: {
      companyId?: string
      contactId?: string
      myCompanyId?: string
      dogovorId?: string
    },
    isFilterBy: {
      company: boolean
      contact: boolean
      myCompany: boolean
      dogovor: boolean
    }
  }
}
// endregion ////
