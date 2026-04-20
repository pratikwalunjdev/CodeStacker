import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BlogDetail } from './pages/BlogDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { BookmarkList } from './pages/BookmarkList';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="bookmarks" element={<BookmarkList />} />
            <Route path="auth" element={<AuthPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
