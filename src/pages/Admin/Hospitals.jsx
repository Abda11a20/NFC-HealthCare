import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useGet, usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Building2, Plus, Trash2, Edit, X } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// Hospitals Management (SuperAdmin/Admin)
// POST   /hospital/create
// GET    /hospital/
// GET    /hospital/:id
// PUT    /hospital/update/:id
// DELETE /hospital/delete/:id
// ============================================================================

const hospitalSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    address: yup.string().required('Address is required'),
    phoneNumber: yup.string().required('Phone is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    hotline: yup.string().required('Hotline is required'),
    licenseNumber: yup.string().optional(),
    departments: yup.array().of(
        yup.object().shape({
            name: yup.string().required('Department name required'),
            floor: yup.string().required('Floor required'),
        })
    ).min(1, 'At least one department is required')
});

export const Hospitals = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('list');
    const [targetHospital, setTargetHospital] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Queries
    const { data: fetchRes, isLoading } = useGet('hospitals', API.HOSPITAL.GET_ALL);
    const hospitals = fetchRes?.data || [];

    const addMutation = usePost(API.HOSPITAL.CREATE);

    const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(hospitalSchema),
        defaultValues: { departments: [{ name: '', floor: '' }] }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "departments" });

    const openCreate = () => {
        setTargetHospital(null);
        reset({ name: '', address: '', phoneNumber: '', email: '', hotline: '', licenseNumber: '', departments: [{ name: '', floor: '' }] });
        setView('form');
    };

    const openEdit = (hospital) => {
        setTargetHospital(hospital);
        reset({
            name: hospital.name,
            address: hospital.address,
            phoneNumber: hospital.phoneNumber,
            email: hospital.email,
            hotline: hospital.hotline,
            licenseNumber: hospital.licenseNumber,
            departments: hospital.departments?.length > 0 ? hospital.departments : [{ name: '', floor: '' }]
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hospital?')) {
            try {
                await apiClient.delete(API.HOSPITAL.DELETE(id));
                toast.success('Hospital deleted');
                queryClient.invalidateQueries({ queryKey: ['hospitals'] });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete hospital');
            }
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        
        // The backend Joi validation rejects "_id" inside the departments array.
        // We must strip it out before sending the PUT/POST request.
        const cleanData = {
            ...data,
            departments: data.departments.map(dept => ({
                name: dept.name,
                floor: dept.floor
            }))
        };

        try {
            if (targetHospital) {
                // PUT /hospital/update/:id
                await apiClient.put(API.HOSPITAL.UPDATE(targetHospital._id), cleanData);
                toast.success('Hospital updated');
            } else {
                // POST /hospital/create
                addMutation.mutate(cleanData, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['hospitals'] });
                        setView('list');
                    }
                });
                setIsSubmitting(false);
                return; // addMutation handles its own flow
            }
            queryClient.invalidateQueries({ queryKey: ['hospitals'] });
            setView('list');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'form') {
        return (
            <div className="max-w-4xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">{targetHospital ? 'Edit Hospital' : 'Register Hospital'}</h2>
                    <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Hospital Name" placeholder="El Salam Hospital" {...register('name')} error={errors.name?.message} />
                        <Input label="Address" placeholder="Nasr City, Cairo" {...register('address')} error={errors.address?.message} />
                        <Input label="Email Address" type="email" placeholder="info@hospital.com" {...register('email')} error={errors.email?.message} />
                        <Input label="Phone Number" placeholder="01012345678" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        <Input label="Hotline" placeholder="19123" {...register('hotline')} error={errors.hotline?.message} />
                        <Input label="License Number" placeholder="HOSP998874" {...register('licenseNumber')} error={errors.licenseNumber?.message} />
                    </div>

                    {/* Dynamic Departments */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                        <h4 className="font-semibold text-slate-700 flex justify-between items-center">
                            Departments
                            <Button type="button" variant="outline" size="sm" onClick={() => append({name: '', floor: ''})}>
                                <Plus size={16} className="mr-1" /> Add Dept
                            </Button>
                        </h4>
                        
                        {errors.departments?.message && <p className="text-xs text-red-500">{errors.departments.message}</p>}
                        
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-start bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                                <Input 
                                    className="flex-1" 
                                    placeholder="e.g. Cardiology" 
                                    {...register(`departments.${index}.name`)} 
                                    error={errors.departments?.[index]?.name?.message} 
                                />
                                <Input 
                                    className="w-1/3" 
                                    placeholder="2nd Floor" 
                                    {...register(`departments.${index}.floor`)} 
                                    error={errors.departments?.[index]?.floor?.message} 
                                />
                                <button type="button" onClick={() => remove(index)} className="p-2 mt-1 text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" isLoading={addMutation.isPending || isSubmitting} size="lg">
                            {targetHospital ? 'Save Changes' : 'Create Hospital'}
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
                    <Building2 size={28} className="text-primary" />
                    <h2 className="text-2xl font-bold text-slate-800">Hospitals Directory</h2>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus size={18} /> Register Hospital
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                {isLoading ? (
                    <TableSkeleton rows={5} />
                ) : hospitals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-slate-500 uppercase tracking-wider">
                                    <th className="pb-3 font-semibold">Name</th>
                                    <th className="pb-3 font-semibold hidden md:table-cell">Contact</th>
                                    <th className="pb-3 font-semibold hidden lg:table-cell">Departments</th>
                                    <th className="pb-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitals.map(h => (
                                    <tr key={h._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 font-medium text-slate-800">{h.name}</td>
                                        <td className="py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {h.hotline} • {h.email}
                                        </td>
                                        <td className="py-4 text-sm text-slate-600 hidden lg:table-cell">
                                            {h.departments?.length || 0} Listed
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => openEdit(h)}>
                                                    <Edit size={16} />
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(h._id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        No Hospitals registered yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hospitals;
