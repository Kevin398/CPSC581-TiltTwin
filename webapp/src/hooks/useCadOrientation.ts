
import { useState } from 'react'
import { Quaternion } from 'three'
import { rotateFromView } from '../utils/rotationMath'

export function useCadOrientation() {
  const [orientation, setOrientation] = useState(
    () => new Quaternion()
  )

  function rotate(pitch: number, yaw: number) {
    setOrientation((current) =>
      rotateFromView(current, pitch, yaw)
    )
  }

  function reset() {
    setOrientation(new Quaternion())
  }

  return { orientation, rotate, reset }
}
