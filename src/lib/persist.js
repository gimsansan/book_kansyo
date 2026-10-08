// 브라우저가 저장소를 함부로 비우지 못하게 요청한다.
// 크롬은 앱 설치·사용 빈도를 보고 자동으로 허락하고, 사파리는 홈 화면에 추가해야 허락한다.
export function persistSupported() {
  return typeof navigator !== 'undefined' && !!navigator.storage?.persist
}

export async function isPersisted() {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return false
  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}

export async function requestPersist() {
  if (!persistSupported()) return false
  try {
    if (await isPersisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function estimateUsage() {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  try {
    const { usage, quota } = await navigator.storage.estimate()
    return { usage: usage ?? 0, quota: quota ?? 0 }
  } catch {
    return null
  }
}
