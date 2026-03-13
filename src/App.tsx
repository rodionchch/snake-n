import { useInputSystem } from './engine'
import { GameCanvas } from './components/GameCanvas'
import { HUD } from './components/HUD'
import { GameOverScreen } from './components/GameOverScreen'

function App() {
  // Активируем систему ввода на весь жизненный цикл приложения
  useInputSystem()

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <GameCanvas />
      <HUD />
      <GameOverScreen />
    </div>
  )
}

export default App
