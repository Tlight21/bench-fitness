import { useState } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { DEFAULT_PROGRAMME } from '../data/programme'
import { DEFAULT_NUTRITION } from '../data/nutrition'

const DAY_NAMES = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

export default function Plans({ programmes, selectedId, onSelect, nutritionPlans, onSaveNutrition, onSaveProgrammes }) {
  const [editPhase, setEditPhase] = useState('gpp')
  const [editSection, setEditSection] = useState('training')
  const [expandedDay, setExpandedDay] = useState(null)
  const [editingMeal, setEditingMeal] = useState(null) // { dayIdx, mealIdx }
  const [addingExercise, setAddingExercise] = useState(null) // dayIdx
  const [newEx, setNewEx] = useState({ name: '', sets: '3', reps: '8', weight: '' })
  const [addingMeal, setAddingMeal] = useState(null) // dayIdx
  const [newMeal, setNewMeal] = useState({ time: '', name: '', kcal: '' })
  const [addingItem, setAddingItem] = useState(null) // { dayIdx, mealIdx }
  const [newItem, setNewItem] = useState({ name: '', quantity: '' })
  const [confirmReset, setConfirmReset] = useState(false)

  const prog = programmes.find(p => p.id === selectedId) || programmes[0]
  const phase = prog.phases.find(p => p.id === editPhase)
  const nutritionPhase = nutritionPlans?.[editPhase]

  // Training helpers
  const updateProgramme = (updater) => {
    const updated = programmes.map(p => {
      if (p.id !== prog.id) return p
      return {
        ...p,
        phases: p.phases.map(ph => {
          if (ph.id !== editPhase) return ph
          return updater(JSON.parse(JSON.stringify(ph)))
        }),
      }
    })
    onSaveProgrammes(updated)
  }

  const deleteExercise = (dayIdx, exIdx) => {
    updateProgramme(ph => {
      ph.days[dayIdx].exercises.splice(exIdx, 1)
      return ph
    })
  }

  const addExercise = (dayIdx) => {
    if (!newEx.name.trim()) return
    updateProgramme(ph => {
      ph.days[dayIdx].exercises.push({
        eid: `custom-${Date.now()}`,
        name: newEx.name.trim(),
        targetSets: parseInt(newEx.sets) || 3,
        targetReps: newEx.reps || '8',
        targetWeight: newEx.weight || 'Moderate',
      })
      return ph
    })
    setNewEx({ name: '', sets: '3', reps: '8', weight: '' })
    setAddingExercise(null)
  }

  // Nutrition helpers
  const updateNutrition = (updater) => {
    const cloned = JSON.parse(JSON.stringify(nutritionPlans))
    updater(cloned[editPhase])
    onSaveNutrition(cloned)
  }

  const deleteMeal = (dayIdx, mealIdx) => {
    updateNutrition(ph => {
      ph.days[dayIdx].meals.splice(mealIdx, 1)
      // Recalc targetKcal
      ph.days[dayIdx].targetKcal = ph.days[dayIdx].meals.reduce((sum, m) => sum + (m.kcal || 0), 0)
    })
  }

  const updateMealField = (dayIdx, mealIdx, field, value) => {
    updateNutrition(ph => {
      ph.days[dayIdx].meals[mealIdx][field] = field === 'kcal' ? (parseInt(value) || 0) : value
      if (field === 'kcal') {
        ph.days[dayIdx].targetKcal = ph.days[dayIdx].meals.reduce((sum, m) => sum + (m.kcal || 0), 0)
      }
    })
  }

  const deleteItem = (dayIdx, mealIdx, itemIdx) => {
    updateNutrition(ph => {
      ph.days[dayIdx].meals[mealIdx].items.splice(itemIdx, 1)
    })
  }

  const updateItemField = (dayIdx, mealIdx, itemIdx, field, value) => {
    updateNutrition(ph => {
      ph.days[dayIdx].meals[mealIdx].items[itemIdx][field] = value
    })
  }

  const addMealToDay = (dayIdx) => {
    if (!newMeal.name.trim()) return
    updateNutrition(ph => {
      ph.days[dayIdx].meals.push({
        time: newMeal.time || '12:00',
        name: newMeal.name.trim(),
        highlight: null,
        kcal: parseInt(newMeal.kcal) || 0,
        items: [],
      })
      ph.days[dayIdx].targetKcal = ph.days[dayIdx].meals.reduce((sum, m) => sum + (m.kcal || 0), 0)
    })
    setNewMeal({ time: '', name: '', kcal: '' })
    setAddingMeal(null)
  }

  const addItemToMeal = (dayIdx, mealIdx) => {
    if (!newItem.name.trim()) return
    updateNutrition(ph => {
      ph.days[dayIdx].meals[mealIdx].items.push({
        name: newItem.name.trim(),
        quantity: newItem.quantity || '1',
      })
    })
    setNewItem({ name: '', quantity: '' })
    setAddingItem(null)
  }

  const handleReset = () => {
    if (editSection === 'training') {
      const defaultPhase = DEFAULT_PROGRAMME.phases.find(p => p.id === editPhase)
      if (defaultPhase) {
        updateProgramme(() => JSON.parse(JSON.stringify(defaultPhase)))
      }
    } else {
      const cloned = JSON.parse(JSON.stringify(nutritionPlans))
      cloned[editPhase] = JSON.parse(JSON.stringify(DEFAULT_NUTRITION[editPhase]))
      onSaveNutrition(cloned)
    }
    setConfirmReset(false)
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>
          Plans
        </div>

        {/* Phase selector */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto',
        }}>
          {prog.phases.map(ph => (
            <button key={ph.id} onClick={() => { setEditPhase(ph.id); setExpandedDay(null); setEditingMeal(null) }}
              className="tap" style={{
                background: editPhase === ph.id ? E.accent : E.gray1,
                border: 'none', borderRadius: 6, padding: '8px 14px',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                color: editPhase === ph.id ? E.white : E.gray5,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
              {ph.name}
            </button>
          ))}
        </div>

        {/* Training / Nutrition toggle */}
        <div style={{
          display: 'flex', background: E.gray1, borderRadius: 8, padding: 2, marginBottom: 4,
        }}>
          {['training', 'nutrition'].map(mode => (
            <button key={mode} onClick={() => { setEditSection(mode); setExpandedDay(null); setEditingMeal(null) }}
              className="tap" style={{
                flex: 1, background: editSection === mode ? E.gray2 : 'transparent',
                border: 'none', borderRadius: 6, padding: '8px 0',
                fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                color: editSection === mode ? E.white : E.gray5,
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              }}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* TRAINING EDITOR */}
      {editSection === 'training' && phase && (
        <div style={{ padding: '0 20px' }}>
          {phase.days.map((day, dayIdx) => {
            const isExpanded = expandedDay === dayIdx
            return (
              <div key={day.id}>
                <button onClick={() => setExpandedDay(isExpanded ? null : dayIdx)}
                  className="tap" style={{
                    width: '100%', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    padding: '14px 0',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: E.white }}>{day.title}</div>
                      <div style={{ fontSize: 11, color: E.gray5, marginTop: 3 }}>
                        {DAY_NAMES[day.id]} · {day.track ? 'Coach-led' : `${day.exercises.length} exercises`}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: E.gray5 }}>{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ paddingBottom: 14 }}>
                    {day.track ? (
                      <div style={{ fontSize: 12, color: E.gray5, padding: '8px 0' }}>
                        Coach-led session — exercises added on the day.
                      </div>
                    ) : (
                      <>
                        {day.exercises.map((ex, exIdx) => (
                          <div key={ex.eid} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 0',
                          }}>
                            <div>
                              <div style={{ fontSize: 13, color: E.gray6 }}>{ex.name}</div>
                              <div style={{ fontSize: 11, color: E.gray5, marginTop: 2 }}>
                                {ex.targetSets} × {ex.targetReps} · {ex.targetWeight}
                              </div>
                            </div>
                            <button onClick={() => deleteExercise(dayIdx, exIdx)} className="tap" style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: E.gray4, fontSize: 16, padding: '4px 8px',
                              fontFamily: 'inherit', lineHeight: 1,
                            }}>×</button>
                          </div>
                        ))}

                        {addingExercise === dayIdx ? (
                          <div style={{ padding: '10px 0' }}>
                            <input value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })}
                              placeholder="Exercise name" style={{
                                width: '100%', boxSizing: 'border-box', background: E.gray2,
                                color: E.white, border: 'none', padding: 10, fontSize: 13,
                                fontFamily: 'inherit', borderRadius: 4, marginBottom: 8,
                              }} />
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                              <input value={newEx.sets} onChange={e => setNewEx({ ...newEx, sets: e.target.value })}
                                placeholder="Sets" type="number" inputMode="numeric" style={{
                                  flex: 1, background: E.gray2, color: E.white, border: 'none',
                                  padding: 10, fontSize: 13, fontFamily: 'inherit', borderRadius: 4,
                                }} />
                              <input value={newEx.reps} onChange={e => setNewEx({ ...newEx, reps: e.target.value })}
                                placeholder="Reps" style={{
                                  flex: 1, background: E.gray2, color: E.white, border: 'none',
                                  padding: 10, fontSize: 13, fontFamily: 'inherit', borderRadius: 4,
                                }} />
                              <input value={newEx.weight} onChange={e => setNewEx({ ...newEx, weight: e.target.value })}
                                placeholder="Load" style={{
                                  flex: 1, background: E.gray2, color: E.white, border: 'none',
                                  padding: 10, fontSize: 13, fontFamily: 'inherit', borderRadius: 4,
                                }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => addExercise(dayIdx)} className="tap" style={{
                                flex: 1, background: E.accent, color: E.white, border: 'none',
                                padding: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                              }}>Add</button>
                              <button onClick={() => setAddingExercise(null)} className="tap" style={{
                                flex: 1, background: E.gray2, color: E.gray5, border: 'none',
                                padding: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                              }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setAddingExercise(dayIdx); setNewEx({ name: '', sets: '3', reps: '8', weight: '' }) }}
                            className="tap" style={{
                              width: '100%', background: 'transparent', border: `1px solid ${E.gray3}`,
                              color: E.gray5, padding: '8px 0', fontSize: 11, fontWeight: 700,
                              letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
                              fontFamily: 'inherit', textTransform: 'uppercase', marginTop: 6,
                            }}>+ Add Exercise</button>
                        )}
                      </>
                    )}
                  </div>
                )}
                <Divider />
              </div>
            )
          })}
        </div>
      )}

      {/* NUTRITION EDITOR */}
      {editSection === 'nutrition' && nutritionPhase && (
        <div style={{ padding: '0 20px' }}>
          {nutritionPhase.days.map((day, dayIdx) => {
            const isExpanded = expandedDay === dayIdx
            return (
              <div key={day.dayOfWeek}>
                <button onClick={() => { setExpandedDay(isExpanded ? null : dayIdx); setEditingMeal(null) }}
                  className="tap" style={{
                    width: '100%', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    padding: '14px 0',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: E.white }}>
                        {DAY_NAMES[day.dayOfWeek]}
                      </div>
                      <div style={{ fontSize: 11, color: E.gray5, marginTop: 3 }}>
                        {day.meals.length} meals · {day.targetKcal.toLocaleString()} kcal
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: E.gray5 }}>{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ paddingBottom: 14 }}>
                    {day.meals.map((meal, mealIdx) => {
                      const isEditing = editingMeal?.dayIdx === dayIdx && editingMeal?.mealIdx === mealIdx
                      return (
                        <div key={mealIdx} style={{
                          background: E.gray1, borderRadius: 6,
                          padding: 12, marginBottom: 8,
                        }}>
                          {isEditing ? (
                            <>
                              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input value={meal.time}
                                  onChange={e => updateMealField(dayIdx, mealIdx, 'time', e.target.value)}
                                  placeholder="Time" style={{
                                    width: 70, background: E.gray2, color: E.white, border: 'none',
                                    padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                                  }} />
                                <input value={meal.name}
                                  onChange={e => updateMealField(dayIdx, mealIdx, 'name', e.target.value)}
                                  placeholder="Meal name" style={{
                                    flex: 1, background: E.gray2, color: E.white, border: 'none',
                                    padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                                  }} />
                                <input value={meal.kcal} type="number" inputMode="numeric"
                                  onChange={e => updateMealField(dayIdx, mealIdx, 'kcal', e.target.value)}
                                  placeholder="kcal" style={{
                                    width: 60, background: E.gray2, color: E.white, border: 'none',
                                    padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                                  }} />
                              </div>

                              {meal.items.map((item, itemIdx) => (
                                <div key={itemIdx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                  <input value={item.name}
                                    onChange={e => updateItemField(dayIdx, mealIdx, itemIdx, 'name', e.target.value)}
                                    placeholder="Item" style={{
                                      flex: 2, background: E.gray2, color: E.white, border: 'none',
                                      padding: 6, fontSize: 11, fontFamily: 'inherit', borderRadius: 3,
                                    }} />
                                  <input value={item.quantity}
                                    onChange={e => updateItemField(dayIdx, mealIdx, itemIdx, 'quantity', e.target.value)}
                                    placeholder="Qty" style={{
                                      flex: 1, background: E.gray2, color: E.white, border: 'none',
                                      padding: 6, fontSize: 11, fontFamily: 'inherit', borderRadius: 3,
                                    }} />
                                  <button onClick={() => deleteItem(dayIdx, mealIdx, itemIdx)} className="tap" style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: E.gray4, fontSize: 14, padding: '2px 4px',
                                    fontFamily: 'inherit', lineHeight: 1,
                                  }}>×</button>
                                </div>
                              ))}

                              {addingItem?.dayIdx === dayIdx && addingItem?.mealIdx === mealIdx ? (
                                <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                                  <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="Item name" style={{
                                      flex: 2, background: E.gray2, color: E.white, border: 'none',
                                      padding: 6, fontSize: 11, fontFamily: 'inherit', borderRadius: 3,
                                    }} />
                                  <input value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                    placeholder="Qty" style={{
                                      flex: 1, background: E.gray2, color: E.white, border: 'none',
                                      padding: 6, fontSize: 11, fontFamily: 'inherit', borderRadius: 3,
                                    }} />
                                  <button onClick={() => addItemToMeal(dayIdx, mealIdx)} className="tap" style={{
                                    background: E.accent, color: E.white, border: 'none',
                                    padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                    borderRadius: 3, fontFamily: 'inherit',
                                  }}>+</button>
                                </div>
                              ) : (
                                <button onClick={() => { setAddingItem({ dayIdx, mealIdx }); setNewItem({ name: '', quantity: '' }) }}
                                  className="tap" style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    color: E.gray5, fontSize: 10, fontWeight: 700, padding: '6px 0',
                                    fontFamily: 'inherit',
                                  }}>+ Add item</button>
                              )}

                              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button onClick={() => setEditingMeal(null)} className="tap" style={{
                                  flex: 1, background: E.gray2, color: E.gray6, border: 'none',
                                  padding: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                  borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                                }}>Done</button>
                                <button onClick={() => deleteMeal(dayIdx, mealIdx)} className="tap" style={{
                                  background: 'transparent', border: `1px solid ${E.gray3}`,
                                  color: E.red, padding: '8px 12px', fontSize: 10, fontWeight: 700,
                                  cursor: 'pointer', borderRadius: 4, fontFamily: 'inherit',
                                  textTransform: 'uppercase',
                                }}>Delete</button>
                              </div>
                            </>
                          ) : (
                            <button onClick={() => setEditingMeal({ dayIdx, mealIdx })}
                              className="tap" style={{
                                width: '100%', background: 'transparent', border: 'none',
                                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                padding: 0,
                              }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, color: E.gray5 }}>{meal.time}</span>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: E.white }}>{meal.name}</span>
                                  {meal.highlight === 'pre' && (
                                    <span style={{ fontSize: 8, fontWeight: 800, color: E.amber, letterSpacing: 0.5 }}>PRE</span>
                                  )}
                                  {meal.highlight === 'post' && (
                                    <span style={{ fontSize: 8, fontWeight: 800, color: E.blue, letterSpacing: 0.5 }}>POST</span>
                                  )}
                                </div>
                                <span style={{ fontSize: 11, color: E.gray5 }}>{meal.kcal}</span>
                              </div>
                              <div style={{ fontSize: 11, color: E.gray5 }}>
                                {meal.items.map(i => i.name).join(', ')}
                              </div>
                            </button>
                          )}
                        </div>
                      )
                    })}

                    {addingMeal === dayIdx ? (
                      <div style={{ background: E.gray1, borderRadius: 6, padding: 12 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input value={newMeal.time} onChange={e => setNewMeal({ ...newMeal, time: e.target.value })}
                            placeholder="Time" style={{
                              width: 70, background: E.gray2, color: E.white, border: 'none',
                              padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                            }} />
                          <input value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                            placeholder="Meal name" style={{
                              flex: 1, background: E.gray2, color: E.white, border: 'none',
                              padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                            }} />
                          <input value={newMeal.kcal} onChange={e => setNewMeal({ ...newMeal, kcal: e.target.value })}
                            placeholder="kcal" type="number" inputMode="numeric" style={{
                              width: 60, background: E.gray2, color: E.white, border: 'none',
                              padding: 8, fontSize: 12, fontFamily: 'inherit', borderRadius: 4,
                            }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => addMealToDay(dayIdx)} className="tap" style={{
                            flex: 1, background: E.accent, color: E.white, border: 'none',
                            padding: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                          }}>Add</button>
                          <button onClick={() => setAddingMeal(null)} className="tap" style={{
                            flex: 1, background: E.gray2, color: E.gray5, border: 'none',
                            padding: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingMeal(dayIdx); setNewMeal({ time: '', name: '', kcal: '' }) }}
                        className="tap" style={{
                          width: '100%', background: 'transparent', border: `1px solid ${E.gray3}`,
                          color: E.gray5, padding: '8px 0', fontSize: 11, fontWeight: 700,
                          letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
                          fontFamily: 'inherit', textTransform: 'uppercase',
                        }}>+ Add Meal</button>
                    )}
                  </div>
                )}
                <Divider />
              </div>
            )
          })}
        </div>
      )}

      {/* Reset to default */}
      <div style={{ padding: '16px 20px' }}>
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleReset} className="tap" style={{
              flex: 1, background: E.red, color: E.white, border: 'none',
              padding: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
            }}>Confirm Reset</button>
            <button onClick={() => setConfirmReset(false)} className="tap" style={{
              flex: 1, background: E.gray2, color: E.gray5, border: 'none',
              padding: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              borderRadius: 4, fontFamily: 'inherit', textTransform: 'uppercase',
            }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="tap" style={{
            width: '100%', background: 'transparent', border: `1px solid ${E.gray3}`,
            color: E.gray5, padding: '12px 0', fontSize: 11, fontWeight: 700,
            letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
            fontFamily: 'inherit', textTransform: 'uppercase',
          }}>Reset {editSection} to default</button>
        )}
      </div>
    </div>
  )
}
