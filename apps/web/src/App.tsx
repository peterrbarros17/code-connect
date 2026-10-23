import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { MainLayout } from './components/templates/MainLayout/MainLayout.tsx'
import { AuthProvider } from './contexts/AuthProvider.tsx'
import { CreatePostPage } from './pages/CreatePostPage/CreatePostPage.tsx'
import { FeedPage } from './pages/FeedPage/FeedPage.tsx'
import { LoginPage } from './pages/LoginPage/LoginPage.tsx'
import { PostDetailPage } from './pages/PostDetailPage/PostDetailPage.tsx'
import { RegisterPage } from './pages/RegisterPage/RegisterPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/publicar" element={<CreatePostPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
