
import type { Quaternion } from 'three'
import CadScene from '../components/CadScene'
import RotationButtons from '../components/RotationButtons'
import './ExpertView.css'

type ExpertViewProps = {
  orientation: Quaternion
  target: Quaternion | null
  onRotate: (pitch: number, yaw: number) => void
  onReset: () => void
  onSaveTarget: () => void
  onClearTarget: () => void
}

export default function ExpertView({
  orientation,
  target,
  onRotate,
  onReset,
  onSaveTarget,
  onClearTarget,
}: ExpertViewProps) {
  return (
    <section className="expert-view">
      <header className="expert-heading">
        <h2>Expert Workspace</h2>
        <p>Set an orientation for the beginner to match.</p>
      </header>

      <div className="workspace">
        <CadScene
          orientation={orientation}
          onDragRotate={onRotate}
        />

        <RotationButtons
          orientation={orientation}
          onRotate={onRotate}
          onReset={onReset}
        />
      </div>

      <div className="expert-target-panel">
        <div>
          <h3>Teaching Target</h3>
          <p aria-live="polite">
            {target
              ? 'Target orientation saved.'
              : 'Choose an orientation to teach.'}
          </p>
        </div>

        <div className="expert-actions">
          <button type="button" onClick={onSaveTarget}>
            Save Angle
          </button>

          <button
            type="button"
            disabled={!target}
            onClick={onClearTarget}
          >
            Clear Target
          </button>
        </div>
      </div>
    </section>
  )
}
