import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

export type Axis = 'x' | 'y' | 'z'

export const CAMERA_POSITION: [number, number, number] = [3, 2, 4]

export const AXES: Record<Axis, Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
}

// [positive rotation, negative rotation], in phone terms (see tests).
export const AXIS_HINTS: Record<Axis, [string, string]> = {
  x: ['Tilt the top of the phone toward you', 'Tilt the top of the phone away from you'],
  // Not "turn left/right": users read that both ways (screen faces left vs. phone turns left).
  y: ['Swing the right edge of the phone away from you', 'Swing the right edge of the phone toward you'],
  z: ['Rotate the phone counter-clockwise', 'Rotate the phone clockwise'],
}

// Within this many degrees of the target counts as matched.
export const TOLERANCE = 8

export type MatchStatus = 'idle' | 'far' | 'close' | 'done'

export const STATUS_COLORS: Record<MatchStatus, string> = {
  idle: '#94a3b8',
  far: '#f97316',
  close: '#facc15',
  done: '#22c55e',
}

export const AXIS_COLORS: Record<Axis, string> = {
  x: '#ef4444',
  y: '#22c55e',
  z: '#3b82f6',
}

export function matchStatus(angle: number, target: number | null, done = false): MatchStatus {
  if (target === null) return 'idle'
  if (done) return 'done'
  const off = Math.abs(wrapDegrees(target - angle))
  return off <= TOLERANCE ? 'done' : off <= 25 ? 'close' : 'far'
}

// Wraps any angle into [-180, 180).
export function wrapDegrees(degrees: number): number {
  return ((((degrees + 180) % 360) + 360) % 360) - 180
}

export function axisRotation(axis: Axis, degrees: number): Quaternion {
  return new Quaternion().setFromAxisAngle(
    AXES[axis],
    MathUtils.degToRad(degrees)
  )
}

// How far `q` turns around `axis`, ignoring any wobble around the
// other axes (swing-twist decomposition).
export function twistDegrees(q: Quaternion, axis: Axis): number {
  const a = AXES[axis]
  const along = q.x * a.x + q.y * a.y + q.z * a.z
  return wrapDegrees(MathUtils.radToDeg(2 * Math.atan2(along, q.w)))
}

// Look out the back of the phone instead of its top edge.
const backFacing = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))

// Phone pose from DeviceOrientation angles, expressed in screen axes:
// x = screen right, y = screen up, z = out of the screen toward the user.
// Same maths as three.js' DeviceOrientationControls.
export function deviceQuaternion(
  alpha: number,
  beta: number,
  gamma: number,
  screenAngle: number
): Quaternion {
  const d = MathUtils.degToRad
  return new Quaternion()
    .setFromEuler(new Euler(d(beta), d(alpha), -d(gamma), 'YXZ'))
    .multiply(backFacing)
    .multiply(axisRotation('z', -screenAngle))
}

// Phone rotation since calibration, measured around one CAD axis.
export function phoneTwist(
  zero: Quaternion,
  current: Quaternion,
  axis: Axis
): number {
  return twistDegrees(zero.clone().invert().multiply(current), axis)
}
