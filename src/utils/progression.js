export function getProgression(sessions, exerciseId, targetReps) {
  const relevant = sessions
    .filter(s => s.exercises?.some(ex => ex.eid === exerciseId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (!relevant.length) return null

  const lastSession = relevant[0]
  const exercise = lastSession.exercises.find(ex => ex.eid === exerciseId)
  if (!exercise) return null

  const completed = exercise.sets.filter(s => s.completed)
  if (!completed.length) return null

  const best = completed.reduce((best, s) => {
    const w = parseFloat(s.weight) || 0
    const r = parseInt(s.reps) || 0
    const bw = parseFloat(best.weight) || 0
    const br = parseInt(best.reps) || 0
    return w > bw || (w === bw && r > br) ? s : best
  }, completed[0])

  const lastWeight = parseFloat(best.weight) || 0
  const lastReps = parseInt(best.reps) || 0
  const target = parseInt(targetReps) || 0
  const isBW = lastWeight === 0
  const avgReps = completed.length
    ? Math.round(completed.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0) / completed.length)
    : lastReps

  let nextWeight = lastWeight
  let nextReps = lastReps
  let advice = ''
  let hitTarget = false

  if (isBW) {
    nextReps = lastReps + 1
    hitTarget = target > 0 && lastReps >= target
    if (hitTarget) {
      advice = `You hit the target. Go for ${nextReps} reps this time.`
    } else if (target > 0 && lastReps < target) {
      nextReps = lastReps + 1
      advice = `${target - lastReps} reps short of target. Aim for ${nextReps}.`
    } else {
      advice = `Add 1 rep — go for ${nextReps}.`
    }
  } else {
    if (target > 0 ? avgReps >= target : true) {
      nextWeight = lastWeight + 2.5
      nextReps = target || lastReps
      hitTarget = true
      advice = `Add 2.5 kg — go for ${nextWeight} kg × ${nextReps} reps.`
    } else {
      nextWeight = lastWeight
      nextReps = avgReps + 1
      advice = `Keep ${lastWeight} kg — hit ${nextReps} reps on every set first.`
    }
  }

  return {
    lastWeight,
    lastReps,
    avgReps,
    lastDate: lastSession.date,
    nextWeight,
    nextReps,
    advice,
    hitTarget,
    isBW,
  }
}
