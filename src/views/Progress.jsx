import { useState } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { shortDate } from '../utils/dates'
import { getProgression } from '../utils/progression'

export default function Progress({ sessions, prs }) {
  const [selected, setSelected] = useState(null)

  // Get all unique exercises from sessions
  const exerciseMap = {}
  sessions.forEach(s => {
    s.exercises?.forEach(ex => {
      if (!exerciseMap[ex.eid]) {
        exerciseMap[ex.eid] = { eid: ex.eid, name: ex.name, targetReps: ex.targetReps }
      }
    })
  })
  const allExercises = Object.values(exerciseMap)

  if (selected) {
    const ex = exerciseMap[selected]
    if (!ex) { setSelected(null); return null }

    const prog = getProgression(sessions, ex.eid, ex.targetReps)
    const history = sessions
      .filter(s => s.exercises?.some(e => e.eid === selected))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(s => {
        const exData = s.exercises.find(e => e.eid === selected)
        const completed = exData.sets.filter(set => set.completed)
        const maxWeight = Math.max(0, ...completed.map(set => parseFloat(set.weight) || 0))
        const avgReps = completed.length
          ? Math.round(completed.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0) / completed.length)
          : 0
        return { date: s.date, maxWeight, avgReps, sets: completed }
      })

    return (
      <div style={{ paddingBottom: 100 }}>
        <div style={{ padding: '24px 20px 0' }}>
          <button onClick={() => setSelected(null)} className="tap" style={{
            background: 'transparent', border: 'none', color: E.gray5,
            fontSize: 12, letterSpacing: 1, cursor: 'pointer', fontFamily: 'inherit',
            textTransform: 'uppercase', padding: 0, marginBottom: 16,
          }}>← BACK</button>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
            {ex.name}
          </div>
          {prs[selected] && (
            <div style={{ fontSize: 13, color: E.accent, fontWeight: 700 }}>
              PR: {prs[selected]} kg
            </div>
          )}
        </div>

        {prog && (
          <div style={{ padding: '20px' }}>
            <div style={{ background: E.gray1, borderRadius: 4, padding: 16 }}>
              <Label style={{ marginBottom: 8 }}>Next Session Target</Label>
              <div style={{ fontSize: 18, fontWeight: 800, color: E.accent }}>
                {prog.isBW ? `BW × ${prog.nextReps}` : `${prog.nextWeight} kg × ${prog.nextReps}`}
              </div>
              <div style={{ fontSize: 11, color: E.gray6, marginTop: 8, lineHeight: 1.5 }}>
                {prog.advice}
              </div>
            </div>
          </div>
        )}

        <Divider />

        <div style={{ padding: '20px' }}>
          <Label style={{ marginBottom: 14 }}>History</Label>
          {history.length === 0 ? (
            <div style={{ fontSize: 13, color: E.gray5 }}>No data for this exercise yet.</div>
          ) : (
            history.map((h, idx) => (
              <div key={idx}>
                <div style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {h.maxWeight ? `${h.maxWeight} kg` : 'BW'} × {h.avgReps} avg
                    </span>
                    <span style={{ fontSize: 11, color: E.gray4 }}>{shortDate(h.date)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {h.sets.map((s, sIdx) => (
                      <span key={sIdx} style={{
                        fontSize: 10, color: E.gray5, background: E.gray1,
                        padding: '3px 8px', borderRadius: 3,
                      }}>
                        {s.weight || 'BW'} × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
                {idx < history.length - 1 && <Divider />}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
          Progress
        </div>
      </div>

      {allExercises.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: E.gray5 }}>
            Complete your first session to track progress.
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {allExercises.map((ex, idx) => {
            const prog = getProgression(sessions, ex.eid, ex.targetReps)
            return (
              <div key={ex.eid}>
                <button onClick={() => setSelected(ex.eid)} className="tap" style={{
                  width: '100%', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  padding: '14px 0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: E.white }}>{ex.name}</div>
                      {prog && (
                        <div style={{ fontSize: 11, color: E.gray5, marginTop: 3 }}>
                          {prog.isBW ? `BW × ${prog.lastReps}` : `${prog.lastWeight} kg × ${prog.avgReps}`}
                          <span style={{ color: E.gray4, marginLeft: 6 }}>{shortDate(prog.lastDate)}</span>
                        </div>
                      )}
                    </div>
                    {prs[ex.eid] && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: E.accent }}>
                        {prs[ex.eid]} kg
                      </span>
                    )}
                  </div>
                </button>
                {idx < allExercises.length - 1 && <Divider />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
