import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  students: 'therapy_students',
  sessions: 'therapy_sessions',
  currentStudent: 'therapy_active_student',
  activeMode: 'therapy_active_mode',
  adminSession: 'therapy_admin_session',
  therapistSession: 'therapy_therapist_session',
};

const THERAPIST_ACCOUNT = {
  email: 'therapist@speech.local',
  password: '123456',
  name: 'Therapist Admin',
};

const SEED_STUDENTS = [
  {
    id: 1,
    name: 'Ahmed Mohamed',
    nameAr: 'أحمد محمد',
    age: 5,
    code: 'AHMED123',
    avatar: '🌟',
    goals: ['تنمية اللغة الاستقبالية', 'اتباع الأوامر البسيطة'],
    assignedGames: ['listen_choose', 'action_drag_drop'],
    currentLevels: {
      listen_choose: 1,
      action_drag_drop: 1,
    },
  },
  {
    id: 2,
    name: 'Layla Hassan',
    nameAr: 'ليلى حسن',
    age: 4,
    code: 'LAYLA456',
    avatar: '🦋',
    goals: ['التعرف على الألوان', 'زيادة الانتباه'],
    assignedGames: ['listen_choose'],
    currentLevels: {
      listen_choose: 2,
    },
  },
];

const SEED_SESSIONS = [
  {
    id: 's1',
    studentId: 1,
    gameId: 1,
    gameType: 'listen_choose',
    level: 1,
    totalQuestions: 10,
    correctAnswers: 5,
    wrongAnswers: 5,
    independenceRate: 40,
    score: 50,
    timeSpent: 300,
    therapistMode: true,
    date: '2026-04-25T10:00:00Z',
  },
  {
    id: 's2',
    studentId: 1,
    gameId: 1,
    gameType: 'listen_choose',
    level: 1,
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    independenceRate: 60,
    score: 70,
    timeSpent: 240,
    therapistMode: true,
    date: '2026-04-28T10:00:00Z',
  },
];

const readStorage = (key, fallback) => {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const ensureArray = (value, fallback) => (Array.isArray(value) ? value : fallback);
const ensureObjectOrNull = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;

const writeStorage = (key, value) => {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

const getInitialStudents = () => ensureArray(readStorage(STORAGE_KEYS.students, SEED_STUDENTS), SEED_STUDENTS);
const getInitialSessions = () => ensureArray(readStorage(STORAGE_KEYS.sessions, SEED_SESSIONS), SEED_SESSIONS);
const getInitialCurrentStudent = () => ensureObjectOrNull(readStorage(STORAGE_KEYS.currentStudent, null));
const getInitialActiveMode = () => readStorage(STORAGE_KEYS.activeMode, 'parent');
const getInitialAdminSession = () => ensureObjectOrNull(readStorage(STORAGE_KEYS.adminSession, null));
const getInitialTherapistSession = () =>
  ensureObjectOrNull(
    readStorage(STORAGE_KEYS.therapistSession, {
      isActive: false,
      therapistControlsEnabled: false,
      promptLevel: 'none',
      launchedGameId: null,
    })
  ) || {
    isActive: false,
    therapistControlsEnabled: false,
    promptLevel: 'none',
    launchedGameId: null,
  };

export const PROMPT_LEVELS = [
  { id: 'none', label: 'بدون مساعدة' },
  { id: 'visual', label: 'بصري' },
  { id: 'verbal', label: 'لفظي' },
  { id: 'gestural', label: 'إيمائي' },
  { id: 'modeling', label: 'نمذجة' },
  { id: 'partial_physical', label: 'جسدي جزئي' },
  { id: 'full_physical', label: 'جسدي كامل' },
];

export function useTherapyStore() {
  const [students, setStudents] = useState(getInitialStudents);
  const [sessions, setSessions] = useState(getInitialSessions);
  const [currentStudent, setCurrentStudent] = useState(getInitialCurrentStudent);
  const [activeMode, setActiveMode] = useState(getInitialActiveMode);
  const [adminSession, setAdminSession] = useState(getInitialAdminSession);
  const [therapistSession, setTherapistSession] = useState(getInitialTherapistSession);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEYS.students) || !Array.isArray(students)) {
      writeStorage(STORAGE_KEYS.students, SEED_STUDENTS);
      setStudents(SEED_STUDENTS);
    }

    if (!localStorage.getItem(STORAGE_KEYS.sessions) || !Array.isArray(sessions)) {
      writeStorage(STORAGE_KEYS.sessions, SEED_SESSIONS);
      setSessions(SEED_SESSIONS);
    }
  }, [sessions, students]);

  const syncStudent = (student, mode) => {
    setCurrentStudent(student);
    setActiveMode(mode);
    writeStorage(STORAGE_KEYS.currentStudent, student);
    writeStorage(STORAGE_KEYS.activeMode, mode);
  };

  const loginStudent = (code, source = 'parent') => {
    const normalizedCode = code.trim().toUpperCase();
    const student = students.find((item) => {
      const candidateCode = item.code || item.accessCode || '';
      return candidateCode.toUpperCase() === normalizedCode;
    });
    if (!student) return false;

    syncStudent(student, source);

    if (source !== 'therapist') {
      const resetSession = {
        isActive: false,
        therapistControlsEnabled: false,
        promptLevel: 'none',
        launchedGameId: null,
      };
      setTherapistSession(resetSession);
      writeStorage(STORAGE_KEYS.therapistSession, resetSession);
    }

    return true;
  };

  const logoutStudent = () => {
    setCurrentStudent(null);
    setActiveMode('parent');
    writeStorage(STORAGE_KEYS.currentStudent, null);
    writeStorage(STORAGE_KEYS.activeMode, 'parent');
  };

  const loginAdmin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/login`, { email, password });
      const session = {
        email: response.data.user.email,
        name: response.data.user.name,
        token: response.data.token,
        loggedInAt: new Date().toISOString(),
      };

      setAdminSession(session);
      writeStorage(STORAGE_KEYS.adminSession, session);
      return true;
    } catch (error) {
      const normalizedEmail = email.trim().toLowerCase();
      if (
        normalizedEmail !== THERAPIST_ACCOUNT.email.toLowerCase() ||
        password !== THERAPIST_ACCOUNT.password
      ) {
        return false;
      }

      const session = {
        email: THERAPIST_ACCOUNT.email,
        name: THERAPIST_ACCOUNT.name,
        token: null,
        loggedInAt: new Date().toISOString(),
      };

      setAdminSession(session);
      writeStorage(STORAGE_KEYS.adminSession, session);
      return true;
    }
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    writeStorage(STORAGE_KEYS.adminSession, null);
  };

  const startTherapistSession = (student, launchedGameId = null) => {
    syncStudent(student, 'therapist');

    const nextSession = {
      isActive: true,
      therapistControlsEnabled: true,
      promptLevel: 'none',
      studentId: student.id,
      launchedGameId,
      startedAt: new Date().toISOString(),
    };

    setTherapistSession(nextSession);
    writeStorage(STORAGE_KEYS.therapistSession, nextSession);
    return nextSession;
  };

  const endTherapistSession = () => {
    const resetSession = {
      isActive: false,
      therapistControlsEnabled: false,
      promptLevel: 'none',
      launchedGameId: null,
    };

    setTherapistSession(resetSession);
    writeStorage(STORAGE_KEYS.therapistSession, resetSession);
    setActiveMode('parent');
    writeStorage(STORAGE_KEYS.activeMode, 'parent');
  };

  const setTherapistControlsEnabled = (enabled) => {
    const updated = {
      ...therapistSession,
      therapistControlsEnabled: enabled,
    };
    setTherapistSession(updated);
    writeStorage(STORAGE_KEYS.therapistSession, updated);
  };

  const setTherapistPromptLevel = (promptLevel) => {
    const updated = {
      ...therapistSession,
      promptLevel,
    };
    setTherapistSession(updated);
    writeStorage(STORAGE_KEYS.therapistSession, updated);
  };

  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: Date.now(),
      currentLevels: studentData.currentLevels || {},
      assignedGames: studentData.assignedGames || [],
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    writeStorage(STORAGE_KEYS.students, updated);
    return newStudent;
  };

  const deleteStudent = (studentId) => {
    const updatedStudents = students.filter((student) => student.id !== studentId);
    setStudents(updatedStudents);
    writeStorage(STORAGE_KEYS.students, updatedStudents);
  };

  const saveSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    writeStorage(STORAGE_KEYS.sessions, updatedSessions);
    return newSession;
  };

  const updateStudent = (studentId, updates) => {
    const updatedStudents = students.map((student) =>
      student.id === studentId ? { ...student, ...updates } : student
    );

    setStudents(updatedStudents);
    writeStorage(STORAGE_KEYS.students, updatedStudents);

    if (currentStudent?.id === studentId) {
      const nextActiveStudent = updatedStudents.find((student) => student.id === studentId) || null;
      setCurrentStudent(nextActiveStudent);
      writeStorage(STORAGE_KEYS.currentStudent, nextActiveStudent);
    }
  };

  const updateStudentLevel = (studentId, gameType, level) => {
    const student = students.find((item) => item.id === studentId);
    if (!student) return;

    updateStudent(studentId, {
      currentLevels: {
        ...student.currentLevels,
        [gameType]: level,
      },
    });
  };

  const resetDemoData = () => {
    const resetTherapistSession = {
      isActive: false,
      therapistControlsEnabled: false,
      promptLevel: 'none',
      launchedGameId: null,
    };

    setStudents(SEED_STUDENTS);
    setSessions(SEED_SESSIONS);
    setCurrentStudent(null);
    setActiveMode('parent');
    setTherapistSession(resetTherapistSession);

    writeStorage(STORAGE_KEYS.students, SEED_STUDENTS);
    writeStorage(STORAGE_KEYS.sessions, SEED_SESSIONS);
    writeStorage(STORAGE_KEYS.currentStudent, null);
    writeStorage(STORAGE_KEYS.activeMode, 'parent');
    writeStorage(STORAGE_KEYS.therapistSession, resetTherapistSession);
  };

  return {
    adminSession,
    activeMode,
    currentStudent,
    sessions,
    students,
    therapistSession,
    loginAdmin,
    logoutAdmin,
    loginStudent,
    logoutStudent,
    startTherapistSession,
    endTherapistSession,
    setTherapistControlsEnabled,
    setTherapistPromptLevel,
    addStudent,
    updateStudent,
    updateStudentLevel,
    resetDemoData,
    deleteStudent,
    saveSession,
  };
}
