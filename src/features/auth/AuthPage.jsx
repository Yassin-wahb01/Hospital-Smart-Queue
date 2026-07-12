import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import SignInForm from './SignInForm';

// RegisterForm is repurposed as admin-gated "Create Staff" form (features/staff/).
// There is no public self-registration endpoint — staff are created by admins only.

export default function AuthPage() {
  const { message, hideToast } = useToast();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 px-4 py-12">
      <Toast message={message} onClose={hideToast} />

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-lg">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">MediCare Admin</h1>
          <p className="mb-6 text-sm text-slate-500">Hospital Management Dashboard</p>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}