import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useTherapyStore();
  const [email, setEmail] = useState('therapist@speech.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const success = await loginAdmin(email, password);
    if (!success) {
      setError('بيانات الدخول غير صحيحة.');
      setSubmitting(false);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eef5ff,_#f8fafc_45%,_#f7f4ea_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <aside className="bg-blue-600 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-950/20">
          <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black mb-4">Therapist Mode</h1>
          <p className="text-lg text-white/85 leading-8 mb-8">
            هذه المنطقة مخصصة للدكتور أو الأخصائي لإدارة الطلاب والجلسات والتقارير.
          </p>
          <div className="rounded-[2rem] bg-white/10 p-5 leading-8">
            <div className="font-black mb-2">Demo Credentials</div>
            <div>Email: therapist@speech.local</div>
            <div>Password: 123456</div>
          </div>
        </aside>

        <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#d8e6ff] shadow-xl">
          <h2 className="text-4xl font-black text-slate-900 mb-3">دخول الدكتور</h2>
          <p className="text-lg text-slate-600 leading-8 mb-8">
            سجل الدخول لمتابعة الطلاب، ضبط المستويات، وبدء الجلسة العلاجية مباشرة.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="block text-base font-bold text-slate-700 mb-3">البريد الإلكتروني</span>
              <div className="relative">
                <Mail size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 pr-12 pl-4 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-base font-bold text-slate-700 mb-3">كلمة المرور</span>
              <div className="relative">
                <LockKeyhole size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 pr-12 pl-4 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-3xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 font-bold">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full !rounded-[1.6rem] !py-4 text-xl bg-blue-600 hover:bg-blue-700"
            >
              دخول لوحة التحكم
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
