import { useGameStore } from '../store'

const GREEN  = '#00ff88'
const DIM    = 'rgba(0,255,136,0.45)'
const BG     = 'rgba(5,5,8,0.82)'
const BORDER = 'rgba(0,255,136,0.18)'

export function HUD() {
  const status = useGameStore(s => s.status)
  const score  = useGameStore(s => s.score)
  const length = useGameStore(s => s.snake.length)

  if (status !== 'running') return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 20px',
      background: BG,
      borderBottom: `1px solid ${BORDER}`,
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      letterSpacing: '0.1em',
      color: GREEN,
      userSelect: 'none',
      zIndex: 10,
    }}>
      <Stat label="SCORE" value={score} highlight />
      <Stat label="LEN"   value={length} />
    </div>
  )
}

interface StatProps {
  label: string
  value: number
  highlight?: boolean
}

function Stat({ label, value, highlight }: StatProps) {
  return (
    <span>
      <span style={{ color: DIM }}>{label} </span>
      <span style={{
        color: highlight ? GREEN : GREEN,
        fontWeight: highlight ? 'bold' : 'normal',
        fontSize: highlight ? '14px' : '12px',
        textShadow: highlight ? `0 0 8px ${GREEN}` : 'none',
      }}>
        {String(value).padStart(4, '\u2007')}
      </span>
    </span>
  )
}
