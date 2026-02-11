import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { usePerusahaan } from '@/features/perusahaan/hooks/usePerusahaan';
import { useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, switchCompany } = useAuth();
    const { perusahaans, fetchPerusahaans } = usePerusahaan();

    useEffect(() => {
        if (user?.peran === 'super_admin') {
            fetchPerusahaans();
        }
    }, [user, fetchPerusahaans]);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center border-b bg-white px-8 shadow-sm justify-between">
                    <div className="flex items-center space-x-4">
                        {user?.peran === 'super_admin' ? (
                            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                                <Building2 className="h-4 w-4 text-indigo-600" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Company</span>
                                    <select 
                                        className="bg-transparent text-xs font-bold text-slate-900 border-none p-0 focus:ring-0 cursor-pointer"
                                        value={user.id_perusahaan}
                                        onChange={(e) => switchCompany(Number(e.target.value))}
                                    >
                                        {perusahaans.map(p => (
                                            <option key={p.id} value={p.id}>{p.nama_perusahaan}</option>
                                        ))}
                                    </select>
                                </div>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">{user?.perusahaan?.nama_perusahaan || 'Sales Tracker'}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-slate-900">{user?.username}</span>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5",
                                user?.peran === 'super_admin' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                            )}>
                                {user?.peran?.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
