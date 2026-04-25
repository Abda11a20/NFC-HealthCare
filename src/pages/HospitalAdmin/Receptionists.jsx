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
import { Button } from '../../components/ui/Button';
import { Users, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// Receptionist Management (Hospital Admin)
// POST   /admin-hospital/create-receptionist/  { fullName, email, phoneNumber, password }
// GET    /admin-hospital/receptionists
// PUT    /admin-hospital/update/:id
// DELETE /admin-hospital/:id
// ============================================================================

const receptionistSchema = yup.object().shape({
    fullName: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(8, 'Min 8 chars'),
    phoneNumber: yup.string().required('Phone number is required')
});

export const Receptionists = () => {
    const { user } = useAuthStore();
    const isHospitalAdmin = user?.role?.toUpperCase() === 'ADMIN_HOSPITAL';
    const queryClient = useQueryClient();
    const [view, setView] = useState('list');

    const { data: fetchRes, isLoading } = useGet('receptionists', API.ADMIN_HOSPITAL.GET_RECEPTIONISTS);
    const receptionists = fetchRes?.data || [];

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(receptionistSchema)
    });

    const addMutation = usePost(API.ADMIN_HOSPITAL.CREATE_RECEPTIONIST);

    const onSubmit = (data) => {
        addMutation.mutate(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['receptionists'] });
                setView('list');
                reset();
            }
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this receptionist?')) {
            try {
                await apiClient.delete(API.ADMIN_HOSPITAL.DELETE_RECEPTIONIST(id));
                toast.success('Receptionist removed');
                queryClient.invalidateQueries({ queryKey: ['receptionists'] });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to remove');
            }
        }
    };

    if (view === 'form') {
        return (
            <div className="max-w-3xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="text-primary" /> Hire Receptionist
                    </h2>
                    <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" placeholder="Jane Smith" {...register('fullName')} error={errors.fullName?.message} />
                        <Input label="Email Address" type="email" placeholder="receptionist@example.com" {...register('email')} error={errors.email?.message} />
                        <Input label="Phone Number" placeholder="01234567821" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        <Input label="Access Password" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={addMutation.isPending} size="lg">
                            Create Account
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
                    <Users size={28} className="text-primary" />
                    <h2 className="text-2xl font-bold text-slate-800">Reception Desk Staff</h2>
                </div>
                <Button onClick={() => setView('form')} className="gap-2">
                    <Plus size={18} /> New Receptionist
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : receptionists.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-sm text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 font-semibold">Name</th>
                                <th className="pb-3 font-semibold">Contact Info</th>
                                <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receptionists.map(r => (
                                <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 font-medium text-slate-800">{r.fullName}</td>
                                    <td className="py-4 text-slate-600 text-sm">
                                        {r.email}<br/>
                                        <span className="text-slate-400">{r.phoneNumber}</span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        {isHospitalAdmin ? 'No receptionists currently active.' : 'You have permission to create Receptionists, but not to view the full directory.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Receptionists;
