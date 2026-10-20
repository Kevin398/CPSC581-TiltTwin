
import type { Quaternion } from 'three'
import OrientationSphere from './OrientationSphere'

type RotationButtonsProps = {
  orientation: Quaternion
  onRotate: (pitch: number, yaw: number) => void
  onReset: () => void
}

const STEP = 15

const directions = [
  { name: 'NW', arrow: '↖', pitch: -STEP, yaw: -STEP },
  { name: 'N', arrow: '↑', pitch: -STEP, yaw: 0 },
  { name: 'NE', arrow: '↗', pitch: -STEP, yaw: STEP },
  { name: 'W', arrow: '←', pitch: 0, yaw: -STEP },
  null,
  { name: 'E', arrow: '→', pitch: 0, yaw: STEP },
  { name: 'SW', arrow: '↙', pitch: STEP, yaw: -STEP },
  { name: 'S', arrow: '↓', pitch: STEP, yaw: 0 },
  { name: 'SE', arrow: '↘', pitch: STEP, yaw: STEP },
]

export default function RotationButtons({
  orientation,
  onRotate,
  onReset,
}: RotationButtonsProps) {
  return (
    <div className="rotation-panel">
      <div className="rotation-pad">
        {directions.map((direction) =>
          direction ? (
            <button
              key={direction.name}
              type="button"
              aria-label={`Rotate ${direction.name}`}
              onClick={() =>
                onRotate(direction.pitch, direction.yaw)
              }
            >
              {direction.arrow}
            </button>
          ) : (
            <OrientationSphere
              key="sphere"
              orientation={orientation}
            />
          )
        )}
      </div>

      <button
        className="reset-button"
        type="button"
        onClick={onReset}
      >
        ↺ Reset Orientation
      </button>
    </div>
  )
}
