import { WipPlaceholder } from '@/components/wip-placeholder'
import { isWipModeEnabled } from '@/lib/wip-mode'
import HomePage from './home-page'

export default function Page() {
  if (isWipModeEnabled()) {
    return <WipPlaceholder />
  }

  return <HomePage />
}
