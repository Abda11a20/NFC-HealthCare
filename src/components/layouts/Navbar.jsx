import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGet } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { LogOut, User as UserIcon, Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLayoutStore } from '../../store/useLayoutStore';

export const Navbar = () => {
    const { user, logout } = useAuthStore();
    const role = user?.role?.toUpperCase();

    const getRoleEndpoints = (r) => {
        switch(r) {
            case 'PATIENT': return API.AUTH.PATIENT_PROFILE;
            case 'DOCTOR': return API.AUTH.DOCTOR_PROFILE;
            case 'ADMIN_HOSPITAL': return API.ADMIN_HOSPITAL.PROFILE;
            case 'SUPER_ADMIN': return API.ADMIN.GET_ALL_ADMINS; // Only SUPER_ADMIN has access to this
            default: return null; // Avoid calling unauthorized APIs which trigger 401 auto-logout
        }
    };

    const { data: profileRes } = useGet('profile', getRoleEndpoints(role));
    const rawProfile = profileRes?.data || profileRes || {};
    const profileData = Array.isArray(rawProfile) ? rawProfile.find(a => a._id === user?._id) || {} : rawProfile;
    
    const displayName = profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || user?.firstName || user?.fullName || 'User';

    const { toggleMobileSidebar } = useLayoutStore();

    return (
        <nav className="h-16 px-4 md:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
            {/* Logo / Brand / Mobile Toggle */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleMobileSidebar}
                    className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
                    aria-label="Toggle Mobile Menu"
                    aria-expanded="false"
                    aria-controls="mobile-sidebar"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <img src="/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="font-bold text-slate-800 text-lg hidden sm:block">NFC Healthcare</h1>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Profile Link */}
                <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UserIcon size={16} />
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 leading-tight">
                            {displayName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium capitalize">
                            {user?.role ? user.role.replace(/_/g, ' ').toLowerCase() : 'Guest'}
                        </span>
                    </div>
                </Link>

                {/* Logout */}
                <button 
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors ml-2"
                    title="Log Out"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
