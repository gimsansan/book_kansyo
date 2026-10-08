# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## PWA: 공유 메뉴 등록과 데이터 보호

### 공유 메뉴에 띄우기 (Web Share Target)

`public/manifest.webmanifest`의 `share_target`이 공유 내용을 `GET /share?title=&text=&url=`로 넘긴다.
`src/pages/Share.jsx`가 이를 받아 `rawFromShareParams`로 한 덩어리 텍스트를 만들고, 기존 `parseShare` 흐름을 그대로 탄다.

- **안드로이드 크롬에서만** 동작한다. iOS는 공유 대상 등록을 지원하지 않으므로, 아이폰에서는 `/share`가 그냥 붙여넣기 화면이다.
- 공유 메뉴에 뜨려면 **앱이 설치되어 있어야 한다**: HTTPS로 열고 "홈 화면에 추가"를 한 번 해야 한다.
- 서비스 워커(`public/sw.js`)는 빌드본에서만 등록된다(`src/main.jsx`). 개발 서버에서는 캐시가 끼지 않는다.
- 배포 호스트는 **SPA 폴백**이 필요하다. `/share`를 포함한 모든 경로가 `index.html`을 받아야 한다
  (Netlify `_redirects`, Vercel `rewrites`, nginx `try_files ... /index.html`).

확인: `npm run build && npm run preview` 뒤 `http://localhost:4173/share?text=문구%0A<책>,%20저자%20-%20밀리의%20서재`

### 데이터 유실 막기

데이터는 각 기기의 `localStorage`에만 있다. **서버는 쓰지 않기로 했다**(`doc/데이터-보관-결정.md`).
그래서 백업이 유일한 안전망이고, 안전장치는 세 가지다.

- `src/lib/persist.js` — 저장할 문구가 생기면 `navigator.storage.persist()`로 저장소를 지우지 말라고 요청한다.
  크롬은 사용 빈도를 보고 자동으로 허락하고, 사파리는 홈 화면에 추가해야 허락한다. 거절되면 배너에 요청 버튼이 뜬다.
- `src/lib/backup.js` — 마지막 백업 시점과 그때의 문구 수를 기록한다. 백업한 적이 없거나,
  백업 뒤 새 문구가 생긴 채로 7일이 지나거나(또는 20개가 쌓이면) 배너로 JSON 내보내기를 권한다. "나중에"는 사흘 미룬다.
- `src/lib/storage.js` — 사파리 비공개 모드나 공간 부족으로 `setItem`이 실패해도 화면은 돌아가고,
  배너가 "지금 내보내세요"라고 알린다.

### 기기 간 이동

자동 동기화는 없다. 다른 기기의 문구를 가져오려면 거기서 **JSON 내보내기** 한 파일을
이 기기에서 **합치기 가져오기**로 읽는다.

| 버튼 | 하는 일 |
|---|---|
| 합치기 가져오기 | 없는 것만 더한다. 겹치면 이 기기 것을 남긴다 (`mergeJson`) |
| 덮어쓰기 복원… | 통째로 갈아끼운다. 기기 교체·데이터 손상용 (`importJson`) |

같은 책을 두 기기에서 따로 저장하면 `id`가 다르므로, **제목·저자가 같으면 같은 책으로** 합친다.

한계: **삭제는 전파되지 않는다.** 한쪽에서 지운 문구가 합치기로 되살아난다.
지우기는 주 기기에서만 한다. 자세한 규칙과 되살릴 조건은 `doc/데이터-보관-결정.md`.

목업 데이터가 켜져 있는 동안에는 백업을 권하지 않는다.
