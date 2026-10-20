
import { useState } from 'react'
import { Quaternion } from 'three'
import CadScene from './components/CadScene'
import RotationButtons from './components/RotationButtons'
import { rotateFromView } from './utils/rotationMath'
import './App.css'

export default function App() {
  const [orientation, setOrientation] = useState(
    () => new Quaternion()
  )

  function handleRotate(pitch: number, yaw: number) {
    setOrientation((current) =>
      rotateFromView(current, pitch, yaw)
    )
  }

  function handleReset() {
    setOrientation(new Quaternion())
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>TiltTwin</h1>
        <p>Remote CAD learning through physical interaction.</p>
      </header>

      <section className="workspace" aria-label="CAD workspace">
        <CadScene orientation={orientation} />

        <RotationButtons
          orientation={orientation}
          onRotate={handleRotate}
          onReset={handleReset}
        />
      </section>
    </main>
  )
}
