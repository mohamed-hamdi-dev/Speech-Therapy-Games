import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  FileText,
  Gamepad2,
  HeartPulse,
  Home,
  Target,
} from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import { buildPatientWorkspaceMock, mockLibraryItems } from '../../data/patientWorkspaceMock';

const sectionItems = [
  { id: 'overview', label: 'الرئيسية', icon: Home },
  { id: 'sessions', label: 'الجلسات', icon: CalendarDays },
  { id: 'assessment', label: 'التقييمات', icon: Brain },
  { id: 'plan', label: 'الخطة العلاجية', icon: Target },
  { id: 'behavior', label: 'السلوكيات', icon: HeartPulse },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'library', label: 'المكتبة', icon: BookOpen },
  { id: 'games', label: 'الألعاب', icon: Gamepad2 },
];

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, startTherapistSession, regenerateStudentAccessCode } = useTherapyStore();

  const [activeSection, setActiveSection] = useState('overview');
  const [accessCode, setAccessCode] = useState('');
  const [busyCodeAction, setBusyCodeAction] = useState(false);

  const storeStudent = useMemo(() => {
    if (!Array.isArray(students)) {
      return null;
    }

    return students.find((item) => String(item.id) === String(id)) || null;
  }, [id, students]);

  const workspace = useMemo(() => {
    if (storeStudent) {
      return {
        patient: {
          id: String(storeStudent.id),
          name: storeStudent.name,
          accessCode: storeStudent.accessCode || storeStudent.code || '',
          age: storeStudent.age,
          diagnosis: storeStudent.diagnosis || 'غير محدد',
          progress: storeStudent.progress || 0,
          attendanceRate: storeStudent.attendanceRate || 0,
          therapist: storeStudent.therapistName || 'غير محدد',
          group: storeStudent.group || 'غير محدد',
        },
        assessmentSummary: null,
        planSummary: null,
        sessions: [],
        behaviors: [],
        reports: [],
        libraryItems: mockLibraryItems,
      };
    }

    const mockWorkspace = buildPatientWorkspaceMock(String(id));
    return {
      ...mockWorkspace,
      patient: {
        ...mockWorkspace.patient,
        accessCode: mockWorkspace?.patient?.accessCode || '',
      },
    };
  }, [id, storeStudent]);

  const patient = workspace.patient;
  const assignedGames = Array.isArray(storeStudent?.assignedGames) ? storeStudent.assignedGames : [];
  const currentAccessCode = accessCode || patient?.accessCode || '';

  const handleCopyCode = async () => {
    if (!currentAccessCode) return;

    try {
      await navigator.clipboard.writeText(currentAccessCode);
      window.alert('تم نسخ كود الدخول.');
    } catch {
      window.alert('تعذر نسخ الكود.');
    }
  };

  const handlePrintCode = () => {
    if (!currentAccessCode || !patient) return;

    const printWindow = window.open('', '', 'width=600,height=460');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة الدخول - ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; margin: 0; }
            .card { background: white; width: 420px; border-radius: 28px; padding: 32px; border: 2px solid #dbe7f3; box-shadow: 0 14px 32px rgba(0,0,0,.08); text-align: center; }
            .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
            .subtitle { color: #475569; line-height: 1.7; margin-bottom: 20px; }
            .code { background: #2563eb; color: white; font-size: 32px; font-weight: 800; letter-spacing: 4px; border-radius: 20px; padding: 18px; margin: 18px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${patient.name}</div>
            <div class="subtitle">كود دخول المستفيد</div>
            <div class="code">${currentAccessCode}</div>
          </div>
          <script>window.onload = function () { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRegenerateCode = async () => {
    if (!storeStudent) return;

    const confirmed = window.confirm('هل تريد تجديد كود الدخول؟');
    if (!confirmed) return;

    try {
      setBusyCodeAction(true);
      const updated = await regenerateStudentAccessCode(storeStudent.id);
      setAccessCode(updated?.accessCode || '');
      window.alert('تم تجديد الكود بنجاح.');
    } catch (error) {
      window.alert(error?.response?.data?.message || error?.message || 'تعذر تجديد الكود.');
    } finally {
      setBusyCodeAction(false);
    }
  };

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center" dir="rtl">
        <h1 className="text-2xl font-black text-slate-900 mb-2">لم يتم العثور على المريض</h1>
        <p className="text-slate-600 mb-5">تحقق من رقم المريض أو ارجع لقائمة المرضى.</p>
        <Button variant="primary" onClick={() => navigate('/admin/patients')}>العودة لقائمة المرضى</Button>
      </div>
    );
  }

  const renderContent = () => {
    if (activeSection === 'overview') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="text-sm text-slate-500 font-bold mb-2">كود الدخول</div>
            <div className="text-2xl font-black tracking-[0.14em] text-blue-700 mb-3">{currentAccessCode || '---'}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="!py-2" onClick={handleCopyCode}>نسخ الكود</Button>
              <Button variant="outline" className="!py-2" onClick={handlePrintCode}>طباعة</Button>
              {storeStudent && (
                <Button
                  variant="primary"
                  className="!py-2 bg-blue-600 hover:bg-blue-700"
                  disabled={busyCodeAction}
                  onClick={handleRegenerateCode}
                >
                  تجديد الكود
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            <InfoCard title="العمر" value={`${patient.age} سنوات`} />
            <InfoCard title="التشخيص" value={patient.diagnosis} />
            <InfoCard title="نسبة الحضور" value={`${patient.attendanceRate || '--'}%`} />
            <InfoCard title="نسبة التقدم" value={`${patient.progress || '--'}%`} />
          </div>
        </div>
      );
    }

    if (activeSection === 'sessions') {
      return <ListBlock emptyText="لا توجد جلسات مرتبطة حاليًا." items={workspace.sessions.map((s) => `${s.date} - ${s.time} - ${s.type} (${s.attendance})`)} />;
    }

    if (activeSection === 'assessment') {
      const a = workspace.assessmentSummary;
      if (!a) return <EmptyBlock text="ملخص التقييم سيظهر بعد ربط الـbackend." />;
      return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoCard title="اللغة" value={`${a.language}%`} />
          <InfoCard title="السلوك" value={`${a.behavior}%`} />
          <InfoCard title="الإدراك" value={`${a.cognitive}%`} />
          <InfoCard title="الانتباه" value={`${a.attention}%`} />
        </div>
      );
    }

    if (activeSection === 'plan') {
      const p = workspace.planSummary;
      if (!p) return <EmptyBlock text="الخطة العلاجية ستظهر بعد ربط الـbackend." />;
      return (
        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <InfoCard title="اسم الخطة" value={p.activePlanName} />
          <InfoCard title="الأهداف النشطة" value={p.activeGoals} />
          <InfoCard title="الأهداف المتقنة" value={p.masteredGoals} />
          <InfoCard title="Targets نشطة" value={p.activeTargets} />
          <InfoCard title="Targets متقنة" value={p.masteredTargets} />
        </div>
      );
    }

    if (activeSection === 'behavior') {
      return <ListBlock emptyText="لا توجد سلوكيات نشطة." items={workspace.behaviors.map((b) => `${b.name} | التكرار: ${b.frequencyPerWeek}/أسبوع | الشدة: ${b.intensity} | الاتجاه: ${b.trend}`)} />;
    }

    if (activeSection === 'reports') {
      return <ListBlock emptyText="لا توجد تقارير بعد." items={workspace.reports.map((r) => `${r.type} - ${r.date} - ${r.status}`)} />;
    }

    if (activeSection === 'library') {
      return <ListBlock emptyText="لا توجد عناصر مكتبة." items={workspace.libraryItems.map((item) => `${item.title} | ${item.category} | ${item.level}`)} />;
    }

    if (activeSection === 'games') {
      if (!storeStudent || assignedGames.length === 0) {
        return <EmptyBlock text="الألعاب الحالية مرتبطة ببيانات المستفيد الفعلية. اختر مستفيدًا موجودًا في بيانات النظام لعرض الألعاب." />;
      }

      return (
        <div className="space-y-3">
          {assignedGames.map((game) => (
            <div key={game.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-slate-900">{game.titleAr || game.title || game.name}</div>
                <div className="text-sm text-slate-500">{game.descriptionAr || game.description || 'لعبة علاجية'}</div>
              </div>
              <Button
                variant="primary"
                className="!py-2.5 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  startTherapistSession(storeStudent, game.id);
                  navigate(`/student/game/${game.id}`);
                }}
              >
                بدء جلسة
              </Button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <section dir="rtl" className="grid lg:grid-cols-[260px_1fr] gap-4">
      <aside className="bg-white border border-slate-200 rounded-[1.6rem] p-3 h-fit lg:sticky lg:top-6">
        <div className="px-3 py-2 border-b border-slate-100 mb-2">
          <div className="text-xs text-slate-500 font-bold">Patient Workspace</div>
          <h2 className="text-lg font-black text-slate-900">{patient.name}</h2>
        </div>

        <nav className="space-y-1">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-right transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="bg-white border border-slate-200 rounded-[1.6rem] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{patient.name}</h1>
            <p className="text-slate-600">الملف الرئيسي للمريض: تقييم، خطة، جلسات، سلوكيات، تقارير، ومكتبة.</p>
          </div>
          <div className="flex gap-2">
            {storeStudent && (
              <Button variant="outline" onClick={() => navigate(`/admin/patients/edit/${storeStudent.id}`)}>
                تعديل البيانات
              </Button>
            )}
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
              onClick={() => navigate('/admin/patients')}
            >
              <ArrowRight size={16} />
              العودة للمرضى
            </Button>
          </div>
        </div>

        {renderContent()}
      </main>
    </section>
  );
};

const InfoCard = ({ title, value }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
    <div className="text-xs text-slate-500 font-bold mb-1">{title}</div>
    <div className="text-lg font-black text-slate-900">{value}</div>
  </div>
);

const EmptyBlock = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 font-bold">{text}</div>
);

const ListBlock = ({ items, emptyText }) => {
  if (!items || items.length === 0) {
    return <EmptyBlock text={emptyText} />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold text-slate-700">
          {item}
        </div>
      ))}
    </div>
  );
};

export default PatientDetails;
