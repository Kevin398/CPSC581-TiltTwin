
import { Canvas } from '@react-three/fiber'
import type { Quaternion } from 'three'
import { CAMERA_POSITION } from '../utils/rotationMath'

type OrientationSphereProps = {
  orientation: Quaternion
}

// Same viewing direction as the CAD scene, but closer.
const sphereCamera = CAMERA_POSITION.map(
  (coordinate) => coordinate * 0.5
) as [number, number, number]

export default function OrientationSphere({
  orientation,
}: OrientationSphereProps) {
  return (
    <div className="orientation-sphere" aria-hidden="true">
      <Canvas camera={{ position: sphereCamera, fov: 45 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[4, 5, 6]} intensity={2} />

        <group quaternion={orientation}>
          <mesh>
            <sphereGeometry args={[0.7, 32, 24]} />
            <meshStandardMaterial color="#8eabc9" />
          </mesh>

          {/* Markers make the sphere's orientation visible. */}
          <mesh position={[0.72, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          <mesh position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>

          <mesh position={[0, 0, 0.72]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
      </Canvas>
    </div>
  )
}
