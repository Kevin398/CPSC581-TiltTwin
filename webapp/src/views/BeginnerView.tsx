
import { useState } from 'react'
import type { Quaternion } from 'three'
import CadScene from '../components/CadScene'
import RotationButtons from '../components/RotationButtons'
import { angularDifferenceDegrees } from '../utils/rotationMath'
import './BeginnerView.css'

type BeginnerViewProps = {
  orientation: Quaternion
  target: Quaternion | null
  onRotate: (pitch: number, yaw: number) => void
  onReset: () => void
}

type CheckResult = {
  error: number
  target: Quaternion
}

export default function BeginnerView({
  orientation,
  target,
  onRotate,
  onReset,
}: BeginnerViewProps) {
  const [lastCheck, setLastCheck] = useState<CheckResult | null>(null)

  function handleRotate(pitch: number, yaw: number) {
    setLastCheck(null)
    onRotate(pitch, yaw)
  }

  function handleReset() {
    setLastCheck(null)
    onReset()
  }

  function handleCheckAngle() {
    if (!target) return

    setLastCheck({
      error: angularDifferenceDegrees(orientation, target),
      target,
    })
  }

  const result =
    lastCheck?.target === target ? lastCheck : null

  const feedback = result === null
    ? null
    : result.error <= 8
      ? 'Matched! You reached the target orientation.'
      : result.error <= 20
        ? 'Very close! Make a small adjustment.'
        : 'Not matched yet. Adjust the model and try again.'

  return (
    <section className="beginner-view">
      <header className="beginner-heading">
        <h2>Beginner Workspace</h2>
        <p>Match the orientation set by your expert.</p>
      </header>

      <div className="beginner-layout">
        <div className="beginner-main">
          <div className="beginner-workspace">
            <div className="beginner-canvas">
              <CadScene
                orientation={orientation}
                onDragRotate={handleRotate}
              />
            </div>

            <RotationButtons
              orientation={orientation}
              onRotate={handleRotate}
              onReset={handleReset}
            />
          </div>

          <div className="beginner-check">
            <button
              type="button"
              onClick={handleCheckAngle}
              disabled={!target}
            >
              Check Angle
            </button>

            <p role="status" aria-live="polite">
              {feedback ??
                (target
                  ? 'Press Check Angle when you are ready.'
                  : 'Waiting for the expert to set a target.')}
            </p>
          </div>
        </div>

        <aside className="beginner-reference">
          <div className="reference-copy">
            <h3>Expert's Target</h3>
            <p>
              {target
                ? 'Rotate your model to match this reference.'
                : 'No target selected yet.'}
            </p>
          </div>

          {target && (
            <div
              className="target-preview"
              aria-label="Saved target orientation"
            >
              <CadScene
                orientation={target}
                onDragRotate={() => {}}
              />
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
