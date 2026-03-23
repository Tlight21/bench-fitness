import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bxfrghqxkxzaibjavykl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZnJnaHF4a3h6YWliamF2eWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTcyNTQsImV4cCI6MjA4OTg3MzI1NH0.r-DycVwQFyHmjraPwLiuyRw0VPypvtefVI9obiGvp9s'

const LS_PREFIX = 'bench:'
const SYNC_TS_PREFIX = 'bench_sync_ts:'
const SYNC_KEYS = ['nk:settings', 'nk:sessions', 'nk:prs', 'nk:programmes']

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const writeQueue = []
let retryTimer = null

function scheduleRetry() {
  if (retryTimer) return
  retryTimer = setTimeout(async () => {
    retryTimer = null
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    const pending = writeQueue.splice(0)
    for (const item of pending) {
      try {
        await supabase.from('user_data').upsert({
          user_id: data.session.user.id,
          key: item.key,
          value: JSON.parse(item.value),
          updated_at: item.timestamp,
        }, { onConflict: 'user_id,key' })
      } catch {
        writeQueue.push(item)
      }
    }
    if (writeQueue.length > 0) scheduleRetry()
  }, 5000)
}

window.addEventListener('online', scheduleRetry)

async function syncToSupabase(key, value) {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return
  const now = new Date().toISOString()
  localStorage.setItem(SYNC_TS_PREFIX + key, now)
  try {
    await supabase.from('user_data').upsert({
      user_id: data.session.user.id,
      key,
      value: JSON.parse(value),
      updated_at: now,
    }, { onConflict: 'user_id,key' })
  } catch {
    writeQueue.push({ key, value, timestamp: now })
    scheduleRetry()
  }
}

export const storage = {
  async get(key) {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (raw === null) throw new Error('Key not found')
    return { key, value: raw }
  },

  async set(key, value) {
    try {
      const strValue = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(LS_PREFIX + key, strValue)
      if (SYNC_KEYS.includes(key)) {
        syncToSupabase(key, strValue)
      }
      return { key, value }
    } catch {
      return null
    }
  },

  async delete(key) {
    localStorage.removeItem(LS_PREFIX + key)
    return { key, deleted: true }
  },

  async list(prefix) {
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PREFIX + (prefix || '')))
      .map(k => k.replace(LS_PREFIX, ''))
    return { keys }
  },
}

export async function performInitialSync() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return false

  const userId = data.session.user.id
  const { data: remoteData, error } = await supabase
    .from('user_data')
    .select('key, value, updated_at')
    .eq('user_id', userId)

  if (error) return false

  let dataChanged = false

  for (const key of SYNC_KEYS) {
    const remote = remoteData?.find(r => r.key === key)
    const localRaw = localStorage.getItem(LS_PREFIX + key)
    const localTs = localStorage.getItem(SYNC_TS_PREFIX + key)

    if (remote && !localRaw) {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(remote.value))
      localStorage.setItem(SYNC_TS_PREFIX + key, remote.updated_at)
      dataChanged = true
    } else if (!remote && localRaw) {
      await syncToSupabase(key, localRaw)
    } else if (remote && localRaw) {
      const remoteTime = new Date(remote.updated_at).getTime()
      const localTime = localTs ? new Date(localTs).getTime() : 0
      if (remoteTime > localTime) {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(remote.value))
        localStorage.setItem(SYNC_TS_PREFIX + key, remote.updated_at)
        dataChanged = true
      } else if (localTime > remoteTime) {
        await syncToSupabase(key, localRaw)
      }
    }
  }

  if (writeQueue.length > 0) scheduleRetry()
  return dataChanged
}
