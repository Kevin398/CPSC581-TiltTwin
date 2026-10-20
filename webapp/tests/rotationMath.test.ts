// Run with: npm test
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  axisRotation,
  deviceQuaternion,
  phoneTwist,
  twistDegrees,
  wrapDegrees,
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

test('turning an upright phone left reads as +Y', () => {
  // Phone held upright facing the user, then turned 40° to the left.
  // alpha grows as the phone turns counter-clockwise seen from above.
  const zero = deviceQuaternion(0, 90, 0, 0)
  const turned = deviceQuaternion(40, 90, 0, 0)
  near(phoneTwist(zero, turned, 'y'), 40)
})

test('tilting the top toward the user reads as +X', () => {
  // beta grows past 90° as the top edge of an upright phone tips toward you.
  const zero = deviceQuaternion(0, 70, 0, 0)
  near(phoneTwist(zero, deviceQuaternion(0, 100, 0, 0), 'x'), 30)
  near(phoneTwist(zero, deviceQuaternion(0, 40, 0, 0), 'x'), -30)
})

test('landscape screens use screen axes, not hardware axes', () => {
  // Phone lying flat, rotated counter-clockwise on the table: +Z either way.
  near(phoneTwist(deviceQuaternion(0, 0, 0, 90), deviceQuaternion(25, 0, 0, 90), 'z'), 25)
  near(phoneTwist(deviceQuaternion(0, 0, 0, 0), deviceQuaternion(25, 0, 0, 0), 'z'), 25)
})
