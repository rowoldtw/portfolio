'use client'

import { useState } from 'react'
import { TextMorph } from '@/components/ui/text-morph'

export function CopyUrlButton() {
  const [text, setText] = useState('Copy')

  return (
    <button
      onClick={() => {
        setText('Copied')
        navigator.clipboard.writeText(window.location.href)
        window.setTimeout(() => setText('Copy'), 2000)
      }}
      className="font-base flex items-center gap-1 text-center text-sm text-zinc-500 transition-colors dark:text-zinc-400"
      type="button"
    >
      <TextMorph>{text}</TextMorph>
      <span>URL</span>
    </button>
  )
}
