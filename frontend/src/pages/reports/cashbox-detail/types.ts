export type CashDetail = {
  ddsname: string
  sump: number
  sumr: number
  subkonto: string[]
  doc: string
  comment: string
}

export type ListCashDetailsResponse = {
  items: CashDetail[]
}

export type GetCashDetailsParams = {
  date_from?: string
  date_to?: string
}
