import { Outlet } from '@tanstack/react-router'

export function RootLayout() {
  return (
    <main className="app-shell">
      <Outlet />
    </main>
  )
}
