'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  User, Teacher, Student, ClassRoom, Subject, Schedule,
  JournalEntry, GradeRecord, CalendarEvent, UserRole,
  School, BillingRecord, SystemLog,
} from '@/types';
import {
  dummyUsers, dummyTeachers, dummyStudents, dummyClasses, dummySubjects,
  dummySchedules, dummyJournals, dummyGrades, dummyCalendarEvents,
  dummySchools, dummyBilling, dummySystemLogs,
} from '@/lib/dummy-data';

// ===== State Shape =====
interface AppState {
  currentUser: User | null;
  teachers: Teacher[];
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  schedules: Schedule[];
  journals: JournalEntry[];
  grades: GradeRecord[];
  calendarEvents: CalendarEvent[];
  schools: School[];
  billingRecords: BillingRecord[];
  systemLogs: SystemLog[];
}

// ===== Actions =====
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_CLASS'; payload: ClassRoom }
  | { type: 'UPDATE_CLASS'; payload: ClassRoom }
  | { type: 'DELETE_CLASS'; payload: string }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'ADD_JOURNAL'; payload: JournalEntry }
  | { type: 'UPDATE_JOURNAL'; payload: JournalEntry }
  | { type: 'UPDATE_GRADE'; payload: GradeRecord }
  | { type: 'ADD_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_CALENDAR_EVENT'; payload: string }
  | { type: 'UPDATE_SCHOOL'; payload: School }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  currentUser: null,
  teachers: dummyTeachers,
  students: dummyStudents,
  classes: dummyClasses,
  subjects: dummySubjects,
  schedules: dummySchedules,
  journals: dummyJournals,
  grades: dummyGrades,
  calendarEvents: dummyCalendarEvents,
  schools: dummySchools,
  billingRecords: dummyBilling,
  systemLogs: dummySystemLogs,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'LOAD_STATE':
      return { ...action.payload };
    // Teachers
    case 'ADD_TEACHER':
      return { ...state, teachers: [...state.teachers, action.payload] };
    case 'UPDATE_TEACHER':
      return { ...state, teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TEACHER':
      return { ...state, teachers: state.teachers.filter(t => t.id !== action.payload) };
    // Students
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter(s => s.id !== action.payload) };
    // Classes
    case 'ADD_CLASS':
      return { ...state, classes: [...state.classes, action.payload] };
    case 'UPDATE_CLASS':
      return { ...state, classes: state.classes.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLASS':
      return { ...state, classes: state.classes.filter(c => c.id !== action.payload) };
    // Subjects
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    // Schedules
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return { ...state, schedules: state.schedules.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter(s => s.id !== action.payload) };
    // Journals
    case 'ADD_JOURNAL':
      return { ...state, journals: [...state.journals, action.payload] };
    case 'UPDATE_JOURNAL':
      return { ...state, journals: state.journals.map(j => j.id === action.payload.id ? action.payload : j) };
    // Grades
    case 'UPDATE_GRADE':
      return { ...state, grades: state.grades.map(g => g.id === action.payload.id ? action.payload : g) };
    // Calendar
    case 'ADD_CALENDAR_EVENT':
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case 'UPDATE_CALENDAR_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_CALENDAR_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) };
    // Schools
    case 'UPDATE_SCHOOL':
      return { ...state, schools: state.schools.map(s => s.id === action.payload.id ? action.payload : s) };
    default:
      return state;
  }
}

// ===== Context =====
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sakuguru_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed } });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      const { currentUser, ...dataToSave } = state;
      localStorage.setItem('sakuguru_state', JSON.stringify(dataToSave));
      if (currentUser) {
        localStorage.setItem('sakuguru_user', JSON.stringify(currentUser));
      }
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const login = useCallback((role: UserRole) => {
    const user = dummyUsers.find(u => u.role === role);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      localStorage.setItem('sakuguru_user', JSON.stringify(user));
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('sakuguru_user');
  }, []);

  // Restore user session
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sakuguru_user');
      if (savedUser && !state.currentUser) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      }
    } catch {
      // ignore
    }
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
