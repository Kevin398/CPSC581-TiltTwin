import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import { useModelDrag } from '../hooks/useModelDrag'
import type { PartId } from '../utils/parts'
import { axisRotation, type Axis } from '../utils/rotationMath'
import { PartModel } from './Parts'

type CadModelProps = {
  part: PartId
  axis: Axis
  angle: number
  tint: string
  showAxes: boolean
  // Loop a 0° → target animation instead of showing `angle`.
  demoTarget?: number
  onDragRotate?: (pitch: number, yaw: number) => void
}

// Large enough to enclose the bracket at any orientation.
const INTERACTION_RADIUS = 1.65

const DEMO_MOVE_S = 2
const DEMO_HOLD_S = 1.2

export default function CadModel({
  part,
  axis,
  angle,
  tint,
  showAxes,
  demoTarget,
  onDragRotate,
}: CadModelProps) {
  const group = useRef<Group>(null)
  const dragHandlers = useModelDrag(onDragRotate ?? (() => {}))

  useFrame(({ clock }) => {
    if (demoTarget === undefined || !group.current) return
    const t = Math.min((clock.elapsedTime % (DEMO_MOVE_S + DEMO_HOLD_S)) / DEMO_MOVE_S, 1)
    const eased = t * t * (3 - 2 * t)
    group.current.quaternion.copy(axisRotation(axis, demoTarget * eased))
  })

  return (
    <group
      ref={group}
      quaternion={demoTarget === undefined ? axisRotation(axis, angle) : undefined}
    >
      {onDragRotate && (
        // Invisible sphere catches drags anywhere around the part.
        <mesh {...dragHandlers}>
          <sphereGeometry args={[INTERACTION_RADIUS, 32, 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      )}

      {/* Axes rotate with the part, like a CAD local frame. */}
      {showAxes && (
        <>
          <axesHelper args={[1.5]} />
          <Html position={[1.65, 0, 0]} center zIndexRange={[1, 0]} className="axis-label x">X</Html>
          <Html position={[0, 1.65, 0]} center zIndexRange={[1, 0]} className="axis-label y">Y</Html>
          <Html position={[0, 0, 1.65]} center zIndexRange={[1, 0]} className="axis-label z">Z</Html>
        </>
      )}

      <PartModel part={part} tint={tint} />
    </group>
  )
}
