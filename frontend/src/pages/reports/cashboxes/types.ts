export type Cashbox = {
  id: string
  name: string
  currency: string
  main: boolean
  type: string
  ost1: number
  sump: number
  sumr: number
  ost2: number
}

export type ObjectCashboxes = {
  object_id: string
  object_title: string
  cashboxes: Cashbox[]
}

export type FailedObject = {
  object_id: string
  object_title: string
}

export type ListCashboxesResponse = {
  items: ObjectCashboxes[]
  failed_objects: FailedObject[]
}

export type ListCashboxesParams = {
  date_from?: string
  date_to?: string
}
