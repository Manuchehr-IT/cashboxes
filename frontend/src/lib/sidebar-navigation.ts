import { Users, Building2, Landmark, ScrollText, Handshake, type LucideIcon } from "lucide-react"

export type SidebarNavigationItem = {
  title: string
  url: string
  icon: LucideIcon
  /** Пункт скрыт, пока у пользователя не выдано соответствующее разрешение (админы — всегда). */
  permissionKey?: "can_view_cashboxes" | "can_view_counterparties"
}

export type SidebarNavigationGroup = {
  title: string
  adminOnly: boolean
  items: SidebarNavigationItem[]
}

export const navigationGroups: SidebarNavigationGroup[] = [
  {
    title: "Управление",
    adminOnly: true,
    items: [
      { title: "Пользователи", url: "/users",   icon: Users      },
      { title: "Объекты",      url: "/objects",  icon: Building2  },
      { title: "Логи",         url: "/logs",     icon: ScrollText },
    ],
  },
  {
    title: "Отчёты",
    adminOnly: false,
    items: [
      { title: "Кассы",        url: "/reports/cashboxes",      icon: Landmark,  permissionKey: "can_view_cashboxes"      },
      { title: "Контрагенты",  url: "/reports/counterparties", icon: Handshake, permissionKey: "can_view_counterparties" },
    ],
  },
]
