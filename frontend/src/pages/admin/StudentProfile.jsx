import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';
import Button from '../../components/Button';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { sessions, students } = useTherapyStore();

  const parsedStudentId = Number(studentId);
  const student = students.find((item) => item.id === parsedStudentId);
  const studentSessions = sessions
    .filter((session) => session.studentId === parsedStudentId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!student) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-200 p-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-3">الطالب غير موجود</h2>
        <p className="text-slate-600 mb-6">
          هذا الرابط يشير إلى طالب غير موجود في البيانات المحلية الحالية.
        </p>
        <Button variant="primary" onClick={() => navigate('/admin/students')}>
          العودة إلى قائمة الطلاب
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin/students')} className="!p-2">
          <ArrowRight size={20} />
        </Button>
        <h1 className="text-3xl font-black text-slate-900">
          الملف الشخصي: {student.nameAr || student.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="w-24 h-24 bg-[#ffe08a] rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              {student.avatar || '🙂'}
            </div>
            <h2 className="text-2xl font-black text-center text-slate-800 mb-2">
              {student.nameAr || student.name}
            </h2>
            <p className="text-center text-slate-500 mb-6">العمر: {student.age} سنوات</p>

            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3">المستويات الحالية</h3>
              {Object.entries(student.currentLevels || {}).map(([game, level]) => (
                <div
                  key={game}
                  className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2 text-sm"
                >
                  <span className="font-bold text-slate-700">
                    {game === 'listen_choose' ? 'اسمع واختر' : 'السحب والإفلات'}
                  </span>
                  <span className="bg-[#14532d] text-white px-3 py-1 rounded-full text-xs">
                    مستوى {level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-700" />
              منحنى التطور
            </h3>

            {studentSessions.length > 0 ? (
              <div className="flex items-end gap-4 h-48 mt-8 border-b border-slate-200 pb-2 px-2">
                {studentSessions.map((session, index) => (
                  <div key={session.id} className="relative flex flex-col items-center flex-1 group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                      استقلالية {session.independenceRate}%
                    </div>
                    <div
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${
                        session.score >= 80
                          ? 'bg-green-500'
                          : session.score >= 50
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                      }`}
                      style={{ height: `${session.score}%` }}
                    />
                    <div className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                      ج {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-10">لا توجد جلسات مسجلة حتى الآن.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-emerald-700" />
              سجل الجلسات الأخيرة
            </h3>

            <div className="space-y-4">
              {studentSessions.slice().reverse().map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div>
                    <div className="font-bold text-slate-800 mb-1">
                      {session.gameType === 'listen_choose' ? 'اسمع واختر' : 'السحب والإفلات'}
                      <span className="text-slate-400 text-sm mr-2">مستوى {session.level}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(session.date).toLocaleDateString('ar-EG')} - استغرقت {session.timeSpent}{' '}
                      ثانية
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">النتيجة</div>
                      <div className="font-black text-lg text-slate-700">{session.score}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">الاستقلالية</div>
                      <div className="font-black text-lg text-emerald-700">
                        {session.independenceRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">الأخطاء</div>
                      <div className="font-black text-lg text-red-500">{session.wrongAnswers}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
