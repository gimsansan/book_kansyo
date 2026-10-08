import { exportJson, getSnapshot, mockIsActive } from './storage.js'

const KEY = 'book-kansyo-backup-v1'
const DAY = 24 * 60 * 60 * 1000
const REMIND_AFTER_DAYS = 7
const SNOOZE_DAYS = 3
const URGENT_UNSAVED = 20

function readState() {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeState(patch) {
  const next = { ...readState(), ...patch }
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 저장소가 막혀 있으면 기록만 포기한다
  }
  return next
}

export function getBackupState() {
  const state = readState()
  return {
    at: typeof state.at === 'string' ? state.at : '',
    count: Number.isFinite(state.count) ? state.count : 0,
    snoozedAt: typeof state.snoozedAt === 'string' ? state.snoozedAt : '',
  }
}

export function markBackupDone(now = new Date()) {
  return writeState({
    at: now.toISOString(),
    count: getSnapshot().quotes.length,
    snoozedAt: '',
  })
}

export function snoozeBackup(now = new Date()) {
  return writeState({ snoozedAt: now.toISOString() })
}

// 백업을 권할지 판단한다. 권하지 않을 때는 null.
export function evaluateReminder({ quoteCount, state, now = Date.now() }) {
  if (quoteCount <= 0) return null

  const since = (iso) => (iso ? (now - Date.parse(iso)) / DAY : Infinity)
  if (since(state.snoozedAt) < SNOOZE_DAYS) return null

  const unsaved = Math.max(0, quoteCount - state.count)
  const days = since(state.at)

  if (!state.at) return { unsaved: quoteCount, days: null, never: true }
  if (unsaved === 0) return null
  if (unsaved >= URGENT_UNSAVED || days >= REMIND_AFTER_DAYS) {
    return { unsaved, days: Math.floor(days), never: false }
  }
  return null
}

export function getBackupReminder(now = Date.now()) {
  // 목업은 잃어도 되는 데이터라 백업을 권하지 않는다
  if (mockIsActive()) return null
  return evaluateReminder({
    quoteCount: getSnapshot().quotes.length,
    state: getBackupState(),
    now,
  })
}

export function downloadBackup() {
  const stamp = new Date().toISOString().slice(0, 10)
  const blob = new Blob([exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `book-kansyo-${stamp}.json`
  link.click()
  URL.revokeObjectURL(url)
  markBackupDone()
}
