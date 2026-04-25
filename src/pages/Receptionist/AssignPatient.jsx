import React, { useState } from 'react';
import { usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForm } from 'react-hook-form';
import { Users, Link as LinkIcon, Search } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// Receptionist Area - Assign Patient
// Used by Receptionist/Admin to tie patients to specific doctors.
// Real app would fetch dynamic lists of patients and doctors for selection.
// ============================================================================

export const AssignPatient = () => {
    const { register, handleSubmit, reset } = useForm();
    const assignMutation = usePost(API.RECEPTIONIST.ASSIGN_PATIENT);
    
    // States for look-up functionality
    const [lookupDoctorId, setLookupDoctorId] = useState('');
    const [lookupResults, setLookupResults] = useState(null);
    const [isLookingUp, setIsLookingUp] = useState(false);

    const onSubmit = (data) => {
        assignMutation.mutate(data, {
            onSuccess: () => {
                reset(); // Clear form on success
            }
        });
    };

    const handleLookup = async () => {
        if (!lookupDoctorId.trim()) return toast.error('Enter a Doctor ID first');
        
        setIsLookingUp(true);
        try {
            const res = await apiClient.get(API.RECEPTIONIST.GET_DOCTOR_PATIENTS(lookupDoctorId.trim()));
            setLookupResults(res.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch patients for doctor');
            setLookupResults([]);
        } finally {
            setIsLookingUp(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <Users size={28} className="text-primary" />
                <h2 className="text-2xl font-bold text-slate-800">Receptionist Desk</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="glass-card p-6 h-fit">
                    <h3 className="text-xl font-bold text-slate-700 mb-6 flex gap-2 items-center">
                        <LinkIcon size={20} className="text-primary" />
                        Assign Patient to Doctor
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Connect a patient account to a specific doctor within the hospital network so the doctor can view and create medical records.</p>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input 
                            label="Doctor ID" 
                            placeholder="Enter Doctor's Object ID" 
                            {...register('doctorId', { required: true })} 
                        />
                        <Input 
                            label="Patient ID" 
                            placeholder="Enter Patient's Object ID" 
                            {...register('patientId', { required: true })} 
                        />
                        
                        <div className="pt-4">
                            <Button type="submit" isLoading={assignMutation.isPending} className="w-full">
                                Assign Patient
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Info / Quick Actions Section */}
                <div className="flex flex-col gap-4">
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                        <h4 className="font-semibold text-primary mb-2">Instructions</h4>
                        <ul className="list-disc pl-4 text-sm text-slate-700 space-y-2">
                            <li>Ensure both Patient and Doctor are <strong>verified</strong> before assignment.</li>
                            <li>The doctor must belong to the same hospital as the receptionist.</li>
                            <li>Once assigned, the doctor will see the patient in their queue.</li>
                        </ul>
                    </div>

                    <div className="border border-slate-200 bg-white p-6 rounded-xl flex-1 flex flex-col">
                        <h4 className="font-semibold text-slate-700 mb-4 flex gap-2 items-center">
                            <Search size={18} /> Quick Doctor Query
                        </h4>
                        
                        <div className="flex gap-2 mb-4">
                            <Input 
                                placeholder="Enter Doctor ID..." 
                                value={lookupDoctorId}
                                onChange={(e) => setLookupDoctorId(e.target.value)}
                                className="flex-1"
                                id="doctor-lookup"
                                aria-label="lookup"
                            />
                            <Button type="button" variant="secondary" onClick={handleLookup} isLoading={isLookingUp}>Look Up</Button>
                        </div>

                        {lookupResults !== null && (
                            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mt-2 flex-1">
                                <div className="p-3 bg-slate-100 border-b border-slate-200 font-medium text-sm text-slate-700">
                                    Assigned Patients ({lookupResults.length})
                                </div>
                                <ul className="max-h-[250px] overflow-y-auto w-full">
                                    {lookupResults.length === 0 ? (
                                        <li className="p-4 text-sm text-slate-500 text-center">No patients found.</li>
                                    ) : lookupResults.map(p => (
                                        <li key={p._id} className="p-3 border-b border-slate-100 last:border-b-0 flex flex-col">
                                            <span className="font-medium text-slate-800 text-sm">{p.firstName} {p.lastName}</span>
                                            <span className="text-xs text-slate-500">{p.phoneNumber}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignPatient;
