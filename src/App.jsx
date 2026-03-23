import { useState, useEffect } from 'react'
import { E } from './theme'
import { storage, supabase, performInitialSync } from './utils/storage'
import { DEFAULT_PROGRAMME } from './data/programme'
import TabBar from './components/TabBar'
import Today from './views/Today'
import Session from './views/Session'
import Progress from './views/Progress'
import History from './views/History'
import Plans from './views/Plans'

export default function App() {
  // Auth state
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('signin') // signin | signup
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  // App state
  const [tab, setTab] = useState('today')
  const [programmes, setProgrammes] = useState([DEFAULT_PROGRAMME])
  const [sessions, setSessions] = useState([])
  const [prs, setPrs] = useState({})
  const [selectedProg, setSelectedProg] = useState('sprint-100-200')
  const [currentSession, setCurrentSession] = useState(null)
  const [settings, setSettings] = useState({ startDate: '2026-03-23' })
  const [loading, setLoading] = useState(true)

  // Auto-save active session to localStorage
  const saveActiveSession = (session) => {
    setCurrentSession(session)
    if (session) {
      localStorage.setItem('bench:active_session', JSON.stringify(session))
    } else {
      localStorage.removeItem('bench:active_session')
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
      }
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Load data when user is authenticated
  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadData()
  }, [user])

  // Re-sync on tab visibility
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && user) {
        performInitialSync().then(changed => {
          if (changed) window.location.reload()
        })
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [user])

  async function loadData() {
    setLoading(true)
    // Sync first
    const changed = await performInitialSync()
    if (changed) {
      window.location.reload()
      return
    }

    try {
      const s = await storage.get('nk:settings')
      setSettings(JSON.parse(s.value))
    } catch {}
    try {
      const s = await storage.get('nk:sessions')
      setSessions(JSON.parse(s.value))
    } catch {}
    try {
      const p = await storage.get('nk:prs')
      setPrs(JSON.parse(p.value))
    } catch {}
    try {
      const p = await storage.get('nk:programmes')
      setProgrammes(JSON.parse(p.value))
    } catch {}

    // Restore active session if one was in progress
    try {
      const saved = localStorage.getItem('bench:active_session')
      if (saved) {
        setCurrentSession(JSON.parse(saved))
      }
    } catch {}

    setLoading(false)
  }

  // Persist helpers
  const saveSessions = (newSessions) => {
    setSessions(newSessions)
    storage.set('nk:sessions', JSON.stringify(newSessions))
  }

  const savePrs = (newPrs) => {
    setPrs(newPrs)
    storage.set('nk:prs', JSON.stringify(newPrs))
  }

  // Session completion
  const handleSessionComplete = (completedSession) => {
    const newPrs = { ...prs }
    completedSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed && s.weight) {
          const w = parseFloat(s.weight)
          if (!isNaN(w) && (!newPrs[ex.eid] || w > newPrs[ex.eid])) {
            newPrs[ex.eid] = w
          }
        }
      })
    })
    savePrs(newPrs)
    saveSessions([completedSession, ...sessions])
    saveActiveSession(null)
    setTab('today')
  }

  const handleDeleteSession = (id) => {
    saveSessions(sessions.filter(s => s.id !== id))
  }

  // Auth handlers
  const handleAuth = async () => {
    if (!authEmail || !authPassword) {
      setAuthError('Please enter email and password.')
      return
    }
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    setAuthBusy(true)
    setAuthError('')

    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })

    if (result.error) {
      setAuthError(result.error.message)
      setAuthBusy(false)
      return
    }

    if (authMode === 'signup' && !result.data.session) {
      setAuthError('Account created! Check your email to confirm, then sign in.')
      setAuthMode('signin')
      setAuthPassword('')
      setAuthBusy(false)
      return
    }

    setAuthBusy(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTab('today')
  }

  // Auth gate
  if (authLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: E.black,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 8, color: E.white }}>BENCH</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: E.black,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>
        <div style={{ width: 'min(320px, 85vw)', textAlign: 'center' }}>
          <div style={{
            fontSize: 32, fontWeight: 800, letterSpacing: 8,
            color: E.white, textTransform: 'uppercase', marginBottom: 48,
          }}>BENCH</div>

          <input
            type="email"
            value={authEmail}
            onChange={e => setAuthEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('bs-pw').focus()}
            placeholder="Email"
            autoComplete="email"
            style={{
              width: '100%', boxSizing: 'border-box', background: E.gray1,
              border: `1px solid ${E.gray2}`, borderRadius: 8,
              padding: '14px 16px', color: E.white, fontSize: 15,
              fontFamily: 'inherit', marginBottom: 10, outline: 'none',
            }}
          />
          <input
            id="bs-pw"
            type="password"
            value={authPassword}
            onChange={e => setAuthPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="Password"
            autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
            style={{
              width: '100%', boxSizing: 'border-box', background: E.gray1,
              border: `1px solid ${E.gray2}`, borderRadius: 8,
              padding: '14px 16px', color: E.white, fontSize: 15,
              fontFamily: 'inherit', marginBottom: 16, outline: 'none',
            }}
          />

          {authError && (
            <div style={{
              color: authError.startsWith('Account created') ? E.green : E.red,
              fontSize: 13, marginBottom: 12,
            }}>{authError}</div>
          )}

          <button onClick={handleAuth} disabled={authBusy} className="tap" style={{
            width: '100%', background: E.accent, color: E.white,
            border: 'none', borderRadius: 8, padding: 16,
            fontSize: 13, fontWeight: 800, letterSpacing: 2,
            cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
            opacity: authBusy ? 0.6 : 1,
          }}>
            {authBusy
              ? (authMode === 'signup' ? 'CREATING...' : 'SIGNING IN...')
              : (authMode === 'signup' ? 'SIGN UP' : 'SIGN IN')
            }
          </button>

          <div style={{ marginTop: 20 }}>
            <span
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'signin' : 'signup')
                setAuthError('')
              }}
              style={{ color: E.gray4, fontSize: 12, cursor: 'pointer' }}
            >
              {authMode === 'signup'
                ? <>Already have an account? <span style={{ color: E.accent }}>Sign in</span></>
                : <>Don&apos;t have an account? <span style={{ color: E.accent }}>Sign up</span></>
              }
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: E.black,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 13, color: E.gray5 }}>Loading...</div>
      </div>
    )
  }

  const prog = programmes.find(p => p.id === selectedProg) || programmes[0]

  // Live session overlay
  if (currentSession) {
    return (
      <Session
        session={currentSession}
        sessions={sessions}
        prs={prs}
        onComplete={handleSessionComplete}
        onDiscard={() => saveActiveSession(null)}
        onUpdate={(updated) => saveActiveSession(updated)}
      />
    )
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: E.black, color: E.white,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      {/* Global styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        .tap:active { opacity: 0.55; }
        input { outline: none; color: ${E.white}; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        body, button, select, input { background: ${E.black}; color: ${E.white}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '54px 20px 0', background: E.black,
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', paddingBottom: 14,
          borderBottom: `1px solid ${E.gray2}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: 4,
              textTransform: 'uppercase', color: E.accent,
            }}>BENCH</div>
            <div style={{
              fontSize: 11, fontWeight: 400, letterSpacing: 1,
              color: E.gray4, textTransform: 'uppercase',
            }}>{prog.name}</div>
          </div>
          <button onClick={handleSignOut} className="tap" style={{
            background: 'transparent', border: 'none',
            color: E.gray5, fontSize: 10, fontWeight: 700,
            letterSpacing: 1, cursor: 'pointer', fontFamily: 'inherit',
            textTransform: 'uppercase', padding: '4px 0',
          }}>
            {(user.email || '?')[0].toUpperCase()} ✕
          </button>
        </div>
      </div>

      {/* Views */}
      {tab === 'today' && (
        <Today
          prog={prog}
          settings={settings}
          sessions={sessions}
          onStart={saveActiveSession}
        />
      )}
      {tab === 'progress' && (
        <Progress sessions={sessions} prs={prs} />
      )}
      {tab === 'history' && (
        <History sessions={sessions} onDelete={handleDeleteSession} />
      )}
      {tab === 'plans' && (
        <Plans
          programmes={programmes}
          selectedId={selectedProg}
          onSelect={setSelectedProg}
        />
      )}

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
