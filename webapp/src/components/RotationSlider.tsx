
type RotationSliderProps = {
  rotationDegrees: number
  onRotationChange: (degrees: number) => void
}

export default function RotationSlider({
  rotationDegrees,
  onRotationChange,
}: RotationSliderProps) {
  return (
    <div>
      <label htmlFor="rotation-slider">
        Rotation: {rotationDegrees}°
      </label>

      <input
        id="rotation-slider"
        type="range"
        min="0"
        max="360"
        step="1"
        value={rotationDegrees}
        onChange={(event) =>
          onRotationChange(Number(event.target.value))
        }
      />
    </div>
  )
}
