import { useState, type FormEvent } from 'react'
import CadScene from './components/CadScene'
import Icon from './components/Icon'
import { db, roomExists } from './sync'
import { PART_IDS, PARTS, type PartId } from './utils/parts'
import ExpertView from './views/ExpertView'
import BeginnerView from './views/BeginnerView'
import './App.css'

// Room codes go into a database path, so keep them to a safe alphabet.
const cleanRoom = (value: string | null) =>
  (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)

// No 0/O or 1/I, so codes are easy to read aloud.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newRoomCode = () =>
  Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')

export default function App() {
  const params = new URLSearchParams(location.search)
  const room = cleanRoom(params.get('room'))
  const role = params.get('role')

  if (room && role === 'expert') return <ExpertView roomId={room} />
  if (room && role === 'beginner') return <BeginnerView roomId={room} />
  if (location.pathname.startsWith('/join')) return <JoinPage />
  return <Home />
}

// One fixed link for every phone (/join); the 4-letter code is the per-lesson check.
function JoinForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'missing' | 'offline'>('idle')

  async function join(event: FormEvent) {
    event.preventDefault()
    const room = cleanRoom(code)
    if (room.length < 4) return
    setState('checking')
    try {
      if (await roomExists(room)) {
        location.assign(`/?role=beginner&room=${room}`)
      } else {
        setState('missing')
      }
    } catch {
      setState('offline')
    }
  }

  const error =
    state === 'missing' ? 'No live lesson with that code. Check the expert’s screen.'
      : state === 'offline' ? 'Couldn’t reach the server. Check your connection and try again.'
        : null

  return (
    <form className="join-form" onSubmit={join} noValidate>
      <label htmlFor="room-code">Lesson code</label>
      <div className="row">
        <input
          id="room-code"
          className="code-input"
          value={code}
          onChange={(event) => {
            setCode(cleanRoom(event.target.value))
            setState('idle')
          }}
          placeholder="K7QF"
          maxLength={8}
          autoFocus={autoFocus}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby="room-code-help"
        />
        <button type="submit" className="primary" disabled={cleanRoom(code).length < 4 || state === 'checking'}>
          {state === 'checking' ? 'Checking…' : 'Join'}
        </button>
      </div>
      <p id="room-code-help" className={error ? 'field-error' : 'field-help'} role={error ? 'alert' : undefined}>
        {error ?? 'The 4-letter code shown on your expert’s screen.'}
      </p>
    </form>
  )
}

function JoinPage() {
  return (
    <main className="join-page">
      <a className="brand big" href="/">TiltTwin</a>
      <div className="panel join-card">
        <span className="badge"><Icon name="phone" size={16} /> Beginner</span>
        <h1>Join your lesson</h1>
        <JoinForm autoFocus />
      </div>
      <p className="muted small">Keep this page bookmarked. It's the same link every lesson.</p>
    </main>
  )
}

const STEPS = [
  { icon: 'laptop', title: 'Expert demonstrates', text: 'Pick a part, an axis and an angle. A looping demo shows the move.' },
  { icon: 'phone', title: 'Beginner moves the phone', text: 'The phone is the part: turn it, and the 3D model turns with it.' },
  { icon: 'target', title: 'Feel it click into place', text: 'Hot/cold ticks, a turn arrow and colour guide you until it fits.' },
] as const

function Home() {
  const [code] = useState(newRoomCode)
  const [part, setPart] = useState<PartId>('elbow')

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="badge">CPSC 581 · Remote CAD teaching</span>
          <h1>Learn 3D rotation <em>with your hands.</em></h1>
          <p className="lede">
            An expert demonstrates a rotation on their laptop. The beginner reproduces it by
            physically turning their phone until the part fits, with live feedback on both ends.
          </p>
          <div className="hero-actions">
            <a className="button primary large" href={`?role=expert&room=${code}`}>
              <Icon name="laptop" /> Start a lesson
            </a>
            <a className="button large" href="/join">
              <Icon name="phone" /> Join on a phone
            </a>
          </div>
        </div>

        <figure className="hero-stage">
          <div className="stage">
            <CadScene part={part} axis="y" angle={0} target={90} status="idle" showAxes demo />
          </div>
          <figcaption>
            <span className="muted">Try a part:</span>
            {PART_IDS.map((p) => (
              <button key={p} type="button" className="chip" aria-pressed={part === p} onClick={() => setPart(p)}>
                {PARTS[p].name}
              </button>
            ))}
            <span className="task-preview">{PARTS[part].task}</span>
          </figcaption>
        </figure>
      </section>

      <ol className="steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="panel step">
            <span className="step-icon"><Icon name={step.icon} size={22} /></span>
            <span className="step-no">{i + 1}</span>
            <h2>{step.title}</h2>
            <p className="muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <section className="panel join-inline">
        <div>
          <h2>Got a code?</h2>
          <p className="muted">On the phone, open <strong>{location.host}/join</strong>. It's the same link every time.</p>
        </div>
        <JoinForm />
      </section>

      {!db && (
        <p className="warn">
          Local mode (no Firebase URL configured): open the expert and beginner in two
          tabs of this same browser.
        </p>
      )}
    </main>
  )
}
