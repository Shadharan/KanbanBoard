import { useState } from 'react'
import './App.css'
import KanbanBoard from './pages/KanbanBoard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Kanban Application</h1>
    <KanbanBoard/>
    </>
  )
}

export default App
