import { useEffect, useRef, useState } from 'react'
import { downloadBackup, getBackupState, markBackupDone } from '../lib/backup.js'
import { getSnapshot, importJson, mergeJson } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

function formatBackupDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('ko-KR', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BackupBox() {
  useLibrary()
  const fileRef = useRef(null)
  // 파일을 고른 뒤 무엇을 할지: 'merge' | 'replace'
  const mode = useRef('merge')
  const [message, setMessage] = useState('')
  const [askReplace, setAskReplace] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const lastBackup = formatBackupDate(getBackupState().at)

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
      <button
        type="button"
        className="text-button"
        onClick={() => setExpanded(!expanded)}
        style={{ alignSelf: 'start', padding: '0' }}
      >
        {expanded ? '▼ 백업' : '▶ 백업'}
      {!expanded && lastBackup && (
        <span className="hint" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
          최근 백업: {lastBackup}
        </span>
      )}
      </button>

      {expanded && (
        <>
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

          {askReplace ? (
            <div className="notice notice-alert">
              <p>
                지금 있는 문구 {getSnapshot().quotes.length}개를 모두 삭제하고 백업 파일의
                내용으로 완전히 교체합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="row">
                <button type="button" className="primary" onClick={() => pickFile('replace')}>
                  모든 데이터 삭제하고 복원하기
                </button>
                <button type="button" onClick={() => setAskReplace(false)}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="text-button" onClick={() => setAskReplace(true)}>
              모든 데이터 삭제하고 복원…
            </button>
          )}

          {message && <p className="status">{message}</p>}
        </>
      )}
    </section>
  )
}
