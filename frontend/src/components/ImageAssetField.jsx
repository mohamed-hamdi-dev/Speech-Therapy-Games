import React, { useEffect, useMemo, useState } from 'react';
import {
  BookmarkPlus,
  FolderOpen,
  ImagePlus,
  LoaderCircle,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import imageService from '../services/imageService';

const QUICK_SEARCH_SUGGESTIONS = ['apple', 'cat', 'fish', 'banana', 'spoon', 'car'];

const deriveCategory = (query) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  return normalized.split(/\s+/)[0] || '';
};

const getAdminToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const rawSession = window.localStorage.getItem('therapy_admin_session');
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;
    return parsedSession?.token || '';
  } catch {
    return '';
  }
};

const getFriendlyErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.message || fallback;
  const normalizedMessage = String(message);

  if (normalizedMessage.includes('Route not found')) {
    return 'الخدمة غير متاحة الآن. أعد تشغيل الـ backend ثم جرّب مرة أخرى.';
  }

  if (normalizedMessage.includes('Pixabay search failed')) {
    return 'تعذر البحث من Pixabay الآن. جرّب Pexels.';
  }

  if (normalizedMessage.includes('Pexels search failed')) {
    return 'تعذر البحث من Pexels الآن. جرّب مرة أخرى بعد قليل.';
  }

  return message;
};

const ImageResultCard = ({
  image,
  onSelect,
  onSave,
  onDelete,
  saving = false,
  deleting = false,
  selected = false,
  showSave = false,
  showDelete = false,
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-[1.4rem] border p-3 bg-white transition-all cursor-pointer ${
        selected ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-[#dbe7f3] hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="aspect-square rounded-[1.2rem] bg-white border border-slate-100 overflow-hidden mb-3 flex items-center justify-center">
        {hasImageError ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,_#ffffff,_#f5faff)] px-4 text-center text-xs font-bold text-slate-400">
            لم يتم عرض الصورة
          </div>
        ) : (
          <img
            src={image.thumbnail || image.url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setHasImageError(true)}
            className="w-full h-full object-contain bg-white p-2"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className="flex-1 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-black hover:bg-blue-700 transition-colors"
        >
          اختيار
        </button>

        {(showSave || showDelete) && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (showDelete) {
                onDelete();
                return;
              }

              onSave();
            }}
            disabled={saving || deleting}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
              showDelete
                ? 'border-red-100 text-red-600 hover:bg-red-50'
                : 'border-[#dbe7f3] text-slate-700 hover:bg-[#f7fbff]'
            }`}
            title={showDelete ? 'حذف من المكتبة' : 'احفظ الصورة'}
          >
            {saving || deleting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : showDelete ? (
              <Trash2 size={16} />
            ) : (
              <BookmarkPlus size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const ImageAssetField = ({
  label,
  value,
  onSelect,
  initialQuery = '',
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [libraryResults, setLibraryResults] = useState([]);
  const [fileResults, setFileResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [savingUrl, setSavingUrl] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchNotice, setSearchNotice] = useState('');

  const selectedPreview = useMemo(
    () => (value ? { url: value, thumbnail: value } : null),
    [value]
  );

  const loadLibrary = async (query = '') => {
    try {
      setLoadingLibrary(true);
      setSearchError('');
      setSearchNotice('');
      const response = await imageService.getLibrary('', { query });
      setLibraryResults(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر تحميل المكتبة.'));
    } finally {
      setLoadingLibrary(false);
    }
  };

  const loadFiles = async (query = '') => {
    try {
      setLoadingFiles(true);
      setSearchError('');
      setSearchNotice('');
      const response = await imageService.getUploadedFiles(getAdminToken(), { query });
      setFileResults(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر تحميل الملفات.'));
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    if (activeTab === 'library') {
      loadLibrary(searchQuery);
    }

    if (activeTab === 'files') {
      loadFiles(searchQuery);
    }
  }, [activeTab, panelOpen]);

  useEffect(() => {
    if (!panelOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [panelOpen]);

  useEffect(() => {
    if (activeTab !== 'search') {
      return;
    }

    setSearchResults([]);
    setSearchError('');
    setSearchNotice('');
  }, [searchQuery, activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoadingSearch(true);
      setSearchError('');
      setSearchNotice('');
      const response = await imageService.searchImages('', searchQuery.trim(), 'pexels');
      const normalizedResults = Array.isArray(response) ? response : [];

      setSearchResults(normalizedResults);
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر البحث عن الصور.'));
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSave = async (image) => {
    try {
      setSavingUrl(image.url);
      setSearchError('');
      setSearchNotice('');
      await imageService.saveToLibrary('', {
        url: image.url,
        thumbnail: image.thumbnail,
        source: image.source,
        category: deriveCategory(searchQuery),
      });

      if (activeTab === 'library') {
        await loadLibrary(searchQuery);
      }
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر حفظ الصورة في المكتبة.'));
    } finally {
      setSavingUrl('');
    }
  };

  const handleDelete = async (image) => {
    try {
      setDeletingId(image.id);
      setSearchError('');
      setSearchNotice('');
      await imageService.deleteFromLibrary('', image.id);
      await loadLibrary(searchQuery);

      if (value === image.url) {
        onSelect('');
      }
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر حذف الصورة من المكتبة.'));
    } finally {
      setDeletingId('');
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploadingFile(true);
      setSearchError('');
      setSearchNotice('');
      const response = await imageService.uploadImageFile(getAdminToken(), file);
      const uploadedUrl = response?.url || '';

      if (uploadedUrl) {
        onSelect(uploadedUrl);
      }

      await loadFiles(searchQuery);
      setActiveTab('files');
    } catch (error) {
      setSearchError(getFriendlyErrorMessage(error, 'تعذر رفع الصورة.'));
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const currentResults =
    activeTab === 'search' ? searchResults : activeTab === 'library' ? libraryResults : fileResults;

  return (
    <div className="space-y-3">
      <label className="block font-bold text-slate-700">{label}</label>

      <div className="w-full max-w-md h-40 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] p-3 flex items-center justify-center overflow-hidden">
        {selectedPreview ? (
          <img src={selectedPreview.url} alt={label} className="w-full h-full object-contain rounded-[1rem]" />
        ) : (
          <div className="w-full h-full rounded-[1rem] border-2 border-dashed border-[#b8deec] bg-[linear-gradient(180deg,_#f7fbff,_#eef8fb)] flex items-center justify-center text-[#138fbc]">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-[#cfe3f3] bg-white/90 shadow-sm">
              <ImagePlus size={28} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setPanelOpen((current) => !current);
            setActiveTab('search');
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] px-4 py-3 font-bold text-slate-700 hover:bg-white transition-colors"
        >
          <Search size={18} />
          <span>بحث عن صورة</span>
        </button>

        <label className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] px-4 py-3 font-bold text-slate-700 cursor-pointer hover:bg-white transition-colors">
          {uploadingFile ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
          <span>{uploadingFile ? 'جارٍ الرفع...' : 'رفع صورة'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 font-bold text-red-600 hover:bg-red-100 transition-colors"
          >
            <X size={18} />
            <span>إزالة الصورة</span>
          </button>
        )}
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-[120]">
          <button
            type="button"
            aria-label="إغلاق مكتشف الصور"
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
          />

          <div className="absolute inset-x-4 top-6 bottom-6 md:inset-x-10 lg:left-1/2 lg:right-auto lg:w-[min(1100px,calc(100vw-5rem))] lg:-translate-x-1/2">
            <div className="flex h-full flex-col rounded-[2rem] border border-[#dbe7f3] bg-[linear-gradient(180deg,_#ffffff,_#fbfdff)] shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden">
              <div className="flex items-start justify-between gap-4 border-b border-[#e7eef8] px-5 py-5 md:px-7">
                <div>
                  <div className="text-xl font-black text-slate-900">مكتشف الصور</div>
                  <div className="text-sm text-slate-500 mt-1">اختر صورة من الإنترنت أو المكتبة أو ملفاتك الحالية.</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-full bg-[#eef4ff] p-1 gap-1 self-start">
                    <button
                      type="button"
                      onClick={() => setActiveTab('search')}
                      className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
                        activeTab === 'search' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('library');
                        loadLibrary(searchQuery);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
                        activeTab === 'library' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      Library
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('files');
                        loadFiles(searchQuery);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
                        activeTab === 'files' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      Files
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dbe7f3] bg-white text-slate-600 hover:bg-[#f7fbff] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6 space-y-5">
                <div className="rounded-[1.6rem] border border-[#dbe7f3] bg-white p-3 md:p-4 space-y-4">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        dir="ltr"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && activeTab === 'search' && searchQuery.trim() && !loadingSearch) {
                            event.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder={activeTab === 'search' ? 'apple أو تفاحة' : 'search files'}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {activeTab === 'search' && (
                      <button
                        type="button"
                        onClick={() => handleSearch()}
                        disabled={loadingSearch || !searchQuery.trim()}
                        className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingSearch ? 'جارٍ البحث...' : 'ابحث الآن'}
                      </button>
                    )}

                    {activeTab === 'library' && (
                      <button
                        type="button"
                        onClick={() => loadLibrary(searchQuery)}
                        disabled={loadingLibrary}
                        className="rounded-2xl bg-slate-700 text-white px-5 py-3 font-black hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingLibrary ? 'جارٍ التحميل...' : 'تحديث المكتبة'}
                      </button>
                    )}

                    {activeTab === 'files' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] px-4 py-3 font-black text-slate-700 cursor-pointer hover:bg-white transition-colors">
                          {uploadingFile ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
                          <span>{uploadingFile ? 'جارٍ الرفع...' : 'رفع صورة'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        </label>
                        <button
                          type="button"
                          onClick={() => loadFiles(searchQuery)}
                          disabled={loadingFiles}
                          className="rounded-2xl bg-slate-700 text-white px-5 py-3 font-black hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingFiles ? 'جارٍ التحميل...' : 'تحديث الملفات'}
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'search' && (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm font-black text-slate-600">Provider</div>
                        <div className="inline-flex rounded-full bg-[#eef4ff] p-1 gap-1">
                          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm">
                            Pexels
                            <span className="ms-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">Best</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {QUICK_SEARCH_SUGGESTIONS.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setSearchQuery(term)}
                            className="rounded-full border border-[#dbe7f3] bg-[#f7fbff] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[#d9ecf7] bg-[linear-gradient(180deg,_#fafdff,_#f3f9ff)] px-4 py-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#138fbc] shadow-sm shadow-sky-100/70">
                          <Sparkles size={14} className="shrink-0" />
                          <span>تحسين تلقائي للبحث</span>
                        </div>
                        <div className="text-sm font-bold text-slate-600">
                          لو كتبت عربي مثل <span className="rounded-full bg-white px-2 py-1 text-[#138fbc] shadow-sm">تفاحة</span> أو <span className="rounded-full bg-white px-2 py-1 text-[#138fbc] shadow-sm">قطة</span> سنحوّله تلقائيًا إلى بحث إنجليزي بخلفية بيضاء.
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'files' && (
                    <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#dbe7f3] bg-[#f8fbff] px-4 py-3 text-sm font-bold text-slate-600">
                      <FolderOpen size={16} className="text-[#138fbc]" />
                      تبويب Files يعرض الصور التي رفعتها من الجهاز إلى مجلد المشروع `uploads`.
                    </div>
                  )}
                </div>

                {searchError && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-bold text-red-600">
                    {searchError}
                  </div>
                )}

                {searchNotice && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-bold text-amber-700">
                    {searchNotice}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentResults.map((image) => (
                    <ImageResultCard
                      key={image.id || `${image.url}-${image.thumbnail}`}
                      image={image}
                      onSelect={() => onSelect(image.url)}
                      onSave={() => handleSave(image)}
                      onDelete={() => handleDelete(image)}
                      saving={savingUrl === image.url}
                      deleting={deletingId === image.id}
                      showSave={activeTab === 'search'}
                      showDelete={activeTab === 'library'}
                      selected={value === image.url}
                    />
                  ))}
                </div>

                {activeTab === 'search' && !loadingSearch && searchResults.length === 0 && !searchError && !searchNotice && (
                  <div className="rounded-2xl border border-dashed border-[#dbe7f3] bg-[#f7fbff] px-4 py-8 text-center text-slate-500 font-bold">
                    اكتب وصفًا بالعربي أو الإنجليزي ثم ابحث لعرض صور مناسبة للأطفال.
                  </div>
                )}

                {activeTab === 'library' && !loadingLibrary && libraryResults.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#dbe7f3] bg-[#f7fbff] px-4 py-8 text-center text-slate-500 font-bold">
                    لا توجد صور محفوظة بعد. احفظ صورًا من تبويب Search لتظهر هنا.
                  </div>
                )}

                {activeTab === 'files' && !loadingFiles && fileResults.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#dbe7f3] bg-[#f7fbff] px-4 py-8 text-center text-slate-500 font-bold">
                    لا توجد صور مرفوعة بعد. ارفع صورة من جهازك لتظهر هنا مباشرة.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAssetField;
