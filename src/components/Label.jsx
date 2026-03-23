import { E } from '../theme'

export default function Label({ children, style }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      color: E.gray5,
      textTransform: 'uppercase',
      ...style,
    }}>
      {children}
    </div>
  )
}
