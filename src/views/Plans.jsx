import { E } from '../theme'
import Label from '../components/Label'
import Divider from '../components/Divider'

export default function Plans({ programmes, selectedId, onSelect }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
          Plans
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {programmes.map((p, idx) => {
          const isActive = p.id === selectedId
          const totalWeeks = p.phases[p.phases.length - 1]?.weekEnd || 0
          return (
            <div key={p.id}>
              <button onClick={() => onSelect(p.id)} className="tap" style={{
                width: '100%', background: 'transparent', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                padding: '14px 0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600,
                      color: isActive ? E.accent : E.white,
                    }}>
                      {p.name}
                      {isActive && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: E.accent,
                          marginLeft: 8, letterSpacing: 1, textTransform: 'uppercase',
                        }}>Active</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: E.gray5, marginTop: 3 }}>
                      {p.phases.length} phases · {totalWeeks} weeks
                    </div>
                  </div>
                </div>
              </button>
              {idx < programmes.length - 1 && <Divider />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
