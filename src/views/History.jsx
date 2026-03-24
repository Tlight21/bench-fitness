import { useState } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { shortDate } from '../utils/dates'

export default function History({ sessions, onDelete }) {
  const [expanded, setExpanded] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
          History
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Sessions</div>
          <div style={{ fontSize: 13, color: E.gray5 }}>Completed sessions will appear here.</div>
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {sorted.map((s, idx) => {
            const isExpanded = expanded === s.id
            const isMenuOpen = menuOpen === s.id
            return (
              <div key={s.id}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                }}>
                  <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="tap" style={{
                      flex: 1, background: 'transparent', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      padding: '14px 0',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: E.white }}>{s.sessionTitle}</div>
                        <div style={{ fontSize: 11, color: E.gray5, marginTop: 3 }}>
                          {s.phaseName} · Week {s.weekNum}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: E.gray5 }}>{shortDate(s.date)}</div>
                    </div>
                  </button>

                  {/* 3-dot menu */}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setMenuOpen(isMenuOpen ? null : s.id)}
                      className="tap" style={{
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', padding: '14px 4px 14px 12px',
                        fontFamily: 'inherit', lineHeight: 1,
                      }}>
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: 3,
                        alignItems: 'center',
                      }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 3, height: 3, borderRadius: '50%',
                            background: E.gray5,
                          }} />
                        ))}
                      </div>
                    </button>

                    {isMenuOpen && (
                      <>
                        <div onClick={() => setMenuOpen(null)} style={{
                          position: 'fixed', inset: 0, zIndex: 50,
                        }} />
                        <div style={{
                          position: 'absolute', right: 0, top: '100%',
                          background: E.gray1, border: `1px solid ${E.gray3}`,
                          borderRadius: 6, zIndex: 51, minWidth: 150,
                          overflow: 'hidden',
                        }}>
                          <button onClick={() => {
                            onDelete(s.id)
                            setMenuOpen(null)
                            if (expanded === s.id) setExpanded(null)
                          }} className="tap" style={{
                            width: '100%', background: 'transparent', border: 'none',
                            color: E.red, padding: '12px 16px', fontSize: 13,
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                            textAlign: 'left',
                          }}>Delete session</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ paddingBottom: 14 }}>
                    {s.exercises.map(ex => (
                      <div key={ex.eid} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 400, color: E.gray5, marginBottom: 4 }}>
                          {ex.name}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {ex.sets.filter(set => set.completed).map((set, sIdx) => (
                            <span key={sIdx} style={{
                              fontSize: 10, color: E.gray6, background: E.gray1,
                              padding: '3px 8px', borderRadius: 3,
                            }}>
                              {set.weight || 'BW'} × {set.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {idx < sorted.length - 1 && <Divider />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
