import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGet } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { useAuthStore } from '../../store/useAuthStore';
import { ProfileSkeleton } from '../../components/ui/Skeletons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';
import { UserCircle, Save, Shield, Building2, Stethoscope, Edit2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Unified Profile Page  (Read-only by default / Toggle to Edit)
// ============================================================================

const InfoRow = ({ label, value }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-medium ${value ? 'text-slate-800' : 'text-slate-400 italic'}`}>
            {value || 'Not provided'}
        </p>
    </div>
);

export const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();
    const role = user?.role?.toUpperCase();
    
    const getRoleEndpoints = (r) => {
        switch(r) {
            case 'PATIENT': return { fetch: API.AUTH.PATIENT_PROFILE, update: API.AUTH.PATIENT_UPDATE };
            case 'DOCTOR': return { fetch: API.AUTH.DOCTOR_PROFILE, update: API.AUTH.DOCTOR_UPDATE };
            case 'ADMIN_HOSPITAL': return { fetch: API.ADMIN_HOSPITAL.PROFILE, update: null };
            case 'SUPER_ADMIN': return { fetch: API.ADMIN.GET_ALL_ADMINS, update: null }; // Only SUPER_ADMIN has access to this
            default: return { fetch: null, update: null }; // Avoid calling unauthorized APIs which trigger 401 auto-logout
        }
    };

    const { fetch: fetchEndpoint, update: updateEndpoint } = getRoleEndpoints(role);

    const { data, isLoading } = useGet('profile', fetchEndpoint);
    
    const rawData = data?.data || data || {};
    const profileData = Array.isArray(rawData) ? rawData.find(a => a._id === user?._id) || {} : rawData;

    const { register, handleSubmit, reset } = useForm();

    // Populate form only when hitting edit
    const handleEditClick = () => {
        reset({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phoneNumber: profileData.phoneNumber || '',
            specialization: profileData.specialization || '',
            address: profileData.address || '',
            nationalId: profileData.nationalId || '',
            cardId: profileData.cardId || '',
            emergencyContact: {
                name: profileData.emergencyContact?.name || '',
                phone: profileData.emergencyContact?.phone || '',
                relation: profileData.emergencyContact?.relation || ''
            }
        });
        setIsEditing(true);
    };

    const onSubmit = async (formData) => {
        if (!updateEndpoint) {
            toast.info('Profile updates for this role are managed via admin panel.');
            setIsEditing(false);
            return;
        }

        // Clean up empty fields based on role updates
        let payload = {};
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== undefined && v !== '') payload[k] = v;
        });

        // Backend Joi validation strictly expects ONLY these fields for DOCTOR
        if (role === 'DOCTOR') {
            payload = {
                firstName: payload.firstName,
                lastName: payload.lastName,
                specialization: payload.specialization,
                phoneNumber: payload.phoneNumber
            };
            // Remove any undefined fields that were not filled
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        }

        try {
            const res = await apiClient.put(updateEndpoint, payload);
            toast.success('Profile updated successfully');
            
            // Invalidate the query to fetch fresh data
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            
            // Update auth store with returned data
            const updated = res?.data?.data || res?.data || payload;
            updateUser({ ...user, ...updated });
            
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const getRoleIcon = () => {
        switch(role) {
            case 'DOCTOR': return <Stethoscope size={20} />;
            case 'ADMIN_HOSPITAL': return <Building2 size={20} />;
            case 'ADMIN': case 'SUPER_ADMIN': return <Shield size={20} />;
            default: return <UserCircle size={20} />;
        }
    };

    const displayName = profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || user?.firstName || user?.fullName || 'User';

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="max-w-3xl space-y-8">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                    {(displayName[0] || 'U').toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                            {getRoleIcon()}
                            {role ? role.replace(/_/g, ' ') : 'USER'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Switch: Read-Only OR Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <h3 className="font-bold text-slate-800">
                        {isEditing ? 'Edit Information' : 'Personal Information'}
                    </h3>
                    
                    {!isEditing && updateEndpoint && (
                        <Button type="button" variant="secondary" onClick={handleEditClick} className="gap-2 border-none font-semibold">
                            <Edit2 size={16} /> Edit Profile
                        </Button>
                    )}
                    
                    {isEditing && (
                        <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="gap-2 border-none font-semibold">
                            <X size={16} /> Cancel
                        </Button>
                    )}
                </div>

                {!isEditing ? (
                    /* Read Only View */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {(role === 'PATIENT' || role === 'DOCTOR') && (
                            <>
                                <InfoRow label="First Name" value={profileData.firstName} />
                                <InfoRow label="Last Name" value={profileData.lastName} />
                            </>
                        )}
                        
                        <div className="md:col-span-2">
                            <InfoRow label="System ID (For Receptionist)" value={user?._id} />
                        </div>

                        {['ADMIN', 'SUPER_ADMIN', 'ADMIN_HOSPITAL', 'RECEPTIONIST'].includes(role) && (
                            <div className="md:col-span-2">
                                <InfoRow label="Full Name" value={profileData.fullName} />
                            </div>
                        )}

                        {profileData.email && <InfoRow label="Email Address" value={profileData.email} />}
                        {profileData.phoneNumber && <InfoRow label="Phone Number" value={profileData.phoneNumber} />}
                        {role === 'DOCTOR' && <InfoRow label="Specialization" value={profileData.specialization} />}
                        {role === 'PATIENT' && profileData.address && <InfoRow label="Address" value={profileData.address} />}
                        
                        {profileData.nationalId && (
                            <InfoRow label="National ID" value={profileData.nationalId} />
                        )}

                        {profileData.cardId && (
                            <InfoRow label="NFC Card ID" value={profileData.cardId} />
                        )}

                        {profileData.hospitalId && (
                            <div className="md:col-span-2">
                                <InfoRow label="Affiliated Hospital" value={profileData.hospitalId?.name || profileData.hospitalId} />
                            </div>
                        )}
                    </div>
                    
                    {/* Emergency Contact Section for PATIENTS */}
                    {(role === 'PATIENT' && profileData.emergencyContact) && (
                        <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-xl">
                            <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                                Emergency Contact
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <InfoRow label="Contact Name" value={profileData.emergencyContact.name} />
                                <InfoRow label="Phone" value={profileData.emergencyContact.phone} />
                                <InfoRow label="Relation" value={profileData.emergencyContact.relation} />
                            </div>
                        </div>
                    )}
                </div>
                ) : (
                    /* Edit Form View */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {role === 'DOCTOR' && (
                                <>
                                    <Input label="First Name" {...register('firstName')} />
                                    <Input label="Last Name" {...register('lastName')} />
                                    <Input label="Phone Number" {...register('phoneNumber')} />
                                    <Input label="Specialization" {...register('specialization')} />
                                </>
                            )}

                            {['ADMIN', 'SUPER_ADMIN', 'ADMIN_HOSPITAL', 'RECEPTIONIST'].includes(role) && (
                                <>
                                    <Input label="Full Name" {...register('fullName')} className="md:col-span-2" />
                                    <Input label="Email Address" type="email" {...register('email')} />
                                    <Input label="Phone Number" {...register('phoneNumber')} />
                                </>
                            )}
                            
                            {/* Based on Postman docs, patient can update nationalId and cardId via PUT /update */}
                            {role === 'PATIENT' && (
                                <>
                                    <Input label="National ID" {...register('nationalId')} />
                                    <Input label="NFC Card ID" {...register('cardId')} />
                                    
                                    <div className="md:col-span-2 mt-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h4 className="font-semibold text-slate-800 mb-4">Emergency Contact</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Input label="Contact Name" {...register('emergencyContact.name')} />
                                            <Input label="Phone Number" {...register('emergencyContact.phone')} />
                                            <Input label="Relation" {...register('emergencyContact.relation')} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end border-t border-slate-100">
                            <Button type="submit" className="gap-2">
                                <Save size={18} /> Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
