export type Debt = {
  acc_code: string
  acc_name: string
  kontr: string
  manager: string
  contract: string
  debt: number
  currency: string
  vid_raschet: string
}

export type ObjectDebts = {
  object_id: string
  object_title: string
  debts: Debt[]
}

export type FailedObject = {
  object_id: string
  object_title: string
}

export type ListCounterpartiesResponse = {
  items: ObjectDebts[]
  failed_objects: FailedObject[]
}
