import { useEffect, useRef, useState } from 'react'
import CadScene from '../components/CadScene'
import Icon from '../components/Icon'
import { usePhoneTilt } from '../hooks/usePhoneTilt'
import { useRoom } from '../sync'
import { buzz, chime, tick, unlockAudio } from '../utils/feedback'
import { PARTS, isPartId } from '../utils/parts'
import { AXES, AXIS_HINTS, TOLERANCE, matchStatus, wrapDegrees } from '../utils/rotationMath'

// Must stay on target this long, so passing through it doesn't count.
const HOLD_MS = 800
const SYNC_EVERY_MS = 150

// Hot/cold tick interval: fast when close, slow when far.
const TICK_NEAR_MS = 110
const TICK_MS_PER_DEGREE = 4.5

// Circumference of the progress ring (r = 44). Explicit rather than SVG
// pathLength, which older iOS Safari ignores for dash arrays.
const RING = 2 * Math.PI * 44

type Mode = 'tilt' | 'drag'

export default function BeginnerView({ roomId }: { roomId: string }) {
  const [room, patch] = useRoom(roomId)
  const lesson = room.lesson && room.lesson.axis in AXES ? room.lesson : null
  const axis = lesson?.axis ?? 'y'
  const part = isPartId(lesson?.part) ? lesson.part : 'bracket'

  const tilt = usePhoneTilt(axis)
  const [mode, setMode] = useState<Mode | null>(null)
  const [dragAngle, setDragAngle] = useState(0)
  const [finished, setFinished] = useState<{ lessonId: number; seconds: number } | null>(null)
  const [showAxes, setShowAxes] = useState(true)
  const [guide, setGuide] = useState(true)
  const [seenLesson, setSeenLesson] = useState(lesson?.id)
  const startedAt = useRef(0)

  // New instruction: start again from 0°.
  if (lesson?.id !== seenLesson) {
    setSeenLesson(lesson?.id)
    setDragAngle(0)
  }

  const { calibrate } = tilt
  useEffect(() => {
    if (!lesson) return
    startedAt.current = Date.now()
    calibrate()
    buzz(60)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a new lesson
  }, [lesson?.id])

  const usingTilt = mode === 'tilt' && tilt.status === 'on'
  const target = lesson?.angle ?? null
  const done = lesson !== null && finished?.lessonId === lesson.id
  // Once it fits, the part stays snapped to the target until the next lesson.
  // Pilot study: beginners relaxed the phone after "Fits!" and the mirror drifted.
  const angle = done && target !== null ? target : Math.round(usingTilt ? tilt.angle : dragAngle)
  const seconds = done ? finished.seconds : 0
  const remaining = target === null ? 0 : wrapDegrees(target - angle)
  const onTarget = target !== null && Math.abs(remaining) <= TOLERANCE
  // 0 at the start (or going the wrong way), 1 on target.
  const progress = target === null ? 0 : done ? 1 : Math.max(0, 1 - Math.abs(remaining) / Math.max(Math.abs(target), 1))

  // Keyed on the id: every sync tick delivers a fresh `lesson` object.
  const lessonId = lesson?.id
  useEffect(() => {
    if (!lessonId || done || !onTarget) return
    const timer = window.setTimeout(() => {
      const tookMs = Date.now() - HOLD_MS - startedAt.current
      setFinished({ lessonId, seconds: Math.round(tookMs / 100) / 10 })
      chime()
      buzz([80, 60, 160])
    }, HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [lessonId, done, onTarget])

  // Stream progress to the expert. A ref keeps the interval stable.
  const latest = useRef({ angle, mode, lessonId: 0, done, seconds })
  const offTarget = useRef(180)
  useEffect(() => {
    latest.current = { angle, mode, lessonId: lesson?.id ?? 0, done, seconds }
    offTarget.current = Math.abs(remaining)
  })

  // Hot/cold: ticks speed up and rise in pitch as the part nears the target,
  // so the beginner can find it by ear (and by feel on phones that vibrate).
  const guiding = guide && mode !== null && !!lessonId && !done
  useEffect(() => {
    if (!guiding) return
    let timer = 0
    const loop = () => {
      const off = offTarget.current
      tick(1 - off / 180)
      timer = window.setTimeout(loop, TICK_NEAR_MS + off * TICK_MS_PER_DEGREE)
    }
    loop()
    return () => window.clearTimeout(timer)
  }, [guiding])
  useEffect(() => {
    // ponytail: fixed-rate writes (~7/s) even when idle; send-on-change if Firebase quota matters.
    const timer = window.setInterval(() => {
      const s = latest.current
      patch({ beginner: { ...s, mode: s.mode ?? 'tilt', beat: Date.now() } })
    }, SYNC_EVERY_MS)
    return () => window.clearInterval(timer)
  }, [patch])

  function handleDrag(pitch: number, yaw: number) {
    if (usingTilt) return
    setDragAngle((a) => wrapDegrees(a + (axis === 'x' ? pitch : yaw)))
  }

  function startDrag() {
    unlockAudio()
    setMode('drag')
  }

  async function startTilt() {
    unlockAudio()
    setMode('tilt')
    await tilt.enable()
  }

  const status = matchStatus(angle, target, done)
  const message = room.message

  return (
    <section className={`beginner status-${status}`}>
      <div className="stage full">
        <CadScene
          part={part}
          axis={axis}
          angle={angle}
          target={target}
          status={status}
          showAxes={showAxes}
          onDragRotate={usingTilt ? undefined : handleDrag}
        />
      </div>

      <header className="hud top">
        <span className="brand">TiltTwin</span>
        <span className="room-code">Room <strong>{roomId}</strong></span>
        <span className="spacer" />
        <button type="button" className="icon-button" aria-pressed={guide} aria-label="Hot/cold sound guide" title="Hot/cold sound" onClick={() => setGuide((g) => !g)}>
          <Icon name={guide ? 'volume' : 'mute'} />
        </button>
        <button type="button" className="icon-button" aria-pressed={showAxes} aria-label="Show axes" title="Axes" onClick={() => setShowAxes((s) => !s)}>
          <Icon name="axes" />
        </button>
        {usingTilt && (
          <button type="button" aria-label="Calibrate: make this position 0°" onClick={tilt.calibrate}>
            <Icon name="rotate" /> <span className="label">Calibrate</span>
          </button>
        )}
        {mode && (
          <button
            type="button"
            aria-label={mode === 'tilt' ? 'Use drag instead of phone motion' : 'Use phone motion'}
            onClick={() => (mode === 'tilt' ? startDrag() : startTilt())}
          >
            <Icon name={mode === 'tilt' ? 'move' : 'phone'} /> <span className="label">{mode === 'tilt' ? 'Use drag' : 'Use tilt'}</span>
          </button>
        )}
      </header>

      {lesson ? (
        <div className="hud instruction">
          <p className="task">{PARTS[part].task}</p>
          <p className="sub-task">Rotate <strong>{lesson.angle}°</strong> around <strong className={`axis-${lesson.axis}`}>{lesson.axis.toUpperCase()}</strong></p>
          <p className="hint">
            {done
              ? 'Hold it there — your expert can see it.'
              : onTarget
                ? 'Hold still…'
                : usingTilt
                  ? AXIS_HINTS[axis][remaining > 0 ? 0 : 1]
                  : `Drag ${axis === 'x' ? (remaining > 0 ? 'down' : 'up') : remaining > 0 ? 'right' : 'left'} on the part`}
          </p>
        </div>
      ) : (
        <div className="hud instruction">
          <p className="task">Waiting for your expert…</p>
          <p className="hint">They'll send a rotation to copy.</p>
        </div>
      )}

      {lesson && (
        <div
          className="hud gauge"
          role="progressbar"
          aria-label="Rotation progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={`${angle} of ${lesson.angle} degrees`}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring-track" cx="50" cy="50" r="44" />
            <circle className="ring-fill" cx="50" cy="50" r="44" strokeDasharray={`${progress * RING} ${RING}`} />
          </svg>
          <span className="value">{angle}°</span>
          <span className="of">of {lesson.angle}°</span>
        </div>
      )}

      {lesson && (
        <aside className="hud demo" aria-label="Expert's demonstration">
          <CadScene part={part} axis={lesson.axis} angle={0} target={lesson.angle} status="idle" demo />
          <span>Expert's demo</span>
        </aside>
      )}

      {message && (
        <div className="toast" key={message.id} role="status"><Icon name="message" /> {message.text}</div>
      )}

      {done && (
        <div className="done-badge big" role="status">
          <span className="pulse" aria-hidden="true" />
          <Icon name="check" size={22} /> It fits!
        </div>
      )}

      {(!mode || (mode === 'tilt' && tilt.status !== 'on')) && (
        <div className="overlay">
          <div className="card">
            <span className="badge"><Icon name="phone" size={14} /> Room {roomId}</span>
            <h1>Learn by moving</h1>
            {tilt.status === 'denied' && <p className="warn">Motion access was blocked. Allow it in your browser settings, or use drag.</p>}
            {tilt.status === 'unsupported' && <p className="warn">No motion sensor found on this device. Use drag instead.</p>}
            <p>Hold your phone sideways in front of you, like you're holding the part. Turn the phone, and the part turns with it.</p>
            <p>Listen for the ticks: they speed up as you get closer.</p>
            <p className="muted">Tip: turn on rotation lock, and turn the silent switch off for sound.</p>
            <button type="button" className="primary large" onClick={startTilt}><Icon name="phone" /> Start with phone motion</button>
            <button type="button" onClick={startDrag}><Icon name="move" /> Use touch / mouse drag</button>
          </div>
        </div>
      )}
    </section>
  )
}
