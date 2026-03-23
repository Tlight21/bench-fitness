import { useState } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { shortDate } from '../utils/dates'

export default function History({ sessions, onDelete }) {
  const [expanded, setExpanded] = useState(null)
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
            return (
              <div key={s.id}>
                <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                  className="tap" style={{
                    width: '100%', background: 'transparent', border: 'none',
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
                    <div style={{ fontSize: 11, color: E.gray4 }}>{shortDate(s.date)}</div>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ paddingBottom: 14 }}>
                    {s.exercises.map(ex => (
                      <div key={ex.eid} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: E.gray6, marginBottom: 4 }}>
                          {ex.name}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {ex.sets.filter(set => set.completed).map((set, sIdx) => (
                            <span key={sIdx} style={{
                              fontSize: 10, color: E.gray5, background: E.gray1,
                              padding: '3px 8px', borderRadius: 3,
                            }}>
                              {set.weight || 'BW'} × {set.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => onDelete(s.id)} className="tap" style={{
                      background: 'transparent', border: `1px solid ${E.gray3}`,
                      color: E.red, padding: '8px 16px', fontSize: 11,
                      fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                      borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                      marginTop: 6,
                    }}>Delete session</button>
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
