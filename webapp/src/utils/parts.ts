// Real-world parts to teach with. Each lesson is an assembly task: rotate the part
// so its feature (a hole, an outlet, a jaw) lines up with a fixed mating part.

export type PartId = 'bracket' | 'elbow' | 'gear' | 'wrench'

type Vec3 = [number, number, number]

// A mating piece is a stack of cylinders along the feature's normal.
// `from`/`to` are distances from the feature point; `sides` 6 makes a hex.
export type MateSegment = { from: number; to: number; radius: number; sides: number }

export type Part = {
  name: string
  task: string // shown to the beginner, e.g. "Fit the bolt through the hole"
  mateName: string
  // Feature in the part's own (centred) coordinates. Must not sit on any X/Y/Z
  // axis line, otherwise rotating about that axis wouldn't move it.
  feature: { position: Vec3; normal: Vec3 }
  mate: MateSegment[]
}

export const PARTS: Record<PartId, Part> = {
  bracket: {
    name: 'L-bracket',
    task: 'Line the hole up with the bolt',
    mateName: 'bolt',
    feature: { position: [0.81, -0.22, 0], normal: [0, 1, 0] },
    mate: [
      { from: 0.05, to: 1.1, radius: 0.12, sides: 16 },
      { from: 1.1, to: 1.3, radius: 0.24, sides: 6 },
    ],
  },
  elbow: {
    name: 'Pipe elbow',
    task: 'Connect the elbow to the pipe',
    mateName: 'pipe',
    feature: { position: [-0.55, 0.54, 0], normal: [-1, 0, 0] },
    mate: [
      { from: 0.05, to: 0.12, radius: 0.3, sides: 24 },
      { from: 0.12, to: 1.2, radius: 0.22, sides: 24 },
    ],
  },
  gear: {
    name: 'Gear',
    task: 'Slide the gear onto the pin',
    mateName: 'pin',
    feature: { position: [0.45, 0.13, 0.2], normal: [0, 1, 0] },
    mate: [
      { from: 0.05, to: 1.0, radius: 0.08, sides: 16 },
      { from: 1.0, to: 1.1, radius: 0.14, sides: 16 },
    ],
  },
  wrench: {
    name: 'Wrench',
    task: 'Fit the wrench jaws onto the nut',
    mateName: 'nut',
    // Jaw centre at (0.95, 0, 0), after the whole wrench is turned 20° about Y.
    feature: { position: [0.893, 0, -0.325], normal: [0, 1, 0] },
    mate: [
      { from: -0.7, to: -0.07, radius: 0.1, sides: 16 },
      { from: -0.06, to: 0.06, radius: 0.2, sides: 6 },
      { from: 0.07, to: 0.2, radius: 0.1, sides: 16 },
    ],
  },
}

export const PART_IDS = Object.keys(PARTS) as PartId[]

export const isPartId = (value: unknown): value is PartId =>
  typeof value === 'string' && value in PARTS
