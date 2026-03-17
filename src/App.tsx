import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import RutePage from "./pages/RutePage";
import JadwalPage from "./pages/JadwalPage";
import KunjunganPage from "./pages/KunjunganPage";
import ProdukPage from "./pages/ProdukPage";
import PelangganPage from "./pages/PelangganPage";
import PesananPage from "./pages/PesananPage";
import KaryawanPage from "./pages/KaryawanPage";
import DivisiPage from "./pages/DivisiPage";
import PerusahaanPage from "./pages/PerusahaanPage";
import UserPage from "./pages/UserPage";
import NotifikasiPage from "./pages/NotifikasiPage";
import InformasiKunjunganPage from "./pages/InformasiKunjunganPage";
import AppUpdatePage from "./pages/AppUpdatePage";
import PromoPage from "./pages/PromoPage";

/** Guard: harus login */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  // Sales tidak boleh masuk web admin
  if (token && user?.peran === "sales") {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-gray-50 text-center px-6">
        <div className="text-5xl">🚫</div>
        <h1 className="text-xl font-bold text-gray-800">Akses Ditolak</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          Akun Sales hanya dapat digunakan di <strong>aplikasi mobile</strong>.
          Silakan gunakan aplikasi Sales Tracker di HP Anda.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/** Guard: hanya Super Admin */
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.peran !== "super_admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  return (
    <ThemeProvider>
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
                      <Route path="/promo" element={<PromoPage />} />
                      <Route path="/pelanggan" element={<PelangganPage />} />
                      <Route path="/produk" element={<ProdukPage />} />
                      <Route path="/pesanan" element={<PesananPage />} />
                      <Route path="/informasi-kunjungan" element={<InformasiKunjunganPage />} />
                      <Route path="/karyawan" element={<KaryawanPage />} />
                      <Route path="/divisi" element={<DivisiPage />} />
                      <Route path="/users" element={<UserPage />} />
                      <Route path="/notifikasi" element={<NotifikasiPage />} />
                      {/* Perusahaan — Super Admin only */}
                      <Route
                        path="/perusahaan"
                        element={
                          <SuperAdminRoute>
                            <PerusahaanPage />
                          </SuperAdminRoute>
                        }
                      />
                      <Route
                        path="/app-update"
                        element={
                          <SuperAdminRoute>
                            <AppUpdatePage />
                          </SuperAdminRoute>
                        }
                      />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
