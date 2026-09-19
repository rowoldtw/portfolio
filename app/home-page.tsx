import { Header } from './header'

export default function HomePage() {
  return (
    <main className="bg-background min-h-dvh w-full dark:bg-[#111]">
      <section
        id="home"
        data-section="home"
        className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col items-center justify-center px-4 py-20 text-left"
      >
        <Header className="mb-0" />
      </section>
    </main>
  )
}
