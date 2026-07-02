import { Users, Building2, Landmark, type LucideIcon } from "lucide-react"

export type SidebarNavigationItem = {
  title: string
  url: string
  icon: LucideIcon
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
    ],
  },
  {
    title: "Отчёты",
    adminOnly: false,
    items: [
      { title: "Кассы", url: "/reports/cashboxes", icon: Landmark },
    ],
  },
]
