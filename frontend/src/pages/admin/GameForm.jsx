import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ImagePlus, LoaderCircle, Plus, Save, Trash2, Upload } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const API_BASE = 'http://localhost:5000/api';

const createOption = () => ({
  id: Date.now() + Math.random(),
  textAr: '',
  text: '',
  image: '',
  isCorrect: false,
});

const createDragItem = () => ({
  id: Date.now() + Math.random(),
  image: '',
  isCorrect: false,
});

const baseGame = {
  title: '',
  titleAr: '',
  type: 'listen_choose',
  level: 1,
  questionText: '',
  questionTextAr: '',
  questionAudio: '',
  instructionText: '',
  instructionAudio: '',
  targetImage: '',
  successSound: '',
  failSound: '',
  options: [createOption(), createOption()],
  items: [createDragItem(), createDragItem()],
};

const getAdminSession = () => {
  try {
    return JSON.parse(localStorage.getItem('therapy_admin_session') || 'null');
  } catch {
    return null;
  }
};

const getAuthConfig = () => {
  const adminSession = getAdminSession();
  const token = adminSession?.token;

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/upload`, formData, getAuthConfig());
  return response.data.url;
};

const uploadMultipleAssets = async (files) =>
  Promise.all(Array.from(files).map((file) => uploadAsset(file)));

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data?.message || error?.response?.data?.error;
  const statusCode = error?.response?.status;

  if (responseMessage && statusCode) {
    return `${fallbackMessage}\n(${statusCode}) ${responseMessage}`;
  }

  if (responseMessage) {
    return `${fallbackMessage}\n${responseMessage}`;
  }

  if (error?.message) {
    return `${fallbackMessage}\n${error.message}`;
  }

  return fallbackMessage;
};

const FileUploadField = ({
  label,
  value,
  onUploaded,
  accept = 'image/*,audio/*',
  previewType = 'auto',
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await uploadAsset(file);
      onUploaded(uploadedUrl);
    } catch (error) {
      console.error(`Error uploading ${label}:`, error);
      window.alert(getApiErrorMessage(error, 'حدث خطأ أثناء رفع الملف'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const resolvedPreviewType =
    previewType === 'auto'
      ? value.match(/\.(mp3|wav|ogg|m4a)$/i)
        ? 'audio'
        : 'image'
      : previewType;

  return (
    <div className="space-y-3">
      <label className="block font-bold text-slate-700">{label}</label>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] px-4 py-3 font-bold text-slate-700 cursor-pointer hover:bg-white transition-colors">
          {uploading ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
          <span>{uploading ? 'جاري الرفع...' : 'رفع ملف'}</span>
          <input type="file" accept={accept} className="hidden" onChange={handleFileChange} />
        </label>

        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(event) => onUploaded(event.target.value)}
          placeholder="أو ضعي رابط الملف مباشرة"
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {value && resolvedPreviewType === 'image' && (
        <img src={value} alt={label} className="w-24 h-24 object-cover rounded-2xl border border-slate-200" />
      )}

      {value && resolvedPreviewType === 'audio' && <audio controls src={value} className="w-full" />}
    </div>
  );
};

const GameForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [formData, setFormData] = useState(baseGame);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [bulkUploadingOptions, setBulkUploadingOptions] = useState(false);
  const [bulkUploadingItems, setBulkUploadingItems] = useState(false);

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isEdit) return;

    const fetchGame = async () => {
      try {
        const response = await axios.get(`${API_BASE}/games/${gameId}`);
        const game = response.data;
        setFormData({
          ...baseGame,
          ...game,
          options: game.options?.length ? game.options : [createOption(), createOption()],
          items: game.items?.length ? game.items : [createDragItem(), createDragItem()],
        });
      } catch (error) {
        console.error('Error fetching game for edit:', error);
        window.alert(getApiErrorMessage(error, 'تعذر تحميل بيانات اللعبة'));
        navigate('/admin/games');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId, isEdit, navigate]);

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const updateOption = (index, key, value) => {
    setFormData((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option
      ),
    }));
  };

  const updateDragItem = (index, key, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addOption = () => updateField('options', [...formData.options, createOption()]);
  const addDragItem = () => updateField('items', [...formData.items, createDragItem()]);

  const removeOption = (index) =>
    updateField(
      'options',
      formData.options.filter((_, optionIndex) => optionIndex !== index)
    );

  const removeDragItem = (index) =>
    updateField(
      'items',
      formData.items.filter((_, itemIndex) => itemIndex !== index)
    );

  const handleBulkOptionImages = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setBulkUploadingOptions(true);
      const urls = await uploadMultipleAssets(files);
      updateField('options', [
        ...formData.options,
        ...urls.map((url) => ({
          ...createOption(),
          image: url,
        })),
      ]);
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'حدث خطأ أثناء رفع صور الاختيارات'));
    } finally {
      setBulkUploadingOptions(false);
      event.target.value = '';
    }
  };

  const handleBulkDragImages = async (event) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setBulkUploadingItems(true);
      const urls = await uploadMultipleAssets(files);
      updateField('items', [
        ...formData.items,
        ...urls.map((url) => ({
          ...createDragItem(),
          image: url,
        })),
      ]);
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'حدث خطأ أثناء رفع صور العناصر'));
    } finally {
      setBulkUploadingItems(false);
      event.target.value = '';
    }
  };

  const buildPayload = () => {
    if (formData.type === 'listen_choose') {
      return {
        title: formData.title.trim() || formData.titleAr.trim(),
        titleAr: formData.titleAr.trim(),
        type: formData.type,
        level: Number(formData.level),
        questionText: formData.questionText.trim() || formData.questionTextAr.trim(),
        questionTextAr: formData.questionTextAr.trim(),
        questionAudio: formData.questionAudio.trim(),
        successSound: formData.successSound.trim(),
        failSound: formData.failSound.trim(),
        options: formData.options.map((option, index) => ({
          id: option.id || index + 1,
          text: option.text.trim() || option.textAr.trim(),
          textAr: option.textAr.trim(),
          image: option.image.trim(),
          isCorrect: option.isCorrect,
        })),
      };
    }

    return {
      title: formData.title.trim() || formData.titleAr.trim(),
      titleAr: formData.titleAr.trim(),
      type: formData.type,
      level: Number(formData.level),
      instructionText: formData.instructionText.trim() || formData.questionTextAr.trim(),
      instructionAudio: formData.instructionAudio.trim(),
      targetImage: formData.targetImage.trim(),
      successSound: formData.successSound.trim(),
      failSound: formData.failSound.trim(),
      items: formData.items.map((item, index) => ({
        id: item.id || index + 1,
        image: item.image.trim(),
        isCorrect: item.isCorrect,
      })),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = buildPayload();
      const authConfig = getAuthConfig();

      if (isEdit) {
        await axios.put(`${API_BASE}/games/${gameId}`, payload, authConfig);
      } else {
        await axios.post(`${API_BASE}/games`, payload, authConfig);
      }

      navigate('/admin/games');
    } catch (error) {
      console.error('Error saving game:', error);
      window.alert(getApiErrorMessage(error, 'حدث خطأ أثناء حفظ اللعبة'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xl font-bold">جاري تحميل بيانات اللعبة...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/games')} className="!py-2 !text-sm">
          <ArrowRight size={20} />
          <span>إلغاء</span>
        </Button>
        <h2 className="text-3xl font-black text-slate-900">
          {isEdit ? 'تعديل اللعبة' : 'إضافة لعبة جديدة'}
        </h2>
        <div className="w-24" />
      </div>

      <Card className="p-8 rounded-[2rem]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-bold mb-2">اسم اللعبة بالعربي</label>
              <input
                type="text"
                value={formData.titleAr}
                onChange={(event) => updateField('titleAr', event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="مثال: اسمع واختار"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">اسم اللعبة بالإنجليزي</label>
              <input
                type="text"
                dir="ltr"
                value={formData.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="Listen and Choose"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">المستوى</label>
              <select
                value={formData.level}
                onChange={(event) => updateField('level', event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none bg-white"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">نوع اللعبة</label>
              <select
                value={formData.type}
                onChange={(event) => updateField('type', event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none bg-white"
              >
                <option value="listen_choose">اسمع واختر الصورة</option>
                <option value="action_drag_drop">السحب والإفلات</option>
              </select>
            </div>
          </div>

          {formData.type === 'listen_choose' ? (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-2">نص السؤال بالعربي</label>
                  <input
                    type="text"
                    value={formData.questionTextAr}
                    onChange={(event) => updateField('questionTextAr', event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="مثال: وريني الوردة"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-2">نص السؤال بالإنجليزي</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.questionText}
                    onChange={(event) => updateField('questionText', event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Show me the flower"
                  />
                </div>
              </div>

              <FileUploadField
                label="صوت السؤال"
                value={formData.questionAudio}
                onUploaded={(value) => updateField('questionAudio', value)}
                accept="audio/*"
                previewType="audio"
              />

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="text-2xl font-black text-slate-900">صور الاختيارات</h3>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#eef4ff] px-4 py-2.5 font-bold text-blue-700 cursor-pointer hover:bg-white transition-colors">
                      {bulkUploadingOptions ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <ImagePlus size={18} />
                      )}
                      <span>{bulkUploadingOptions ? 'جاري رفع الصور...' : 'إضافة عدة صور'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleBulkOptionImages}
                      />
                    </label>

                    <Button type="button" variant="outline" onClick={addOption} className="!py-2 !px-4">
                      <Plus size={18} />
                      <span>إضافة اختيار</span>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-800">اختيار {index + 1}</h4>
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={option.textAr}
                          onChange={(event) => updateOption(index, 'textAr', event.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                          placeholder="اسم الصورة بالعربي"
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={option.text}
                          onChange={(event) => updateOption(index, 'text', event.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                          placeholder="Name in English"
                        />
                      </div>

                      <FileUploadField
                        label="صورة الاختيار"
                        value={option.image}
                        onUploaded={(value) => updateOption(index, 'image', value)}
                        accept="image/*"
                        previewType="image"
                      />

                      <label className="flex items-center gap-2 font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(event) => updateOption(index, 'isCorrect', event.target.checked)}
                        />
                        <span>هذه هي الإجابة الصحيحة</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-2">تعليمات اللعبة</label>
                  <input
                    type="text"
                    value={formData.instructionText}
                    onChange={(event) => updateField('instructionText', event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="مثال: اجعل الطفل يشم الوردة"
                  />
                </div>
              </div>

              <FileUploadField
                label="صوت التعليمات"
                value={formData.instructionAudio}
                onUploaded={(value) => updateField('instructionAudio', value)}
                accept="audio/*"
                previewType="audio"
              />

              <FileUploadField
                label="الصورة العليا / الصورة الهدف"
                value={formData.targetImage}
                onUploaded={(value) => updateField('targetImage', value)}
                accept="image/*"
                previewType="image"
              />

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="text-2xl font-black text-slate-900">صور المقارنة / السحب</h3>
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#eef4ff] px-4 py-2.5 font-bold text-blue-700 cursor-pointer hover:bg-white transition-colors">
                      {bulkUploadingItems ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <ImagePlus size={18} />
                      )}
                      <span>{bulkUploadingItems ? 'جاري رفع الصور...' : 'إضافة عدة صور'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleBulkDragImages}
                      />
                    </label>

                    <Button type="button" variant="outline" onClick={addDragItem} className="!py-2 !px-4">
                      <Plus size={18} />
                      <span>إضافة صورة</span>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-800">صورة {index + 1}</h4>
                        {formData.items.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeDragItem(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <FileUploadField
                        label="صورة العنصر"
                        value={item.image}
                        onUploaded={(value) => updateDragItem(index, 'image', value)}
                        accept="image/*"
                        previewType="image"
                      />

                      <label className="flex items-center gap-2 font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={item.isCorrect}
                          onChange={(event) => updateDragItem(index, 'isCorrect', event.target.checked)}
                        />
                        <span>هذه هي الصورة الصحيحة</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <FileUploadField
              label="صوت الإجابة الصحيحة"
              value={formData.successSound}
              onUploaded={(value) => updateField('successSound', value)}
              accept="audio/*"
              previewType="audio"
            />

            <FileUploadField
              label="صوت الإجابة الخاطئة"
              value={formData.failSound}
              onUploaded={(value) => updateField('failSound', value)}
              accept="audio/*"
              previewType="audio"
            />
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6 flex justify-end">
            <Button variant="primary" type="submit" disabled={saving} className="!py-3 !px-8">
              {saving ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : isEdit ? (
                <Save size={20} />
              ) : (
                <Plus size={20} />
              )}
              <span>{saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'حفظ اللعبة'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default GameForm;
