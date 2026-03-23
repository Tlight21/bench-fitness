import { useState } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { shortDate } from '../utils/dates'
import { getProgression } from '../utils/progression'

export default function Session({ session, sessions, prs, onComplete, onDiscard }) {
  const [exercises, setExercises] = useState(session.exercises)
  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)

  const ex = exercises[exIdx]
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets = exercises.reduce((n, e) => n + e.sets.filter(s => s.completed).length, 0)
  const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0
  const allDone = exercises.every(e => e.sets.every(s => s.completed))
  const prog = ex ? getProgression(sessions, ex.eid, ex.targetReps) : null
  const isPR = (eid, weight) => weight && !isNaN(parseFloat(weight)) && prs[eid] && parseFloat(weight) > prs[eid]

  const updateSet = (eI, sI, field, value) => {
    setExercises(prev => prev.map((e, i) =>
      i !== eI ? e : {
        ...e,
        sets: e.sets.map((s, j) => j !== sI ? s : { ...s, [field]: value }),
      }
    ))
  }

  const completeSet = (eI, sI) => {
    setExercises(prev => prev.map((e, i) =>
      i !== eI ? e : {
        ...e,
        sets: e.sets.map((s, j) => j !== sI ? s : { ...s, completed: true }),
      }
    ))
    // Auto-advance
    if (sI < exercises[eI].sets.length - 1) {
      setSetIdx(sI + 1)
    } else if (eI + 1 < exercises.length) {
      setExIdx(eI + 1)
      setSetIdx(0)
    }
  }

  const deleteSet = (eI, sI) => {
    setExercises(prev => prev.map((e, i) => {
      if (i !== eI) return e
      const newSets = e.sets.filter((_, j) => j !== sI)
      return { ...e, sets: newSets }
    }))
    // Adjust setIdx if needed
    if (setIdx >= exercises[eI].sets.length - 1) {
      setSetIdx(Math.max(0, exercises[eI].sets.length - 2))
    }
  }

  const addSet = (eI) => {
    setExercises(prev => prev.map((e, i) =>
      i !== eI ? e : {
        ...e,
        sets: [...e.sets, { reps: '', weight: '', completed: false }],
      }
    ))
  }

  const completeAll = (eI) => {
    setExercises(prev => prev.map((e, i) =>
      i !== eI ? e : {
        ...e,
        sets: e.sets.map(s => ({ ...s, completed: true })),
      }
    ))
  }

  const handleFinish = () => {
    onComplete({ ...session, exercises, completed: true })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      background: E.black, overflowY: 'auto',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: E.black, padding: '54px 20px 0',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 14,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 4, color: E.accent }}>BENCH</span>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                color: E.accent, textTransform: 'uppercase',
              }}>Live</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
              {session.sessionTitle}
            </div>
          </div>
          <button onClick={onDiscard} className="tap" style={{
            background: 'transparent', border: `1px solid ${E.gray3}`,
            color: E.gray5, padding: '6px 14px', fontSize: 11,
            letterSpacing: 1, cursor: 'pointer', borderRadius: 2,
            fontFamily: 'inherit', textTransform: 'uppercase',
          }}>Discard</button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 2, background: E.gray2 }}>
            <div style={{ height: '100%', background: E.accent, width: `${pct}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: E.gray5 }}>{doneSets} / {totalSets} sets</span>
            <span style={{ fontSize: 10, color: E.gray5 }}>{pct}%</span>
          </div>
        </div>

        {/* Exercise tabs */}
        <div style={{
          display: 'flex', gap: 20, overflowX: 'auto',
          paddingTop: 18, paddingBottom: 18,
          borderBottom: `1px solid ${E.gray2}`,
        }}>
          {exercises.map((e, idx) => {
            const done = e.sets.every(s => s.completed)
            const active = idx === exIdx
            return (
              <button key={idx} onClick={() => { setExIdx(idx); setSetIdx(0) }}
                className="tap" style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  flexShrink: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 5, fontFamily: 'inherit',
                }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: done ? E.green : active ? E.white : E.gray4,
                  letterSpacing: 0.5, whiteSpace: 'nowrap',
                }}>{done ? '✓' : `${idx + 1}`}</span>
                <span style={{
                  fontSize: 10,
                  color: done ? E.green : active ? E.white : E.gray4,
                  whiteSpace: 'nowrap', maxWidth: 64,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{e.name.split(' ')[0]}</span>
                {active && <div style={{ width: '100%', height: 2, background: E.white }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Current exercise info */}
      {ex && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ paddingTop: 22, paddingBottom: 20, borderBottom: `1px solid ${E.gray2}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
              {ex.name}
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: prog ? 18 : 0 }}>
              <div>
                <Label>Programme Target</Label>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  {ex.targetSets} × {ex.targetReps}
                </div>
              </div>
              <div>
                <Label>Load Guide</Label>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{ex.targetWeight}</div>
              </div>
            </div>

            {/* Progression advice */}
            {prog && (
              <div style={{ background: E.gray1, borderRadius: 4, padding: 16, marginTop: 4 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 28px 1fr',
                  alignItems: 'center', gap: 0, marginBottom: 12,
                }}>
                  <div>
                    <Label style={{ marginBottom: 5 }}>Last time</Label>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: E.gray6 }}>
                      {prog.isBW ? 'BW' : `${prog.lastWeight}kg`}
                    </div>
                    <div style={{ fontSize: 12, color: E.gray5, marginTop: 2 }}>{prog.avgReps} reps avg</div>
                    <div style={{ fontSize: 10, color: E.gray4, marginTop: 2 }}>{shortDate(prog.lastDate)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 16, color: E.gray3 }}>→</div>
                  </div>
                  <div>
                    <Label style={{ marginBottom: 5, color: E.accent }}>Beat this</Label>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: E.accent }}>
                      {prog.isBW ? 'BW' : `${prog.nextWeight}kg`}
                    </div>
                    <div style={{ fontSize: 12, color: E.accent, marginTop: 2, fontWeight: 600 }}>
                      {prog.nextReps} reps
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${E.gray2}`, paddingTop: 10 }}>
                  <div style={{ fontSize: 11, color: E.gray6, lineHeight: 1.5 }}>{prog.advice}</div>
                </div>
              </div>
            )}
          </div>

          {/* Sets */}
          {ex.sets.map((s, sIdx) => {
            const isCurrent = sIdx === setIdx && !s.completed
            const pr = isPR(ex.eid, s.weight)
            return (
              <div key={sIdx} style={{ borderBottom: `1px solid ${E.gray2}` }}>
                {s.completed ? (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '14px 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: E.green }}>✓</span>
                      <span style={{ fontSize: 13, color: E.gray6 }}>
                        Set {sIdx + 1}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: E.gray5 }}>
                        {s.weight ? `${s.weight} kg` : 'BW'} × {s.reps || '—'}
                      </span>
                      {pr && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: E.accent,
                          letterSpacing: 1, textTransform: 'uppercase',
                        }}>NEW PR</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    paddingTop: 14, paddingBottom: 14,
                    background: isCurrent ? E.gray1 : 'transparent',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 10,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: E.gray5 }}>
                        SET {sIdx + 1}
                      </span>
                      <button onClick={() => deleteSet(exIdx, sIdx)} className="tap" style={{
                        background: 'transparent', border: 'none',
                        color: E.red, fontSize: 10, fontWeight: 700,
                        letterSpacing: 1, cursor: 'pointer', fontFamily: 'inherit',
                        textTransform: 'uppercase', padding: '4px 0',
                      }}>Delete</button>
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={s.weight}
                      onChange={e => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                      placeholder="Weight (kg)"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: E.gray2, color: E.white, border: 'none',
                        padding: 12, marginBottom: 10, fontSize: 14,
                        fontFamily: 'inherit', borderRadius: 4,
                        borderBottom: pr ? `2px solid ${E.accent}` : 'none',
                      }}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={s.reps}
                      onChange={e => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                      placeholder="Reps"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: E.gray2, color: E.white, border: 'none',
                        padding: 12, marginBottom: 10, fontSize: 14,
                        fontFamily: 'inherit', borderRadius: 4,
                      }}
                    />
                    <button onClick={() => completeSet(exIdx, sIdx)} className="tap" style={{
                      width: '100%', background: E.accent, color: E.black,
                      border: 'none', padding: 12, fontSize: 12, fontWeight: 800,
                      cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit',
                      textTransform: 'uppercase',
                    }}>Complete Set</button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add set button */}
          <div style={{ display: 'flex', gap: 10, padding: '14px 0' }}>
            <button onClick={() => addSet(exIdx)} className="tap" style={{
              flex: 1, background: 'transparent', border: `1px solid ${E.gray3}`,
              color: E.gray5, padding: '10px 0', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
              fontFamily: 'inherit', textTransform: 'uppercase',
            }}>+ Add Set</button>
            {ex.sets.some(s => !s.completed) && (
              <button onClick={() => completeAll(exIdx)} className="tap" style={{
                flex: 1, background: 'transparent', border: `1px solid ${E.gray3}`,
                color: E.gray5, padding: '10px 0', fontSize: 11, fontWeight: 700,
                letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
                fontFamily: 'inherit', textTransform: 'uppercase',
              }}>Mark All Done</button>
            )}
          </div>
        </div>
      )}

      {/* Finish button */}
      {allDone && (
        <div style={{ padding: '20px 20px 100px' }}>
          <button onClick={handleFinish} className="tap" style={{
            width: '100%', background: E.green, color: E.black,
            border: 'none', borderRadius: 4, padding: '17px 0',
            fontSize: 13, fontWeight: 800, letterSpacing: 1,
            cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
          }}>Finish & Save</button>
        </div>
      )}
    </div>
  )
}
