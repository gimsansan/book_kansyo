import { Link, useSearchParams } from 'react-router-dom'
import PasteBox from '../components/PasteBox.jsx'
import { hasShareParams, rawFromShareParams } from '../lib/shareTarget.js'

// 안드로이드 공유 메뉴에서 "북칸쇼"를 고르면 이 주소로 들어온다.
// 아이폰은 공유 대상 등록을 지원하지 않으므로, 붙여넣기 화면으로만 쓰인다.
export default function Share() {
  const [params] = useSearchParams()
  const shared = hasShareParams(params)
  const raw = rawFromShareParams(params)

  return (
    <div className="stack">
      <p className="hint">
        {shared
          ? '공유한 문구를 받았습니다. 책과 저자를 확인하고 저장하세요.'
          : '공유 메뉴를 쓸 수 없으면 여기에 직접 붙여넣으세요.'}
      </p>
      <PasteBox
        key={raw}
        initialRaw={raw}
        label={shared ? '공유로 받은 문구' : '붙여넣을 문구'}
      />
      <Link className="back" to="/">
        홈으로
      </Link>
    </div>
  )
}
