import { createBrowserRouter, Navigate } from "react-router-dom"

import { SigninPage } from "@/pages/auth"
import { UsersPage } from "@/pages/users"
import { UserDetailPage } from "@/pages/user-detail"
import { ObjectsPage } from "@/pages/objects"
import { CashboxesPage } from "@/pages/reports/cashboxes"

import { ProtectedRoute } from "@/components/protected-route"
import { PublicRoute } from "@/components/public-route"

import AppLayout from "./layout"

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/signin", element: <SigninPage /> },
      { path: "*", element: <Navigate to="/signin" replace /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/reports/cashboxes" replace /> },
          { path: "/users",              element: <UsersPage />    },
          { path: "/users/:userId",      element: <UserDetailPage />  },
          { path: "/objects",            element: <ObjectsPage />  },
          { path: "/reports/cashboxes",  element: <CashboxesPage /> },
        ],
      },
    ],
  },
])
