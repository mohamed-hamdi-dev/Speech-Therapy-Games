import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Shield } from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { loginStudent } = useTherapyStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError('اكتبي كود الدخول أولًا.');
      return;
    }

    const success = loginStudent(normalizedCode, 'parent');
    if (!success) {
      setError('الكود غير صحيح. تأكدي من كود الدخول الخاص بالطفل.');
      return;
    }

    setError('');
    navigate('/student/home');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eef5ff,_#f8fbff_46%,_#ffffff_100%)] flex items-start justify-center p-4 md:p-5">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.03fr_0.97fr] gap-5">
        <section className="bg-white/95 rounded-[2.3rem] p-7 md:p-8 border border-[#dbe7f3] shadow-[0_18px_60px_rgba(37,99,235,0.08)]">
          <div className="flex items-start justify-end gap-4 mb-8">
            <div className="flex items-center gap-3 rounded-[1.5rem] bg-[#f7fbff] border border-[#dbe7f3] px-4 py-3 shadow-sm">
              <div className="w-14 h-14 rounded-[1.1rem] bg-white border border-[#dbe7f3] shadow-sm flex items-center justify-center overflow-hidden p-1">
                <img src="/logo.png" alt="شعار العيادة" className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-black text-blue-700 leading-tight">العيادة السودانية</h1>
                <p className="text-sm text-slate-500 leading-6">لأمراض التخاطب والنمو العصبي</p>
              </div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
            دخول الأسرة بالكود فقط
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-7 leading-8 max-w-3xl">
            لا يحتاج الطفل إلى بريد إلكتروني أو كلمة مرور. فقط أدخل كود الوصول ثم ابدأ
            الألعاب المخصصة له.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="block text-base font-bold text-slate-700 mb-3">كود الوصول</span>
              <input
                type="text"
                dir="ltr"
                autoComplete="off"
                spellCheck="false"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="AHMED123"
                className="w-full rounded-[1.7rem] border-2 border-[#d3e3f8] bg-[#fbfdff] px-6 py-4 text-center text-2xl tracking-[0.35em] font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 uppercase"
              />
            </label>

            {error && (
              <div className="rounded-3xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 font-bold">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full !rounded-[1.7rem] !py-4 text-xl bg-blue-600 hover:bg-blue-700"
            >
              دخول الطفل
            </Button>
          </form>

          <div className="mt-7 rounded-[1.8rem] bg-[#f7fbff] border border-[#dbe7f3] p-5">
            <div className="flex items-center gap-2 text-slate-800 font-black mb-2">
              <QrCode size={20} className="text-blue-600" />
              <span>قريبًا</span>
            </div>
            <p className="text-slate-600 leading-7">
              يمكن إضافة دخول بالـ QR Code حتى يدخل الطفل بسرعة من البيت أو العيادة بدون كتابة.
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[2.3rem] border border-[#dbe7f3] bg-[linear-gradient(180deg,_#0f4ea8,_#1d68d8_42%,_#2d7cf0_100%)] p-6 md:p-7 text-white shadow-[0_24px_60px_rgba(29,104,216,0.24)]">
          <div className="absolute -top-16 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-10 right-0 h-44 w-44 rounded-full bg-[#ffd76a]/20 blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-[1.4rem] bg-white/12 border border-white/15 flex items-center justify-center mb-4 overflow-hidden p-2">
              <img
                src="/logo.png"
                alt="شعار العيادة"
                className="w-full h-full object-contain rounded-[1.2rem]"
              />
            </div>

            <h3 className="text-2xl md:text-[1.8rem] font-black leading-tight mb-3">
              هوية بصرية من شعار العيادة
            </h3>
            <p className="text-white/90 text-base md:text-lg leading-7 mb-5">
              الأزرق هو اللون الرئيسي هنا لأنه الأقرب لهوية الشعار ويعطي إحساسًا أوضح وأنظف من
              الأخضر السابق.
            </p>

            <div className="space-y-3">
              <div className="rounded-[1.5rem] bg-white/12 border border-white/10 p-4">
                <div className="font-black text-sm md:text-base mb-1">Therapist Mode</div>
                <div className="text-white/80 text-sm md:text-base leading-6">
                  الدكتور يتحكم في الجلسة ويتابع مستويات المساعدة والتقارير.
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white/12 border border-white/10 p-4">
                <div className="font-black text-sm md:text-base mb-1">Clinic Friendly</div>
                <div className="text-white/80 text-sm md:text-base leading-6">
                  يمكن بدء الجلسة من العيادة مباشرة بدون أن يمر الطفل بخطوات دخول.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/login')}
              className="mt-5 w-full rounded-[1.4rem] border border-white/20 bg-white/8 px-5 py-3 font-bold text-sm md:text-base hover:bg-white/14 transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              <span>دخول الدكتور</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentLogin;
