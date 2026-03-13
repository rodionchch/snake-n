import { useEffect } from 'react'

// Только поворот: влево или вправо относительно текущего направления
export const inputState = {
  turn: null as 'left' | 'right' | null,
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    e.preventDefault()
    inputState.turn = 'left'
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    e.preventDefault()
    inputState.turn = 'right'
  }
}

export function useInputSystem(): void {
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

export function startInputSystem(): void {
  window.addEventListener('keydown', onKeyDown)
}
