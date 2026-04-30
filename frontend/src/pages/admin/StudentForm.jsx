import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Save, UserRoundPlus } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const avatarOptions = ['🙂', '🌟', '🦋', '🚗', '🧩', '🐥'];

const defaultForm = {
  name: '',
  nameAr: '',
  age: 4,
  code: '',
  avatar: '🙂',
  goals: '',
  assignedGames: [],
};

const StudentForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { addStudent, students, updateStudent } = useTherapyStore();
  const [formData, setFormData] = useState(defaultForm);
  const [availableGames, setAvailableGames] = useState([]);

  const isEdit = mode === 'edit';
  const student = students.find((item) => item.id === Number(studentId));

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/games');
        setAvailableGames(response.data);
      } catch (error) {
        console.error('Error fetching games for student form:', error);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (isEdit && student) {
      const normalizedAssignedGames = (student.assignedGames || []).flatMap((assignedGame) => {
        const matches = availableGames.filter(
          (game) => game.id === assignedGame || String(game.id) === String(assignedGame) || game.type === assignedGame
        );

        if (matches.length > 0) {
          return matches.map((game) => String(game.id));
        }

        return String(assignedGame);
      });

      setFormData({
        name: student.name || '',
        nameAr: student.nameAr || '',
        age: student.age || 4,
        code: student.code || '',
        avatar: student.avatar || '🙂',
        goals: (student.goals || []).join('، '),
        assignedGames: normalizedAssignedGames,
      });
    }
  }, [availableGames, isEdit, student]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAssignedGamesChange = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((current) => ({
      ...current,
      assignedGames: selectedValues,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim() || formData.nameAr.trim(),
      nameAr: formData.nameAr.trim() || formData.name.trim(),
      age: Number(formData.age),
      code: formData.code.trim().toUpperCase(),
      avatar: formData.avatar,
      goals: formData.goals
        .split(/[،,]/)
        .map((goal) => goal.trim())
        .filter(Boolean),
      assignedGames: formData.assignedGames.map((gameId) => Number(gameId)),
    };

    if (isEdit && student) {
      updateStudent(student.id, payload);
    } else {
      addStudent({
        ...payload,
        currentLevels: {
          listen_choose: 1,
          action_drag_drop: 1,
        },
      });
    }

    navigate('/admin/students');
  };

  if (isEdit && !student) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-3">الطالب غير موجود</h2>
        <Button variant="primary" onClick={() => navigate('/admin/students')}>
          العودة للطلاب
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/students')} className="!py-2 !px-4">
          <ArrowRight size={18} />
          <span>إلغاء</span>
        </Button>

        <div className="text-right">
          <h1 className="text-4xl font-black text-slate-900">
            {isEdit ? 'تعديل الطالب' : 'إضافة طالب جديد'}
          </h1>
          <p className="text-slate-600 mt-2">اختاري الألعاب من القائمة بدل كتابتها يدويًا.</p>
        </div>
      </div>

      <Card className="p-8 rounded-[2rem]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-2">الاسم بالعربية</label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">الاسم بالإنجليزية</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-slate-700 mb-2">العمر</label>
              <input
                type="number"
                min="2"
                max="18"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">كود الدخول</label>
              <input
                type="text"
                dir="ltr"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-3">صورة الطفل الرمزية</label>
            <div className="flex flex-wrap gap-3">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, avatar }))}
                  className={`w-16 h-16 rounded-2xl text-3xl border transition-colors ${
                    formData.avatar === avatar
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">الأهداف العلاجية</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows="3"
              placeholder="مثال: تنمية اللغة الاستقبالية، اتباع الأوامر البسيطة"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">الألعاب المخصصة</label>
            <select
              multiple
              value={formData.assignedGames}
              onChange={handleAssignedGamesChange}
              className="w-full min-h-40 px-4 py-3 rounded-2xl border border-slate-300 bg-white outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              {availableGames.map((game) => (
                <option key={game.id} value={String(game.id)}>
                  {game.titleAr} - المستوى {game.level}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-slate-500">اضغطي `Ctrl` أو `Cmd` لاختيار أكثر من لعبة.</p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button type="submit" variant="primary" className="!py-3 !px-8 bg-blue-600 hover:bg-blue-700">
              {isEdit ? <Save size={18} /> : <UserRoundPlus size={18} />}
              <span>{isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
