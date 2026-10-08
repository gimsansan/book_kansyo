import { useEffect, useRef, useState } from 'react'
import { downloadBackup, getBackupState, markBackupDone } from '../lib/backup.js'
import { importJson } from '../lib/storage.js'

function lastBackupLabel(state) {
  if (!state.at) return '아직 백업한 적이 없습니다. 기기를 잃으면 문구도 사라집니다.'
  return `마지막 백업: ${state.at.slice(0, 10)} · 문구 ${state.count}개`
}

export default function BackupBox() {
  const fileRef = useRef(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])

  function onExport() {
    downloadBackup()
    setMessage('내보냈습니다.')
  }

  function onImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJson(String(reader.result))
        markBackupDone()
        setMessage('가져왔습니다.')
      } catch {
        setMessage('가져오기에 실패했습니다.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <section className="panel backup">
      <h2>백업</h2>
      <div className="row">
        <button type="button" onClick={onExport}>
          JSON 내보내기
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          JSON 가져오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={onImport}
        />
      </div>
      <p className="hint">{lastBackupLabel(getBackupState())}</p>
      {message && <p className="status">{message}</p>}
    </section>
  )
}
