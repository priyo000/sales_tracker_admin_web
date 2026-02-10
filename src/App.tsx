import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import RutePage from './pages/RutePage';
import JadwalPage from './pages/JadwalPage';
import ProdukPage from './pages/ProdukPage';
import PelangganPage from './pages/PelangganPage';
import PesananPage from './pages/PesananPage';
import KaryawanPage from './pages/KaryawanPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
                                    <Route path="/rute" element={<RutePage />} />
                                    <Route path="/pelanggan" element={<PelangganPage />} />
                                    <Route path="/produk" element={<ProdukPage />} />
                                    <Route path="/pesanan" element={<PesananPage />} />
                                    <Route path="/karyawan" element={<KaryawanPage />} />
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
