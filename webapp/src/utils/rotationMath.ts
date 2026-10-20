
import { Matrix4, MathUtils, Quaternion, Vector3 } from 'three'

export const CAMERA_POSITION: [number, number, number] = [3, 2, 4]

// Find the camera's horizontal and vertical directions.
const cameraRotation = new Quaternion().setFromRotationMatrix(
  new Matrix4().lookAt(
    new Vector3(...CAMERA_POSITION),
    new Vector3(0, 0, 0),
    new Vector3(0, 1, 0)
  )
)

const screenRight = new Vector3(1, 0, 0)
  .applyQuaternion(cameraRotation)

const screenUp = new Vector3(0, 1, 0)
  .applyQuaternion(cameraRotation)

export function rotateFromView(
  current: Quaternion,
  pitchDegrees: number,
  yawDegrees: number
): Quaternion {
  const pitch = new Quaternion().setFromAxisAngle(
    screenRight,
    MathUtils.degToRad(pitchDegrees)
  )

  const yaw = new Quaternion().setFromAxisAngle(
    screenUp,
    MathUtils.degToRad(yawDegrees)
  )

  return pitch.multiply(yaw).multiply(current).normalize()
}


export function angularDifferenceDegrees(
  first: Quaternion,
  second: Quaternion
): number {
  return Math.round(
    MathUtils.radToDeg(first.angleTo(second))
  )
}
