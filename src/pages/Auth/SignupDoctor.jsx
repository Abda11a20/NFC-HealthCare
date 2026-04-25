import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { usePost, useGet } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { toast } from 'react-toastify';
import { Stethoscope, ChevronRight } from 'lucide-react';

// ============================================================================
// Doctor Signup — Premium Split-Screen with Hospital Selection
// ============================================================================

const schema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(8, 'Minimum 8 characters'),
    phoneNumber: yup.string().required('Phone number is required'),
    specialization: yup.string().required('Specialization is required'),
    hospitalId: yup.string().required('Please provide your hospital access code'),
});

export const SignupDoctor = () => {
    const navigate = useNavigate();
    const mutation = usePost(API.AUTH.SIGNUP_DOCTOR);

    // Remove authenticated call since doctors aren't logged in yet
    // They will need to manually input the code provided by their hospital admin.

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data) => {
        mutation.mutate(data, {
            onSuccess: () => {
                toast.success('Doctor application submitted! Please log in.');
                navigate('/login');
            }
        });
    };

    return (
        <div className="min-h-screen flex w-full flex-col md:flex-row bg-white">
            {/* Left Branding Panel */}
            <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-slate-900 to-teal-900 text-white relative overflow-hidden justify-center px-12 lg:px-20">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Stethoscope size={28} className="text-teal-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Doctor Portal</h1>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Join the <br/><span className="text-teal-400">Medical Network.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        Register as a verified doctor to manage patient records, view diagnostic data, and collaborate with hospital teams securely.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-lg space-y-6">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Registration</h3>
                        <p className="text-slate-500 mt-2">Complete the form below to apply for verified doctor access.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="First Name" placeholder="Dr. Ahmed" {...register('firstName')} error={errors.firstName?.message} />
                            <Input label="Last Name" placeholder="Hassan" {...register('lastName')} error={errors.lastName?.message} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Email Address" type="email" placeholder="dr.ahmed@hospital.com" {...register('email')} error={errors.email?.message} />
                            <Input label="Phone Number" placeholder="e.g. 01012345174" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                        </div>
                        <Input label="Password" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
                        <Input label="Specialization" placeholder="e.g. Cardiology, Neurology" {...register('specialization')} error={errors.specialization?.message} />
                        
                        <Input 
                            label="Hospital Access Code (Hospital ID)" 
                            placeholder="Ask your admin for the 24-character ID" 
                            {...register('hospitalId')} 
                            error={errors.hospitalId?.message} 
                        />

                        <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white group mt-2" isLoading={mutation.isPending}>
                            <span className="flex items-center gap-2 justify-center">
                                Submit Application
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                        Already have an account? <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupDoctor;
