'use client'

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'portfolio:cursor-trail-enabled'
const CHANGE_EVENT = 'portfolio:cursor-trail-change'
let fallbackEnabled = true

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false'
  } catch {
    return fallbackEnabled
  }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback()
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export function setCursorTrailEnabled(enabled: boolean) {
  fallbackEnabled = enabled
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled))
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useCursorTrailEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
