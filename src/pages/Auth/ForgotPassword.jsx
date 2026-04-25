import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { Mail, ChevronRight, Activity } from 'lucide-react';

// ============================================================================
// Forgot Password — Premium Split-Screen
// ============================================================================

const schema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
});

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const mutation = usePost(API.AUTH.FORGET_PASSWORD);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = (data) => {
        mutation.mutate(data, {
            onSuccess: () => {
                navigate('/reset-password', { state: { email: data.email } });
            }
        });
    };

    return (
        <div className="min-h-screen flex w-full flex-col md:flex-row bg-white">
            {/* Left Branding Panel */}
            <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-slate-900 to-teal-900 text-white relative overflow-hidden justify-center px-12 lg:px-20">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Activity size={28} className="text-teal-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">NFC Health</h1>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Account <br/><span className="text-teal-400">Recovery.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        We will send a secure 6-digit OTP code to your registered email address. Use it on the next screen to set a new password.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password</h3>
                        <p className="text-slate-500 mt-2">Enter the email linked to your staff account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input 
                            label="Email Address" 
                            type="email" 
                            placeholder="dr.name@hospital.com" 
                            {...register('email')} 
                            error={errors.email?.message}
                        />

                        <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white group" isLoading={mutation.isPending}>
                            <span className="flex items-center gap-2 justify-center">
                                <Mail size={18} /> Send OTP Code
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                        Remembered your password? <Link to="/login" className="text-teal-600 font-medium hover:underline">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
