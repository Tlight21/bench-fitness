import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { today, shortDate, currentWeek, todayDayId, findPhase } from '../utils/dates'
import { getProgression } from '../utils/progression'

const WEEK_DAYS = [
  { d: 'mon', l: 'M' }, { d: 'tue', l: 'T' }, { d: 'wed', l: 'W' },
  { d: 'thu', l: 'T' }, { d: 'fri', l: 'F' }, { d: 'sat', l: 'S' },
  { d: 'sun', l: 'S' },
]

export default function Today({ prog, settings, sessions, onStart }) {
  const week = currentWeek(settings.startDate)
  const phase = findPhase(prog, week)
  const dayId = todayDayId()
  const todayDay = phase?.days?.find(d => d.id === dayId)
  const doneToday = sessions.some(s => s.date === today() && s.programmeId === prog.id)
  const progSessions = sessions.filter(s => s.programmeId === prog.id)
  const totalWeeks = prog.phases[prog.phases.length - 1]?.weekEnd || 28
  const pct = Math.min(100, Math.round(week / totalWeeks * 100))
  const trainingDays = phase?.days?.filter(d => d.exercises.length > 0).map(d => d.id) || []

  const handleStart = () => {
    if (!todayDay || !todayDay.exercises.length) return
    const session = {
      id: `s-${Date.now()}`,
      programmeId: prog.id,
      date: today(),
      dayId,
      sessionTitle: todayDay.title,
      phaseId: phase.id,
      phaseName: phase.name,
      weekNum: week,
      completed: false,
      startTime: new Date().toISOString(),
      exercises: todayDay.exercises.map(ex => ({
        eid: ex.eid,
        name: ex.name,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        targetWeight: ex.targetWeight,
        sets: Array.from({ length: ex.targetSets }, () => ({
          reps: '', weight: '', completed: false,
        })),
      })),
    }
    onStart(session)
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Date + Week */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 11, color: E.gray5, letterSpacing: 1, marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long',
          }).toUpperCase()}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
          Week {week}
        </div>
        <div style={{ fontSize: 13, color: E.gray5, marginTop: 4 }}>
          {phase?.fullName}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Label>Programme Progress</Label>
            <span style={{ fontSize: 10, fontWeight: 700, color: E.gray4 }}>{pct}%</span>
          </div>
          <div style={{ height: 2, background: E.gray2 }}>
            <div style={{ height: '100%', background: E.white, width: `${pct}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {[
          { label: 'Sessions', value: progSessions.length },
          { label: 'Phase', value: phase?.name },
          { label: 'Wks Left', value: Math.max(0, totalWeeks - week) },
        ].map(({ label, value }, idx) => (
          <div key={label} style={{
            padding: 20,
            borderRight: idx < 2 ? `1px solid ${E.gray2}` : 'none',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{value}</div>
            <Label style={{ marginTop: 4 }}>{label}</Label>
          </div>
        ))}
      </div>

      <Divider />

      {/* Week days */}
      <div style={{ padding: '20px 20px 0' }}>
        <Label style={{ marginBottom: 14 }}>This Week</Label>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
          gap: 6, marginBottom: 24,
        }}>
          {WEEK_DAYS.map(({ d, l }) => {
            const isToday = d === dayId
            const isTraining = trainingDays.includes(d)
            return (
              <div key={d} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: isToday ? E.white : E.gray4, letterSpacing: 0.5,
                }}>{l}</span>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isToday ? E.accent : isTraining ? E.gray3 : 'transparent',
                }} />
              </div>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Today's session */}
      <div style={{ padding: '20px 20px' }}>
        {todayDay && todayDay.exercises.length > 0 ? (
          <>
            <Label style={{ marginBottom: 6 }}>Today&apos;s Session</Label>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
              {todayDay.title}
            </div>

            {/* Exercise list */}
            {todayDay.exercises.map((ex, idx) => {
              const prog = getProgression(sessions, ex.eid, ex.targetReps)
              return (
                <div key={ex.eid}>
                  <div style={{ paddingBottom: 16, paddingTop: idx === 0 ? 0 : 16 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: prog ? 8 : 0,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                      <span style={{ fontSize: 12, color: E.gray5 }}>
                        {ex.targetSets} × {ex.targetReps}
                      </span>
                    </div>
                    {prog && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        <div>
                          <Label style={{ marginBottom: 2 }}>Last time</Label>
                          <span style={{ fontSize: 12, color: E.gray6 }}>
                            {prog.isBW ? `BW × ${prog.lastReps}` : `${prog.lastWeight} kg × ${prog.avgReps}`}
                            <span style={{ fontSize: 10, color: E.gray4, marginLeft: 6 }}>
                              {shortDate(prog.lastDate)}
                            </span>
                          </span>
                        </div>
                        <div>
                          <Label style={{ marginBottom: 2, color: E.accent }}>Beat this</Label>
                          <span style={{ fontSize: 12, fontWeight: 700, color: E.accent }}>
                            {prog.isBW ? `BW × ${prog.nextReps}` : `${prog.nextWeight} kg × ${prog.nextReps}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {idx < todayDay.exercises.length - 1 && <Divider />}
                </div>
              )
            })}

            {/* Start button */}
            {!doneToday && (
              <button onClick={handleStart} className="tap" style={{
                width: '100%', background: E.white, color: E.black,
                border: 'none', borderRadius: 4, padding: '17px 0',
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
                marginTop: 20,
              }}>
                Start Session
              </button>
            )}
            {doneToday && (
              <div style={{
                textAlign: 'center', padding: '17px 0', marginTop: 20,
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                color: E.green, textTransform: 'uppercase',
              }}>
                ✓ Logged today
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Session</div>
            <div style={{ fontSize: 13, color: E.gray5 }}>
              {todayDay ? 'Recovery is part of the programme.' : 'Nothing scheduled today.'}
            </div>
          </div>
        )}
      </div>

      {/* Recent sessions */}
      {progSessions.length > 0 && (
        <>
          <Divider />
          <div style={{ padding: '20px 20px' }}>
            <Label style={{ marginBottom: 14 }}>Recent</Label>
            {progSessions.slice(0, 4).map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 0',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.sessionTitle}</div>
                  <div style={{ fontSize: 11, color: E.gray5, marginTop: 2 }}>
                    {s.phaseName} · Week {s.weekNum}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: E.gray4 }}>{shortDate(s.date)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
