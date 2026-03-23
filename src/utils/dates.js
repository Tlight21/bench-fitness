export const today = () => new Date().toISOString().split('T')[0]

export const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const longDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const currentWeek = (startDate) =>
  Math.max(1, Math.floor((new Date() - new Date(startDate)) / (7 * 864e5)) + 1)

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const todayDayId = () => DAYS[new Date().getDay()]

export const findPhase = (programme, weekNum) =>
  programme.phases.find(p => weekNum >= p.weekStart && weekNum <= p.weekEnd) ||
  programme.phases[programme.phases.length - 1]
