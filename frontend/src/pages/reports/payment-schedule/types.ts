export type PaymentEntry = {
  date: string
  sum: number
}

export type PaymentScheduleEntry = {
  kontragent: string
  contract: string
  plan: PaymentEntry[]
  currency: string
  ost_start: number
  ost_end: number
  fact: PaymentEntry[]
  phone: string
}

export type ObjectPaymentSchedule = {
  object_id: string
  object_title: string
  entries: PaymentScheduleEntry[]
}

export type FailedObject = {
  object_id: string
  object_title: string
}

export type ListPaymentScheduleResponse = {
  items: ObjectPaymentSchedule[]
  failed_objects: FailedObject[]
}

export type ListPaymentScheduleParams = {
  date_from?: string
  date_to?: string
}
