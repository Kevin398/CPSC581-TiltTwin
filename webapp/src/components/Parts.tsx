import { Quaternion, Vector3 } from 'three'
import { PARTS, type PartId } from '../utils/parts'

const HOLE = '#0f172a'

// The part itself, centred on the rotation pivot.
export function PartModel({ part, tint }: { part: PartId; tint: string }) {
  switch (part) {
    case 'bracket':
      return (
        <group position={[0.36, 0.13, 0]}>
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[2, 0.3, 1]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          <mesh position={[-0.85, 0.35, 0]}>
            <boxGeometry args={[0.3, 1.5, 1]} />
            <meshStandardMaterial color={tint} roughness={0.4} />
          </mesh>
          <mesh position={[0.45, -0.34, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
            <meshStandardMaterial color={HOLE} />
          </mesh>
        </group>
      )

    case 'elbow':
      // Quarter bend from +X round to +Y, with an inlet below and an outlet to the left.
      return (
        <group position={[-0.05, -0.06, 0]}>
          <mesh>
            <torusGeometry args={[0.6, 0.22, 16, 32, Math.PI / 2]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          <mesh position={[0.6, -0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.7, 24]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          <mesh position={[-0.25, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          <mesh position={[0.6, -0.7, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
            <meshStandardMaterial color={tint} roughness={0.3} />
          </mesh>
          <mesh position={[-0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
            <meshStandardMaterial color={HOLE} />
          </mesh>
        </group>
      )

    case 'gear':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.8, 0.8, 0.25, 48]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.24, 0.25, 0.16]} />
                <meshStandardMaterial color={tint} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.26, 24]} />
            <meshStandardMaterial color={HOLE} />
          </mesh>
          <mesh position={[0.45, 0.115, 0.2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
            <meshStandardMaterial color={HOLE} />
          </mesh>
        </group>
      )

    case 'wrench':
      // Open-end wrench lying flat, angled 20° so its jaw isn't on an axis line.
      return (
        <group rotation={[0, (20 * Math.PI) / 180, 0]}>
          <mesh position={[-0.05, 0, 0]}>
            <boxGeometry args={[1.5, 0.08, 0.2]} />
            <meshStandardMaterial color={tint} roughness={0.3} />
          </mesh>
          <mesh position={[0.95, 0, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            <torusGeometry args={[0.27, 0.08, 12, 32, (5 * Math.PI) / 3]} />
            <meshStandardMaterial color={tint} roughness={0.3} />
          </mesh>
          <mesh position={[-0.9, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.07, 12, 32]} />
            <meshStandardMaterial color={tint} roughness={0.3} />
          </mesh>
        </group>
      )
  }
}

const UP = new Vector3(0, 1, 0)

// The fixed mating piece, placed where the part's feature will be once the part
// is rotated to `orientation` (the lesson's target).
export function Mate({ part, orientation, color }: { part: PartId; orientation: Quaternion; color: string }) {
  const { feature, mate } = PARTS[part]
  const origin = new Vector3(...feature.position).applyQuaternion(orientation)
  const normal = new Vector3(...feature.normal).applyQuaternion(orientation)
  const turn = new Quaternion().setFromUnitVectors(UP, normal)

  return (
    <>
      {mate.map(({ from, to, radius, sides }) => (
        <mesh
          key={`${from}-${to}`}
          position={origin.clone().addScaledVector(normal, (from + to) / 2)}
          quaternion={turn}
        >
          <cylinderGeometry args={[radius, radius, to - from, sides]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </>
  )
}
