import { createFileRoute } from '@tanstack/react-router'
import { TodayPage } from '../today/TodayPage.tsx'

export const Route = createFileRoute('/')({
  component: TodayPage,
})
