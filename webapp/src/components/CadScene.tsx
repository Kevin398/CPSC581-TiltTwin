import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import CadModel from './CadModel'
import {
  AXIS_COLORS,
  CAMERA_POSITION,
  STATUS_COLORS,
  TOLERANCE,
  wrapDegrees,
  type Axis,
  type MatchStatus,
} from '../utils/rotationMath'

type CadSceneProps = {
  axis: Axis
  angle: number
  target: number | null
  status: MatchStatus
  showAxes?: boolean
  demo?: boolean
  onDragRotate?: (pitch: number, yaw: number) => void
}

export default function CadScene({
  axis,
  angle,
  target,
  status,
  showAxes = false,
  demo = false,
  onDragRotate,
}: CadSceneProps) {
  const remaining = target === null ? 0 : wrapDegrees(target - angle)

  return (
    <Canvas
      camera={{ position: CAMERA_POSITION, fov: 45 }}
      style={{ touchAction: 'none' }}
    >
      <FitWidth />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} />

      {target !== null && <AxisLine axis={axis} />}

      {target !== null && !demo && Math.abs(remaining) > TOLERANCE && (
        <TurnArrow axis={axis} from={angle} sweep={remaining} color={STATUS_COLORS[status]} />
      )}

      <CadModel
        axis={axis}
        angle={angle}
        tint={STATUS_COLORS[status]}
        showAxes={showAxes}
        demoTarget={demo && target !== null ? target : undefined}
        onDragRotate={onDragRotate}
      />

      <gridHelper args={[8, 16, '#334155', '#1e293b']} position={[0, -1.4, 0]} />
    </Canvas>
  )
}

// The camera's FOV is vertical, so tall (portrait) screens crop the sides.
// Back the camera off until the part fits the width.
function FitWidth() {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)

  useEffect(() => {
    camera.position.set(...CAMERA_POSITION).multiplyScalar(Math.max(1, 1 / aspect))
    camera.lookAt(0, 0, 0)
  }, [camera, aspect])

  return null
}

// Rotates a Z-aligned shape onto the given axis.
const ALIGN: Record<Axis, [number, number, number]> = {
  x: [0, Math.PI / 2, 0],
  y: [-Math.PI / 2, 0, 0],
  z: [0, 0, 0],
}

// Fixed world axis the lesson rotates around.
function AxisLine({ axis }: { axis: Axis }) {
  return (
    <group rotation={ALIGN[axis]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 4.4, 8]} />
        <meshBasicMaterial color={AXIS_COLORS[axis]} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

const ARROW_RADIUS = 1.9

// Arc from the current angle to the target, with a head showing which way to turn.
function TurnArrow({
  axis,
  from,
  sweep,
  color,
}: {
  axis: Axis
  from: number
  sweep: number
  color: string
}) {
  const rad = Math.PI / 180
  const start = (sweep > 0 ? from : from + sweep) * rad
  const arc = Math.abs(sweep) * rad
  const headAt = sweep > 0 ? arc : 0
  const headTurn = sweep > 0 ? headAt : Math.PI

  return (
    <group rotation={ALIGN[axis]}>
      <group rotation={[0, 0, start]}>
        <mesh>
          <torusGeometry args={[ARROW_RADIUS, 0.04, 8, 64, arc]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh
          position={[ARROW_RADIUS * Math.cos(headAt), ARROW_RADIUS * Math.sin(headAt), 0]}
          rotation={[0, 0, headTurn]}
        >
          <coneGeometry args={[0.13, 0.32, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  )
}
