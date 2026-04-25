import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    UserCircle, 
    ClipboardList,
    Users,
    Building2,
    ShieldCheck,
    Stethoscope,
    X
} from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useEffect } from 'react';

export const Sidebar = () => {
    const { user } = useAuthStore();
    const { isMobileSidebarOpen, closeMobileSidebar } = useLayoutStore();
    const role = user?.role?.toUpperCase();

    // Define navigation specific to explicit roles.
    // Using Lucide icons for high-quality SVG visuals.
    const getNavLinks = () => {
        const links = [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
        ];

        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            links.push({ path: '/hospitals', label: 'Hospitals', icon: <Building2 size={20} /> });
            links.push({ path: '/doctors', label: 'Medical Staff', icon: <Stethoscope size={20} /> });
            links.push({ 
                path: '/admins', 
                label: role === 'SUPER_ADMIN' ? 'Admin Accounts' : 'Hospital Admins', 
                icon: <ShieldCheck size={20} /> 
            });
        }

        if (role === 'ADMIN_HOSPITAL') {
            links.push({ path: '/receptionists', label: 'Reception Team', icon: <Users size={20} /> });
        }

        if (['DOCTOR', 'ADMIN_HOSPITAL'].includes(role)) {
            links.push({ path: '/records', label: 'Medical Records', icon: <ClipboardList size={20} /> });
        }

        if (role === 'PATIENT') {
            links.push({ path: '/records', label: 'My Records', icon: <ClipboardList size={20} /> });
        }

        if (['RECEPTIONIST', 'ADMIN_HOSPITAL'].includes(role)) {
            links.push({ path: '/patients', label: 'Assign Patients', icon: <Users size={20} /> });
        }

        return links;
    };

    // Handle ESC key to close sidebar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeMobileSidebar();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeMobileSidebar]);

    // Handle body scroll lock
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileSidebarOpen]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}
            
            {/* Sidebar Container */}
            <aside 
                id="mobile-sidebar"
                className={`
                    w-64 bg-[#0f172a] text-slate-100 flex flex-col h-screen fixed md:sticky top-0 z-50 
                    transition-transform duration-300 ease-in-out
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
                aria-label="Main Navigation"
            >
                <div className="p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        Smart Hospital
                    </h2>
                    {/* Close button for mobile */}
                    <button 
                        onClick={closeMobileSidebar}
                        className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                        aria-label="Close Menu"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="px-6 text-xs text-slate-400 font-medium tracking-widest mt-1">SECURE PORTAL</div>
            
            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="mb-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Main Menu</div>
                {getNavLinks().map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                                isActive 
                                ? 'bg-teal-500/10 text-teal-400 font-medium border border-teal-500/20' 
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </div>
            
            <div className="p-6 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                     NFC Healthcare © 2026<br/>
                    All rights reserved.
                </div>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
