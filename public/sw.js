// 설치형 앱(공유 메뉴 등록)과 오프라인 실행을 위한 최소 서비스 워커.
// 빌드 산출물 이름을 미리 알 수 없으므로, 받아온 응답을 그때그때 캐시에 넣는다.
const CACHE = 'book-kansyo-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/app-icon.svg', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// 화면 이동은 네트워크 먼저, 실패하면 캐시한 앱 껍데기를 돌려준다.
// /share?text=... 같은 주소도 껍데기만 있으면 앱이 직접 주소를 읽어 처리한다.
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE)
    cache.put('/index.html', response.clone())
    return response
  } catch {
    const cached = await caches.match('/index.html')
    return cached ?? Response.error()
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE)
    cache.put(request, response.clone())
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  event.respondWith(handleAsset(request))
})
