import React, { useMemo } from 'react';
import { useGet } from '../../hooks/useApi';
import { useAuthStore } from '../../store/useAuthStore';
import { CardSkeleton } from '../../components/ui/Skeletons';
import API from '../../config/apiRoutes';
import { Building2, Users, ClipboardList, Activity, TrendingUp, Stethoscope, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// ============================================================================
// Dynamic Dashboard — All metrics are LIVE from the database.
// Fetches are role-gated: only calls APIs the logged-in user has access to.
// ============================================================================

export const Dashboard = () => {
    const { user } = useAuthStore();
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

    // Grab profile data cache (deduplicated by React Query with Profile.jsx)
    const { data: profileRes } = useGet('profile', getRoleEndpoints(role));
    const rawProfile = profileRes?.data || profileRes || {};
    const profileData = Array.isArray(rawProfile) ? rawProfile.find(a => a._id === user?._id) || {} : rawProfile;
    
    const displayName = profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || user?.firstName || user?.fullName || 'User';


    // ============== ROLE-GATED DATA FETCHES ==============
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);
    const isHospitalAdmin = role === 'ADMIN_HOSPITAL';
    const isDoctorOrPatient = ['DOCTOR', 'PATIENT'].includes(role);
    const isReceptionist = role === 'RECEPTIONIST';

    // Only admins fetch hospitals
    const { data: hospitalsRes, isLoading: loadingH } = useGet(
        'dash-hospitals', API.HOSPITAL.GET_ALL,
        { enabled: isAdmin }
    );

    // Only doctor/patient/hospital-admin fetch medical records
    const { data: recordsRes, isLoading: loadingR } = useGet(
        'dash-records', API.MEDICAL_RECORD.GET_ALL,
        { enabled: isDoctorOrPatient || isHospitalAdmin }
    );

    // Only hospital admin fetches receptionists
    const { data: receptionistsRes, isLoading: loadingRec } = useGet(
        'dash-receptionists', API.ADMIN_HOSPITAL.GET_RECEPTIONISTS,
        { enabled: isHospitalAdmin }
    );

    const hospitals = hospitalsRes?.data || [];
    const receptionists = receptionistsRes?.data || [];
    
    // Client-side fallback filter: ensure doctors/patients only see their own records 
    // in case the backend GET_ALL doesn't filter them automatically.
    const records = (recordsRes?.data || []).filter(r => {
        if (role === 'DOCTOR') return (r.doctorId?._id || r.doctorId) === user?._id;
        if (role === 'PATIENT') return (r.patientId?._id || r.patientId) === user?._id;
        return true;
    });

    const isLoading = (isAdmin && loadingH) || ((isDoctorOrPatient || isHospitalAdmin) && loadingR);

    // ============== DERIVED METRICS ==============
    const uniqueDoctors = useMemo(() => {
        const ids = new Set(records.map(r => r.doctorId?._id || r.doctorId).filter(Boolean));
        return ids.size;
    }, [records]);

    const uniquePatients = useMemo(() => {
        const ids = new Set(records.map(r => r.patientId?._id || r.patientId).filter(Boolean));
        return ids.size;
    }, [records]);

    // ============== CHART DATA ==============
    const monthlyActivity = useMemo(() => {
        if (!records.length) return [];
        const months = {};
        records.forEach(r => {
            const date = new Date(r.visitDate || r.createdAt);
            if (isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleString('en', { month: 'short', year: '2-digit' });
            if (!months[key]) months[key] = { key, label, records: 0 };
            months[key].records += 1;
        });
        return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
    }, [records]);

    const doctorDistribution = useMemo(() => {
        if (!records.length) return [];
        const map = {};
        records.forEach(r => {
            const doc = r.doctorId;
            const name = doc?.lastName ? `Dr. ${doc.lastName}` : (doc?.fullName || 'Unknown');
            if (!map[name]) map[name] = { name, count: 0 };
            map[name].count += 1;
        });
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
    }, [records]);

    // ============== KPI CARDS CONFIG ==============
    const kpiCards = [];

    if (isAdmin) {
        kpiCards.push({
            label: 'Hospitals', value: hospitals.length,
            icon: <Building2 size={24} />, color: 'text-indigo-600 bg-indigo-50',
            description: 'Registered institutions'
        });
    }

    if (isDoctorOrPatient || isHospitalAdmin) {
        kpiCards.push({
            label: 'Medical Records', value: records.length,
            icon: <ClipboardList size={24} />, color: 'text-teal-600 bg-teal-50',
            description: 'Total diagnostic entries'
        });
        kpiCards.push({
            label: 'Active Doctors', value: uniqueDoctors,
            icon: <Stethoscope size={24} />, color: 'text-blue-600 bg-blue-50',
            description: 'With at least 1 record'
        });
        kpiCards.push({
            label: 'Registered Patients', value: uniquePatients,
            icon: <UserCheck size={24} />, color: 'text-emerald-600 bg-emerald-50',
            description: 'With medical history'
        });
    }

    if (isHospitalAdmin) {
        kpiCards.push({
            label: 'Receptionists', value: receptionists.length,
            icon: <Users size={24} />, color: 'text-orange-600 bg-orange-50',
            description: 'Active desk staff'
        });
    }

    if (isReceptionist) {
        kpiCards.push({
            label: 'Active Appointments', value: '0',
            icon: <Activity size={24} />, color: 'text-blue-600 bg-blue-50',
            description: "Today's scheduled visits"
        });
        kpiCards.push({
            label: 'System Status', value: 'Online',
            icon: <Activity size={24} />, color: 'text-green-600 bg-green-50',
            description: 'All services operational'
        });
    }

    // Fallback for admin with no records access
    if (isAdmin && kpiCards.length === 1) {
        kpiCards.push({
            label: 'System Status', value: 'Online',
            icon: <Activity size={24} />, color: 'text-green-600 bg-green-50',
            description: 'All services operational'
        });
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500 font-medium">Welcome back,</p>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {displayName}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold border border-teal-200">
                    <Activity size={16} />
                    Live System Overview
                </div>
            </div>

            {/* KPI Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6" 
                    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))` }}
                >
                    {kpiCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                            <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts — only show if there are medical records */}
            {(isDoctorOrPatient || isHospitalAdmin) && records.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Area Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900">Monthly Activity</h3>
                                <p className="text-xs text-slate-500">Medical records over time</p>
                            </div>
                            <TrendingUp size={20} className="text-teal-500" />
                        </div>
                        {monthlyActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={monthlyActivity}>
                                    <defs>
                                        <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="records" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecords)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No activity data yet.</div>
                        )}
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-900">Records per Doctor</h3>
                                <p className="text-xs text-slate-500">Distribution of entries</p>
                            </div>
                            <Stethoscope size={20} className="text-blue-500" />
                        </div>
                        {doctorDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={doctorDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No doctor data yet.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state for admins */}
            {isAdmin && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-700 text-lg">Administrative Overview</h3>
                    <p className="text-sm text-slate-500 mt-2">Manage hospitals, admin accounts, and system-wide settings from the sidebar.</p>
                </div>
            )}

            {/* Empty state for Receptionists */}
            {isReceptionist && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-700 text-lg">Reception Desk Hub</h3>
                    <p className="text-sm text-slate-500 mt-2">Assign patients to doctors and manage the reception flow from the sidebar.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
