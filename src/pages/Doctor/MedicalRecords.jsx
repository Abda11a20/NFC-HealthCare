import React, { useState } from 'react';
import { useGet } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileUp, File, Trash2, Eye, Plus, ClipboardList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/useAuthStore';
import { usePost } from '../../hooks/useApi';
import { apiClient } from '../../services/apiClient';
import { toast } from 'react-toastify';

// ============================================================================
// Medical Records Management
// Full CRUD: View list, Add new records, Edit existing, Delete.
// File upload interface included.
// ============================================================================

export const MedicalRecords = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    const canAdd = ['DOCTOR', 'ADMIN_HOSPITAL'].includes(user?.role);

    const { data: recordsData, isLoading } = useGet('records', API.MEDICAL_RECORD.GET_ALL);
    
    // Client-side fallback filter: ensure doctors/patients only see their own records 
    // in case the backend GET_ALL doesn't filter them automatically.
    const records = (recordsData?.data || []).filter(r => {
        const role = user?.role?.toUpperCase();
        if (role === 'DOCTOR') return (r.doctorId?._id || r.doctorId) === user?._id;
        if (role === 'PATIENT') return (r.patientId?._id || r.patientId) === user?._id;
        return true;
    });

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this record?')) {
            try {
                await apiClient.delete(API.MEDICAL_RECORD.DELETE(id));
                queryClient.invalidateQueries({ queryKey: ['records'] });
                toast.success('Record deleted successfully');
            } catch (error) {
                toast.error('Failed to delete record');
            }
        }
    };

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setView('edit');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
                    <p className="text-sm text-slate-500">{records.length} total entries</p>
                </div>
                {canAdd && view === 'list' && (
                    <Button onClick={() => setView('add')} className="gap-2">
                        <Plus size={18} /> New Record
                    </Button>
                )}
                {(view === 'add' || view === 'edit') && (
                    <Button variant="outline" onClick={() => { setView('list'); setSelectedRecord(null); }}>
                        Cancel
                    </Button>
                )}
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
                    {isLoading ? (
                        <TableSkeleton rows={6} />
                    ) : records.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Patient</th>
                                        <th className="pb-3 font-medium">Diagnosis</th>
                                        <th className="pb-3 font-medium">Doctor</th>
                                        <th className="pb-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(record => (
                                        <tr key={record._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 text-sm text-slate-700">{new Date(record.visitDate || record.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 font-medium text-slate-800">{record.patientId?.firstName} {record.patientId?.lastName}</td>
                                            <td className="py-4 text-slate-600 truncate max-w-[200px]">{record.diagnosis}</td>
                                            <td className="py-4 text-sm text-slate-600">Dr. {record.doctorId?.lastName}</td>
                                            <td className="py-4">
                                                <div className="flex gap-2">
                                                    <Button variant="secondary" size="sm" className="gap-1" onClick={() => handleEdit(record)}>
                                                        <Eye size={14} /> View
                                                    </Button>
                                                    {canAdd && (
                                                        <Button variant="danger" size="sm" onClick={() => handleDelete(record._id)}>
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <ClipboardList size={48} className="text-slate-300 mb-4" />
                            <p className="text-lg font-medium text-slate-700">No medical records found</p>
                            <p className="text-sm">They will appear here once added.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Record */}
            {(view === 'add' || view === 'edit') && (
                <RecordForm 
                    initialData={view === 'edit' ? selectedRecord : null}
                    isEdit={view === 'edit'}
                    onComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ['records'] });
                        setView('list');
                        setSelectedRecord(null);
                    }} 
                />
            )}
        </div>
    );
};

// ============================================================================
// Internal Record Form (Add / Edit)
// ============================================================================
const RecordForm = ({ onComplete, initialData, isEdit }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            patientId: initialData?.patientId?._id || '',
            diagnosis: initialData?.diagnosis || '',
            treatment: initialData?.treatment || ''
        }
    });

    const addMutation = usePost(API.MEDICAL_RECORD.ADD);
    const [attachments, setAttachments] = useState([]);

    const handleFileChange = (e) => {
        if(e.target.files) {
            const newFiles = Array.from(e.target.files).map(f => ({
                file: f,
                id: Math.random().toString(36),
                name: f.name,
                size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
            }));
            setAttachments([...attachments, ...newFiles]);
        }
    };

    const removeAttachment = (id) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    const onSubmit = async (data) => {
        if (isEdit) {
            try {
                await apiClient.put(API.MEDICAL_RECORD.UPDATE(initialData._id), data);
                toast.success('Record updated successfully');
                onComplete();
            } catch (err) {
                toast.error('Update failed');
            }
        } else {
            addMutation.mutate(data, {
                onSuccess: () => onComplete()
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">
                {isEdit ? 'Update Medical Record' : 'New Medical Record'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Patient ID" placeholder="Enter Patient Object ID" {...register('patientId', {required: true})} disabled={isEdit} />
                <Input label="Diagnosis" placeholder="e.g. Acute Pharyngitis" {...register('diagnosis', {required: true})} />
                
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">Treatment Plan</label>
                    <textarea 
                        className="w-full min-h-[120px] rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                        placeholder="Detailed treatment description..."
                        {...register('treatment')}
                    />
                </div>

                {/* File Upload UI */}
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-2">Attachments (Reports, Scans)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-teal-400 transition-colors cursor-pointer relative overflow-hidden">
                        <FileUp size={32} className="text-teal-500" />
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                        <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 10MB)</p>
                        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    {attachments.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {attachments.map(att => (
                                <div key={att.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <File size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{att.name}</p>
                                            <p className="text-xs text-slate-500">{att.size}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeAttachment(att.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" isLoading={addMutation.isPending} size="lg">
                    {isEdit ? 'Save Changes' : 'Save Record'}
                </Button>
            </div>
        </form>
    );
};

export default MedicalRecords;
