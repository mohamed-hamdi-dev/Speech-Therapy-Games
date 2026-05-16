import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import { therapistService } from '../../services/therapistService';

const TherapistsList = () => {
  const navigate = useNavigate();
  const { adminSession } = useTherapyStore();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayedTherapists = useMemo(() => {
    const list = Array.isArray(therapists) ? [...therapists] : [];

    if (adminSession?.user?.role !== 'SUPER_ADMIN') {
      return list;
    }

    const currentAdminId = adminSession?.user?.id;
    const alreadyIncluded = list.some((therapist) => therapist.id === currentAdminId);

    if (alreadyIncluded) {
      return list;
    }

    return [
      {
        id: currentAdminId || 'current-super-admin',
        name: adminSession?.name || adminSession?.user?.name || 'المسؤول الرئيسي',
        email: adminSession?.email || adminSession?.user?.email || '',
        role: 'SUPER_ADMIN',
        isActive: true,
        isBootstrapAccount: Boolean(adminSession?.user?.isBootstrapAccount),
      },
      ...list,
    ];
  }, [adminSession?.email, adminSession?.name, adminSession?.user?.id, adminSession?.user?.name, adminSession?.user?.role, therapists]);

  useEffect(() => {
    const fetchTherapists = async () => {
      if (!adminSession?.token) {
        setTherapists([]);
        setError('جلسة الإدارة غير متاحة. سجّل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await therapistService.getTherapists(adminSession.token);
        setTherapists(Array.isArray(response?.data) ? response.data : []);
      } catch (_fetchError) {
        setTherapists([]);
        setError('حدث خطأ أثناء جلب قائمة الدكاترة.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, [adminSession?.token]);

  const handleToggleActive = async (id, currentStatus) => {
    const actionLabel = currentStatus ? 'تعطيل' : 'تفعيل';
    if (!window.confirm(`هل أنت متأكد من رغبتك في ${actionLabel} هذا الحساب؟`)) {
      return;
    }

    try {
      setError('');
      if (currentStatus) {
        await therapistService.deactivateTherapist(adminSession.token, id);
      } else {
        await therapistService.updateTherapist(adminSession.token, id, { isActive: true });
      }

      const response = await therapistService.getTherapists(adminSession.token);
      setTherapists(Array.isArray(response?.data) ? response.data : []);
    } catch (_error) {
      setError('حدث خطأ أثناء تحديث حالة الدكتور.');
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">إدارة الدكاترة</h1>
          <p className="text-sm sm:text-base text-slate-600">
            إضافة الدكاترة الجدد وتعيين حساباتهم وصلاحياتهم.
          </p>
        </div>

        <Button
          onClick={() => navigate('/admin/therapists/create')}
          variant="primary"
          className="shrink-0 flex items-center justify-center gap-2 !py-3"
        >
          <Plus size={20} />
          <span>إضافة دكتور جديد</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 font-bold">
          {error}
        </div>
      )}

      {displayedTherapists.length === 0 ? (
        <Card className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 text-slate-400">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">لا يوجد دكاترة بعد</h3>
          <p className="text-slate-500 mb-8 max-w-md">
            يمكنك الآن إضافة دكتور جديد لتمكينه من إدارة جلسات وطلاب العيادة.
          </p>
          <Button onClick={() => navigate('/admin/therapists/create')} variant="primary">
            إضافة دكتور
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedTherapists.map((therapist) => (
            <Card key={therapist.id} className="p-5 sm:p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                  {therapist.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!therapist.isActive && (
                    <div className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                      معطل
                    </div>
                  )}
                  <div
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      therapist.role === 'SUPER_ADMIN'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {therapist.role === 'SUPER_ADMIN' ? 'دكتور ومسؤول رئيسي' : 'دكتور'}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1 truncate">{therapist.name}</h3>
              {therapist.isBootstrapAccount && (
                <div className="mb-2 inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  حساب تأسيسي احتياطي
                </div>
              )}
              <div className="text-sm text-slate-500 mb-6 truncate">{therapist.email}</div>

              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-100">
                <Button
                  onClick={() => navigate(`/admin/therapists/edit/${therapist.id}`)}
                  variant="primary"
                  className="flex-1 flex justify-center items-center gap-2 !py-2.5 !text-sm !rounded-[1.4rem]"
                >
                  <Edit size={16} />
                  <span>تعديل</span>
                </Button>

                {therapist.role !== 'SUPER_ADMIN' && (
                  <Button
                    onClick={() => handleToggleActive(therapist.id, therapist.isActive)}
                    variant={therapist.isActive ? 'danger' : 'success'}
                    className="flex-1 flex justify-center items-center gap-2 !py-2.5 !text-sm !rounded-[1.4rem]"
                  >
                    {therapist.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    <span>{therapist.isActive ? 'تعطيل' : 'تفعيل'}</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistsList;
