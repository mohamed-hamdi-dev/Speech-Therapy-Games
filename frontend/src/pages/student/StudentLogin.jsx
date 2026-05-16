import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Shield } from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { loginStudent } = useTherapyStore();

  const [accessCode, setAccessCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    const normalizedCode = accessCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError('من فضلك أدخل كود الدخول أولًا.');
      return;
    }

    setSubmitting(true);
    const result = await loginStudent(normalizedCode, 'parent', rememberMe);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'كود الدخول غير صحيح.');
      return;
    }

    setError('');
    navigate('/student/home');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[linear-gradient(180deg,_#eef8fb,_#f7fcfd_46%,_#ffffff_100%)] flex items-start justify-center p-4">
      <div className="w-full max-w-[72rem] grid lg:grid-cols-[1.02fr_0.98fr] gap-4">
        <section className="bg-white/95 rounded-[2rem] p-6 md:p-7 border border-[#b8deec] shadow-[0_18px_60px_rgba(19,143,188,0.10)]">
          <div className="flex items-start justify-end gap-4 mb-6">
            <div className="flex items-center gap-3 rounded-[1.4rem] bg-[#f7fbff] border border-[#dbe7f3] px-4 py-3 shadow-sm">
              <div className="w-12 h-12 rounded-[1rem] bg-white border border-[#dbe7f3] shadow-sm flex items-center justify-center overflow-hidden p-1">
                <img src="/logo.png" alt="شعار العيادة" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <h1 className="text-base font-extrabold text-blue-700 leading-tight">مركز التأهيل والتخاطب</h1>
                <p className="text-sm text-slate-500 leading-5">دخول المستفيد بالكود فقط</p>
              </div>
            </div>
          </div>

          <h2 className="text-[2.6rem] md:text-[3rem] font-extrabold text-slate-900 leading-[1.08] mb-3">
            دخول المستفيد فقط
          </h2>
          <p className="text-lg md:text-[1.1rem] text-slate-600 mb-6 leading-8 max-w-3xl">
            لا نطلب كلمة مرور أو PIN. أدخل كود الدخول ثم ابدأ الأنشطة العلاجية والألعاب المخصصة مباشرة.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="block text-[0.95rem] font-extrabold text-slate-700 mb-3">كود الدخول</span>
              <input
                type="text"
                dir="ltr"
                autoComplete="off"
                spellCheck="false"
                value={accessCode}
                onChange={(event) => {
                  setAccessCode(event.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="AHMED123"
                className="w-full rounded-[1.5rem] border-2 border-[#d3e3f8] bg-[#fbfdff] px-6 py-3.5 text-center text-2xl tracking-[0.16em] font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 uppercase"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-slate-600 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              تذكرني
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
              className="w-full !rounded-[1.5rem] !py-3.5 text-xl bg-blue-600 hover:bg-blue-700"
            >
              دخول المستفيد
            </Button>
          </form>

          <div className="mt-6 rounded-[1.6rem] bg-[#f7fbff] border border-[#dbe7f3] p-4">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold mb-2">
              <QrCode size={20} className="text-blue-600" />
              <span>قريبًا</span>
            </div>
            <p className="text-slate-600 leading-7 text-[0.97rem]">
              إمكانية إضافة دخول عبر QR Code لتسهيل الدخول السريع من البيت أو العيادة.
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[2rem] border border-[#8ecfe2] bg-[linear-gradient(180deg,_#0f7ea6,_#138fbc_44%,_#45abd0_100%)] p-5 md:p-6 text-white shadow-[0_24px_60px_rgba(19,143,188,0.24)]">
          <div className="absolute -top-16 -left-12 h-48 w-48 rounded-full bg-white/12 blur-2xl" />
          <div className="absolute bottom-10 right-0 h-44 w-44 rounded-full bg-[#fff0ba]/18 blur-3xl" />

          <div className="relative z-10">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-white/12 border border-white/15 flex items-center justify-center mb-4 overflow-hidden p-2">
              <img src="/logo.png" alt="شعار العيادة" className="w-full h-full object-contain rounded-[1.2rem]" />
            </div>

            <h3 className="text-[1.55rem] md:text-[1.72rem] font-extrabold leading-tight mb-3">واجهة بسيطة وسريعة</h3>
            <p className="text-white/90 text-[0.98rem] md:text-lg leading-7 mb-4">
              بعد إدخال الكود، يصل المستفيد مباشرة إلى الأنشطة العلاجية، الألعاب المخصصة، والجلسات الحالية.
            </p>

            <div className="space-y-3">
              <div className="rounded-[1.35rem] bg-white/12 border border-white/10 p-4">
                <div className="font-extrabold text-sm md:text-[0.96rem] mb-1">بدون كلمة مرور</div>
                <div className="text-white/80 text-sm md:text-base leading-6">
                  تجربة دخول مريحة خاصة بالمستفيد في الـMVP.
                </div>
              </div>

              <div className="rounded-[1.35rem] bg-white/12 border border-white/10 p-4">
                <div className="font-extrabold text-sm md:text-[0.96rem] mb-1">صديق للعيادة</div>
                <div className="text-white/80 text-sm md:text-base leading-6">
                  يمكن للأخصائي بدء الجلسة بسهولة دون خطوات معقدة.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/login')}
              className="mt-4 w-full rounded-[1.25rem] border border-white/20 bg-white/8 px-5 py-3 font-bold text-sm md:text-base hover:bg-white/14 transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              <span>دخول الأخصائي والإدارة</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentLogin;
