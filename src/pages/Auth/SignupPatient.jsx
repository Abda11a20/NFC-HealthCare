import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { toast } from 'react-toastify';
import { User, ChevronRight, Phone } from 'lucide-react';

// ============================================================================
// Patient Signup — POST /auth/signup/patient
// Fields: firstName, lastName, nationalId, gender, dateOfBirth,
//         phoneNumber, address, emergencyContact { name, phone, relation }, cardId
// Note: No password field — patient login uses nationalId only.
// ============================================================================

const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    nationalId: yup.string().required('National ID is required').length(14, 'Must be exactly 14 digits').matches(/^[0-9]+$/, 'Digits only'),
    gender: yup.string().required('Gender is required'),
    dateOfBirth: yup.string().required('Date of birth is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    address: yup.string().required('Address is required'),
    cardId: yup.string().required('NFC Card ID is required'),
    emergencyContact: yup.object().shape({
        name: yup.string().required('Emergency contact name is required'),
        phone: yup.string().required('Emergency phone is required'),
        relation: yup.string().required('Relation is required'),
    }),
});

export const SignupPatient = () => {
    const navigate = useNavigate();
    const mutation = usePost(API.AUTH.SIGNUP_PATIENT);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data) => {
        mutation.mutate(data, {
            onSuccess: () => {
                toast.success('Account created! You can now log in with your National ID.');
                navigate('/login');
            }
        });
    };

    return (
        <div className="min-h-screen flex w-full flex-col md:flex-row bg-white">
            {/* Left Branding Panel */}
            <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-teal-800 to-slate-900 text-white relative overflow-hidden justify-center px-12 lg:px-20">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <User size={28} className="text-teal-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Patient Portal</h1>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Take Control of <br/><span className="text-teal-400">Your Health.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        Create your secure patient profile and gain instant access to your medical records, prescriptions, and care history via NFC technology.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-lg space-y-6">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h3>
                        <p className="text-slate-500 mt-2">Fill in your details to register as a new patient.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="Ahmed" {...register('firstName')} error={errors.firstName?.message} />
                            <Input label="Last Name" placeholder="Mohamed" {...register('lastName')} error={errors.lastName?.message} />
                        </div>

                        <Input label="National ID (14 digits)" placeholder="30401111301068" {...register('nationalId')} error={errors.nationalId?.message} />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select 
                                label="Gender" 
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' },
                                ]}
                                placeholder="Select gender..."
                                {...register('gender')} 
                                error={errors.gender?.message} 
                            />
                            <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
                        </div>

                        <Input label="Phone Number" placeholder="01154330542" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        <Input label="Address" placeholder="Cairo, Nasr City" {...register('address')} error={errors.address?.message} />
                        <Input label="NFC Card ID" placeholder="CARD-XXXXXX" {...register('cardId')} error={errors.cardId?.message} />
                        
                        {/* Emergency Contact Section */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 mt-2">
                            <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                                <Phone size={16} className="text-teal-600" /> Emergency Contact
                            </h4>
                            <Input label="Contact Name" placeholder="Ahmed Ali" {...register('emergencyContact.name')} error={errors.emergencyContact?.name?.message} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Phone" placeholder="01098765432" {...register('emergencyContact.phone')} error={errors.emergencyContact?.phone?.message} />
                                <Input label="Relation" placeholder="Brother" {...register('emergencyContact.relation')} error={errors.emergencyContact?.relation?.message} />
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white group mt-2" isLoading={mutation.isPending}>
                            <span className="flex items-center gap-2 justify-center">
                                Create Patient Account
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                        Already registered? <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPatient;
