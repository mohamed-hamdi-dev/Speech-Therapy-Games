import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const DATA = [
    {
        id: "g1",
        title: "الصف 3 الفصل 2 املاء",
        countLabel: "4 الأهداف الطويلة",
        children: [
            { id: "g1-1", title: "الدرس 4 - التلوين (تلوين الفتح، تلوين الضم، تلوين الكسر)", countLabel: "4 الأهداف القصيرة" },
            { id: "g1-2", title: "الدرس 3 - المد بالواو والمد بالياء والمد بالألف والفرق بينها وبين الحركات", countLabel: "10 الأهداف القصيرة" },
            { id: "g1-3", title: "الدرس 2 - الحركات (الفتحة، الضمة، الكسرة) والسكون والشدة", countLabel: "5 الأهداف القصيرة" },
            { id: "g1-4", title: "الدرس 1 - تدريبات تنشيطية", countLabel: "8 الأهداف القصيرة" },
        ],
    },
    {
        id: "g2",
        title: "الصف 3 الفصل 1 املاء",
        countLabel: "4 الأهداف الطويلة",
        children: [
            { id: "g2-1", title: "ص-3 ف 2 تربية أسرية", countLabel: "2 الأهداف الطويلة" },
            { id: "g2-2", title: "ص-3 ف 1 تربية أسرية", countLabel: "3 الأهداف الطويلة" },
            { id: "g2-3", title: "ص-2 ف 2 تربية أسرية", countLabel: "3 الأهداف الطويلة" },
        ],
    },
    {
        id: "g3",
        title: "ص-3 ف 2 رياضيات",
        countLabel: "6 الأهداف الطويلة",
        children: [
            { id: "g3-1", title: "ص-3 ف 1 رياضيات", countLabel: "4 الأهداف الطويلة" },
            { id: "g3-2", title: "ص-2 ف2 رياضيات", countLabel: "7 الأهداف الطويلة" },
            { id: "g3-3", title: "ص-2 ف1 رياضيات", countLabel: "6 الأهداف الطويلة" },
        ],
    },
];

const Row = ({ title, countLabel, open, onToggle, isChild = false, connectorWidth = 18 }) => {
    // حساب مسافات التموضع للخطوط والنقاط
    const rightOffset = -connectorWidth;
    const circleSize = 7;
    const circleOffset = rightOffset - circleSize / 2;

    return (
        <div className="flex items-center gap-3 relative z-10 w-full group">
            {/* الخط الأفقي المتقطع */}
            <div
                className="absolute top-1/2 border-b-[1.5px] border-dashed border-[#94a3b8] z-0 transition-colors duration-300"
                style={{ right: `${rightOffset}px`, width: `${connectorWidth}px`, transform: "translateY(-50%)" }}
            />

            {/* الدائرة الدقيقة عند بداية الخط */}
            <div
                className="absolute top-1/2 rounded-full border-[1.5px] border-[#94a3b8] bg-white z-10 transition-colors duration-300"
                style={{ right: `${circleOffset}px`, width: `${circleSize}px`, height: `${circleSize}px`, transform: "translateY(-50%)" }}
            />

            {/* زر الفتح والإغلاق */}
            <button
                type="button"
                onClick={onToggle}
                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-all duration-300 shadow-sm relative z-20 ${
                    open ? "bg-[#18b29e] hover:bg-[#149988]" : "bg-[#5f76b3] hover:bg-[#4d629a]"
                }`}>
                {open ? <ChevronUp size={20} strokeWidth={2.5} /> : <ChevronDown size={20} strokeWidth={2.5} />}
            </button>

            {/* محتوى الصف */}
            <div
                className={`flex-1 rounded-xl border border-slate-200/60 shadow-sm transition-all duration-300 relative z-20 ${
                    isChild ? "bg-white hover:border-emerald-200" : "bg-[#f8f9fb] hover:border-indigo-200"
                } px-5 py-3`}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div className="text-right text-[15px] font-bold text-slate-800">{title}</div>
                    <div className="text-right text-[14px] font-medium text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-lg">{countLabel}</div>
                </div>
            </div>
        </div>
    );
};

const CurriculumPage = () => {
    const [openGroups, setOpenGroups] = useState(() => new Set(["g1"]));
    const [openChildren, setOpenChildren] = useState(() => new Set());

    // تحميل خط Cairo برمجياً
    useEffect(() => {
        if (!document.getElementById("cairo-font")) {
            const link = document.createElement("link");
            link.id = "cairo-font";
            link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap";
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    }, []);

    const rowsCount = useMemo(() => {
        let total = DATA.length;
        DATA.forEach((g) => {
            if (openGroups.has(g.id)) total += g.children.length;
        });
        return total;
    }, [openGroups]);

    const toggleGroup = (id) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleChild = (id) => {
        setOpenChildren((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div dir="rtl" className="min-h-screen  p-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 max-w-5xl mx-auto">
                {/* التبويبات الرئيسية */}
                <div className="flex items-center justify-start gap-8 px-4 pb-0 border-b-2 border-slate-100 mb-8 mt-2">
                    <button className="text-[17px] font-bold text-[#2a3b6e] border-b-[3px] border-[#18b29e] pb-3 -mb-[2px] transition-colors">الجوانب</button>
                    <button className="text-[17px] font-semibold text-slate-400 hover:text-slate-600 pb-3 transition-colors">الجوانب المؤرشفة</button>
                </div>

                {/* الحاوية الرئيسية للشجرة */}
                <div className="relative pr-[26px] space-y-4">
                    {/* الخط العمودي الرئيسي للمستوى الأول */}
                    <div className="absolute right-[8px] top-[24px] bottom-[24px] border-r-[1.5px] border-dashed border-[#94a3b8] z-0" />

                    {DATA.map((group) => {
                        const isOpen = openGroups.has(group.id);
                        return (
                            <div key={group.id} className="relative z-10">
                                {/* صف الأب */}
                                <Row title={group.title} countLabel={group.countLabel} open={isOpen} onToggle={() => toggleGroup(group.id)} connectorWidth={18} />

                                {/* الحاوية الفرعية للأبناء */}
                                {isOpen && (
                                    <div className="relative pr-[46px] mt-4 mb-3 space-y-3">
                                        {/* الخط العمودي للمستوى الثاني (ينزل من منتصف زر الأب) */}
                                        <div className="absolute right-[20px] top-[-36px] bottom-[24px] border-r-[1.5px] border-dashed border-[#94a3b8] z-0" />

                                        {/* تبويبات الأهداف الخاصة بالمجموعة */}
                                        <div className="flex items-center justify-start gap-6 px-3 py-1 mb-4 relative z-10">
                                            <button className="text-[15px] font-bold text-[#2a3b6e] border-b-[3px] border-[#18b29e] pb-2 transition-colors">الأهداف الطويلة</button>
                                            <button className="text-[15px] font-semibold text-slate-400 hover:text-slate-600 pb-2 transition-colors">الأهداف الطويلة المؤرشفة</button>
                                        </div>

                                        {/* قائمة الأبناء */}
                                        {group.children.map((child) => {
                                            const childOpen = openChildren.has(child.id);
                                            return (
                                                <div key={child.id} className="relative z-10 space-y-2">
                                                    <Row title={child.title} countLabel={child.countLabel} open={childOpen} onToggle={() => toggleChild(child.id)} isChild connectorWidth={26} />

                                                    {/* محتوى تفصيلي للابن عند فتحه */}
                                                    {childOpen && (
                                                        <div className="mr-[56px] rounded-xl bg-slate-50 border border-slate-200 p-5 text-right text-slate-600 font-medium shadow-inner relative z-20">
                                                            <p className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                                                                يمكن عرض تفاصيل إضافية لهذا الهدف هنا.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default CurriculumPage;
