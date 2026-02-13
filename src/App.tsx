import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import RutePage from './pages/RutePage';
import JadwalPage from './pages/JadwalPage';
import KunjunganPage from './pages/KunjunganPage';
import ProdukPage from './pages/ProdukPage';
import PelangganPage from './pages/PelangganPage';
import PesananPage from './pages/PesananPage';
import KaryawanPage from './pages/KaryawanPage';
import DivisiPage from './pages/DivisiPage';
import PerusahaanPage from './pages/PerusahaanPage';
import UserPage from './pages/UserPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, isLoading } = useAuth();
    
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
  return (
    <Router>
        <AuthProvider>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                    path="/*" 
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/jadwal" element={<JadwalPage />} />
                                    <Route path="/kunjungan" element={<KunjunganPage />} />
                                    <Route path="/rute" element={<RutePage />} />
                                    <Route path="/pelanggan" element={<PelangganPage />} />
                                    <Route path="/produk" element={<ProdukPage />} />
                                    <Route path="/pesanan" element={<PesananPage />} />
                                    <Route path="/karyawan" element={<KaryawanPage />} />
                                    <Route path="/divisi" element={<DivisiPage />} />
                                    <Route path="/perusahaan" element={<PerusahaanPage />} />
                                    <Route path="/users" element={<UserPage />} />
                                </Routes>
                            </MainLayout>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </AuthProvider>
    </Router>
  )
}

export default App
