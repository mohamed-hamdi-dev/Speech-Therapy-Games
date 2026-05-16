import React, { useMemo } from "react";
import { Activity, CalendarClock, Flag, HeartPulse, Target, TrendingUp, Users, AlertCircle, Clock, User, ChevronLeft, ShieldAlert } from "lucide-react";

// وضعنا البيانات الوهمية هنا لضمان عمل الملف بشكل مستقل
const getDashboardMock = () => ({
    kpis: {
        totalPatients: 142,
        todaySessions: 28,
        activePlans: 115,
        masteredGoals: 843,
        attendanceRate: 94,
        overallProgress: 68,
    },
    upcomingSessions: [
        { id: 1, patientId: "1042", patientName: "أحمد محمود", date: "اليوم", time: "10:00 ص", type: "نطق وتخاطب", color: "bg-blue-100 text-blue-700" },
        { id: 2, patientId: "1088", patientName: "سارة علي", date: "اليوم", time: "11:30 ص", type: "تعديل سلوك", color: "bg-purple-100 text-purple-700" },
        { id: 3, patientId: "1095", patientName: "عمر حسن", date: "اليوم", time: "01:00 م", type: "تنمية مهارات", color: "bg-emerald-100 text-emerald-700" },
        { id: 4, patientId: "1102", patientName: "ليان طارق", date: "اليوم", time: "02:30 م", type: "علاج وظيفي", color: "bg-orange-100 text-orange-700" },
    ],
    followUpPatients: [
        { id: 1, name: "يوسف ابراهيم", progress: 32, attendanceRate: 85, status: "needs_attention" },
        { id: 2, name: "ليلى خالد", progress: 45, attendanceRate: 90, status: "on_track" },
        { id: 3, name: "كريم مجدي", progress: 15, attendanceRate: 70, status: "critical" },
    ],
    activeBehaviorAlerts: [
        { patientId: 1, patientName: "طارق زياد", behaviors: ["نوبات غضب", "رفض المهام"], severity: "high" },
        { patientId: 2, patientName: "نور محمد", behaviors: ["تشتت انتباه مستمر"], severity: "medium" },
    ],
    progressTrend: [
        { label: "يناير", value: 45 },
        { label: "فبراير", value: 52 },
        { label: "مارس", value: 58 },
        { label: "أبريل", value: 65 },
        { label: "مايو", value: 72 },
        { label: "يونيو", value: 68 },
    ],
});

// مكونات مساعدة لتحسين شكل التصميم
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>{children}</div>;

const ProgressBar = ({ progress, colorClass = "bg-indigo-500" }) => (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
);

export default function AdminDashboard() {
    const dashboard = useMemo(() => getDashboardMock(), []);
    const { kpis, upcomingSessions, followUpPatients, activeBehaviorAlerts, progressTrend } = dashboard;

    const stats = [
        { label: "إجمالي المرضى", value: kpis.totalPatients, icon: Users, tone: "from-blue-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600" },
        { label: "جلسات اليوم", value: kpis.todaySessions, icon: CalendarClock, tone: "from-sky-400 to-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
        { label: "الخطط النشطة", value: kpis.activePlans, icon: Target, tone: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600" },
        { label: "الأهداف المتقنة", value: kpis.masteredGoals, icon: Flag, tone: "from-orange-400 to-amber-500", bg: "bg-orange-50", text: "text-orange-600" },
        { label: "نسبة الحضور", value: `${kpis.attendanceRate}%`, icon: Activity, tone: "from-purple-400 to-violet-500", bg: "bg-purple-50", text: "text-purple-600" },
        { label: "التقدم العام", value: `${kpis.overallProgress}%`, icon: TrendingUp, tone: "from-rose-400 to-red-500", bg: "bg-rose-50", text: "text-rose-600" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">لوحة متابعة المركز</h1>
                        <p className="text-slate-500 mt-1.5 font-medium">نظرة شاملة ومحدثة لحالة المرضى، الجلسات، والخطط العلاجية.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm shadow-indigo-200">
                        <span>تحديث البيانات</span>
                        <Activity size={18} />
                    </button>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className="p-5 relative overflow-hidden group">
                                <div
                                    className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.tone} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}></div>
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.text}`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                                        <div className="text-sm font-semibold text-slate-500">{stat.label}</div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Main Content Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Chart & Follow-ups) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart Panel */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">معدل التقدم العام (6 أشهر)</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">متوسط استجابة المرضى للخطط العلاجية</p>
                                </div>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <TrendingUp size={24} />
                                </div>
                            </div>

                            <div className="flex items-end justify-between gap-2 h-64 border-b-2 border-slate-100 pb-2 px-2">
                                {progressTrend.map((point) => (
                                    <div key={point.label} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform translate-y-2 group-hover:translate-y-0">
                                            {point.value}%
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full max-w-[3.5rem] rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500 shadow-sm group-hover:opacity-80"
                                            style={{ height: `${point.value}%` }}
                                        />
                                        <div className="text-sm font-bold text-slate-500 mt-4">{point.label}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Follow-up Patients Panel */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">مرضى يحتاجون مراجعة</h2>
                                </div>
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">عرض الكل</button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {followUpPatients.map((patient) => (
                                    <div key={patient.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="font-bold text-slate-800 text-lg">{patient.name}</div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${patient.attendanceRate < 80 ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`}>
                                                حضور {patient.attendanceRate}%
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 font-semibold">
                                                <span className="text-slate-500">نسبة التقدم</span>
                                                <span className="text-indigo-700">{patient.progress}%</span>
                                            </div>
                                            <ProgressBar progress={patient.progress} colorClass={patient.progress < 30 ? "bg-rose-500" : "bg-indigo-500"} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column (Sessions & Alerts) */}
                    <div className="space-y-6">
                        {/* Upcoming Sessions Panel */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <CalendarClock size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">الجلسات القادمة</h2>
                            </div>

                            <div className="space-y-3">
                                {upcomingSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{session.patientName}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-semibold">
                                                    <Clock size={14} className="text-slate-400" />
                                                    <span>{session.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${session.color}`}>{session.type}</span>
                                            <ChevronLeft size={16} className="text-slate-300 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                عرض الجدول الكامل
                            </button>
                        </Card>

                        {/* Behavior Alerts Panel */}
                        <Card className="p-6 border-l-4 border-l-rose-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                    <ShieldAlert size={24} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">تنبيهات السلوك</h2>
                            </div>

                            <div className="space-y-3">
                                {activeBehaviorAlerts.map((alert, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <HeartPulse size={16} className="text-rose-600" />
                                            <span className="font-extrabold text-slate-900">{alert.patientName}</span>
                                            {alert.severity === "high" && <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold mr-auto">عالي</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {alert.behaviors.map((behavior, bIdx) => (
                                                <span key={bIdx} className="text-xs font-bold bg-white text-rose-700 px-2.5 py-1 rounded-lg shadow-sm">
                                                    {behavior}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
