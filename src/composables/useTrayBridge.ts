import { onMounted, onUnmounted, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { useTimerStore } from '../stores/timer'
import { formatClock } from '../utils/format'

const TRAY_ACTION_EVENT = 'tray://action'
const SET_TRAY_TITLE_CMD = 'set_tray_title'

type TrayAction = 'toggle' | 'reset'

export function useTrayBridge() {
  const timer = useTimerStore()
  let unlisten: UnlistenFn | null = null

  const pushTitle = (secs: number) => {
    void invoke(SET_TRAY_TITLE_CMD, { title: formatClock(secs) })
  }

  const dispatch = (action: TrayAction) => {
    if (action === 'toggle') timer.toggle()
    else if (action === 'reset') timer.reset()
  }

  watch(() => timer.remainingSecs, pushTitle)

  onMounted(async () => {
    pushTitle(timer.remainingSecs)
    unlisten = await listen<TrayAction>(TRAY_ACTION_EVENT, ({ payload }) => {
      dispatch(payload)
    })
  })

  onUnmounted(() => {
    unlisten?.()
    unlisten = null
  })
}
