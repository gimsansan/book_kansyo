import { useEffect, useRef, useState } from 'react'
import { downloadBackup, getBackupState, markBackupDone } from '../lib/backup.js'
import { getSnapshot, importJson, mergeJson } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

function lastBackupLabel(state) {
  if (!state.at) return '아직 백업한 적이 없습니다. 기기를 잃으면 문구도 사라집니다.'
  return `마지막 백업: ${state.at.slice(0, 10)} · 문구 ${state.count}개`
}

export default function BackupBox() {
  useLibrary()
  const fileRef = useRef(null)
  // 파일을 고른 뒤 무엇을 할지: 'merge' | 'replace'
  const mode = useRef('merge')
  const [message, setMessage] = useState('')
  const [askReplace, setAskReplace] = useState(false)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timer)
  }, [message])

  function onExport() {
    downloadBackup()
    setMessage('내보냈습니다.')
  }

  function pickFile(next) {
    mode.current = next
    setAskReplace(false)
    fileRef.current?.click()
  }

  function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const picked = mode.current
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = String(reader.result)
        if (picked === 'replace') {
          importJson(json)
          markBackupDone()
          setMessage('덮어썼습니다.')
          return
        }
        const report = mergeJson(json)
        if (report.books + report.quotes === 0) {
          setMessage('새로 들어온 것이 없습니다. 모두 이미 갖고 있습니다.')
          return
        }
        const skipped = report.skipped ? ` (${report.skipped}개는 이미 있어 건너뜀)` : ''
        setMessage(`책 ${report.books}권, 문구 ${report.quotes}개를 더했습니다.${skipped}`)
      } catch {
        setMessage('가져오기에 실패했습니다. 백업 파일이 맞는지 확인하세요.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <section className="panel backup">
      <h2>백업</h2>
      <p className="hint">
        기기끼리 자동으로 맞춰지지 않습니다. 다른 기기의 문구를 가져오려면 거기서
        내보낸 파일을 <strong>합치기</strong>로 읽어 들이세요.
      </p>

      <div className="row">
        <button type="button" onClick={onExport}>
          JSON 내보내기
        </button>
        <button type="button" className="primary" onClick={() => pickFile('merge')}>
          합치기 가져오기
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={onFile}
      />

      <p className="hint">{lastBackupLabel(getBackupState())}</p>

      {askReplace ? (
        <div className="notice notice-alert">
          <p>
            지금 있는 책과 문구 {getSnapshot().quotes.length}개를 모두 지우고 백업
            파일의 내용으로 바꿉니다. 되돌릴 수 없습니다.
          </p>
          <div className="row">
            <button type="button" className="primary" onClick={() => pickFile('replace')}>
              파일 고르고 덮어쓰기
            </button>
            <button type="button" onClick={() => setAskReplace(false)}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => setAskReplace(true)}>
          덮어쓰기 복원…
        </button>
      )}

      {message && <p className="status">{message}</p>}
    </section>
  )
}
