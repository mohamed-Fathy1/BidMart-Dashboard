import { createFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/features/settings/content-page'

export const Route = createFileRoute('/_authed/settings/content')({
  component: ContentRoute,
})

function ContentRoute() {
  return <ContentPage />
}
