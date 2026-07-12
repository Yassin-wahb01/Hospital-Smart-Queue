import { useState } from 'react';
import Logo from '../../components/Logo';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import SignInForm from './SignInForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const { message, hideToast } = useToast();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 px-4 py-12">
      <Toast message={message} onClose={hideToast} />

      <div className="w-full max-w-md">
        <Logo />

        <div className="rounded-2xl border border-slate-300 bg-white shadow-lg">
          <div className="flex gap-1 rounded-t-2xl bg-slate-300 p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'signin' ? <SignInForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}