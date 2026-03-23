import { E } from '../theme'

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'progress', label: 'Progress' },
  { id: 'history', label: 'History' },
  { id: 'plans', label: 'Plans' },
]

export default function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: E.black,
      borderTop: `1px solid ${E.gray2}`,
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 30,
    }}>
      {TABS.map(({ id, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="tap"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '13px 4px 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? E.white : E.gray4,
              letterSpacing: 0.5,
            }}>
              {label}
            </span>
            {isActive && (
              <div style={{
                width: 18,
                height: 2,
                background: E.accent,
                borderRadius: 1,
                marginTop: 4,
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
