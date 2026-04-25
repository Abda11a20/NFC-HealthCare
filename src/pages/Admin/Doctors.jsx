import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePost, useGet } from '../../hooks/useApi';
import { useAuthStore } from '../../store/useAuthStore';
import API from '../../config/apiRoutes';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Stethoscope, Plus, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';

// ============================================================================
// Doctors Management 
// POST /auth/signup/doctor
// ============================================================================

const doctorSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    specialization: yup.string().required('Specialization is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    password: yup.string().required('Password is required').min(8, 'Min 8 characters'),
    hospitalId: yup.string().required('Please select a hospital'),
});

export const Doctors = () => {
    const [view, setView] = useState('list');

    // Fetch all hospitals to populate the dropdown
    const { data: hospitalsRes, isLoading: loadingHospitals } = useGet('hospitals-list', API.HOSPITAL.GET_ALL);
    const hospitals = hospitalsRes?.data || [];

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(doctorSchema)
    });

    const addMutation = usePost(API.AUTH.SIGNUP_DOCTOR);

    const onSubmit = (data) => {
        addMutation.mutate(data, {
            onSuccess: () => {
                toast.success('Doctor account created successfully! They will receive a verification email.');
                setView('list');
                reset();
            }
        });
    };

    if (view === 'form') {
        return (
            <div className="max-w-3xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="text-primary" /> Register New Doctor
                    </h2>
                    <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="First Name" placeholder="John" {...register('firstName')} error={errors.firstName?.message} />
                        <Input label="Last Name" placeholder="Doe" {...register('lastName')} error={errors.lastName?.message} />
                        <Input label="Specialization" placeholder="Cardiology" {...register('specialization')} error={errors.specialization?.message} />
                        <Input label="Email Address" type="email" placeholder="doctor@hospital.com" {...register('email')} error={errors.email?.message} />
                        <Input label="Phone Number" placeholder="01234567890" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        <Input label="Temporary Password" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
                        
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Building2 size={16} className="text-slate-400" />
                                Assign to Hospital
                            </label>
                            <div className="relative">
                                <select 
                                    className={`w-full bg-slate-50 border ${errors.hospitalId ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-primary'} text-slate-900 rounded-lg focus:ring-2 focus:border-transparent block p-2.5 transition-all outline-none appearance-none cursor-pointer`}
                                    {...register('hospitalId')}
                                    disabled={loadingHospitals}
                                >
                                    <option value="">{loadingHospitals ? 'Loading hospitals...' : 'Select a hospital'}</option>
                                    {hospitals.map(hospital => (
                                        <option key={hospital._id} value={hospital._id}>
                                            {hospital.name} ({hospital.address || 'No Address'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.hospitalId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.hospitalId.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={addMutation.isPending} size="lg">
                            Create Doctor Account
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
                    <Stethoscope size={28} className="text-primary" />
                    <h2 className="text-2xl font-bold text-slate-800">Medical Staff (Doctors)</h2>
                </div>
                <Button onClick={() => setView('form')} className="gap-2">
                    <Plus size={18} /> Add Doctor
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                <div className="text-center py-20 text-slate-500">
                    You have permission to register new doctors to your hospital. 
                    <br />
                    (The directory list is currently managed by the system database).
                </div>
            </div>
        </div>
    );
};

export default Doctors;
