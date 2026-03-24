import { useState, useEffect } from 'react'
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

const DAY_NAMES = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

export default function Today({ prog, settings, sessions, onStart }) {
  const realWeek = currentWeek(settings.startDate)
  const realDayId = todayDayId()
  const totalWeeks = prog.phases[prog.phases.length - 1]?.weekEnd || 28

  const [viewWeek, setViewWeek] = useState(realWeek)
  const [selectedDay, setSelectedDay] = useState(realDayId)

  // Reset to today when component mounts (tab switch / app reopen)
  useEffect(() => {
    setViewWeek(realWeek)
    setSelectedDay(realDayId)
  }, [realWeek, realDayId])

  const phase = findPhase(prog, viewWeek)
  const selectedDayData = phase?.days?.find(d => d.id === selectedDay)
  const isToday = viewWeek === realWeek && selectedDay === realDayId
  const doneToday = isToday && sessions.some(s => s.date === today() && s.programmeId === prog.id)
  const progSessions = sessions.filter(s => s.programmeId === prog.id)
  const pct = Math.min(100, Math.round(realWeek / totalWeeks * 100))
  const trainingDays = phase?.days?.filter(d => d.exercises.length > 0 || d.track).map(d => d.id) || []

  const isTrackDay = selectedDayData?.track

  const handleStart = () => {
    if (!selectedDayData) return
    if (!isTrackDay && !selectedDayData.exercises.length) return
    const session = {
      id: `s-${Date.now()}`,
      programmeId: prog.id,
      date: today(),
      dayId: selectedDay,
      sessionTitle: selectedDayData.title,
      phaseId: phase.id,
      phaseName: phase.name,
      weekNum: viewWeek,
      completed: false,
      track: isTrackDay || false,
      startTime: new Date().toISOString(),
      exercises: isTrackDay ? [] : selectedDayData.exercises.map(ex => ({
        eid: ex.eid,
        name: ex.name,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        targetWeight: ex.targetWeight,
        track: ex.track || false,
        sets: Array.from({ length: ex.targetSets }, () => ({
          reps: '', weight: '', completed: false,
        })),
      })),
    }
    onStart(session)
  }

  const prevWeek = () => setViewWeek(w => Math.max(1, w - 1))
  const nextWeek = () => setViewWeek(w => Math.min(totalWeeks, w + 1))

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
          Week {realWeek}
        </div>
        <div style={{ fontSize: 13, color: E.gray5, marginTop: 4 }}>
          {findPhase(prog, realWeek)?.fullName}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginTop: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Label>Programme Progress</Label>
            <span style={{ fontSize: 10, fontWeight: 700, color: E.gray5 }}>{pct}%</span>
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
          { label: 'Phase', value: findPhase(prog, realWeek)?.name },
          { label: 'Wks Left', value: Math.max(0, totalWeeks - realWeek) },
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

      {/* Week selector */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button onClick={prevWeek} className="tap" style={{
            background: 'transparent', border: 'none', color: viewWeek <= 1 ? E.gray3 : E.gray5,
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
          }} disabled={viewWeek <= 1}>←</button>
          <button onClick={() => { setViewWeek(realWeek); setSelectedDay(realDayId) }} className="tap" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
          }}>
            <Label style={{ color: viewWeek === realWeek ? E.white : E.gray5 }}>
              {viewWeek === realWeek ? 'This Week' : `Week ${viewWeek}`}
            </Label>
            {viewWeek !== realWeek && (
              <div style={{ fontSize: 9, color: E.gray5, textAlign: 'center', marginTop: 2 }}>
                {phase?.name}
              </div>
            )}
          </button>
          <button onClick={nextWeek} className="tap" style={{
            background: 'transparent', border: 'none', color: viewWeek >= totalWeeks ? E.gray3 : E.gray5,
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
          }} disabled={viewWeek >= totalWeeks}>→</button>
        </div>

        {/* Day selector */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
          gap: 6, marginBottom: 24,
        }}>
          {WEEK_DAYS.map(({ d, l }) => {
            const isCurrent = viewWeek === realWeek && d === realDayId
            const isSelected = d === selectedDay
            const isTraining = trainingDays.includes(d)
            return (
              <button key={d} onClick={() => setSelectedDay(d)} className="tap" style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '6px 0', fontFamily: 'inherit',
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: isSelected ? E.white : E.gray5, letterSpacing: 0.5,
                }}>{l}</span>
                <div style={{
                  width: isSelected ? 20 : 8, height: isSelected ? 20 : 8,
                  borderRadius: '50%',
                  background: isSelected ? E.accent : isCurrent ? E.white : isTraining ? E.gray3 : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isSelected && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: E.white }}>
                      {l}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Selected day's session */}
      <div style={{ padding: '20px 20px' }}>
        {isTrackDay ? (
          <>
            <Label style={{ marginBottom: 6 }}>
              {isToday ? "Today's Session" : `${DAY_NAMES[selectedDay]}'s Session`}
            </Label>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
              Track
            </div>
            <div style={{
              background: E.gray1, borderRadius: 8, padding: 20,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, color: E.gray6, lineHeight: 1.6 }}>
                Coach-led session. Log your reps and distances after training.
              </div>
            </div>
            {isToday && !doneToday && (
              <button onClick={handleStart} className="tap" style={{
                width: '100%', background: E.white, color: E.black,
                border: 'none', borderRadius: 4, padding: '17px 0',
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
              }}>
                Log Track Session
              </button>
            )}
            {isToday && doneToday && (
              <div style={{
                textAlign: 'center', padding: '17px 0',
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                color: E.green, textTransform: 'uppercase',
              }}>
                ✓ Logged today
              </div>
            )}
          </>
        ) : selectedDayData && selectedDayData.exercises.length > 0 ? (
          <>
            <Label style={{ marginBottom: 6 }}>
              {isToday ? "Today's Session" : `${DAY_NAMES[selectedDay]}'s Session`}
            </Label>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
              {selectedDayData.title}
            </div>

            {/* Exercise list */}
            {selectedDayData.exercises.map((ex, idx) => {
              const p = getProgression(sessions, ex.eid, ex.targetReps)
              return (
                <div key={ex.eid}>
                  <div style={{ paddingBottom: 16, paddingTop: idx === 0 ? 0 : 16 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: p ? 8 : 0,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                      <span style={{ fontSize: 12, color: E.gray5 }}>
                        {ex.targetSets} × {ex.targetReps}
                      </span>
                    </div>
                    {p && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        <div>
                          <Label style={{ marginBottom: 2 }}>Last time</Label>
                          <span style={{ fontSize: 12, color: E.gray6 }}>
                            {p.isBW ? `BW × ${p.lastReps}` : `${p.lastWeight} kg × ${p.avgReps}`}
                            <span style={{ fontSize: 10, color: E.gray5, marginLeft: 6 }}>
                              {shortDate(p.lastDate)}
                            </span>
                          </span>
                        </div>
                        <div>
                          <Label style={{ marginBottom: 2, color: E.accent }}>Beat this</Label>
                          <span style={{ fontSize: 12, fontWeight: 700, color: E.accent }}>
                            {p.isBW ? `BW × ${p.nextReps}` : `${p.nextWeight} kg × ${p.nextReps}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {idx < selectedDayData.exercises.length - 1 && <Divider />}
                </div>
              )
            })}

            {/* Start button — only for today */}
            {isToday && !doneToday && (
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
            {isToday && doneToday && (
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
              {selectedDayData ? 'Recovery is part of the programme.' : `Nothing scheduled for ${DAY_NAMES[selectedDay] || 'this day'}.`}
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
                <div style={{ fontSize: 11, color: E.gray5 }}>{shortDate(s.date)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
