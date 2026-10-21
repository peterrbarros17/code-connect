import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { LoginPage } from './pages/LoginPage/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage/RegisterPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
