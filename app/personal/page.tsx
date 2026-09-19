import { permanentRedirect } from 'next/navigation'

export default function PersonalRedirect() {
  permanentRedirect('/reviews')
}
