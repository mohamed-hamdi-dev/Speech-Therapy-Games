import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, UserRound } from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import { mockPatients } from '../../data/patientWorkspaceMock';

const PatientsList = () => {
  const navigate = useNavigate();
  const { students } = useTherapyStore();

  const mergedPatients = useMemo(() => {
    const base = Array.isArray(students)
      ? students.map((student) => ({
          id: String(student.id),
          name: student.name,
          age: student.age,
          diagnosis: student.diagnosis || 'غير محدد',
          accessCode: student.accessCode || student.code || '',
          progress: student.progress || null,
          attendanceRate: student.attendanceRate || null,
          source: 'live',
        }))
      : [];

    if (base.length > 0) {
      return base;
    }

    return mockPatients.map((patient) => ({ ...patient, source: 'mock' }));
  }, [students]);

  return (
    <section className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-3">
            <UserRound className="text-blue-700" size={30} />
            المرضى / المستفيدون
          </h1>
          <p className="text-slate-600 mt-2">اختر مريضًا لفتح صفحة المتابعة الرئيسية الخاصة به.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="primary" className="!py-3 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/admin/patients/create')}>
            إضافة مستفيد
          </Button>
          <Button variant="outline" className="!py-3" onClick={() => navigate('/admin/library')}>
            <ClipboardList size={18} />
            المكتبة العلاجية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mergedPatients.map((patient) => (
          <article key={patient.id} className="bg-white border border-slate-200 rounded-[1.6rem] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{patient.name}</h2>
                <p className="text-slate-500 mt-1">العمر: {patient.age || '-'} سنوات</p>
                <p className="text-slate-500">التشخيص: {patient.diagnosis || 'غير محدد'}</p>
                <p className="text-slate-500">كود الدخول: {patient.accessCode || patient.code || '---'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                {patient.name?.charAt(0) || 'م'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500 font-bold">نسبة الحضور</div>
                <div className="text-lg font-black text-slate-800">{patient.attendanceRate ?? '--'}%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500 font-bold">التقدم</div>
                <div className="text-lg font-black text-slate-800">{patient.progress ?? '--'}%</div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full mt-4 !py-3 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(`/admin/patients/${patient.id}`)}
            >
              فتح صفحة المريض
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PatientsList;
