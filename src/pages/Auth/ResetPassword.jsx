import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { toast } from 'react-toastify';
import { ShieldCheck, ChevronRight, Activity } from 'lucide-react';

// ============================================================================
// Reset Password — Premium Split-Screen with OTP Verification
// ============================================================================

const schema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    otp: yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
    newPassword: yup.string().required('New password is required').min(8, 'Minimum 8 characters'),
});

export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialEmail = location.state?.email || '';

    const mutation = usePost(API.AUTH.RESET_PASSWORD);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { email: initialEmail }
    });

    const onSubmit = (data) => {
        mutation.mutate(data, {
            onSuccess: () => {
                toast.success('Password reset successful! Please log in.');
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
                            <Activity size={28} className="text-teal-300" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">NFC Health</h1>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                        Verify <br/><span className="text-teal-400">& Reset.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                        Enter the 6-digit verification code sent to your email, then define a strong new password for your account.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h3>
                        <p className="text-slate-500 mt-2">Enter the OTP and your new password below.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input label="Email Address" type="email" placeholder="dr.name@hospital.com" {...register('email')} error={errors.email?.message} />
                        <Input label="6-Digit OTP Code" placeholder="000000" {...register('otp')} error={errors.otp?.message} />
                        <Input label="New Password" type="password" placeholder="Min 8 characters" {...register('newPassword')} error={errors.newPassword?.message} />

                        <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white group" isLoading={mutation.isPending}>
                            <span className="flex items-center gap-2 justify-center">
                                <ShieldCheck size={18} /> Confirm Reset
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                        <Link to="/forgot-password" className="text-teal-600 font-medium hover:underline">Resend OTP</Link>
                        <span className="text-slate-300 mx-2">|</span>
                        <Link to="/login" className="text-slate-500 hover:underline">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
