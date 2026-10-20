
import type { Quaternion } from 'three'
import { useModelDrag } from '../hooks/useModelDrag'

type CadModelProps = {
  orientation: Quaternion
  onDragRotate: (pitch: number, yaw: number) => void
}

const CENTER_X = -0.36
const CENTER_Y = -0.13

// Large enough to enclose the bracket at any orientation.
const INTERACTION_RADIUS = 1.65

export default function CadModel({
  orientation,
  onDragRotate,
}: CadModelProps) {
  const dragHandlers = useModelDrag(onDragRotate)

  return (
    <group quaternion={orientation}>
      {/* Invisible sphere handles mouse dragging. */}
      <mesh {...dragHandlers}>
        <sphereGeometry args={[INTERACTION_RADIUS, 32, 24]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
        />
      </mesh>

      {/* Visible CAD model, centered around its pivot. */}
      <group position={[-CENTER_X, -CENTER_Y, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[2, 0.3, 1]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        <mesh position={[-0.85, 0.35, 0]}>
          <boxGeometry args={[0.3, 1.5, 1]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>
    </group>
  )
}
