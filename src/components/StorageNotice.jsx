import { useEffect, useState } from 'react'
import {
  downloadBackup,
  getBackupReminder,
  snoozeBackup,
} from '../lib/backup.js'
import { isPersisted, persistSupported, requestPersist } from '../lib/persist.js'
import { getWriteError, mockIsActive } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

// 데이터가 localStorage에만 있는 동안의 안전장치.
// 저장소 보호를 요청해 두고, 백업하지 않은 문구가 쌓이면 알린다.
export default function StorageNotice() {
  const { quotes } = useLibrary()
  const [persisted, setPersisted] = useState(true)
  const [tick, setTick] = useState(0)
  const hasData = quotes.length > 0 && !mockIsActive()

  // 지킬 것이 생겼을 때만 자동으로 요청한다.
  // 파이어폭스는 이 요청에 권한 창을 띄우므로, 빈 앱에서 먼저 묻지 않는다.
  useEffect(() => {
    let alive = true
    async function check() {
      if (!persistSupported()) return
      const granted = (await isPersisted()) || (hasData && (await requestPersist()))
      if (alive) setPersisted(!!granted)
    }
    check()
    return () => {
      alive = false
    }
  }, [tick, hasData])

  const writeError = getWriteError()
  const reminder = getBackupReminder()

  function onBackup() {
    downloadBackup()
    setTick((value) => value + 1)
  }

  function onLater() {
    snoozeBackup()
    setTick((value) => value + 1)
  }

  async function onProtect() {
    await requestPersist()
    setTick((value) => value + 1)
  }

  const showProtect = !persisted && hasData
  if (!writeError && !reminder && !showProtect) return null

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

      {reminder && (
        <section className="notice">
          <p>
            {reminder.never
              ? `아직 백업한 적이 없어요. 문구 ${reminder.unsaved}개가 이 기기에만 있습니다.`
              : `백업한 지 ${reminder.days}일 됐어요. 문구 ${reminder.unsaved}개가 아직 백업되지 않았습니다.`}
          </p>
          <div className="row">
            <button type="button" className="primary" onClick={onBackup}>
              JSON으로 내보내기
            </button>
            <button type="button" onClick={onLater}>
              나중에
            </button>
          </div>
        </section>
      )}

      {showProtect && !reminder && !writeError && (
        <section className="notice">
          <p>
            브라우저가 공간이 부족하면 저장한 문구를 지울 수 있어요. 지우지 않도록
            요청해 두세요.
          </p>
          <div className="row">
            <button type="button" onClick={onProtect}>
              저장소 보호 요청
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
