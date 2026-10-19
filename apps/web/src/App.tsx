import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { LoginPage } from './pages/LoginPage/LoginPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}
