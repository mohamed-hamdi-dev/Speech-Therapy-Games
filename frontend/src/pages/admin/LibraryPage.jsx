import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import { mockLibraryItems } from '../../data/patientWorkspaceMock';

const LibraryPage = () => {
  return (
    <section className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
          <BookOpenCheck className="text-blue-700" />
          المكتبة العلاجية
        </h1>
        <p className="text-slate-600 mt-2">مكتبة مؤقتة للأنشطة والقوالب لحين ربط الـbackend.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockLibraryItems.map((item) => (
          <article key={item.id} className="bg-white border border-slate-200 rounded-[1.4rem] p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">{item.title}</h2>
            <p className="text-slate-500 mt-2">التصنيف: {item.category}</p>
            <div className="mt-4 inline-flex rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-bold">
              المستوى: {item.level}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LibraryPage;
