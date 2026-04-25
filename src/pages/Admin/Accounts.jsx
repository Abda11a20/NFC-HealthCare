import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useGet, usePost } from '../../hooks/useApi';
import { useAuthStore } from '../../store/useAuthStore';
import API from '../../config/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// Admin Accounts Management (SuperAdmin)
// POST /admin/create-admin          { fullName, email, password, phoneNumber }
// POST /admin/create-hospital-admin { fullName, email, phoneNumber, password, hospitalId }
// GET  /admin/admins
// DELETE /admin/admin/:id
// ============================================================================

const adminSchema = yup.object().shape({
    roleType: yup.string().required('Role type is required'),
    fullName: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(8, 'Min 8 chars'),
    phoneNumber: yup.string().required('Phone number is required'),
    hospitalId: yup.string().when('roleType', {
        is: 'HOSPITAL_ADMIN',
        then: (schema) => schema.required('Hospital is required for Hospital Admins'),
        otherwise: (schema) => schema.notRequired(),
    })
});

export const Accounts = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('list');

    const { data: adminsRes, isLoading: isLoadingAdmins } = useGet('admins', API.ADMIN.GET_ALL_ADMINS);
    const { data: hospitalsRes } = useGet('hospitals', API.HOSPITAL.GET_ALL);
    
    const admins = adminsRes?.data || [];
    const hospitals = hospitalsRes?.data || [];

    const { user } = useAuthStore();
    const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        resolver: yupResolver(adminSchema),
        defaultValues: { roleType: isSuperAdmin ? 'ADMIN' : 'HOSPITAL_ADMIN' }
    });
    
    const selectedRole = watch('roleType');

    const mutationAdmin = usePost(API.ADMIN.CREATE_ADMIN);
    const mutationHAdmin = usePost(API.ADMIN.CREATE_HOSPITAL_ADMIN);

    const onSubmit = (data) => {
        const payload = {
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            phoneNumber: data.phoneNumber,
        };

        if (data.roleType === 'HOSPITAL_ADMIN') {
            payload.hospitalId = data.hospitalId;
            mutationHAdmin.mutate(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['admins'] });
                    setView('list');
                    reset();
                }
            });
        } else {
            mutationAdmin.mutate(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['admins'] });
                    setView('list');
                    reset();
                }
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this administrator?')) {
            try {
                await apiClient.delete(API.ADMIN.DELETE_ADMIN(id));
                toast.success('Admin deleted');
                queryClient.invalidateQueries({ queryKey: ['admins'] });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete admin');
            }
        }
    };

    if (view === 'form') {
        const hOptions = hospitals.map(h => ({ label: h.name, value: h._id }));
        return (
            <div className="max-w-3xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="text-primary" /> Create Administrator
                    </h2>
                    <Button variant="secondary" onClick={() => setView('list')}>Back to List</Button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
                    <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl mb-6">
                        <Select 
                            label="Select Access Level" 
                            options={
                                isSuperAdmin ? [
                                    { label: 'System Admin (Full Access)', value: 'ADMIN' },
                                    { label: 'Hospital Admin (Local Access)', value: 'HOSPITAL_ADMIN' }
                                ] : [
                                    { label: 'Hospital Admin (Local Access)', value: 'HOSPITAL_ADMIN' }
                                ]
                            }
                            {...register('roleType')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" placeholder="Admin Master" {...register('fullName')} error={errors.fullName?.message} />
                        <Input label="Email Address" type="email" placeholder="admin@example.com" {...register('email')} error={errors.email?.message} />
                        <Input label="Phone Number" placeholder="01234567890" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        <Input label="Password" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
                    </div>

                    {selectedRole === 'HOSPITAL_ADMIN' && (
                        <div className="mt-4">
                            <Select 
                                label="Assign to Hospital" 
                                options={hOptions}
                                placeholder="Select a hospital..."
                                {...register('hospitalId')}
                                error={errors.hospitalId?.message}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6 pt-6">
                        <Button type="submit" isLoading={mutationAdmin.isPending || mutationHAdmin.isPending} size="lg">
                            Grant Access
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={28} className="text-primary" />
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isSuperAdmin ? 'Administrative Accounts' : 'Hospital Administrators'}
                    </h2>
                </div>
                <Button onClick={() => setView('form')} className="gap-2">
                    <Plus size={18} /> {isSuperAdmin ? 'Add Admin' : 'Add Hospital Admin'}
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                {isLoadingAdmins ? (
                    <TableSkeleton rows={5} />
                ) : admins.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-sm text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 font-semibold">Name</th>
                                <th className="pb-3 font-semibold">Email</th>
                                <th className="pb-3 font-semibold">Role</th>
                                <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(a => (
                                <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 font-medium text-slate-800">{a.fullName}</td>
                                    <td className="py-4 text-slate-600">{a.email}</td>
                                    <td className="py-4">
                                        <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
                                            {a.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(a._id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        {isSuperAdmin ? 'No admins created yet.' : 'You have permission to create Hospital Administrators, but not to view the full directory.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accounts;
