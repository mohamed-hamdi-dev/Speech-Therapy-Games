import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save, UserRoundPlus } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import gameService from '../../services/gameService';
import therapistService from '../../services/therapistService';

const defaultForm = {
  name: '',
  age: 4,
  diagnosis: '',
  currentLevel: 1,
  therapistId: '',
  assignedGameIds: [],
};

const StudentForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { addStudent, adminSession, fetchStudents, students, updateStudent } = useTherapyStore();

  const [formData, setFormData] = useState(defaultForm);
  const [availableGames, setAvailableGames] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [gamesFilter, setGamesFilter] = useState('');

  const isEdit = mode === 'edit';
  const student = useMemo(
    () => (Array.isArray(students) ? students.find((item) => String(item.id) === String(studentId)) : null),
    [studentId, students]
  );

  const filteredGames = useMemo(() => {
    const query = gamesFilter.trim().toLowerCase();
    if (!query) {
      return availableGames;
    }

    return availableGames.filter((game) => {
      const searchableText = `${game.titleAr || ''} ${game.title || ''} ${game.name || ''} ${game.level || ''}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [availableGames, gamesFilter]);

  useEffect(() => {
    const fetchFormDependencies = async () => {
      let nextError = '';

      setLoadingGames(true);
      setError('');

      try {
        const gamesResponse = await gameService.getGames(adminSession?.token);
        setAvailableGames(
          Array.isArray(gamesResponse)
            ? gamesResponse
            : Array.isArray(gamesResponse?.data)
              ? gamesResponse.data
              : []
        );
      } catch (_gamesError) {
        setAvailableGames([]);
        nextError = 'تعذر تحميل الألعاب.';
      }

      if (adminSession?.user?.role === 'SUPER_ADMIN' && adminSession?.token) {
        const adminOption = adminSession?.user
          ? [
              {
                id: adminSession.user.id,
                name: adminSession.user.name || adminSession.name,
                email: adminSession.user.email || adminSession.email,
              },
            ]
          : [];

        try {
          const therapistsResponse = await therapistService.getTherapists(adminSession.token);
          const therapistsData = Array.isArray(therapistsResponse?.data) ? therapistsResponse.data : [];
          const mergedTherapists = [...adminOption, ...therapistsData].filter(
            (therapist, index, array) => array.findIndex((item) => item.id === therapist.id) === index
          );

          setTherapists(mergedTherapists);
          if (!isEdit) {
            setFormData((current) => ({
              ...current,
              therapistId: current.therapistId || adminSession.user.id || mergedTherapists[0]?.id || '',
            }));
          }
        } catch (_therapistsError) {
          setTherapists(adminOption);
          if (!isEdit) {
            setFormData((current) => ({
              ...current,
              therapistId: current.therapistId || adminSession.user.id || adminOption[0]?.id || '',
            }));
          }
          if (!nextError) {
            nextError = 'تعذر تحميل قائمة الدكاترة.';
          }
        }
      } else {
        setTherapists([]);
      }

      setError(nextError);
      setLoadingGames(false);
    };

    fetchFormDependencies();
  }, [adminSession?.email, adminSession?.name, adminSession?.token, adminSession?.user, isEdit]);

  useEffect(() => {
    if (isEdit && student) {
      setFormData({
        name: student.name || '',
        age: student.age || 4,
        diagnosis: student.diagnosis || '',
        currentLevel: student.currentLevel || 1,
        therapistId: student.therapistId || '',
        assignedGameIds: Array.isArray(student.assignedGames)
          ? student.assignedGames.map((game) => String(game.id))
          : [],
      });
    }
  }, [isEdit, student]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleAssignedGame = (gameId) => {
    setFormData((current) => ({
      ...current,
      assignedGameIds: current.assignedGameIds.includes(gameId)
        ? current.assignedGameIds.filter((id) => id !== gameId)
        : [...current.assignedGameIds, gameId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (!adminSession?.token) {
      setError('جلسة الإدارة غير متاحة. سجلي الدخول مرة أخرى.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      age: Number(formData.age),
      diagnosis: formData.diagnosis.trim() || undefined,
      currentLevel: Number(formData.currentLevel),
      therapistId: formData.therapistId || undefined,
      assignedGameIds: formData.assignedGameIds,
    };

    try {
      if (isEdit && student) {
        await updateStudent(student.id, payload);
      } else {
        await addStudent(payload);
      }

      await fetchStudents(adminSession.token);
      navigate('/admin/patients');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError?.message || 'تعذر حفظ بيانات المستفيد.');
      setSubmitting(false);
    }
  };

  if (isEdit && !student) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-3">المستفيد غير موجود</h2>
        <Button variant="primary" onClick={() => navigate('/admin/patients')}>
          العودة إلى المستفيدين
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/patients')} className="!py-2 !px-4">
          <ArrowRight size={18} />
          <span>إلغاء</span>
        </Button>

        <div className="text-right">
          <h1 className="text-4xl font-black text-slate-900">
            {isEdit ? 'تعديل المستفيد' : 'إضافة مستفيد جديد'}
          </h1>
          <p className="text-slate-600 mt-2">
            كود الدخول يُنشأ تلقائيًا من النظام عند إنشاء المستفيد.
          </p>
        </div>
      </div>

      <Card className="p-8 rounded-[2rem]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-2">اسم المستفيد</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">العمر</label>
              <input
                type="number"
                min="1"
                max="25"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-2">التشخيص</label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="اختياري"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">المستوى الحالي</label>
              <input
                type="number"
                min="1"
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {adminSession?.user?.role === 'SUPER_ADMIN' && (
            <div>
              <label className="block font-bold text-slate-700 mb-2">الدكتور المسؤول</label>
              <select
                name="therapistId"
                value={formData.therapistId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              >
                <option value="">اختار الدكتور</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name} - {therapist.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-2">الألعاب المخصصة</label>
            <div className="rounded-[1.75rem] border border-slate-300 bg-white p-4 space-y-4">
              <input
                type="text"
                value={gamesFilter}
                onChange={(event) => setGamesFilter(event.target.value)}
                placeholder="ابحثي عن لعبة بالاسم أو المستوى"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                disabled={loadingGames}
              />

              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-slate-500">
                  {loadingGames ? 'جارٍ تحميل الألعاب...' : `${formData.assignedGameIds.length} لعبة مختارة`}
                </span>
                {!!gamesFilter && (
                  <button
                    type="button"
                    onClick={() => setGamesFilter('')}
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    مسح الفلتر
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {!loadingGames && !availableGames.length && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-5 text-center text-slate-500">
                    لا توجد ألعاب متاحة حاليًا.
                  </div>
                )}

                {!loadingGames && !!availableGames.length && !filteredGames.length && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-5 text-center text-slate-500">
                    لا توجد نتائج مطابقة للبحث.
                  </div>
                )}

                {filteredGames.map((game) => {
                  const gameId = String(game.id);
                  const checked = formData.assignedGameIds.includes(gameId);

                  return (
                    <label
                      key={game.id}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                        checked
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAssignedGame(gameId)}
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800">
                          {game.titleAr || game.title || game.name}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">المستوى {game.level}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 font-bold">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="!py-3 !px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isEdit ? <Save size={18} /> : <UserRoundPlus size={18} />}
              <span>{isEdit ? 'حفظ التعديلات' : 'إضافة المستفيد'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
