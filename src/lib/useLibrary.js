import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from './storage.js'

export function useLibrary() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
