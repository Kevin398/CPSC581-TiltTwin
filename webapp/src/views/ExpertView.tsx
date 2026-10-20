
import { useState } from 'react'
import { MathUtils, Quaternion } from 'three'
import CadScene from '../components/CadScene'
import RotationButtons from '../components/RotationButtons'
import { rotateFromView } from '../utils/rotationMath'
import './ExpertView.css'

const HOME_ORIENTATION = new Quaternion()

function degreesFromHome(orientation: Quaternion) {
  return Math.round(
    MathUtils.radToDeg(HOME_ORIENTATION.angleTo(orientation))
  )
}

export default function ExpertView() {
  const [orientation, setOrientation] = useState(
    () => new Quaternion()
  )
  const [target, setTarget] = useState<Quaternion | null>(null)

  function handleRotate(pitch: number, yaw: number) {
    setOrientation((current) =>
      rotateFromView(current, pitch, yaw)
    )
  }

  function handleReset() {
    setOrientation(new Quaternion())
  }

  function handleSaveTarget() {
    setTarget(orientation.clone())
  }

  return (
    <section className="expert-view">
      <header className="expert-heading">
        <h2>Expert Workspace</h2>
        <p>Rotate the model to demonstrate a desired orientation.</p>
      </header>

      <div className="workspace">
        <CadScene
          orientation={orientation}
          onDragRotate={handleRotate}
        />

        <RotationButtons
          orientation={orientation}
          onRotate={handleRotate}
          onReset={handleReset}
        />
      </div>

      <div className="expert-target-panel">
        <div>
          <h3>Teaching Target</h3>
          <p>
            Current pose: {degreesFromHome(orientation)}°
            from starting orientation
          </p>

          <p aria-live="polite">
            {target
              ? `Saved target: ${degreesFromHome(target)}° from start`
              : 'No target saved yet'}
          </p>
        </div>

        <div className="expert-actions">
          <button type="button" onClick={handleSaveTarget}>
            Save Target
          </button>

          <button
            type="button"
            disabled={!target}
            onClick={() => setTarget(null)}
          >
            Clear Target
          </button>
        </div>
      </div>

      <p className="expert-note">
        Targets are currently saved locally. Live sharing will
        be added later.
      </p>
    </section>
  )
}
