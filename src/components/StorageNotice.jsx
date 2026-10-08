import { getWriteError } from '../lib/storage.js'
import { downloadBackup } from '../lib/backup.js'

export default function StorageNotice() {
  const writeError = getWriteError()

  function onBackup() {
    downloadBackup()
  }

  if (!writeError) return null

  return (
    <div className="notice-stack">
      {writeError && (
        <section className="notice notice-alert">
          <p>{writeError}</p>
          <div className="row">
            <button type="button" className="primary" onClick={onBackup}>
              지금 내보내기
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
