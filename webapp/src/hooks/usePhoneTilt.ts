import { useEffect, useRef, useState } from 'react'
import type { Quaternion } from 'three'
import {
  deviceQuaternion,
  phoneTwist,
  wrapDegrees,
  type Axis,
} from '../utils/rotationMath'

export type TiltStatus = 'off' | 'on' | 'denied' | 'unsupported'

// 0..1 — lower is smoother but laggier. Tune on real phones.
const SMOOTHING = 0.25

// Desktop browsers expose the API but never send real readings.
const NO_SENSOR_TIMEOUT_MS = 1500

type PermissionApi = { requestPermission?: () => Promise<string> }

// Rotation of the phone around one CAD axis, in degrees since calibration.
export function usePhoneTilt(axis: Axis) {
  const [status, setStatus] = useState<TiltStatus>('off')
  const [angle, setAngle] = useState(0)

  const axisRef = useRef(axis)
  const zero = useRef<Quaternion | null>(null)
  const screenAngle = useRef(0)
  const smoothed = useRef(0)

  useEffect(() => {
    axisRef.current = axis
    zero.current = null
  }, [axis])

  useEffect(() => {
    if (status !== 'on') return

    let gotReading = false
    const timeout = window.setTimeout(() => {
      if (!gotReading) setStatus('unsupported')
    }, NO_SENSOR_TIMEOUT_MS)

    function onOrientation(event: DeviceOrientationEvent) {
      if (event.alpha === null || event.beta === null || event.gamma === null) return
      gotReading = true

      const pose = deviceQuaternion(event.alpha, event.beta, event.gamma, screenAngle.current)
      if (!zero.current) {
        zero.current = pose
        smoothed.current = 0
      }

      const raw = phoneTwist(zero.current, pose, axisRef.current)
      smoothed.current = wrapDegrees(
        smoothed.current + wrapDegrees(raw - smoothed.current) * SMOOTHING
      )
      setAngle(Math.round(smoothed.current))
    }

    window.addEventListener('deviceorientation', onOrientation)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [status])

  // The phone's current pose becomes 0°. Screen axes are frozen here so the
  // mapping doesn't jump if the OS auto-rotates the display mid-lesson.
  function calibrate() {
    zero.current = null
    screenAngle.current = screen.orientation?.angle ?? 0
    setAngle(0)
  }

  // Must run from a tap: iOS only grants motion access inside a user gesture.
  async function enable() {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setStatus('unsupported')
      return
    }

    const api = DeviceOrientationEvent as unknown as PermissionApi
    if (api.requestPermission) {
      const answer = await api.requestPermission().catch(() => 'denied')
      if (answer !== 'granted') {
        setStatus('denied')
        return
      }
    }

    calibrate()
    setStatus('on')
  }

  return { status, angle, enable, calibrate }
}
