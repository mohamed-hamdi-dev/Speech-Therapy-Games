import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ImageAssetField from '../../components/ImageAssetField';
import { gameService } from '../../services/gameService';
import { useTherapyStore } from '../../hooks/useTherapyStore';
import { SOUND_PRESET_OPTIONS, playAudioUrl } from '../../utils/soundEffects';
import {
  buildActivityRuntimeGame,
  createEmptyBuilderConfig,
  getDefaultActivityForType,
  normalizeBuilderConfig,
} from '../../games/adapters/buildActivityPreviewGame';
import renderGameActivity from '../../games/renderGameActivity';

const GAME_TYPE_CARDS = [
  {
    value: 'matching.similar',
    title: 'الصورة المطابقة',
    description: 'صورة رئيسية في السؤال وتحتها اختيارات يختار منها الطفل الصورة المطابقة.',
    accent: 'from-blue-100 to-cyan-100',
  },
  {
    value: 'matching.different',
    title: 'أوجد المختلف',
    description: 'صورة رئيسية في السؤال ومعها اختياران أو أكثر يختار منها الطفل الصورة المختلفة. مثال: قطة كبيرة وفوق الاختيارات قطة وكلب.',
    accent: 'from-amber-100 to-orange-100',
  },
  {
    value: 'matching.find',
    title: 'أوجد الصورة',
    description: 'بدون صورة رئيسية فوق. يسمع الطفل التعليمات مثل: أوجد القطة، ثم يختار من 2 أو 3 أو 4 أو 6 صور.',
    accent: 'from-fuchsia-100 to-pink-100',
  },
  {
    value: 'sequence.order',
    title: 'ترتيب الصور',
    description: 'صور خطوات يعيد الطفل ترتيبها بالسحب.',
    accent: 'from-emerald-100 to-lime-100',
  },
  {
    value: 'action.drag_to_target',
    title: 'السحب والإفلات',
    description: 'مشهد ثابت في المنتصف والعناصر تُسحب إلى المكان الصحيح داخل الصورة.',
    accent: 'from-rose-100 to-orange-100',
  },
  {
    value: 'navigation.move_to_target',
    title: 'التحريك بالأزرار',
    description: 'تحريك عنصر خطوة بخطوة باستخدام الأسهم حتى يصل إلى الهدف.',
    accent: 'from-violet-100 to-sky-100',
  },
];

const EMPTY_MESSAGE = 'ارفع الملف أو اتركه فارغًا مؤقتًا';
const getActivityAutoTitle = (index) => `نشاط ${index + 1}`;
const getActivitySummary = (activity, index) =>
  activity?.titleAr?.trim() || activity?.questionAr?.trim() || getActivityAutoTitle(index);
const getTypeCardTitle = (type) => GAME_TYPE_CARDS.find((card) => card.value === type)?.title || '';

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseErrors = error?.response?.data?.details || error?.response?.data?.errors;
  const firstIssueMessage = Array.isArray(responseErrors) ? responseErrors[0]?.message : '';
  if (firstIssueMessage) {
    return firstIssueMessage;
  }

  const responseMessage = error?.response?.data?.message || error?.response?.data?.error;
  if (responseMessage) {
    return responseMessage;
  }
  return error?.message || fallbackMessage;
};

const FileUploadField = ({
  label,
  value,
  onUploaded,
  uploadAsset,
  accept = 'image/*,audio/*,video/*',
  previewType = 'auto',
  placeholder = EMPTY_MESSAGE,
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
      window.alert(getApiErrorMessage(error, 'تعذر رفع الملف.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const resolvedPreviewType =
    previewType === 'auto'
      ? value.match(/\.(mp3|wav|ogg|m4a)$/i)
        ? 'audio'
        : value.match(/\.(mp4|webm|mov)$/i)
          ? 'video'
          : 'image'
      : previewType;

  return (
    <div className="space-y-3">
      <label className="block font-bold text-slate-700">{label}</label>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <label className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dbe7f3] bg-[#f7fbff] px-4 py-3 font-bold text-slate-700 cursor-pointer hover:bg-white transition-colors">
          {uploading ? <LoaderCircle size={18} className="animate-spin" /> : <Upload size={18} />}
          <span>{uploading ? 'جارٍ الرفع...' : 'رفع ملف'}</span>
          <input type="file" accept={accept} className="hidden" onChange={handleFileChange} />
        </label>

        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(event) => onUploaded(event.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {resolvedPreviewType === 'image' && (
        <div
          className={`w-full max-w-md h-40 rounded-2xl border p-3 flex items-center justify-center overflow-hidden ${
            value ? 'border-slate-200 bg-white' : 'border-[#dbe7f3] bg-[#f7fbff]'
          }`}
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full rounded-[1rem] border-2 border-dashed border-[#b8deec] bg-[linear-gradient(180deg,_#f7fbff,_#eef8fb)] flex items-center justify-center text-[#138fbc]">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-[#cfe3f3] bg-white/90 shadow-sm">
                <ImagePlus size={28} />
              </div>
            </div>
          )}
        </div>
      )}
      {value && resolvedPreviewType === 'audio' && <audio controls src={value} className="w-full" />}
      {value && resolvedPreviewType === 'video' && <video controls src={value} className="w-full rounded-2xl" />}
    </div>
  );
};

const SoundPresetField = ({ label, value, options, onChange }) => {
  const presetOptions = options.filter((option) => option.value);
  const hasCustomValue = value && !options.some((option) => option.value === value);
  const colorThemes = [
    {
      idle: 'border-slate-200 bg-white text-slate-700',
      active: 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100 ring-2 ring-emerald-200',
      icon: 'border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:text-emerald-800',
    },
    {
      idle: 'border-slate-200 bg-white text-slate-700',
      active: 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm shadow-amber-100 ring-2 ring-amber-200',
      icon: 'border-amber-200 text-amber-700 hover:border-amber-300 hover:text-amber-800',
    },
    {
      idle: 'border-slate-200 bg-white text-slate-700',
      active: 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm shadow-sky-100 ring-2 ring-sky-200',
      icon: 'border-sky-200 text-sky-700 hover:border-sky-300 hover:text-sky-800',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presetOptions.map((option, index) => {
          const isActive = value === option.value;
          const theme = colorThemes[index % colorThemes.length];

          return (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(option.value);
                }
              }}
              className={`rounded-[1.2rem] border px-4 py-3 transition-all min-h-[7rem] flex flex-col justify-between ${
                isActive ? theme.active : theme.idle
              } cursor-pointer`}
            >
              <div className="w-full text-right">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-black">{option.label}</span>
                  {isActive && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold">
                      مختار
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    playAudioUrl(option.value);
                  }}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 transition-colors ${theme.icon}`}
                  aria-label={`معاينة ${option.label}`}
                >
                  <Volume2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          className={`!py-3 !px-5 justify-center ${!value ? '!text-blue-700 !border-blue-200 !bg-blue-50' : ''}`}
          onClick={() => onChange('')}
        >
          <span>بدون صوت</span>
        </Button>

        {hasCustomValue && (
          <Button
            type="button"
            variant="outline"
            className="!py-3 !px-4 justify-center"
            onClick={() => playAudioUrl(value)}
          >
            <Volume2 size={18} />
            <span>معاينة الصوت المخصص</span>
          </Button>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ children, action }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <h3 className="text-2xl font-black text-slate-900">{children}</h3>
    {action}
  </div>
);

const GameForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { adminSession } = useTherapyStore();
  const isEdit = mode === 'edit';

  const [builderState, setBuilderState] = useState({
    gameCode: '',
    name: '',
    nameAr: '',
    type: '',
    isActive: true,
    config: createEmptyBuilderConfig('matching.similar'),
  });
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const uploadAsset = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const response = await gameService.uploadAsset(adminSession?.token, form);
    return response.url;
  };

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      try {
        const game = await gameService.getGame(adminSession?.token, gameId);
        const config = normalizeBuilderConfig(game);
        setBuilderState({
          gameCode: game.gameCode || '',
          name: game.name || config.name || '',
          nameAr: game.titleAr || config.nameAr || '',
          type: game.type || config.templateType,
          isActive: game.isActive ?? true,
          config,
        });
      } catch (error) {
        window.alert(getApiErrorMessage(error, 'تعذر تحميل اللعبة.'));
        navigate('/admin/games');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [adminSession?.token, gameId, isEdit, navigate]);

  const levels = builderState.config?.levels || [];
  const currentLevel = levels[selectedLevel] || levels[0];
  const currentActivities = Array.isArray(currentLevel?.activities) ? currentLevel.activities : [];
  const currentActivity = currentActivities[selectedActivity] || null;

  const previewGame = useMemo(() => {
    if (!builderState.type || !currentActivity) {
      return null;
    }

    return buildActivityRuntimeGame({
      nameAr: builderState.nameAr,
      templateType: builderState.type,
      activity: currentActivity,
      sharedMedia: builderState.config.media,
    });
  }, [builderState.config.media, builderState.nameAr, builderState.type, currentActivity]);

  const updateConfig = (updater) => {
    setBuilderState((current) => ({
      ...current,
      config: typeof updater === 'function' ? updater(current.config) : updater,
    }));
  };

  const updateType = (type) => {
    const selectedTypeCard = GAME_TYPE_CARDS.find((card) => card.value === type);

    setBuilderState((current) => {
      const previousTypeTitle = getTypeCardTitle(current.type);
      const trimmedNameAr = current.nameAr?.trim() || '';
      const trimmedName = current.name?.trim() || '';
      const shouldReplaceAutoName =
        !trimmedNameAr || trimmedNameAr === previousTypeTitle || trimmedNameAr === trimmedName;
      const autoNameAr = shouldReplaceAutoName ? selectedTypeCard?.title || '' : trimmedNameAr;
      const autoName = shouldReplaceAutoName ? autoNameAr : trimmedName || trimmedNameAr;

      return {
        ...current,
        type,
        name: autoName,
        nameAr: autoNameAr,
        config: {
          ...createEmptyBuilderConfig(type),
          name: autoName,
          nameAr: autoNameAr,
        },
      };
    });
    setSelectedLevel(0);
    setSelectedActivity(0);
    setFormError('');
  };

  const updateLevel = (levelIndex, updater) => {
    updateConfig((currentConfig) => ({
      ...currentConfig,
      levels: currentConfig.levels.map((level, index) =>
        index === levelIndex ? (typeof updater === 'function' ? updater(level) : updater) : level
      ),
    }));
  };

  const updateCurrentActivity = (updater) => {
    updateLevel(selectedLevel, (level) => ({
      ...level,
      activities: level.activities.map((activity, index) =>
        index === selectedActivity ? (typeof updater === 'function' ? updater(activity) : updater) : activity
      ),
    }));
  };

  const addActivity = () => {
    if (!builderState.type) return;

    updateLevel(selectedLevel, (level) => ({
      ...level,
      activities: [
        ...level.activities,
        getDefaultActivityForType(builderState.type, level.activities.length),
      ],
    }));
    setSelectedActivity(currentActivities.length);
  };

  const removeActivity = (activityIndex) => {
    updateLevel(selectedLevel, (level) => ({
      ...level,
      activities: level.activities.filter((_, index) => index !== activityIndex),
    }));
    setSelectedActivity((current) => Math.max(Math.min(current, currentActivities.length - 2), 0));
  };

  const setActivityField = (field, value) => {
    updateCurrentActivity((activity) => ({ ...activity, [field]: value }));
  };

  const updateOption = (optionIndex, field, value) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      options: activity.options.map((option, index) => {
        if (index !== optionIndex) return option;
        return { ...option, [field]: value };
      }),
    }));
  };

  const selectCorrectOption = (optionIndex) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      options: activity.options.map((option, index) => ({
        ...option,
        isCorrect: index === optionIndex,
      })),
    }));
  };

  const addOption = () => {
    updateCurrentActivity((activity) => ({
      ...activity,
      options: [
        ...(activity.options || []),
        {
          id: `option_${Date.now()}`,
          image: '',
          textAr: '',
          isCorrect: false,
        },
      ],
    }));
  };

  const removeOption = (optionIndex) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      options: activity.options.filter((_, index) => index !== optionIndex),
    }));
  };

  const updateDraggable = (itemIndex, field, value) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      draggables: (activity.draggables || []).map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addDraggable = () => {
    updateCurrentActivity((activity) => {
      const nextIndex = (activity.draggables?.length || 0) + 1;
      const nextDraggableId = `drag_${nextIndex}`;
      return {
        ...activity,
        draggables: [
          ...(activity.draggables || []),
          {
            id: nextDraggableId,
            image: '',
            labelAr: '',
            startPosition: 'bottom',
            isCorrect: false,
          },
        ],
      };
    });
  };

  const removeDraggable = (itemIndex) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      draggables: (activity.draggables || []).filter((_, index) => index !== itemIndex),
    }));
  };

  const updateStep = (stepIndex, field, value) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      steps: activity.steps.map((step, index) =>
        index === stepIndex ? { ...step, [field]: value } : step
      ),
    }));
  };

  const updateNavigationField = (section, field, value) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      [section]: {
        ...(activity[section] || {}),
        [field]: value,
      },
    }));
  };

  const addStep = () => {
    updateCurrentActivity((activity) => ({
      ...activity,
      steps: [
        ...(activity.steps || []),
        {
          id: `step_${Date.now()}`,
          image: '',
          labelAr: '',
          order: (activity.steps?.length || 0) + 1,
        },
      ],
    }));
  };

  const removeStep = (stepIndex) => {
    updateCurrentActivity((activity) => ({
      ...activity,
      steps: activity.steps
        .filter((_, index) => index !== stepIndex)
        .map((step, index) => ({ ...step, order: index + 1 })),
    }));
  };

  const validateBuilder = () => {
    if (!builderState.type) {
      return 'اختر نوع اللعبة أولًا.';
    }

    if (!builderState.nameAr.trim()) {
      return 'أدخل عنوان اللعبة بالعربية.';
    }

    if (!builderState.gameCode.trim()) {
      return 'أدخل كود اللعبة.';
    }

    const allActivities = builderState.config.levels.flatMap((level) => level.activities || []);
    if (!allActivities.length) {
      return 'أضف نشاطًا واحدًا على الأقل.';
    }

    for (const level of builderState.config.levels) {
      for (const activity of level.activities || []) {
        if (!activity.questionAr?.trim()) {
          return `أدخل نص السؤال في المستوى ${level.levelNumber}.`;
        }

        if (!activity.instructionAudio?.trim()) {
          return `أضف صوت السؤال أو التعليمات في المستوى ${level.levelNumber}.`;
        }

        if (builderState.type === 'matching.similar') {
          if (!activity.heroImage?.trim()) {
            return `أضف الصورة الرئيسية في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).length < 2) {
            return `لعبة الصورة المطابقة تحتاج اختيارين على الأقل في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).filter((option) => option.isCorrect).length !== 1) {
            return `حدد إجابة صحيحة واحدة فقط في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).some((option) => !option.image?.trim())) {
            return `كل اختيارات الصورة المطابقة تحتاج صورة في المستوى ${level.levelNumber}.`;
          }
        }

        if (builderState.type === 'matching.find') {
          if ((activity.options || []).length < 2) {
            return `لعبة أوجد الصورة تحتاج صورتين على الأقل في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).filter((option) => option.isCorrect).length !== 1) {
            return `حدد إجابة صحيحة واحدة فقط في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).some((option) => !option.image?.trim())) {
            return `كل صور الاختيارات يجب أن تكون مرفوعة في المستوى ${level.levelNumber}.`;
          }
        }

        if (builderState.type === 'matching.different') {
          if (!activity.heroImage?.trim()) {
            return `أضف الصورة الرئيسية في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).length < 2) {
            return `لعبة أوجد المختلف تحتاج صورتين على الأقل في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).filter((option) => option.isCorrect).length !== 1) {
            return `حدد الصورة المختلفة بشكل صحيح في المستوى ${level.levelNumber}.`;
          }
          if ((activity.options || []).some((option) => !option.image?.trim())) {
            return `كل صور أوجد المختلف يجب أن تكون مرفوعة في المستوى ${level.levelNumber}.`;
          }
        }

        if (builderState.type === 'sequence.order') {
          if ((activity.steps || []).length < 2) {
            return `أضف خطوتين على الأقل في المستوى ${level.levelNumber}.`;
          }
          if ((activity.steps || []).some((step) => !step.image?.trim())) {
            return `كل خطوات الترتيب تحتاج صورة في المستوى ${level.levelNumber}.`;
          }
        }

        if (builderState.type === 'action.drag_to_target') {
          if (!activity.sceneImage?.trim()) {
            return `أضف صورة المشهد في المستوى ${level.levelNumber}.`;
          }
          if ((activity.draggables || []).length < 1) {
            return `أضف عنصرًا واحدًا على الأقل في المستوى ${level.levelNumber}.`;
          }
          if ((activity.draggables || []).length > 3) {
            return `هذا النوع يدعم حتى 3 عناصر فقط في المستوى ${level.levelNumber}.`;
          }
          if ((activity.draggables || []).some((item) => !item.image?.trim())) {
            return `كل عناصر السحب تحتاج صورة في المستوى ${level.levelNumber}.`;
          }
          if ((activity.draggables || []).filter((item) => item.isCorrect).length < 1) {
            return `حدد عنصرًا صحيحًا واحدًا على الأقل في المستوى ${level.levelNumber}.`;
          }
        }

        if (builderState.type === 'navigation.move_to_target') {
          if (!activity.sceneImage?.trim()) {
            return `أضف صورة المشهد في المستوى ${level.levelNumber}.`;
          }
          if (!activity.movable?.image?.trim()) {
            return `أضف صورة العنصر المتحرك في المستوى ${level.levelNumber}.`;
          }
          if (!activity.target?.image?.trim()) {
            return `أضف صورة الهدف في المستوى ${level.levelNumber}.`;
          }
          if (Number(activity.grid?.cols || 0) < 2 || Number(activity.grid?.rows || 0) < 2) {
            return `حدد Grid صالحًا في المستوى ${level.levelNumber}.`;
          }
          if (Number(activity.movable?.startX || 0) < 1 || Number(activity.movable?.startY || 0) < 1) {
            return `حدد نقطة بداية صحيحة في المستوى ${level.levelNumber}.`;
          }
          if (Number(activity.target?.x || 0) < 1 || Number(activity.target?.y || 0) < 1) {
            return `حدد موقع هدف صحيح في المستوى ${level.levelNumber}.`;
          }
        }
          if (
            builderState.type === 'navigation.move_to_target' &&
            Number(activity.movable?.startX || 0) > Number(activity.grid?.cols || 0)
          ) {
            return `Start position لازم تكون داخل الـ Grid في المستوى ${level.levelNumber}.`;
          }
          if (
            builderState.type === 'navigation.move_to_target' &&
            Number(activity.movable?.startY || 0) > Number(activity.grid?.rows || 0)
          ) {
            return `Start position لازم تكون داخل الـ Grid في المستوى ${level.levelNumber}.`;
          }
          if (
            builderState.type === 'navigation.move_to_target' &&
            Number(activity.target?.x || 0) > Number(activity.grid?.cols || 0)
          ) {
            return `Target position لازم تكون داخل الـ Grid في المستوى ${level.levelNumber}.`;
          }
          if (
            builderState.type === 'navigation.move_to_target' &&
            Number(activity.target?.y || 0) > Number(activity.grid?.rows || 0)
          ) {
            return `Target position لازم تكون داخل الـ Grid في المستوى ${level.levelNumber}.`;
          }
          if (
            builderState.type === 'navigation.move_to_target' &&
            Number(activity.target?.radius || 0) < 1
          ) {
            return `Radius لازم تكون 1 أو أكثر في المستوى ${level.levelNumber}.`;
          }
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateBuilder();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setSaving(true);

    const payload = {
      gameCode: builderState.gameCode.trim(),
      name: builderState.name.trim() || builderState.nameAr.trim(),
      nameAr: builderState.nameAr.trim(),
      type: builderState.type,
      level: 1,
      isActive: builderState.isActive,
      config: {
        ...builderState.config,
        name: builderState.name.trim() || builderState.nameAr.trim(),
        nameAr: builderState.nameAr.trim(),
        templateType: builderState.type,
      },
    };

    try {
      if (isEdit) {
        await gameService.updateGame(adminSession?.token, gameId, payload);
      } else {
        await gameService.createGame(adminSession?.token, payload);
      }

      navigate('/admin/games');
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'تعذر حفظ اللعبة.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xl font-bold">جارٍ تحميل بيانات اللعبة...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/games')} className="!py-2 !text-sm">
          <ArrowRight size={20} />
          <span>رجوع</span>
        </Button>

        <h2 className="text-3xl font-black text-slate-900">
          {isEdit ? 'تعديل قالب اللعبة' : 'إنشاء قالب لعبة جديد'}
        </h2>

        <div className="w-24" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8 rounded-[2rem] space-y-6">
          <SectionTitle>1. اختيار نوع اللعبة</SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            {GAME_TYPE_CARDS.map((typeCard) => (
              <button
                key={typeCard.value}
                type="button"
                onClick={() => updateType(typeCard.value)}
                className={`rounded-[2rem] border-2 p-5 text-right transition-all ${
                  builderState.type === typeCard.value
                    ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100'
                    : 'border-[#dbe7f3] bg-white hover:border-blue-300'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-[1.2rem] bg-gradient-to-br ${typeCard.accent} mb-4 flex items-center justify-center border border-[#b8deec] shadow-sm ${
                    builderState.type === typeCard.value ? 'ring-2 ring-[#d7ecf7] shadow-md' : ''
                  }`}
                >
                  <ImagePlus size={24} className="text-slate-700" />
                </div>
                <div className="text-xl font-black text-slate-900 mb-2">{typeCard.title}</div>
                <div className="text-sm leading-7 text-slate-600">{typeCard.description}</div>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 font-bold mb-2">عنوان اللعبة بالعربية</label>
              <input
                type="text"
                value={builderState.nameAr}
                onChange={(event) =>
                  setBuilderState((current) => ({
                    ...current,
                    nameAr: event.target.value,
                    name: event.target.value,
                    config: {
                      ...current.config,
                      nameAr: event.target.value,
                      name: event.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="مثال: الصورة المطابقة"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-2">كود اللعبة</label>
              <input
                type="text"
                dir="ltr"
                value={builderState.gameCode}
                onChange={(event) =>
                  setBuilderState((current) => ({
                    ...current,
                    gameCode: event.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="MAT-SIM-001"
              />
            </div>

            <div className="hidden">
              <label className="block text-slate-700 font-bold mb-2">اسم داخلي اختياري</label>
              <input
                type="text"
                dir="ltr"
                value={builderState.name}
                onChange={(event) =>
                  setBuilderState((current) => ({
                    ...current,
                    name: event.target.value,
                    config: { ...current.config, name: event.target.value },
                  }))
                }
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                placeholder="matching template"
              />
            </div>
          </div>

          <div className="space-y-6">
            <FileUploadField
              label="الفيديو التمهيدي"
              value={builderState.config.media?.introVideo || ''}
              onUploaded={(value) =>
                updateConfig((current) => ({
                  ...current,
                  media: { ...current.media, introVideo: value },
                }))
              }
              uploadAsset={uploadAsset}
              accept="video/*"
              previewType="video"
              placeholder="مثال: intro-video.mp4"
            />

            <div className="grid lg:grid-cols-2 gap-6">
              <SoundPresetField
                label="صوت النجاح"
                value={builderState.config.media?.successSound || ''}
                options={SOUND_PRESET_OPTIONS.success}
                onChange={(value) =>
                  updateConfig((current) => ({
                    ...current,
                    media: { ...current.media, successSound: value },
                  }))
                }
              />

              <SoundPresetField
                label="صوت الخطأ"
                value={builderState.config.media?.failSound || ''}
                options={SOUND_PRESET_OPTIONS.fail}
                onChange={(value) =>
                  updateConfig((current) => ({
                    ...current,
                    media: { ...current.media, failSound: value },
                  }))
                }
              />
            </div>
          </div>
        </Card>

        {builderState.type && (
          <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            <Card className="p-8 rounded-[2rem] space-y-6">
              <SectionTitle>2. المستويات والأنشطة</SectionTitle>

              <div className="flex flex-wrap gap-3">
                {levels.map((level, index) => (
                  <button
                    key={level.levelNumber}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(index);
                      setSelectedActivity(0);
                    }}
                    className={`rounded-[1.4rem] px-5 py-3 font-black border transition-all ${
                      selectedLevel === index
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-[#dbe7f3]'
                    }`}
                  >
                    Level {level.levelNumber}
                  </button>
                ))}
              </div>

              <div className="rounded-[1.8rem] border border-[#dbe7f3] p-5 bg-[#f8fbff] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-slate-900">أنشطة المستوى {currentLevel?.levelNumber}</div>
                    <div className="text-sm text-slate-500">يمكنك إضافة عدة Activities داخل كل مستوى.</div>
                  </div>

                  <Button type="button" variant="outline" onClick={addActivity} className="!py-2 !px-4">
                    <Plus size={18} />
                    <span>إضافة نشاط</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {currentActivities.map((activity, index) => (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => setSelectedActivity(index)}
                      className={`rounded-[1.3rem] border px-4 py-3 text-right transition-all ${
                        selectedActivity === index
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-black">{getActivityAutoTitle(index)}</div>
                      <div className="text-xs mt-1">{getActivitySummary(activity, index)}</div>
                    </button>
                  ))}
                </div>

                {!currentActivities.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center text-slate-500">
                    لا يوجد Activities في هذا المستوى حتى الآن.
                  </div>
                )}
              </div>

              {currentActivity && (
                <div className="space-y-6">
                  <SectionTitle
                    action={
                      currentActivities.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeActivity(selectedActivity)}
                          className="inline-flex items-center gap-2 text-red-600 font-bold"
                        >
                          <Trash2 size={18} />
                          <span>حذف النشاط</span>
                        </button>
                      ) : null
                    }
                  >
                    3. فورم النشاط
                  </SectionTitle>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-bold mb-2">عنوان النشاط</label>
                      <input
                        type="text"
                        value={currentActivity.titleAr || ''}
                        onChange={(event) => setActivityField('titleAr', event.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                        placeholder={getActivityAutoTitle(selectedActivity)}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-2">الصعوبة</label>
                      <select
                        value={currentActivity.difficulty || 'easy'}
                        onChange={(event) => setActivityField('difficulty', event.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                      >
                        <option value="easy">سهل</option>
                        <option value="medium">متوسط</option>
                        <option value="hard">صعب</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-2">نص السؤال أو التعليمات</label>
                    <textarea
                      rows={3}
                      value={currentActivity.questionAr || ''}
                      onChange={(event) => setActivityField('questionAr', event.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                      placeholder="مثال: اختر الصورة المطابقة"
                    />
                  </div>

                  <FileUploadField
                    label="صوت السؤال أو التعليمات"
                    value={currentActivity.instructionAudio || ''}
                    onUploaded={(value) => setActivityField('instructionAudio', value)}
                    uploadAsset={uploadAsset}
                    accept="audio/*"
                    previewType="audio"
                  />

                  {builderState.type === 'matching.similar' && (
                    <div className="space-y-6">
                      <ImageAssetField
                        label="الصورة الرئيسية الكبيرة"
                        value={currentActivity.heroImage || ''}
                        onSelect={(value) => setActivityField('heroImage', value)}
                        token={adminSession?.token}
                        initialQuery="child object flashcard"
                      />

                      <SectionTitle
                        action={
                          <Button type="button" variant="outline" onClick={addOption} className="!py-2 !px-4">
                            <Plus size={18} />
                            <span>إضافة اختيار</span>
                          </Button>
                        }
                      >
                        صور الاختيارات
                      </SectionTitle>

                      <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-bold text-amber-700">
                        الطفل سيرى الصورة الرئيسية أولًا، ثم يختار من الاختيارين أيهما مطابق لها.
                      </div>

                      <div className="grid gap-4">
                        {(currentActivity.options || []).map((option, optionIndex) => (
                          <div key={option.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800">اختيار {optionIndex + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeOption(optionIndex)}
                                disabled={(currentActivity.options || []).length <= 2}
                                className={`inline-flex items-center justify-center rounded-xl border p-2 transition-colors ${
                                  (currentActivity.options || []).length <= 2
                                    ? 'text-slate-400 border-slate-200 bg-slate-100 cursor-not-allowed'
                                    : 'text-red-500 border-red-200 bg-red-50 hover:text-red-600 hover:bg-red-100'
                                }`}
                                title={(currentActivity.options || []).length <= 2 ? 'لا يمكن الحذف: الحد الأدنى اختياران' : 'حذف الاختيار'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={option.textAr || ''}
                              onChange={(event) => updateOption(optionIndex, 'textAr', event.target.value)}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                              placeholder="اسم الاختيار بالعربية"
                            />

                            <ImageAssetField
                              label="صورة الاختيار"
                              value={option.image || ''}
                              onSelect={(value) => updateOption(optionIndex, 'image', value)}
                              token={adminSession?.token}
                              initialQuery={option.textAr || 'child object flashcard'}
                            />

                            <label className="flex items-center gap-2 font-bold text-slate-700">
                              <input
                                type="radio"
                                checked={Boolean(option.isCorrect)}
                                onChange={() => selectCorrectOption(optionIndex)}
                              />
                              <span>هذه هي الإجابة الصحيحة</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {builderState.type === 'matching.find' && (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-fuchsia-50 border border-fuchsia-100 px-4 py-3 text-sm font-bold text-fuchsia-700">
                        الطفل يسمع أو يقرأ التعليمات مثل: أوجد القطة، ثم يختار الصورة الصحيحة من بين 2 أو 3 أو 4 أو 6 صور.
                      </div>

                      <SectionTitle
                        action={
                          <Button type="button" variant="outline" onClick={addOption} className="!py-2 !px-4">
                            <Plus size={18} />
                            <span>إضافة صورة</span>
                          </Button>
                        }
                      >
                        صور الاختيارات
                      </SectionTitle>

                      <div className="grid gap-4">
                        {(currentActivity.options || []).map((option, optionIndex) => (
                          <div key={option.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800">صورة {optionIndex + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeOption(optionIndex)}
                                disabled={(currentActivity.options || []).length <= 2}
                                className={`inline-flex items-center justify-center rounded-xl border p-2 transition-colors ${
                                  (currentActivity.options || []).length <= 2
                                    ? 'text-slate-400 border-slate-200 bg-slate-100 cursor-not-allowed'
                                    : 'text-red-500 border-red-200 bg-red-50 hover:text-red-600 hover:bg-red-100'
                                }`}
                                title={(currentActivity.options || []).length <= 2 ? 'لا يمكن الحذف: الحد الأدنى صورتان' : 'حذف الصورة'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={option.textAr || ''}
                              onChange={(event) => updateOption(optionIndex, 'textAr', event.target.value)}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                              placeholder="اسم الصورة اختياري"
                            />

                            <ImageAssetField
                              label="صورة الاختيار"
                              value={option.image || ''}
                              onSelect={(value) => updateOption(optionIndex, 'image', value)}
                              token={adminSession?.token}
                              initialQuery={option.textAr || 'cat isolated white background'}
                            />

                            <label className="flex items-center gap-2 font-bold text-slate-700">
                              <input
                                type="radio"
                                checked={Boolean(option.isCorrect)}
                                onChange={() => selectCorrectOption(optionIndex)}
                              />
                              <span>هذه هي الصورة المطلوبة</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {builderState.type === 'matching.different' && (
                    <div className="space-y-6">
                      <ImageAssetField
                        label="الصورة الرئيسية في السؤال"
                        value={currentActivity.heroImage || ''}
                        onSelect={(value) => setActivityField('heroImage', value)}
                        token={adminSession?.token}
                        initialQuery="single object white background"
                      />

                      <SectionTitle
                        action={
                          <Button type="button" variant="outline" onClick={addOption} className="!py-2 !px-4">
                            <Plus size={18} />
                            <span>إضافة صورة</span>
                          </Button>
                        }
                      >
                        صور الاختيارات
                      </SectionTitle>

                      <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-bold text-amber-700">
                        الطفل سيرى الصورة الرئيسية أولًا، ثم يختار من الصور أيها المختلفة عنها. مثال مناسب: قطة كبيرة في الوسط، وتحتها قطة وكلب ليختار الطفل الكلب لأنه المختلف.
                      </div>

                      <div className="grid gap-4">
                        {(currentActivity.options || []).map((option, optionIndex) => (
                          <div key={option.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800">صورة {optionIndex + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeOption(optionIndex)}
                                disabled={(currentActivity.options || []).length <= 2}
                                className={`inline-flex items-center justify-center rounded-xl border p-2 transition-colors ${
                                  (currentActivity.options || []).length <= 2
                                    ? 'text-slate-400 border-slate-200 bg-slate-100 cursor-not-allowed'
                                    : 'text-red-500 border-red-200 bg-red-50 hover:text-red-600 hover:bg-red-100'
                                }`}
                                title={(currentActivity.options || []).length <= 2 ? 'لا يمكن الحذف: الحد الأدنى صورتان' : 'حذف الصورة'}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={option.textAr || ''}
                              onChange={(event) => updateOption(optionIndex, 'textAr', event.target.value)}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                              placeholder="وصف اختياري"
                            />

                            <ImageAssetField
                              label="صورة الاختيار"
                              value={option.image || ''}
                              onSelect={(value) => updateOption(optionIndex, 'image', value)}
                              token={adminSession?.token}
                              initialQuery={option.textAr || 'single object white background'}
                            />

                            <label className="flex items-center gap-2 font-bold text-slate-700">
                              <input
                                type="radio"
                                checked={Boolean(option.isCorrect)}
                                onChange={() => selectCorrectOption(optionIndex)}
                              />
                              <span>هذه هي الصورة المختلفة</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {builderState.type === 'action.drag_to_target' && (
                    <div className="space-y-6">
                      <ImageAssetField
                        label="صورة المشهد الثابت"
                        value={currentActivity.sceneImage || ''}
                        onSelect={(value) => setActivityField('sceneImage', value)}
                        token={adminSession?.token}
                        initialQuery="children room scene"
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="hidden">
                        <ImageAssetField
                          label="صورة المشهد الثابت"
                          value={currentActivity.sceneImage || ''}
                          onSelect={(value) => setActivityField('sceneImage', value)}
                          token={adminSession?.token}
                          initialQuery="children room scene"
                        />
                        </div>

                        <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                          <div>
                            <label className="block text-slate-700 font-bold mb-2">نمط اللعبة</label>
                            <select
                              value={currentActivity.mode || 'one-to-one'}
                              onChange={(event) => setActivityField('mode', event.target.value)}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                            >
                              <option value="one-to-one">عنصر واحد صحيح</option>
                              <option value="one-of-many">اختيار الصحيح من عدة عناصر</option>
                              <option value="multi-match">أكثر من عنصر صحيح</option>
                            </select>
                          </div>

                        </div>
                      </div>

                      <SectionTitle
                        action={
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addDraggable}
                            className="!py-2 !px-4"
                          >
                            <Plus size={18} />
                            <span>إضافة عنصر</span>
                          </Button>
                        }
                      >
                        عناصر السحب ومناطق الإسقاط
                      </SectionTitle>

                      <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-bold text-amber-700">
                        المشهد كله هو منطقة الإسقاط. حدّد فقط العنصر الصحيح أو العناصر الصحيحة.
                      </div>

                      <div className="grid gap-4">
                        {(currentActivity.draggables || []).map((item, itemIndex) => (
                          <div key={item.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800">عنصر {itemIndex + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeDraggable(itemIndex)}
                                disabled={(currentActivity.draggables || []).length <= 1}
                                className={`inline-flex items-center justify-center rounded-xl border p-2 transition-colors ${
                                  (currentActivity.draggables || []).length <= 1
                                    ? 'text-slate-400 border-slate-200 bg-slate-100 cursor-not-allowed'
                                    : 'text-red-500 border-red-200 bg-red-50 hover:text-red-600 hover:bg-red-100'
                                }`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={item.labelAr || ''}
                                onChange={(event) => updateDraggable(itemIndex, 'labelAr', event.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                                placeholder="اسم العنصر بالعربية"
                              />

                              <select
                                value={item.startPosition || 'bottom'}
                                onChange={(event) => updateDraggable(itemIndex, 'startPosition', event.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                              >
                                <option value="left">الجانب الأيسر</option>
                                <option value="right">الجانب الأيمن</option>
                                <option value="bottom">الأسفل</option>
                              </select>
                            </div>

                            <ImageAssetField
                              label="صورة العنصر"
                              value={item.image || ''}
                              onSelect={(value) => updateDraggable(itemIndex, 'image', value)}
                              token={adminSession?.token}
                              initialQuery={item.labelAr || 'single object white background'}
                            />

                            <label className="flex items-center gap-2 font-bold text-slate-700">
                              <input
                                type={currentActivity.mode === 'multi-match' ? 'checkbox' : 'radio'}
                                name={`drag-correct-${selectedLevel}-${selectedActivity}`}
                                checked={Boolean(item.isCorrect)}
                                onChange={(event) => {
                                  if (currentActivity.mode === 'multi-match') {
                                    updateDraggable(itemIndex, 'isCorrect', event.target.checked);
                                    return;
                                  }

                                  updateCurrentActivity((activity) => ({
                                    ...activity,
                                    draggables: (activity.draggables || []).map((dragItem, index) => ({
                                      ...dragItem,
                                      isCorrect: index === itemIndex,
                                    })),
                                  }));
                                }}
                              />
                              <span>هذا هو العنصر الصحيح</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {builderState.type === 'navigation.move_to_target' && (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-sm font-bold text-sky-700">
                        الطفل سيحرك العنصر خطوة بخطوة باستخدام أزرار الاتجاهات حتى يصل إلى الهدف.
                      </div>

                      <ImageAssetField
                        label="صورة المشهد"
                        value={currentActivity.sceneImage || ''}
                        onSelect={(value) => setActivityField('sceneImage', value)}
                        token={adminSession?.token}
                        initialQuery="grid map children scene"
                      />

                      <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-5">
                        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-5 items-start">
                          <div className="space-y-2">
                            <label className="block text-slate-700 font-bold">طريقة اللعب</label>
                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 font-black text-sky-700 text-center">
                              أزرار الاتجاهات
                            </div>
                            <p className="text-sm text-slate-500">الطفل يتحرك خطوة واحدة مع كل ضغطة زر.</p>
                          </div>

                          <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
                              <label className="block text-slate-700 font-bold">عرض المسار</label>
                              <p className="text-xs text-slate-500">عدد الخانات أفقيًا</p>
                              <input
                                type="number"
                                min={2}
                                value={currentActivity.grid?.cols ?? 8}
                                onChange={(event) => updateNavigationField('grid', 'cols', Number(event.target.value))}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                              />
                            </div>

                            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
                              <label className="block text-slate-700 font-bold">ارتفاع المسار</label>
                              <p className="text-xs text-slate-500">عدد الخانات رأسيًا</p>
                              <input
                                type="number"
                                min={2}
                                value={currentActivity.grid?.rows ?? 6}
                                onChange={(event) => updateNavigationField('grid', 'rows', Number(event.target.value))}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                              />
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-3">
                        <SectionTitle>أصوات الحركة</SectionTitle>
                        <div className="rounded-2xl bg-white border border-slate-200 px-4 py-4 text-sm font-bold text-slate-600">
                          النظام يشغل تلقائيًا صوت حركة خفيف مع كل ضغطة وصوت تنبيه عند الاصطدام بالحدود.
                        </div>
                      </div>

                      <SectionTitle>العنصر المتحرك</SectionTitle>
                      <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-5">
                        <ImageAssetField
                          label="صورة العنصر المتحرك"
                          value={currentActivity.movable?.image || ''}
                          onSelect={(value) => updateNavigationField('movable', 'image', value)}
                          token={adminSession?.token}
                          initialQuery="cartoon child character isolated white background"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-bold mb-2">بداية العنصر أفقيًا</label>
                            <input
                              type="number"
                              min={1}
                              value={currentActivity.movable?.startX ?? 1}
                              onChange={(event) => updateNavigationField('movable', 'startX', Number(event.target.value))}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-2">بداية العنصر رأسيًا</label>
                            <input
                              type="number"
                              min={1}
                              value={currentActivity.movable?.startY ?? 1}
                              onChange={(event) => updateNavigationField('movable', 'startY', Number(event.target.value))}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <SectionTitle>الهدف</SectionTitle>
                      <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-5">
                        <ImageAssetField
                          label="صورة الهدف"
                          value={currentActivity.target?.image || ''}
                          onSelect={(value) => updateNavigationField('target', 'image', value)}
                          token={adminSession?.token}
                          initialQuery="single object white background"
                        />

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-slate-700 font-bold mb-2">موضع الهدف أفقيًا</label>
                            <input
                              type="number"
                              min={1}
                              value={currentActivity.target?.x ?? 5}
                              onChange={(event) => updateNavigationField('target', 'x', Number(event.target.value))}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-2">موضع الهدف رأسيًا</label>
                            <input
                              type="number"
                              min={1}
                              value={currentActivity.target?.y ?? 3}
                              onChange={(event) => updateNavigationField('target', 'y', Number(event.target.value))}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-2">نطاق الوصول</label>
                            <input
                              type="number"
                              min={1}
                              value={currentActivity.target?.radius ?? 1}
                              onChange={(event) => updateNavigationField('target', 'radius', Number(event.target.value))}
                              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {builderState.type === 'sequence.order' && (
                    <div className="space-y-6">
                      <SectionTitle
                        action={
                          <Button type="button" variant="outline" onClick={addStep} className="!py-2 !px-4">
                            <Plus size={18} />
                            <span>إضافة خطوة</span>
                          </Button>
                        }
                      >
                        خطوات الترتيب
                      </SectionTitle>

                      <div className="grid gap-4">
                        {(currentActivity.steps || []).map((step, stepIndex) => (
                          <div key={step.id} className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-slate-800">خطوة {stepIndex + 1}</h4>
                              {(currentActivity.steps || []).length > 2 && (
                                <button type="button" onClick={() => removeStep(stepIndex)} className="text-red-500">
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={step.labelAr || ''}
                                onChange={(event) => updateStep(stepIndex, 'labelAr', event.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                                placeholder="وصف اختياري"
                              />

                              <input
                                type="number"
                                min={1}
                                value={step.order || stepIndex + 1}
                                onChange={(event) => updateStep(stepIndex, 'order', Number(event.target.value))}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none"
                                placeholder="الترتيب"
                              />
                            </div>

                            <ImageAssetField
                              label="صورة الخطوة"
                              value={step.image || ''}
                              onSelect={(value) => updateStep(stepIndex, 'image', value)}
                              token={adminSession?.token}
                              initialQuery={step.labelAr || 'single step object white background'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-8 rounded-[2rem] space-y-6 sticky top-6">
              <SectionTitle
                action={
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-blue-700 font-bold">
                    <Volume2 size={16} />
                    <span>Live Preview</span>
                  </div>
                }
              >
                4. معاينة مباشرة
              </SectionTitle>

              {previewGame ? (
                <div className="rounded-[2rem] border border-[#dbe7f3] bg-[#f8fbff] p-4">
                  {renderGameActivity({
                    game: previewGame,
                    onComplete: () => {},
                    previewMode: true,
                  })}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-500">
                  اختر نوع اللعبة ثم أضف Activity لعرض المعاينة هنا.
                </div>
              )}
            </Card>
          </div>
        )}

        {formError && (
          <div className="rounded-3xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 font-bold">
            {formError}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="primary" type="submit" disabled={saving} className="!py-3 !px-8">
            {saving ? <LoaderCircle size={20} className="animate-spin" /> : <Save size={20} />}
            <span>{saving ? 'جارٍ الحفظ...' : 'حفظ القالب'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;
