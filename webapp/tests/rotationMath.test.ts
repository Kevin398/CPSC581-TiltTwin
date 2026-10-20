// Run with: npm test
import assert from 'node:assert/strict'
import test from 'node:test'
import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import {
  axisRotation,
  deviceQuaternion,
  phoneTwist,
  twistDegrees,
  wrapDegrees,
  type Axis,
} from '../src/utils/rotationMath.ts'

const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 0.5, `${actual} ≉ ${expected}`)

test('wrapDegrees keeps angles in [-180, 180)', () => {
  near(wrapDegrees(190), -170)
  near(wrapDegrees(-190), 170)
  near(wrapDegrees(720 + 45), 45)
  near(wrapDegrees(180), -180)
})

test('twist reads back a pure rotation and ignores other axes', () => {
  near(twistDegrees(axisRotation('y', 45), 'y'), 45)
  near(twistDegrees(axisRotation('x', -90), 'x'), -90)
  near(twistDegrees(axisRotation('x', 60), 'y'), 0)

  const wobbly = axisRotation('y', 30).multiply(axisRotation('x', 5))
  assert.ok(Math.abs(twistDegrees(wobbly, 'y') - 30) < 2)
})

// Simulate a real hold: device axes in world coords (East, North, Up; user faces North),
// rotate the phone about a world axis, convert to the W3C alpha/beta/gamma the browser
// reports (R = Rz(alpha) Rx(beta) Ry(gamma)), and run them through our pipeline.
const E = new Vector3(1, 0, 0), N = new Vector3(0, 1, 0), U = new Vector3(0, 0, 1)
const W = E.clone().negate(), S = N.clone().negate(), D = U.clone().negate()

function reported(basis: Vector3[], about: Vector3, deg: number) {
  const turn = new Quaternion().setFromAxisAngle(about, MathUtils.degToRad(deg))
  const [x, y, z] = basis.map((v) => v.clone().applyQuaternion(turn))
  const e = new Euler().setFromRotationMatrix(new Matrix4().makeBasis(x, y, z), 'ZXY')
  return [e.z, e.x, e.y].map(MathUtils.radToDeg) as [number, number, number]
}

// Phone upright in front of the user, screen facing them (South).
const HOLDS = {
  portrait: { basis: [E, U, S], screen: 0 },
  'landscape, top to the left': { basis: [U, W, S], screen: 90 },
  'landscape, top to the right': { basis: [D, E, S], screen: 270 },
}

// Each AXIS_HINTS[axis][0] motion, as a rotation about a world axis.
const POSITIVE_MOTIONS: Record<Axis, Vector3> = {
  x: E, // tilt the top toward you
  y: U, // swing the right edge away from you (counter-clockwise seen from above)
  z: S, // counter-clockwise as the user sees the screen
}

for (const [hold, { basis, screen }] of Object.entries(HOLDS)) {
  test(`${hold}: each hint's motion reads as + on its axis`, () => {
    const zero = deviceQuaternion(...reported(basis, U, 0), screen)
    for (const axis of ['x', 'y', 'z'] as Axis[]) {
      const moved = deviceQuaternion(...reported(basis, POSITIVE_MOTIONS[axis], 30), screen)
      near(phoneTwist(zero, moved, axis), 30)
    }
  })
}

test('the +Y motion really is "right edge away from you"', () => {
  // Rotating the screen-right axis (East) counter-clockwise from above moves it North: away.
  const rightEdge = E.clone().applyAxisAngle(U, MathUtils.degToRad(30))
  assert.ok(rightEdge.y > 0)
})
