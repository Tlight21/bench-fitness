import { useState, useEffect } from 'react'
import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'
import { generateShoppingList } from '../data/shopping'

export default function Shopping({ shoppingList, onUpdate, nutritionPlans, currentPhaseId }) {
  const stores = shoppingList.stores?.length > 0
    ? shoppingList.stores
    : generateShoppingList(nutritionPlans?.[currentPhaseId])

  // Auto-reset: check if we've crossed the reset day
  useEffect(() => {
    if (!shoppingList.weekStartDate) return
    const now = new Date()
    const lastReset = new Date(shoppingList.weekStartDate)
    const daysSince = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24))
    if (daysSince >= 7) {
      handleReset()
    }
  }, [])

  const toggleItem = (storeIdx, itemIdx) => {
    const updated = {
      ...shoppingList,
      stores: stores.map((store, sI) =>
        sI !== storeIdx ? store : {
          ...store,
          items: store.items.map((item, iI) =>
            iI !== itemIdx ? item : { ...item, checked: !item.checked }
          ),
        }
      ),
    }
    onUpdate(updated)
  }

  const handleReset = () => {
    const updated = {
      ...shoppingList,
      weekStartDate: new Date().toISOString(),
      stores: stores.map(store => ({
        ...store,
        items: store.items.map(item => ({ ...item, checked: false })),
      })),
    }
    onUpdate(updated)
  }

  const handleRegenerate = () => {
    const newStores = generateShoppingList(nutritionPlans?.[currentPhaseId])
    onUpdate({
      ...shoppingList,
      weekStartDate: new Date().toISOString(),
      stores: newStores,
    })
  }

  const hasItems = stores.some(s => s.items.length > 0)

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>
          Shopping
        </div>

        <button onClick={handleRegenerate} className="tap" style={{
          width: '100%', background: E.gray1, border: `1px solid ${E.gray2}`,
          color: E.gray6, padding: '12px 0', fontSize: 11, fontWeight: 700,
          letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
          fontFamily: 'inherit', textTransform: 'uppercase', marginBottom: 6,
        }}>Regenerate from plan</button>
      </div>

      {!hasItems ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: E.white }}>No Items</div>
          <div style={{ fontSize: 13, color: E.gray5 }}>
            Tap "Regenerate from plan" to build your shopping list.
          </div>
        </div>
      ) : (
        <>
          {stores.map((store, storeIdx) => {
            if (store.items.length === 0) return null
            const checkedCount = store.items.filter(i => i.checked).length
            return (
              <div key={store.name}>
                <div style={{ padding: '20px 20px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Label>{store.name}</Label>
                    <span style={{ fontSize: 10, color: E.gray5 }}>
                      {checkedCount} / {store.items.length}
                    </span>
                  </div>
                  {store.items.map((item, itemIdx) => (
                    <button key={itemIdx} onClick={() => toggleItem(storeIdx, itemIdx)}
                      className="tap" style={{
                        width: '100%', background: 'transparent', border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: item.checked ? 'none' : `2px solid ${E.gray3}`,
                        background: item.checked ? E.green : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.checked && (
                          <span style={{ fontSize: 11, color: E.black, fontWeight: 800 }}>✓</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: 14,
                          color: item.checked ? E.gray4 : E.white,
                          textDecoration: item.checked ? 'line-through' : 'none',
                        }}>{item.name}</span>
                      </div>
                      <span style={{
                        fontSize: 12,
                        color: item.checked ? E.gray4 : E.gray5,
                      }}>{item.quantity}</span>
                    </button>
                  ))}
                </div>
                <Divider />
              </div>
            )
          })}

          <div style={{ padding: '16px 20px' }}>
            <button onClick={handleReset} className="tap" style={{
              width: '100%', background: 'transparent', border: `1px solid ${E.gray3}`,
              color: E.gray5, padding: '12px 0', fontSize: 11, fontWeight: 700,
              letterSpacing: 1, cursor: 'pointer', borderRadius: 4,
              fontFamily: 'inherit', textTransform: 'uppercase',
            }}>Reset checkboxes</button>
          </div>
        </>
      )}
    </div>
  )
}
