import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { usePost } from '../../hooks/useApi';
import API from '../../config/apiRoutes';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-toastify';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, ChevronRight, Activity, ShieldPlus } from 'lucide-react';

// ============================================================================
// Premium Login — Split-Screen
// Patient login: POST /auth/login/patient  { nationalId }
// Staff login:   POST /auth/login          { email, password }
// ============================================================================

const patientSchema = yup.object().shape({
    nationalId: yup.string()
        .required('National ID is required')
        .length(14, 'Must be exactly 14 digits')
        .matches(/^[0-9]+$/, 'Must contain only numbers'),
});

const staffSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
});

export const Login = () => {
    const [loginType, setLoginType] = useState('patient');
    const schema = loginType === 'patient' ? patientSchema : staffSchema;
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema)
    });

    const navigate = useNavigate();
    const { login } = useAuthStore();

    // Different endpoints for patient vs staff
    const patientLoginMutation = usePost(API.AUTH.LOGIN_PATIENT);
    const staffLoginMutation = usePost(API.AUTH.LOGIN_STAFF);

    const onSubmit = (data) => {
        if (loginType === 'patient') {
            patientLoginMutation.mutate({ nationalId: data.nationalId }, {
                onSuccess: (res) => {
                    const token = res?.token || res?.data?.token;
                    // Support flat responses where user fields are at the root
                    let user = res?.user || res?.data?.user || (res?.nationalId || res?.role ? res : null);
                    
                    if (!user) user = {};
                    
                    user.role = 'PATIENT';
                    user.nationalId = data.nationalId;

                    if (token) {
                        login(user, token);
                        toast.success('Welcome back, Patient!');
                        navigate('/dashboard');
                    }
                }
            });
        } else {
            staffLoginMutation.mutate({ email: data.email, password: data.password }, {
                onSuccess: (res) => {
                    const token = res?.token || res?.data?.token;
                    // Support flat responses where user fields (role, email, etc.) are at the root
                    const user = res?.user || res?.data?.user || (res?.role ? res : res?.data);
                    
                    if (token) {
                        login(user || {}, token);
                        toast.success('Authentication successful');
                        navigate('/dashboard');
                    }
                }
            });
        }
    };

    // Reset form when switching login type
    const switchType = (type) => {
        setLoginType(type);
        reset();
    };

    const isLoading = patientLoginMutation.isPending || staffLoginMutation.isPending;

    return (
        <div className="min-h-screen flex w-full flex-col md:flex-row bg-white">
            
            {/* Left Side: Branding Panel */}
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
                        The Future of <br/><span className="text-teal-400">Connected Care.</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md leading-relaxed mb-12">
                        Access your medical records securely, coordinate with verified healthcare professionals, and manage the administrative ecosystem seamlessly.
                    </p>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 w-fit backdrop-blur-sm">
                        <ShieldPlus className="text-teal-400" size={24} />
                        <div>
                            <h4 className="font-semibold text-white">Military-grade Security</h4>
                            <p className="text-xs text-slate-400">Strict Role-Based Access Control</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h3>
                        <p className="text-slate-500 mt-2">Please enter your credentials to proceed.</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex p-1 bg-slate-100/80 rounded-xl mt-8">
                        <button type="button"
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200 ${loginType === 'patient' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => switchType('patient')}
                        >
                            <User size={16} /> Patient Portal
                        </button>
                        <button type="button"
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex justify-center items-center gap-2 transition-all duration-200 ${loginType === 'staff' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => switchType('staff')}
                        >
                            <Activity size={16} /> Staff / Doctor
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {loginType === 'patient' ? (
                            <Input 
                                label="National ID" 
                                placeholder="Enter your 14-digit National ID" 
                                {...register('nationalId')} 
                                error={errors.nationalId?.message}
                            />
                        ) : (
                            <>
                                <Input 
                                    label="Email Address" 
                                    type="email" 
                                    placeholder="staff@nfc-health.com" 
                                    {...register('email')} 
                                    error={errors.email?.message}
                                />
                                <div>
                                    <Input 
                                        label="Password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        {...register('password')} 
                                        error={errors.password?.message}
                                    />
                                    <div className="flex justify-end pt-1">
                                        <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}

                        <Button type="submit" size="lg" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white group" isLoading={isLoading}>
                            <span className="flex items-center gap-2 justify-center">
                                Secure Login
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="pt-8 text-center text-sm font-medium text-slate-600 border-t border-slate-100">
                        New to the network? <br className="sm:hidden"/> 
                        <Link to="/signup/patient" className="text-teal-600 hover:text-teal-700 hover:underline ml-1">Register as Patient</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
