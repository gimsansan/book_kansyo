# 독서 노트 인계문

작성일: 2026-10-07  
프로젝트: `d:\Projects\261006_book_kansyo`  
원 계획: `초기봇북감상PLAN.md` (로컬 다운로드 문서. 저장소에는 없음)

밀리의 서재 공유 문구를 붙여넣으면 책·저자별로 모아 두는 웹앱. 지금은 브라우저 `localStorage`만 쓰는 로컬 단계다. 폰 앱이 아니라, 폰 브라우저에서도 여는 웹 화면이다.

> **2026-10-08 기준: 이 문서는 과거 기록이다.**
> 여기 적힌 2단계 **Supabase 연동은 철회됐다.** 서버를 붙이지 않고 로컬에 둔 채
> JSON 합치기로 기기 간 이동을 한다. 판단 근거와 되살릴 조건은
> `doc/데이터-보관-결정.md`, 현재 상태는 `doc/현재인계문.md`를 본다.

데이터 모델은 투두 앱(Todoist, Trello)과 동일하다. **책(카테고리/프로젝트 폴더)** 안에 **문구(할 일 카드)**가 속하는 구조이며, 문구 이동과 정리는 드래그 앤 드롭으로 가볍게 처리한다.

---

## 1. 지금 상태

| 계획 단계 | 상태 |
|---|---|
| 1단계 로컬 MVP (파싱, 저장, 목록, 검색) | 됨 |
| 2단계 Supabase, 로그인, 노트북·폰 동기화 | 안 됨. 계정 필요 |
| 3단계 페이지/메모, 책 정보 수정, 중복 방지, JSON 백업 | 로컬에서 됨 |
| 드래그로 순서 변경, 다른 책(카테고리)으로 이동 | 됨. 2026-10-07 수정. 9장 참고 |
| 4단계 PWA, 배포 | 안 됨 |
| 5단계 오프라인 동기화, 안드로이드 공유 대상, 표지/캘린더/랜덤 | 안 됨 |

테스트: `npm test` → 8개 통과 (파싱 5, 순서/이동 2, 목업 1).

---

## 2. 실행

```bash
npm install
npm run dev
npm test
```

개발 서버는 Vite다. 기본 주소는 http://localhost:5173/ 이고, 그 포트가 이미 쓰이면 5174로 올라간다. 화면을 보려면 새로고침한다.

화면:
- `/` 홈: 붙여넣기, 최근 문구 5개, 책 목록, JSON 백업
- `/book/:id` 책 상세: 해당 책에 속한 문구를 드래그 순서(`position`)대로 표시
- `/search` 검색: 문구, 메모, 제목, 저자 검색 및 검색어 강조

---

## 3. 저장 및 데이터 규칙 (투두 앱 모델)

데이터는 이 브라우저의 `localStorage` 키 `book-kansyo-v1`에 저장된다. 브라우저 사이트별 저장 용량(보통 약 5MB)을 따른다.

### 책(카테고리)과 문구(카드)의 독립성
- **책은 독립된 폴더:** 문구를 모두 다른 책으로 옮겨서 속한 문구가 0개가 되더라도 책은 **절대 자동으로 삭제되지 않고 유지**된다.
- **수동 삭제 원칙:** 책 자체를 지우는 것은 사용자가 책 화면이나 관리 메뉴에서 직접 '책 삭제'를 눌렀을 때만 동작한다.
- **자동 책 생성:** 붙여넣기 시 **제목과 저자가 둘 다 일치**하는 책이 있으면 그 책 아래로 들어가고, 없으면 새 책 카테고리를 만든다.
- **중복 방지:** 같은 책 내에 완전히 동일한 본문이 이미 존재하면 "이미 저장한 문구입니다" 안내를 띄운다.

---

## 4. 붙여넣기 형식

마지막 줄만 서지 정보다.

```text
본문 문구. 여러 줄일 수 있다.
<책 제목>, 저자 - 밀리의 서재
```

정규식: `/^<(.+?)>\s*,\s*(.+?)\s*-\s*밀리의 서재$/`  
파일: `src/lib/parseShare.js`

마지막 줄이 이 형식이 아니면 전체를 본문으로 두고 제목은 `제목 없음`으로 저장한다. 저자가 여러 명이면 저자 문자열을 통째로 저장한다. 저장 전에 제목, 저자, 본문을 미리보기에서 수정할 수 있다.

---

## 5. 드래그 (순서 및 소속 정리)

책 화면(`/book/:id`)에서 문구 카드를 드래그하여 정리한다.

- **순서 변경 (`reorderQuotes`):** 문구 좌측/우측의 **⋮⋮** 손잡이를 잡아 같은 책 안에서 위아래로 끌어 순서를 바꾼다 (투두 우선순위 정렬과 동일).
- **소속 변경 (`moveQuoteToBook`):** 하단 "다른 책(카테고리)으로 이동" 트레이에 있는 책 카드 위로 문구를 떨어뜨리면, 해당 책의 맨 뒤(`position`)로 소속(`book_id`)만 바뀐다.
- **빈 책 유지:** 문구를 다른 곳으로 옮겨 기존 책에 남은 문구가 0개가 되어도, 기존 책은 빈 카테고리로 그대로 남는다. 빈 책 카드로도 다른 문구를 끌어다 넣을 수 있다.

구현은 `@dnd-kit`을 사용하며 `src/components/SortableQuotes.jsx`에 위치한다.

---

## 6. 임시 목업 (확인 후 제거)

드래그 연습을 위해 문구 10개, 책 5권을 준비해 둔 상태다.

- 첫 방문에만 주입: `src/main.jsx`의 `ensureDragMock()`
- 플래그 키: `book-kansyo-mock-v1` (`1`: 사용 중, `off`: 삭제됨)
- 홈의 **목업 다시 섞기**: 연습 데이터를 초기 상태로 리셋
- **목업 지우기**: 데이터를 비우며 재방문 시 자동 생성되지 않음
- 데이터 정의: `src/lib/mockData.js`

확인 후 제거 대상:
1. `src/main.jsx`의 `ensureDragMock()` 호출
2. `src/pages/Home.jsx`의 목업 안내 상자
3. `src/lib/mockData.js`, `src/lib/mockData.test.js`
4. `src/lib/storage.js` 내 목업 관련 함수들

---

## 7. 파일 및 데이터 구조

```text
src/
  main.jsx                 앱 시작. 목업 최초 주입
  App.jsx                  라우팅 (홈 / 책 / 검색)
  index.css
  lib/parseShare.js        밀리의 서재 공유 텍스트 파싱
  lib/storage.js           데이터 조작 (순서 변경, 이동, 수동 삭제)
  lib/useLibrary.js        저장소 동기화 훅
  lib/mockData.js          임시 목업
  components/PasteBox.jsx  붙여넣기 및 미리보기
  components/BookList.jsx  책 목록 (문구가 0개인 책도 표시)
  components/QuoteList.jsx 문구 목록
  components/QuoteItem.jsx 문구 카드 (손잡이, 메모, 개별 삭제)
  components/SortableQuotes.jsx 드래그 앤 드롭 정렬/이동 컨테이너
  components/SearchBar.jsx
  components/Highlight.jsx
  components/BackupBox.jsx JSON 백업/복원
  pages/Home.jsx
  pages/Book.jsx
  pages/Search.jsx
```

### 데이터 스키마
- **책 (`books`)**: `id`, `title`, `author`, `created_at`
- **문구 (`quotes`)**: `id`, `book_id`, `text`, `page`, `note`, `raw`, `position`, `created_at`

### 주요 데이터 조작 함수 (`src/lib/storage.js`)
- `reorderQuotes(bookId, activeId, overId)`: 같은 책 내에서 `position` 인덱스 재정렬
- `moveQuoteToBook(quoteId, targetBookId)`: 대상 문구의 `book_id`를 바꾸고 대상 책 맨 뒤의 `position` 부여 (기존 책 자동 삭제 로직 없음)
- `deleteQuote(quoteId)`: 문구 1건 수동 삭제
- `deleteBook(bookId)`: 사용자가 책 화면에서 책을 수동 삭제할 때만 실행

---

## 8. 다음에 할 일 (Supabase 연동)

투두 앱 형태의 단순 1:N 구조이므로 백엔드 연동이 직관적이다.

1. **테이블 생성:** `books` 테이블과 `quotes` 테이블 (`book_id REFERENCES books(id) ON DELETE CASCADE`)
2. **RLS 설정:** `user_id = auth.uid()`
3. **환경 변수:** `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. **저장 함수 교체:** `src/lib/storage.js`의 함수들을 Supabase API 호출로 1:1 교체
   - 문구 순서 변경: `quotes`의 `position` 컬럼 일괄 `UPDATE`
   - 책 정보 수정: 같은 `title`·`author`의 다른 책이 있으면 저장 차단 (병합·문구 이동 없음)
5. **PWA 및 배포:** `vite-plugin-pwa` 설정 후 배포 진행

---

## 9. 해결된 것: 드래그 무반응 (2026-10-07)

자세한 원인과 분석 과정: `doc/드래그-무반응-원인분석.md`

### 증상
- 책 화면에서 **⋮⋮** 손잡이를 끌어도 문구 카드가 흐려지지 않고 드래그가 시작되지 않음.
- 하단 타깃 카드 위로 가져가도 `.over` 강조 표시가 나타나지 않음.

### 원인
`.move-tray`에 `position: sticky; bottom: 0`이 지정되어 있어, 책 목록이 길어질 때 트레이가 문구 목록 상단을 물리적으로 덮어버리는 현상 발생. 포인터 이벤트가 손잡이에 닿지 못하고 트레이에 먼저 걸렸음.

### 조치 완료
1. `src/index.css`: `.move-tray`에서 `position: sticky`와 `bottom: 0`을 제거하여 문구 목록 하단에 자연스럽게 배치. dnd-kit의 자동 스크롤로 드래그 이동 지원.
2. `src/components/SortableQuotes.jsx`, `src/components/QuoteItem.jsx`: `useSortable`의 `setActivatorNodeRef`를 손잡이 버튼에 직접 연결하여 터치 및 클릭 이벤트 분리 보장.