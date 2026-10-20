
import { Canvas } from '@react-three/fiber'
import type { Quaternion } from 'three'
import CadModel from './CadModel'
import { CAMERA_POSITION } from '../utils/rotationMath'

type CadSceneProps = {
  orientation: Quaternion
  onDragRotate: (pitch: number, yaw: number) => void
}

export default function CadScene({
  orientation,
  onDragRotate,
}: CadSceneProps) {
  return (
    <Canvas
      camera={{ position: CAMERA_POSITION, fov: 45 }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <CadModel
        orientation={orientation}
        onDragRotate={onDragRotate}
      />
    </Canvas>
  )
}
