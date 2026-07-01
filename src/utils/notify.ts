import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

let cachedGrant = false

async function ensurePermission(): Promise<boolean> {
  if (cachedGrant) return true
  if (await isPermissionGranted()) {
    cachedGrant = true
    return true
  }
  return (await requestPermission()) === 'granted'
}

export async function notify(title: string, body: string): Promise<void> {
  try {
    if (!(await ensurePermission())) return
    sendNotification({ title, body })
  } catch (err) {
    console.warn('Notification failed', err)
  }
}
