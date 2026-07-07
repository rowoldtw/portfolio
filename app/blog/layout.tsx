import { ScrollProgress } from '@/components/ui/scroll-progress'
import { Header } from '../header'
import { CopyUrlButton } from './copy-url-button'

export default function LayoutBlogPost({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background dark:bg-[#111]">
      <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-20">
        <Header />

        <div className="pointer-events-none fixed top-0 left-0 z-10 h-12 w-full bg-gray-100 to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-[#111]" />
        <ScrollProgress
          className="fixed top-0 z-20 h-0.5 bg-gray-300 dark:bg-zinc-600"
          springOptions={{
            bounce: 0,
          }}
        />

        <div className="absolute top-24 right-4">
          <CopyUrlButton />
        </div>

        <main className="prose prose-gray prose-h4:prose-base dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium mt-24 pb-20">
          {children}
        </main>
      </div>
    </div>
  )
}
