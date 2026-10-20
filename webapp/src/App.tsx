
import ExpertView from './views/ExpertView'
import './App.css'

export default function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>TiltTwin</h1>
        <p>Remote CAD learning through physical interaction.</p>
      </header>

      <ExpertView />
    </main>
  )
}
