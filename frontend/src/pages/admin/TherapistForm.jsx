import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Save } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import { therapistService } from '../../services/therapistService';

const TherapistForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { therapistId } = useParams();
  const { adminSession } = useTherapyStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    role: 'THERAPIST',
  });
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (mode !== 'edit' || !therapistId) {
        return;
      }

      if (!adminSession?.token) {
        setError('جلسة الإدارة غير متاحة. سجّل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await therapistService.getTherapists(adminSession.token);
        const therapistFromList = Array.isArray(response?.data)
          ? response.data.find((item) => item.id === therapistId)
          : null;
        const therapist =
          therapistFromList ||
          (adminSession?.user?.role === 'SUPER_ADMIN' && adminSession?.user?.id === therapistId
            ? {
                id: adminSession.user.id,
                name: adminSession.name || adminSession.user.name || '',
                email: adminSession.email || adminSession.user.email || '',
                isActive: true,
                role: 'SUPER_ADMIN',
              }
            : null);

        if (!therapist) {
          setError('لم يتم العثور على الدكتور.');
          return;
        }

        setFormData({
          name: therapist.name || '',
          email: therapist.email || '',
          password: '',
          isActive: therapist.isActive !== undefined ? therapist.isActive : true,
          role: therapist.role || 'THERAPIST',
        });
      } catch (_fetchError) {
        setError('حدث خطأ أثناء جلب بيانات الدكتور.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [adminSession?.token, mode, therapistId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'create') {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        }

        await therapistService.createTherapist(adminSession.token, formData);
      } else {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }

        await therapistService.updateTherapist(adminSession.token, therapistId, payload);
      }

      navigate('/admin/therapists');
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message || submitError?.message || 'حدث خطأ أثناء الحفظ.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/therapists')}
          className="w-10 h-10 rounded-2xl bg-white border border-[#dbe7f3] flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {mode === 'create' ? 'إضافة دكتور جديد' : 'تعديل بيانات الدكتور'}
          </h1>
          <p className="text-sm text-slate-500">
            {mode === 'create'
              ? 'قم بإدخال البيانات الأساسية للدكتور لإرسال دعوة الدخول.'
              : 'تحديث معلومات الدكتور وكلمة المرور.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 font-bold">
          {error}
        </div>
      )}

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <label className="block">
              <span className="block text-sm font-bold text-slate-700 mb-2">اسم الدكتور كاملًا</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="مثال: د. محمد أحمد"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all text-left dir-ltr"
                placeholder="doctor@clinic.com"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-bold text-slate-700 mb-2">
              كلمة المرور {mode === 'edit' && <span className="text-slate-400 font-normal">(اتركها فارغة إذا لم ترغب بتغييرها)</span>}
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={mode === 'create'}
                minLength={6}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-14 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all text-left dir-ltr"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-bold text-slate-800">حساب نشط</div>
              <div className="text-sm text-slate-500">
                يمكن للدكتور تسجيل الدخول وإدارة الطلاب إذا كان الحساب نشطًا.
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.role === 'SUPER_ADMIN'}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  role: event.target.checked ? 'SUPER_ADMIN' : 'THERAPIST',
                }))
              }
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-bold text-slate-800">تعيينه مسؤولًا رئيسيًا</div>
              <div className="text-sm text-slate-500">
                عند التفعيل سيبقى هذا الحساب دكتورًا، مع منحه أيضًا صلاحية المسؤول الرئيسي.
              </div>
            </div>
          </label>

          <div className="pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 !py-3 !px-8"
            >
              <Save size={20} />
              <span>{submitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TherapistForm;
