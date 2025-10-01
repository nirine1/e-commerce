import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/auth/register'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    )
}

export default App
