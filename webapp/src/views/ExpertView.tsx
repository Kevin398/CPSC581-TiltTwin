import { useEffect, useRef, useState, type CSSProperties } from 'react'
import CadScene from '../components/CadScene'
import { useRoom } from '../sync'
import { chime } from '../utils/feedback'
import { PART_IDS, PARTS, isPartId, type PartId } from '../utils/parts'
import { AXES, AXIS_COLORS, AXIS_HINTS, matchStatus, type Axis } from '../utils/rotationMath'

const ANGLES = [-90, -45, 45, 90, 180]
const CORRECTIONS = ['Other way!', 'Keep going', 'Almost there', 'Slow down', 'Recalibrate & try again']

// Beginner counts as offline after this long without an update.
const OFFLINE_AFTER_MS = 4000

type Result = { lessonId: number; part: PartId; axis: Axis; angle: number; mode: string; seconds: number }

export default function ExpertView({ roomId }: { roomId: string }) {
  const [room, patch] = useRoom(roomId)
  const [part, setPart] = useState<PartId>('bracket')
  const [axis, setAxis] = useState<Axis>('y')
  const [angle, setAngle] = useState(45)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [online, setOnline] = useState(false)

  const lesson = room.lesson && room.lesson.axis in AXES ? room.lesson : null
  const beginner = room.beginner
  const working = beginner && lesson && beginner.lessonId === lesson.id ? beginner : null
  const lessonPart = isPartId(lesson?.part) ? lesson.part : 'bracket'

  // Clock-skew-proof presence: watch for *new* heartbeats using our own clock.
  const beat = useRef({ latest: 0, seen: 0, at: 0 })
  useEffect(() => {
    beat.current.latest = beginner?.beat ?? 0
  })
  useEffect(() => {
    const timer = window.setInterval(() => {
      const b = beat.current
      if (b.latest !== b.seen) Object.assign(b, { seen: b.latest, at: Date.now() })
      setOnline(Date.now() - b.at < OFFLINE_AFTER_MS)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const doneId = working?.done && lesson ? lesson.id : null
  if (doneId && lesson && working && !results.some((r) => r.lessonId === doneId)) {
    setResults([...results, { lessonId: doneId, part: lessonPart, axis: lesson.axis, angle: lesson.angle, mode: working.mode, seconds: working.seconds }])
  }
  useEffect(() => {
    if (doneId) chime()
  }, [doneId])

  const joinUrl = `${location.origin}${location.pathname}?role=beginner&room=${roomId}`

  function sendLesson() {
    patch({ lesson: { id: Date.now(), part, axis, angle }, message: null })
  }

  function sendMessage(text: string) {
    if (!text.trim()) return
    patch({ message: { id: (room.message?.id ?? 0) + 1, text: text.trim().slice(0, 120) } })
    setMessage('')
  }

  function copyResults() {
    const rows = results.map((r, i) => [i + 1, r.part, r.axis.toUpperCase(), r.angle, r.mode, r.seconds].join(','))
    navigator.clipboard?.writeText(['#,part,axis,angle,mode,seconds', ...rows].join('\n'))
  }

  const status = working ? matchStatus(working.angle, lesson!.angle, working.done) : 'idle'

  return (
    <section className="expert">
      <header className="topbar">
        <a className="brand" href="./">TiltTwin</a>
        <span className="pill">Expert</span>
        <span className="room-code" title="Room code">Room <strong>{roomId}</strong></span>
        <span className={`presence ${online ? 'on' : ''}`}>
          {online ? `Beginner connected (${beginner?.mode === 'drag' ? 'drag' : 'phone tilt'})` : 'Waiting for beginner…'}
        </span>
      </header>

      <p className="join-hint">
        Beginner joins on their phone: <a href={joinUrl} target="_blank" rel="noreferrer">{joinUrl}</a>
      </p>

      <div className="expert-grid">
        <div className="panel">
          <h2>1 · Demonstrate</h2>
          <fieldset className="choice">
            <legend>Part</legend>
            {PART_IDS.map((p) => (
              <button key={p} type="button" aria-pressed={part === p} onClick={() => setPart(p)}>
                {PARTS[p].name}
              </button>
            ))}
          </fieldset>

          <fieldset className="choice">
            <legend>Rotation axis</legend>
            {(Object.keys(AXES) as Axis[]).map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={axis === a}
                style={{ '--axis': AXIS_COLORS[a] } as CSSProperties}
                onClick={() => setAxis(a)}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </fieldset>

          <fieldset className="choice">
            <legend>Angle</legend>
            {ANGLES.map((a) => (
              <button key={a} type="button" aria-pressed={angle === a} onClick={() => setAngle(a)}>
                {a > 0 ? '+' : ''}{a}°
              </button>
            ))}
          </fieldset>

          <div className="stage small">
            <CadScene part={part} axis={axis} angle={0} target={angle} status="idle" showAxes demo />
          </div>
          <p className="muted">
            Task: “{PARTS[part].task}”. Hint: “{AXIS_HINTS[axis][angle > 0 ? 0 : 1]}”
          </p>

          <div className="row">
            <button type="button" className="primary" onClick={sendLesson}>
              {lesson ? 'Send new instruction' : 'Send instruction'}
            </button>
            <button type="button" disabled={!lesson} onClick={() => patch({ lesson: null })}>
              End lesson
            </button>
          </div>
        </div>

        <div className="panel">
          <h2>2 · Watch the beginner</h2>
          <div className={`stage live status-${status}`}>
            {lesson ? (
              <CadScene
                part={lessonPart}
                axis={lesson.axis}
                angle={working?.angle ?? 0}
                target={lesson.angle}
                status={status}
              />
            ) : (
              <p className="empty">Send an instruction to start a lesson.</p>
            )}
            {working?.done && <div className="done-badge">✓ Fits! {working.seconds}s</div>}
          </div>

          {lesson && (
            <p className={`readout status-${status}`}>
              <strong>{working?.angle ?? 0}°</strong> / {lesson.angle}° around {lesson.axis.toUpperCase()}
            </p>
          )}

          <h3>Corrections</h3>
          <div className="row wrap">
            {CORRECTIONS.map((text) => (
              <button key={text} type="button" disabled={!lesson} onClick={() => sendMessage(text)}>
                {text}
              </button>
            ))}
          </div>
          <form
            className="row"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(message)
            }}
          >
            <input
              aria-label="Message to beginner"
              placeholder="Type a tip for the beginner…"
              maxLength={120}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="row spread">
          <h2>Session results</h2>
          <button type="button" disabled={!results.length} onClick={copyResults}>Copy CSV</button>
        </div>
        {results.length ? (
          <table>
            <thead>
              <tr><th>#</th><th>Part</th><th>Axis</th><th>Target</th><th>Input</th><th>Time</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.lessonId}>
                  <td>{i + 1}</td><td>{PARTS[r.part].name}</td><td>{r.axis.toUpperCase()}</td><td>{r.angle}°</td><td>{r.mode}</td><td>{r.seconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">Completed lessons appear here (useful for user testing).</p>
        )}
      </div>
    </section>
  )
}
