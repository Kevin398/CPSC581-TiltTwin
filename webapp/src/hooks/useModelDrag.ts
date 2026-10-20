
import { useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'


type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void
  hasPointerCapture: (pointerId: number) => boolean
  releasePointerCapture: (pointerId: number) => void
}


type DragPoint = {
  pointerId: number
  x: number
  y: number
}

const SENSITIVITY = 0.35

export function useModelDrag(
  onRotate: (pitch: number, yaw: number) => void
) {
  const dragPoint = useRef<DragPoint | null>(null)

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    if (event.button !== 0) return

    event.stopPropagation()

    dragPoint.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }

    const target = event.target as PointerCaptureTarget
    target.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ThreeEvent<PointerEvent>) {
    const previous = dragPoint.current
    if (!previous || previous.pointerId !== event.pointerId) return

    event.stopPropagation()

    const deltaX = event.clientX - previous.x
    const deltaY = event.clientY - previous.y

    dragPoint.current = {
      ...previous,
      x: event.clientX,
      y: event.clientY,
    }

    // Rotate around camera-relative axes.
    onRotate(deltaY * SENSITIVITY, deltaX * SENSITIVITY)
  }

  function onPointerEnd(event: ThreeEvent<PointerEvent>) {
    if (dragPoint.current?.pointerId !== event.pointerId) return

    event.stopPropagation()
    dragPoint.current = null

    const target = event.target as PointerCaptureTarget

    if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId)
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  }
}
