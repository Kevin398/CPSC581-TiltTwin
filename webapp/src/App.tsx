
import { useState } from 'react'
import { Quaternion } from 'three'
import { useCadOrientation } from './hooks/useCadOrientation'
import ExpertView from './views/ExpertView'
import BeginnerView from './views/BeginnerView'
import './App.css'

type Role = 'expert' | 'beginner'

export default function App() {
  const [role, setRole] = useState<Role>('expert')
  const [target, setTarget] = useState<Quaternion | null>(null)

  const expert = useCadOrientation()
  const beginner = useCadOrientation()

  return (
    <main className="app">
      <header className="app-header">
        <h1>TiltTwin</h1>
        <p>Remote CAD learning through physical interaction.</p>
      </header>

      <nav className="role-switcher" aria-label="Select workspace">
        <button
          type="button"
          aria-pressed={role === 'expert'}
          onClick={() => setRole('expert')}
        >
          Expert View
        </button>

        <button
          type="button"
          aria-pressed={role === 'beginner'}
          onClick={() => setRole('beginner')}
        >
          Beginner View
        </button>
      </nav>

      {role === 'expert' ? (
        <ExpertView
          orientation={expert.orientation}
          target={target}
          onRotate={expert.rotate}
          onReset={expert.reset}
          onSaveTarget={() =>
            setTarget(expert.orientation.clone())
          }
          onClearTarget={() => setTarget(null)}
        />
      ) : (
        <BeginnerView
          orientation={beginner.orientation}
          target={target}
          onRotate={beginner.rotate}
          onReset={beginner.reset}
        />
      )}
    </main>
  )
}
