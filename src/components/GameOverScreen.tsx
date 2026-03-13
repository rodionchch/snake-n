import { useEffect } from 'react'
import { useGameStore } from '../store'
import { resetSnakeRefs } from '../entities/snakeState'
import { resetFlipRefs } from '../entities/flipState'

const GREEN        = '#00ff88'
const GREEN_DIM    = 'rgba(0,255,136,0.5)'
const GREEN_BORDER = 'rgba(0,255,136,0.25)'
const BG_OVERLAY   = 'rgba(5,5,8,0.92)'

export function GameOverScreen() {
  const status = useGameStore(s => s.status)
  const score  = useGameStore(s => s.score)
  const length = useGameStore(s => s.snake.length)
  const { startGame, restartGame } = useGameStore()

  function handleStart() {
    resetFlipRefs()
    resetSnakeRefs()
    startGame()
  }

  function handleRestart() {
    resetFlipRefs()
    resetSnakeRefs()
    restartGame()
  }

  // Enter / Space запускает или перезапускает игру
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== 'Enter' && e.code !== 'Space') return
      if (status === 'idle')      { handleStart(); return }
      if (status === 'game_over') { handleRestart(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])  // eslint-disable-line react-hooks/exhaustive-deps

  if (status !== 'idle' && status !== 'game_over') return null

  const isGameOver = status === 'game_over'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BG_OVERLAY,
      zIndex: 20,
      fontFamily: '"Courier New", Courier, monospace',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        border: `1px solid ${GREEN_BORDER}`,
        padding: '32px 48px',
        minWidth: '260px',
        boxShadow: `0 0 40px rgba(0,255,136,0.08)`,
      }}>

        {/* Title */}
        <div style={{
          fontSize: '11px',
          letterSpacing: '0.25em',
          color: GREEN_DIM,
          marginBottom: '4px',
        }}>
          {isGameOver ? 'GAME OVER' : 'SNAKE  N-GAGE'}
        </div>

        <div style={{
          fontSize: isGameOver ? '36px' : '28px',
          fontWeight: 'bold',
          color: GREEN,
          letterSpacing: '0.08em',
          textShadow: `0 0 20px ${GREEN}`,
          marginBottom: '24px',
        }}>
          {isGameOver ? String(score).padStart(6, '0') : 'READY?'}
        </div>

        {/* Stats (game over only) */}
        {isGameOver && (
          <div style={{
            width: '100%',
            borderTop: `1px solid ${GREEN_BORDER}`,
            borderBottom: `1px solid ${GREEN_BORDER}`,
            padding: '12px 0',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <Row label="SCORE"  value={score} />
            <Row label="LENGTH" value={length} />
          </div>
        )}

        {/* Controls hint (start screen only) */}
        {!isGameOver && (
          <div style={{
            width: '100%',
            borderTop: `1px solid ${GREEN_BORDER}`,
            padding: '12px 0',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '11px',
            color: GREEN_DIM,
            letterSpacing: '0.08em',
          }}>
            <span>◄ / A  —  TURN LEFT</span>
            <span>► / D  —  TURN RIGHT</span>
          </div>
        )}

        {/* Button */}
        <button
          onClick={isGameOver ? handleRestart : handleStart}
          style={{
            background: 'transparent',
            border: `1px solid ${GREEN}`,
            color: GREEN,
            fontFamily: 'inherit',
            fontSize: '13px',
            letterSpacing: '0.2em',
            padding: '10px 32px',
            cursor: 'pointer',
            textShadow: `0 0 8px ${GREEN}`,
            boxShadow: `0 0 12px rgba(0,255,136,0.15)`,
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.boxShadow = `0 0 20px rgba(0,255,136,0.4)`
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.boxShadow = `0 0 12px rgba(0,255,136,0.15)`
          }}
        >
          {isGameOver ? 'PLAY AGAIN' : 'START'}
        </button>

        <div style={{
          marginTop: '10px',
          fontSize: '10px',
          color: GREEN_DIM,
          letterSpacing: '0.1em',
        }}>
          ENTER / SPACE
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      letterSpacing: '0.1em',
    }}>
      <span style={{ color: GREEN_DIM }}>{label}</span>
      <span style={{ color: GREEN }}>{value}</span>
    </div>
  )
}
