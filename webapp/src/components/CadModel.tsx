import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import { useModelDrag } from '../hooks/useModelDrag'
import { axisRotation, type Axis } from '../utils/rotationMath'

type CadModelProps = {
  axis: Axis
  angle: number
  tint: string
  showAxes: boolean
  // Loop a 0° → target animation instead of showing `angle`.
  demoTarget?: number
  onDragRotate?: (pitch: number, yaw: number) => void
}

const CENTER_X = -0.36
const CENTER_Y = -0.13

// Large enough to enclose the bracket at any orientation.
const INTERACTION_RADIUS = 1.65

const DEMO_MOVE_S = 2
const DEMO_HOLD_S = 1.2

export default function CadModel({
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

      {/* L-bracket, centred around its pivot. */}
      <group position={[-CENTER_X, -CENTER_Y, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[2, 0.3, 1]} />
          <meshStandardMaterial color={tint} />
        </mesh>

        <mesh position={[-0.85, 0.35, 0]}>
          <boxGeometry args={[0.3, 1.5, 1]} />
          <meshStandardMaterial color={tint} roughness={0.4} />
        </mesh>

        {/* Mounting hole marks the "front" so orientation is unambiguous. */}
        <mesh position={[0.45, -0.34, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  )
}
