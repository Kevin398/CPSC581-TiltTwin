
import type { Quaternion } from 'three'

type CadModelProps = {
  orientation: Quaternion
}

// Approximate mass center for the two solid boxes.
const CENTER_X = -0.36
const CENTER_Y = -0.13

export default function CadModel({ orientation }: CadModelProps) {
  return (
    <group quaternion={orientation}>
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
