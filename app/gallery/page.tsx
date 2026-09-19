import { permanentRedirect } from 'next/navigation'

export default function GalleryRedirect() {
  permanentRedirect('/projects')
}
