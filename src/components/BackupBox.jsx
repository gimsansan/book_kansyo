import { useRef, useState } from 'react'
import { exportJson, importJson } from '../lib/storage.js'

export default function BackupBox() {
  const fileRef = useRef(null)
  const [message, setMessage] = useState('')

  function onExport() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'book-kansyo-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function onImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJson(String(reader.result))
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
      {message && <p className="status">{message}</p>}
    </section>
  )
}
