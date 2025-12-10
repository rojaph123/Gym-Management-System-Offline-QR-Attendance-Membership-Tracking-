import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';

export interface Member {
  id: number;
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  photo: string;
  qr_code: string;
  qr_image_path: string;
  membership_type: 'student' | 'regular' | 'senior';
  is_member: number;
  subscription_start: string | null;
  subscription_end: string | null;
}

export interface Attendance {
  id: number;
  member_id: number;
  date: string;
  time: string;
}

export interface Sale {
  id: number;
  type: string;
  amount: number;
  date: string;
  note: string;
}

export interface PriceSettings {
  id: number;
  membership: number;
  student_monthly: number;
  regular_monthly: number;
  senior_monthly: number;
  session_member: number;
  session_nonmember: number;
}

interface AppState {
  isAuthenticated: boolean;
  hasPin: boolean;
  isDarkMode: boolean;
  members: Member[];
  attendance: Attendance[];
  sales: Sale[];
  priceSettings: PriceSettings;
}

interface AppContextType extends AppState {
  setAuthenticated: (value: boolean) => void;
  setHasPin: (value: boolean) => void;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
  addMember: (member: Omit<Member, 'id' | 'qr_code' | 'qr_image_path'>) => Member;
  updateMember: (id: number, updates: Partial<Member>) => void;
  deleteMember: (id: number) => void;
  getMember: (id: number) => Member | undefined;
  getMemberByQR: (qrCode: string) => Member | undefined;
  addAttendance: (memberId: number) => void;
  addSale: (type: string, amount: number, note: string) => void;
  updatePriceSettings: (settings: Partial<PriceSettings>) => void;
  getTodayAttendance: () => Attendance[];
  getTodaySales: () => number;
  getActiveMembers: () => Member[];
  getExpiredMembers: () => Member[];
  renewSubscription: (memberId: number) => void;
  paySession: (memberId: number, isMember: boolean) => void;
}

const defaultPriceSettings: PriceSettings = {
  id: 1,
  membership: 1500,
  student_monthly: 500,
  regular_monthly: 700,
  senior_monthly: 400,
  session_member: 50,
  session_nonmember: 80,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    hasPin: false,
    isDarkMode: Appearance.getColorScheme() === 'dark',
    members: [],
    attendance: [],
    sales: [],
    priceSettings: defaultPriceSettings,
  });

  const setAuthenticated = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: value }));
  }, []);

  const setHasPin = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, hasPin: value }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isDarkMode: value }));
  }, []);

  const generateQRCode = (id: number): string => {
    return `GYM-${id.toString().padStart(6, '0')}`;
  };

  const addMember = useCallback((memberData: Omit<Member, 'id' | 'qr_code' | 'qr_image_path'>): Member => {
    const id = Date.now();
    const qr_code = generateQRCode(id);
    const newMember: Member = {
      ...memberData,
      id,
      qr_code,
      qr_image_path: '',
    };
    setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
    return newMember;
  }, []);

  const updateMember = useCallback((id: number, updates: Partial<Member>) => {
    setState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  }, []);

  const deleteMember = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
    }));
  }, []);

  const getMember = useCallback((id: number): Member | undefined => {
    return state.members.find(m => m.id === id);
  }, [state.members]);

  const getMemberByQR = useCallback((qrCode: string): Member | undefined => {
    return state.members.find(m => m.qr_code === qrCode);
  }, [state.members]);

  const addAttendance = useCallback((memberId: number) => {
    const now = new Date();
    const attendance: Attendance = {
      id: Date.now(),
      member_id: memberId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
    };
    setState(prev => ({ ...prev, attendance: [...prev.attendance, attendance] }));
  }, []);

  const addSale = useCallback((type: string, amount: number, note: string) => {
    const sale: Sale = {
      id: Date.now(),
      type,
      amount,
      date: new Date().toISOString().split('T')[0],
      note,
    };
    setState(prev => ({ ...prev, sales: [...prev.sales, sale] }));
  }, []);

  const updatePriceSettings = useCallback((settings: Partial<PriceSettings>) => {
    setState(prev => ({
      ...prev,
      priceSettings: { ...prev.priceSettings, ...settings },
    }));
  }, []);

  const getTodayAttendance = useCallback((): Attendance[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.attendance.filter(a => a.date === today);
  }, [state.attendance]);

  const getTodaySales = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    return state.sales
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + s.amount, 0);
  }, [state.sales]);

  const getActiveMembers = useCallback((): Member[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.members.filter(m => 
      m.subscription_end && m.subscription_end >= today
    );
  }, [state.members]);

  const getExpiredMembers = useCallback((): Member[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.members.filter(m => 
      !m.subscription_end || m.subscription_end < today
    );
  }, [state.members]);

  const renewSubscription = useCallback((memberId: number) => {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);

    const priceKey = `${member.membership_type}_monthly` as keyof PriceSettings;
    const amount = state.priceSettings[priceKey] as number;

    updateMember(memberId, {
      subscription_start: today.toISOString().split('T')[0],
      subscription_end: endDate.toISOString().split('T')[0],
    });

    addSale(`monthly_${member.membership_type}`, amount, `Monthly subscription for ${member.firstname} ${member.lastname}`);
  }, [state.members, state.priceSettings, updateMember, addSale]);

  const paySession = useCallback((memberId: number, isMember: boolean) => {
    const member = state.members.find(m => m.id === memberId);
    const amount = isMember ? state.priceSettings.session_member : state.priceSettings.session_nonmember;
    const type = isMember ? 'session_member' : 'session_nonmember';
    const note = member 
      ? `Session for ${member.firstname} ${member.lastname}`
      : 'Walk-in session';
    
    addSale(type, amount, note);
    if (memberId > 0) {
      addAttendance(memberId);
    }
  }, [state.members, state.priceSettings, addSale, addAttendance]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setAuthenticated,
        setHasPin,
        toggleTheme,
        setDarkMode,
        addMember,
        updateMember,
        deleteMember,
        getMember,
        getMemberByQR,
        addAttendance,
        addSale,
        updatePriceSettings,
        getTodayAttendance,
        getTodaySales,
        getActiveMembers,
        getExpiredMembers,
        renewSubscription,
        paySession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
