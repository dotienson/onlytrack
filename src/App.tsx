import React, { useEffect, useState, useMemo, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signIn, signOut, testConnection } from "./firebase";
import { useMetrics, Metric, UserProfile } from "./hooks/useMetrics";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush,
} from "recharts";
import {
  LogOut,
  Activity,
  Ruler,
  Scale,
  Calendar,
  Plus,
  Trash2,
  Quote,
  Info,
  Flame,
  Target,
  Bell,
  UserCircle,
  Apple,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertTriangle,
  Share2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Printer,
  FileText,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import * as Slider from "@radix-ui/react-slider";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function TrendDot({ cx, cy, isLast, color, index, data, dataKey, threshold = 0 }: any) {
  if (typeof cx !== "number" || typeof cy !== "number" || isNaN(cx) || isNaN(cy)) {
    return null;
  }
  if (isLast) {
    return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} key={index} />;
  }

  let shouldShow = true;
  if (data && data.length > 2 && data[0] && data[data.length - 1] && data[index]) {
    const timeRange = data[data.length - 1].timestampForChart - data[0].timestampForChart;
    if (timeRange > 0) {
      const minSpacing = timeRange / 25; // Define density threshold
      const currentTs = data[index].timestampForChart;
      
      const distToLast = data[data.length - 1].timestampForChart - currentTs;
      if (distToLast > 0 && distToLast < minSpacing * 1.5) {
        shouldShow = false;
      } else {
        const distPrev = index > 0 && data[index - 1] ? currentTs - data[index - 1].timestampForChart : Infinity;
        const distNext = index < data.length - 1 && data[index + 1] ? data[index + 1].timestampForChart - currentTs : Infinity;

        if (distPrev < minSpacing || distNext < minSpacing) {
          shouldShow = false;
        }
      }
    }
  }

  if (!shouldShow) return null;
  return <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#fff" strokeWidth={2} key={index} />;
}

function CountdownBanner({
  targetDate,
  targetEvent,
}: {
  targetDate: string;
  targetEvent?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    mins: number;
    secs: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(`${targetDate}T00:00:00`);

    const updateTimer = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, mins, secs });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-200/50 dark:border-amber-900/30 flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-4 text-amber-700 max-w-sm text-center md:text-left">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl hidden md:block border border-amber-200 dark:border-amber-800">
          <Target className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-[pulse_3s_ease-in-out_infinite]" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-amber-600/80 dark:text-amber-400/80 uppercase mb-1 drop-shadow-sm">
            Mục tiêu sắp tới
          </p>
          <h3 className="text-2xl font-black tracking-tight text-amber-900 dark:text-amber-100 leading-tight">
            {targetEvent || "Ngày trọng đại"}
          </h3>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 text-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-2xl shadow-sm border border-black/5 min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-500">
            {timeLeft.days}
          </div>
          <div className="text-[10px] font-bold text-amber-500/70 dark:text-amber-400/70 uppercase mt-1 tracking-wider">
            Ngày
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-2xl shadow-sm border border-black/5 min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-500">
            {timeLeft.hours}
          </div>
          <div className="text-[10px] font-bold text-amber-500/70 dark:text-amber-400/70 uppercase mt-1 tracking-wider">
            Giờ
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-2xl shadow-sm border border-black/5 min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-500">
            {timeLeft.mins}
          </div>
          <div className="text-[10px] font-bold text-amber-500/70 dark:text-amber-400/70 uppercase mt-1 tracking-wider">
            Phút
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-2xl shadow-sm border border-black/5 min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-500 tabular-nums">
            {timeLeft.secs}
          </div>
          <div className="text-[10px] font-bold text-amber-500/70 dark:text-amber-400/70 uppercase mt-1 tracking-wider">
            Giây
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyCheckin({ profile, updateProfile }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  // Adjusted for Monday start (1 is Monday, 7 is Sunday)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const activities = profile?.activities || {};
  const [legend, setLegend] = useState(profile?.activityLegend || {});
  const [isEditingLegend, setIsEditingLegend] = useState(false);

  useEffect(() => {
    // update local state if profile changes
    setLegend(profile?.activityLegend || {});
  }, [profile?.activityLegend]);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const current = activities[dateStr] || 0;
    const next = (current + 1) % 5;
    
    const newActivities = { ...activities };
    if (next === 0) {
      delete newActivities[dateStr];
    } else {
      newActivities[dateStr] = next;
    }
    
    updateProfile({ activities: newActivities });
  };

  const handleLegendChange = (colorIndex: number, value: string) => {
    setLegend({ ...legend, [colorIndex]: value });
    setIsEditingLegend(true);
  };

  const saveLegend = () => {
    updateProfile({ activityLegend: legend });
    setIsEditingLegend(false);
  };

  const getColorClass = (index: number) => {
    switch(index) {
      case 1: return "bg-rose-500 text-white shadow-sm shadow-rose-500/50";
      case 2: return "bg-sky-500 text-white shadow-sm shadow-sky-500/50";
      case 3: return "bg-amber-400 text-white shadow-sm shadow-amber-400/50";
      case 4: return "bg-purple-500 text-white shadow-sm shadow-purple-500/50";
      default: return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 outline outline-1 outline-slate-200 dark:outline-slate-700/50";
    }
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // Determine active colors
  const activeColors = Array.from(new Set(Object.values(activities) as number[])).filter(Boolean).sort();

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mt-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            Lịch cá nhân
          </h3>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {showInfo && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Hướng dẫn sử dụng</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4">
                <li>Nhấn vào một ngày bất kỳ để thay đổi trạng thái (màu sắc).</li>
                <li>Tiếp tục nhấn để chuyển đổi qua lại giữa các trạng thái khác nhau.</li>
                <li>Bạn có thể định nghĩa ý nghĩa của từng màu sắc ở phần chú thích bên dưới.</li>
                <li>Hệ thống sẽ tự động lưu sau mỗi lần nhấn!</li>
              </ul>
              <button 
                onClick={() => setShowInfo(false)}
                className="mt-3 w-full py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-black w-20 text-center uppercase tracking-widest text-slate-600 dark:text-slate-300">
            Th {month + 1}/{year}
          </span>
          <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const current = activities[dateStr] || 0;
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all transform active:scale-95",
                getColorClass(current),
                isToday && current === 0 && "outline outline-2 outline-indigo-500/50 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {activeColors.length > 0 && (
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-2">
          {activeColors.map((colorIndex) => (
            <div key={colorIndex} className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full flex-shrink-0", getColorClass(colorIndex))} />
              <input
                type="text"
                value={legend[colorIndex] || ""}
                onChange={(e) => handleLegendChange(colorIndex, e.target.value)}
                className="flex-grow bg-slate-50 dark:bg-slate-900/50 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-700 dark:text-slate-300 transition-colors"
                maxLength={40}
              />
            </div>
          ))}
          {isEditingLegend && (
            <div className="flex justify-end mt-2 pt-2">
              <button
                onClick={saveLegend}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                Lưu chú thích
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatToDDMMYY(dateString: string | number | Date) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  useEffect(() => {
    testConnection();

    // Check if user was previously a guest
    const guestMode = localStorage.getItem("betteryou_guest_mode") === "true";
    if (guestMode) {
      setIsGuest(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsGuest(false);
        localStorage.setItem("betteryou_guest_mode", "false");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGuestLogin = () => {
    if (!passcode.endsWith("6") || !/[a-zA-Z]/.test(passcode) || !/[0-9]/.test(passcode)) {
      setPasscodeError("Mã kết nối không hợp lệ.");
      return;
    }
    setPasscodeError("");
    setIsGuest(true);
    localStorage.setItem("betteryou_guest_mode", "true");
  };

  const handleLogout = () => {
    if (user) {
      signOut();
    } else {
      setIsGuest(false);
      localStorage.setItem("betteryou_guest_mode", "false");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 dark:border-slate-800 text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
            <Apple className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                OnlyTrack
              </h1>
              <p className="text-indigo-600 font-bold uppercase text-lg sm:text-xl transform -skew-x-12">
                BS.Sơn
              </p>
            </div>
            <p className="text-slate-500 font-medium mt-1">Ứng dụng nhật ký tối giản</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGuestLogin}
              className="w-full py-4 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Bắt đầu ngay không cần tài khoản
            </button>
            <div className="pt-2">
              <input
                type="text"
                autoComplete="off"
                placeholder="Xin nhập mã BS.Sơn cung cấp"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError("");
                }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-800 dark:text-slate-100 text-center uppercase"
              />
              {passcodeError && (
                <p className="text-xs text-rose-500 mt-2 font-medium text-center">{passcodeError}</p>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Lưu ý: Để đảm bảo bí mật riêng tư: Dữ liệu chỉ lưu trên 01 thiết bị (thiết bị đang hiển thị). Thay đổi thiết bị sẽ không đồng bộ được dữ liệu đã nhập.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} isGuest={isGuest} onLogout={handleLogout} />;
}

function Dashboard({
  user,
  isGuest,
  onLogout,
}: {
  user: User | null;
  isGuest: boolean;
  onLogout: () => void;
}) {
  const {
    metrics,
    profile,
    loading,
    addMetric,
    deleteMetric,
    updateProfile,
    clearData,
    importLocalData,
  } = useMetrics(user, isGuest);

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getLocalDateString());
  const [rememberHeight, setRememberHeight] = useState(() => localStorage.getItem("remember_height") === "true");
  const [height, setHeight] = useState(() => localStorage.getItem("saved_height") || "");

  useEffect(() => {
    localStorage.setItem("remember_height", rememberHeight.toString());
    if (rememberHeight) {
      localStorage.setItem("saved_height", height);
    }
  }, [rememberHeight, height]);

  const [targetWeight, setTargetWeight] = useState("");
  const [nickname, setNickname] = useState("");
  const [slogan, setSlogan] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetEvent, setTargetEvent] = useState("");
  const [reminderTime, setReminderTime] = useState("06:00");

  const [savingMetric, setSavingMetric] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [chartType, setChartType] = useState<"weight" | "bmi" | "waist">(
    "weight",
  );

  const [brushRange, setBrushRange] = useState<{startIndex?: number; endIndex?: number}>({});

  const [showStats, setShowStats] = useState(false);
  const [summaryMonths, setSummaryMonths] = useState(1);

  const isProfileComplete = profile?.nickname && profile?.slogan;
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(() => {
    return localStorage.getItem("onlytrack_terms_accepted") !== "true";
  });
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.nickname !== undefined) setNickname(profile.nickname);
      if (profile.slogan !== undefined) setSlogan(profile.slogan);
      if (profile.targetDate !== undefined) setTargetDate(profile.targetDate);
      if (profile.targetEvent !== undefined) setTargetEvent(profile.targetEvent);
      if (profile.targetWeight !== undefined) setTargetWeight(profile.targetWeight.toString());
      if (profile.reminderTime !== undefined) setReminderTime(profile.reminderTime);
    }
  }, [profile]);

  useEffect(() => {
    // If no height is set in input and we lack height but have profile height, we can seed it initially
    if (height === "" && profile?.height) setHeight(profile.height.toString());
  }, [profile?.height]);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const checkReminder = () => {
      if (Notification.permission !== "granted") {
        if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
        return; // wait for next tick or user to grant
      }

      const targetTime = profile?.reminderTime || "06:00";
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHours}:${currentMinutes}`;

      const lastNotif = localStorage.getItem("betteryou_last_notif");
      const today = now.toISOString().split("T")[0];

      if (currentTime >= targetTime && lastNotif !== today) {
        new Notification("OnlyTrack - BS.Sơn", {
          body: "Chúc bạn một ngày đầy hứng khởi. Hãy bước lên cân vào cùng một thời điểm mỗi ngày nhé!",
          icon: "/vite.svg",
        });
        localStorage.setItem("betteryou_last_notif", today);
      }
    };

    checkReminder();
    const intervalId = setInterval(checkReminder, 60000);

    return () => clearInterval(intervalId);
  }, [profile?.reminderTime]);

  const handleDecimalInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > 1) {
      val = parts[0] + "." + parts[1].substring(0, 1);
    }
    setter(val);
  };

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setSavingMetric(true);

    const parsedWeight = parseFloat(weight);
    const parsedHeight = height ? parseFloat(height) : undefined;

    await addMetric(
      parsedWeight,
      parsedHeight,
      waist ? parseFloat(waist) : undefined,
      date,
      note,
    );

    // Check progress
    if (metrics.length > 0) {
      const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
      const lastMetric = sorted[sorted.length - 1]; // Current newest before save

      // We check if the NEW weight is lower than the previously newest weight
      // Or in the event we overwrote today, we check against yesterday, but simpler:
      // Just check the state before we added the new one.
      if (lastMetric && parsedWeight < lastMetric.weight) {
        // Lost weight! Confetti time!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#818cf8", "#34d399", "#fbbf24"],
        });
        alert("Tuyệt vời! Bạn đang giảm cân tốt, tiếp tục phát huy nhé! 🎉");
      } else if (lastMetric && parsedWeight > lastMetric.weight) {
        alert(
          "Cân nặng có chút tăng. Đừng nản chí, kiên trì với mục tiêu nhé! 💪",
        );
      } else {
        confetti({ particleCount: 50, origin: { y: 0.6 } });
      }
    } else {
      confetti({ particleCount: 100, origin: { y: 0.6 } });
      alert(
        "Tuyệt vời! Bạn đã bắt đầu hành trình theo dõi sức khoẻ của mình. Chúc bạn thành công! 🌟",
      );
    }

    setSavingMetric(false);
    setWeight("");
    setWaist("");
    setNote("");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportDoc = () => {
    try {
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Báo Cáo Tiến Độ</title>
      <style>
        @page WordSection1 { size: 21.0cm 29.7cm; margin: 0.5cm 1.0cm 0.5cm 1.0cm; mso-header-margin: 0.5cm; mso-footer-margin: 0.5cm; mso-paper-source: 0; }
        div.WordSection1 { page: WordSection1; }
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.2; color: #334155; margin: 0; padding: 0; }
        .document-wrapper { border: 2px solid #64748b; padding: 15px; }
        h1 { text-align: center; color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 6px; margin-bottom: 10px; margin-top: 0; font-size: 18pt; text-transform: uppercase; }
        h2 { color: #4338ca; margin-top: 12px; margin-bottom: 6px; font-size: 13pt; font-weight: bold; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; padding: 8px; margin-bottom: 10px; border-radius: 4px; }
        .info-card p { margin: 3px 0; font-size: 10.5pt; }
        .stats-grid { display: table; width: 100%; border-spacing: 8px; margin-left: -8px; margin-top: 5px; }
        .stat-box { display: table-cell; background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; width: 25%; }
        .stat-label { font-size: 9pt; color: #64748b; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 3px; }
        .stat-value { font-size: 12pt; color: #0f172a; font-weight: bold; display: block; }
        .stat-sub { font-size: 8.5pt; color: #475569; display: block; margin-top: 2px; }
        table { border-collapse: collapse; width: 100%; margin-top: 8px; table-layout: fixed; }
        th, td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; font-size: 10pt; word-wrap: break-word; }
        th { background-color: #f8fafc; font-weight: bold; color: #334155; }
        .note { text-align: left; }
        .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; font-size: 8.5pt; color: #94a3b8; font-style: italic; }
      </style>
      </head><body><div class="WordSection1 document-wrapper">`;
      
      const sortedByDateAsc = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
      const sortedByDateDesc = [...sortedByDateAsc].reverse();
      
      const today = new Date().toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
      const startDateStr = sortedByDateAsc.length > 0 ? formatToDDMMYY(sortedByDateAsc[0].date) : '-';
      const endDateStr = sortedByDateDesc.length > 0 ? formatToDDMMYY(sortedByDateDesc[0].date) : '-';

      let content = `<h1>NHẬT KÝ KIỂM SOÁT CÂN NẶNG</h1>`;
      content += `<p style="text-align: center; color: #475569; font-style: italic; margin-top: -5px; margin-bottom: 20px; font-size: 11pt;">Báo cáo ngày: ${today}<br>Dữ liệu từ ngày ${startDateStr} đến ngày ${endDateStr}</p>`;
      
      content += `<h2>THÔNG TIN CÁ NHÂN</h2>`;
      content += `<div class="info-card">`;
      content += `<p><strong>Họ tên/Nickname:</strong> ${profile?.nickname || 'Guest'}</p>`;
      if (profile?.targetEvent || profile?.targetDate) {
        content += `<p><strong>Sự kiện sắp tới:</strong> ${profile?.targetEvent || 'Ngày trọng đại'} ${profile?.targetDate ? `(Ngày: ${formatToDDMMYY(profile.targetDate)})` : ''}</p>`;
      }
      if (profile?.targetWeight) {
          content += `<p><strong>Cân nặng mục tiêu:</strong> ${profile.targetWeight} kg</p>`;
      }
      content += `</div>`;
      
      let startMetric = null;
      let peakMetric = null;
      let currentMetric = null;
      let weightChangeStr = '';
      
      let trending1m = null;
      let trending2m = null;
      let trending4m = null;
      
      if (sortedByDateAsc.length > 0) {
          startMetric = sortedByDateAsc.find(m => m.weight);
          currentMetric = sortedByDateDesc.find(m => m.weight);
          
          let maxWeight = -1;
          for (const m of sortedByDateAsc) {
              if (m.weight && m.weight > maxWeight) {
                  maxWeight = m.weight;
                  peakMetric = m;
              }
          }
          if (startMetric && currentMetric) {
               const diff = currentMetric.weight - startMetric.weight;
               if (diff > 0) {
                   weightChangeStr = `${diff.toFixed(1)} kg`;
                   content += `<h2>TỔNG QUAN</h2>`;
                   content += `<div class="info-card">`;
                   content += `<p><strong>Dữ liệu đầu:</strong> ${startMetric.weight} kg (${formatToDDMMYY(startMetric.date)})</p>`;
                   content += `<p><strong>Đỉnh điểm:</strong> ${peakMetric?.weight} kg (${peakMetric ? formatToDDMMYY(peakMetric.date) : ''})</p>`;
                   content += `<p><strong>Hiện tại:</strong> ${currentMetric.weight} kg (${formatToDDMMYY(currentMetric.date)})</p>`;
                   content += `<p><strong>Đã tăng:</strong> ${weightChangeStr}</p>`;
                   content += `</div>`;
               } else if (diff < 0) {
                   weightChangeStr = `${Math.abs(diff).toFixed(1)} kg`;
                   content += `<h2>TỔNG QUAN</h2>`;
                   content += `<div class="info-card">`;
                   content += `<p><strong>Dữ liệu đầu:</strong> ${startMetric.weight} kg (${formatToDDMMYY(startMetric.date)})</p>`;
                   content += `<p><strong>Đỉnh điểm:</strong> ${peakMetric?.weight} kg (${peakMetric ? formatToDDMMYY(peakMetric.date) : ''})</p>`;
                   content += `<p><strong>Hiện tại:</strong> ${currentMetric.weight} kg (${formatToDDMMYY(currentMetric.date)})</p>`;
                   content += `<p><strong>Đã giảm:</strong> ${weightChangeStr}</p>`;
                   content += `</div>`;
               } else {
                   content += `<h2>TỔNG QUAN</h2>`;
                   content += `<div class="info-card">`;
                   content += `<p><strong>Dữ liệu đầu:</strong> ${startMetric.weight} kg (${formatToDDMMYY(startMetric.date)})</p>`;
                   content += `<p><strong>Đỉnh điểm:</strong> ${peakMetric?.weight} kg (${peakMetric ? formatToDDMMYY(peakMetric.date) : ''})</p>`;
                   content += `<p><strong>Hiện tại:</strong> ${currentMetric.weight} kg (${formatToDDMMYY(currentMetric.date)})</p>`;
                   content += `<p><strong>Thay đổi tổng:</strong> Không đổi</p>`;
                   content += `</div>`;
               }
          }

          const currentDateTime = new Date(currentMetric?.date || new Date()).getTime();

          const getTrend = (months: number) => {
             const targetDate = new Date(currentDateTime);
             targetDate.setDate(targetDate.getDate() - months * 30);
             const targetTime = targetDate.getTime();
             
             if (sortedByDateAsc[0] && new Date(sortedByDateAsc[0].date).getTime() > targetTime) {
                 return null;
             }
             
             let closeMetric = sortedByDateAsc[0];
             let minDiff = Infinity;
             for (const m of sortedByDateAsc) {
                 if (!m.weight) continue;
                 const diff = Math.abs(new Date(m.date).getTime() - targetTime);
                 if (diff < minDiff) {
                     minDiff = diff;
                     closeMetric = m;
                 }
             }
             if (closeMetric && currentMetric && closeMetric !== currentMetric) {
                 const diff = currentMetric.weight - closeMetric.weight;
                 const sign = diff > 0 ? '+' : (diff < 0 ? '-' : '');
                 return { value: `${sign}${Math.abs(diff).toFixed(1)} kg`, date: formatToDDMMYY(closeMetric.date), diff };
             }
             return null; // Not enough change or exactly same timeframe
          };
          
          trending1m = getTrend(1);
          trending2m = getTrend(2);
          trending4m = getTrend(4);

          if (trending1m || trending2m || trending4m) {
              content += `<h2>THỐNG KÊ XU HƯỚNG</h2>`;
              content += `<div class="stats-grid">`;
              if (trending1m) {
                  content += `
                  <div class="stat-box">
                      <span class="stat-label">1 Tháng</span>
                      <span class="stat-value" style="color: ${trending1m.diff > 0 ? '#e11d48' : '#059669'};">${trending1m.value}</span>
                      <span class="stat-sub">Từ ${trending1m.date}</span>
                  </div>`;
              }
              if (trending2m) {
                  content += `
                  <div class="stat-box">
                      <span class="stat-label">2 Tháng</span>
                      <span class="stat-value" style="color: ${trending2m.diff > 0 ? '#e11d48' : '#059669'};">${trending2m.value}</span>
                      <span class="stat-sub">Từ ${trending2m.date}</span>
                  </div>`;
              }
              if (trending4m) {
                  content += `
                  <div class="stat-box">
                      <span class="stat-label">4 Tháng</span>
                      <span class="stat-value" style="color: ${trending4m.diff > 0 ? '#e11d48' : '#059669'};">${trending4m.value}</span>
                      <span class="stat-sub">Từ ${trending4m.date}</span>
                  </div>`;
              }
              content += `</div>`;
          }
      }
      
      content += `<h2>CHI TIẾT LỊCH SỬ CHỈ SỐ</h2>`;
      content += `<table>
          <tr>
              <th style="width: 15%;">Ngày</th>
              <th style="width: 15%;">Cân nặng (kg)</th>
              <th style="width: 15%;">Chiều cao (cm)</th>
              <th style="width: 15%;">BMI</th>
              <th style="width: 15%;">Vòng eo (cm)</th>
              <th style="width: 25%;">Ghi chú</th>
          </tr>`;
          
      sortedByDateDesc.forEach(m => {
          content += `<tr>
              <td>${formatToDDMMYY(m.date)}</td>
              <td>${m.weight || '-'}</td>
              <td>${m.height || '-'}</td>
              <td>${m.bmi || '-'}</td>
              <td>${m.waist || '-'}</td>
              <td class="note">${m.note || '-'}</td>
          </tr>`;
      });
      
      content += `</table>`;
      
      content += `<div class="footer">
        Xuất từ ứng dụng OnlyTrack của BS Đỗ Tiến Sơn TAHN<br>
        Dữ liệu do người dùng tự nhập và quản lí tại máy cá nhân
      </div>`;

      content += `</div></body></html>`;

      const blob = new Blob(['\ufeff', header + content], {
          type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const removeAccents = (str: string) => {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
      };
      const safeNickname = (profile?.nickname || 'Guest').split(' ').map(removeAccents).join(' ');
      const now = new Date();
      const backupDate = now.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
      
      link.download = `${safeNickname} - KSCN Report - ${backupDate} by OnlyTrack DrSon TAHN.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi xuất dữ liệu.');
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        metrics,
        profile
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const removeAccents = (str: string) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
      };
      const safeNickname = (profile?.nickname || 'Guest')
        .split(' ')
        .map(removeAccents)
        .join('');
      const now = new Date();
      const backupDate = now.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
      const backupTime = now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
      
      link.download = `${safeNickname} ${backupDate} ${backupTime} OnlyTrackApp BS Son.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      alert("Đã xảy ra lỗi khi tải dữ liệu.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        let importedMetrics: any = null;
        let importedProfile: any = null;
        if (parsed.metrics) {
            importedMetrics = parsed.metrics;
        }
        if (parsed.profile) {
            importedProfile = parsed.profile;
        }
        
        if (importedMetrics || importedProfile) {
            importLocalData(importedMetrics, importedProfile);
            alert("Khôi phục dữ liệu thành công! 🥳");
            window.location.reload();
        } else {
             alert("File dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        }
      } catch (err) {
        console.error("Lỗi đọc file:", err);
        alert("File dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const updates: Partial<UserProfile> = {};
    updates.nickname = nickname;
    updates.slogan = slogan;
    updates.targetDate = targetDate;
    updates.targetEvent = targetEvent;
    updates.targetWeight = targetWeight ? parseFloat(targetWeight) : undefined;
    updates.reminderTime = reminderTime;

    await updateProfile(updates);
    setSavingProfile(false);
    setShowAccountModal(false);
  };

  const handleShare = async () => {
    if (metrics.length === 0) {
      alert("Chưa có dữ liệu để chia sẻ!");
      return;
    }
    const sortedAsc = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
    const firstMetric = sortedAsc[0];
    const latestMetricInner = sortedAsc[sortedAsc.length - 1];

    let startWeight = firstMetric.weight || 0;
    let startBmi = firstMetric.bmi;
    const calcHeightFirst = firstMetric.height || profile?.height;
    if (!startBmi && calcHeightFirst && startWeight) {
      const hM = calcHeightFirst / 100;
      startBmi = parseFloat((startWeight / (hM * hM)).toFixed(1));
    }

    const allWeights = sortedAsc.map(m => m.weight).filter(w => w !== undefined && w !== null) as number[];
    const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : startWeight;

    const startDate = new Date(firstMetric.date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const currentWeight = latestMetricInner.weight || startWeight;
    const weightLostStr = (startWeight - currentWeight).toFixed(1).replace(/\.0$/, '');

    let text = `Thật tự hào khi tôi cố gắng mỗi ngày! Tôi đã bắt đầu hành trình với ${startWeight}kg và BMI ${startBmi || '--'}, `;
    if (maxWeight > startWeight) {
      text += `thậm chí có lúc lên tới ${maxWeight}kg, `;
    }
    text += `sau ${daysElapsed} ngày, tôi đã giảm được ${weightLostStr}kg. Hành trình bắt đầu từ những bước chân nho nhỏ! Hãy tự hào ghi lại cùng app OnlyTrack Free https://onlytracking.vercel.app của BS Đỗ Tiến Sơn nhé!`;
    const title = "Hành trình của tôi";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        });
      } catch (err) {
        console.error("Lỗi chia sẻ:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}`);
        alert("Đã sao chép vào bộ nhớ tạm!");
      } catch (err) {
        console.error("Không thể sao chép:", err);
      }
    }
  };

  const sortedMetrics = useMemo(
    () => [...metrics].sort((a, b) => a.date.localeCompare(b.date)),
    [metrics],
  );
  const parsedMetrics = useMemo(() => {
    return sortedMetrics.map((m) => {
      let calcBmi = m.bmi;
      const calcHeight = m.height || profile?.height;
      if (!calcBmi && calcHeight && m.weight) {
        const heightInMeters = calcHeight / 100;
        calcBmi = parseFloat(
          (m.weight / (heightInMeters * heightInMeters)).toFixed(1),
        );
      }
      return {
        ...m,
        bmi: calcBmi,
        timestampForChart: new Date(m.date).getTime(),
      };
    });
  }, [sortedMetrics, profile?.height]);

  const weeklyReportData = useMemo(() => {
    if (parsedMetrics.length === 0) return null;
    
    const now = new Date();
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      last7Days.push(`${y}-${m}-${day}`);
    }

    const prev7Days = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      prev7Days.push(`${y}-${m}-${day}`);
    }

    const metricsThisWeek = parsedMetrics.filter(m => last7Days.includes(m.date));
    const metricsLastWeek = parsedMetrics.filter(m => prev7Days.includes(m.date));

    const thisWeekWeight = metricsThisWeek.filter(m => m.weight).map(m => m.weight!);
    const lastWeekWeight = metricsLastWeek.filter(m => m.weight).map(m => m.weight!);
    
    const avgThisWeek = thisWeekWeight.length > 0 ? (thisWeekWeight.reduce((a,b)=>a+b,0)/thisWeekWeight.length) : null;
    const avgLastWeek = lastWeekWeight.length > 0 ? (lastWeekWeight.reduce((a,b)=>a+b,0)/lastWeekWeight.length) : null;
    
    let changeStr = "";
    let isLoss = false;
    if (avgThisWeek !== null && avgLastWeek !== null) {
      const diff = avgThisWeek - avgLastWeek;
      isLoss = diff <= 0;
      changeStr = Math.abs(diff).toFixed(1) + " kg";
    }

    const minWeight = thisWeekWeight.length > 0 ? Math.min(...thisWeekWeight) : null;
    const maxWeight = thisWeekWeight.length > 0 ? Math.max(...thisWeekWeight) : null;
    const inputDaysCount = metricsThisWeek.length;
    
    return {
      last7Days,
      metricsThisWeek,
      avgThisWeek,
      avgLastWeek,
      changeStr,
      isLoss,
      minWeight,
      maxWeight,
      inputDaysCount
    };
  }, [parsedMetrics]);

  const latestMetric = parsedMetrics[parsedMetrics.length - 1];
  const hasTodayMetric = metrics.some(m => m.date === getLocalDateString());

  const streakData = useMemo(() => {
    if (metrics.length === 0) return { count: 0 };
    const uniqueDates = [...new Set(metrics.filter(m => m.weight).map(m => m.date))].sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) return { count: 0 };

    const toDateStr = (d: Date) => {
       const y = d.getFullYear();
       const m = String(d.getMonth() + 1).padStart(2, '0');
       const dateDay = String(d.getDate()).padStart(2, '0');
       return `${y}-${m}-${dateDay}`;
    };

    let count = 0;
    let expectedDate = new Date(); 
    
    const checkToday = toDateStr(expectedDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    const checkYesterday = toDateStr(expectedDate);
    
    // reset expectedDate to today for the loop setup
    expectedDate = new Date();
    
    if (uniqueDates[0] === checkToday) {
       count = 1;
    } else if (uniqueDates[0] === checkYesterday) {
       count = 1;
       expectedDate.setDate(expectedDate.getDate() - 1); // shift back so first loop iteration checks day before yesterday
    } else {
       return { count: 0 };
    }
    
    for (let i = 1; i < uniqueDates.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        if (uniqueDates[i] === toDateStr(expectedDate)) {
            count++;
        } else {
            break;
        }
    }
    return { count };
  }, [metrics]);

  const badges = useMemo(() => {
    if (parsedMetrics.length < 2) return [];
    const firstM = parsedMetrics.find(m => m.weight);
    const lastM = [...parsedMetrics].reverse().find(m => m.weight);
    if (!firstM || !lastM || !firstM.weight || !lastM.weight) return [];
    
    const diff = firstM.weight - lastM.weight;
    if (diff < 2) return [];
    
    const res = [];
    if (diff >= 2 && diff < 5) res.push("🥉 Giảm 2kg");
    if (diff >= 5 && diff < 10) res.push("🥈 Giảm 5kg");
    if (diff >= 10 && diff < 20) res.push("🥇 Giảm 10kg");
    if (diff >= 20) res.push("👑 Giảm 20kg+");
    return res;
  }, [parsedMetrics]);

  const chartDomainX = useMemo(() => {
    if (parsedMetrics.length === 0) {
      const now = Date.now();
      const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
      return [now - sixMonths, now + sixMonths];
    }
    if (parsedMetrics.length === 1) {
      const point = parsedMetrics[0].timestampForChart;
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      return [point - oneMonth, point + oneMonth];
    }
    return ["dataMin", "dataMax"];
  }, [parsedMetrics]);

  const defaultBrushStartIndex = useMemo(() => {
    if (parsedMetrics.length <= 15) return 0;
    
    const lastPoint = parsedMetrics[parsedMetrics.length - 1].timestampForChart;
    const targetTime = lastPoint - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    
    let idx = parsedMetrics.findIndex(m => m.timestampForChart >= targetTime);
    if (idx === -1) idx = parsedMetrics.length - 15;
    
    // Ensure we show at least 5 points to have a good graph, but don't overflow
    if (parsedMetrics.length - idx < 5) {
      idx = Math.max(0, parsedMetrics.length - 15);
    }
    return idx;
  }, [parsedMetrics]);

  let whtr = null;
  const currentHeight = latestMetric?.height || profile?.height;
  if (latestMetric?.waist && currentHeight) {
    whtr = latestMetric.waist / currentHeight;
  }

  const hasMetabolicRisk = whtr !== null && whtr > 0.5;
  const username =
    profile?.nickname ||
    (isGuest ? "Khách" : user?.displayName?.split(" ")[0] || "Bạn");

  const visibleMetrics = useMemo(() => {
    if (parsedMetrics.length > 5) {
      let start = brushRange.startIndex ?? defaultBrushStartIndex;
      let end = brushRange.endIndex ?? (parsedMetrics.length - 1);
      start = Math.max(0, Math.min(start, parsedMetrics.length - 1));
      end = Math.max(start, Math.min(end, parsedMetrics.length - 1));
      return parsedMetrics.slice(start, end + 1);
    }
    return parsedMetrics;
  }, [parsedMetrics, brushRange, defaultBrushStartIndex]);

  const availableMonths = useMemo(() => {
    if (parsedMetrics.length === 0) return 0;
    const firstDate = parsedMetrics[0].timestampForChart;
    const lastDate = parsedMetrics[parsedMetrics.length - 1].timestampForChart;
    const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    // Even if they have e.g. 40 days, allow up to 2 months so they can compare
    return Math.max(1, Math.ceil(diffDays / 30));
  }, [parsedMetrics]);

  const summaryData = useMemo(() => {
    if (parsedMetrics.length === 0) return null;
    
    // Use the latest metric date as the reference point
    const latestDate = new Date(parsedMetrics[parsedMetrics.length - 1].timestampForChart);
    
    const rangeDate = new Date(latestDate.getTime());
    rangeDate.setDate(latestDate.getDate() - (summaryMonths * 30));
    rangeDate.setHours(0, 0, 0, 0);

    // Find the closest metric to rangeDate to serve as our start point
    let startMetric = parsedMetrics[0];
    let minDiff = Infinity;
    for (const m of parsedMetrics) {
      const diff = Math.abs(m.timestampForChart - rangeDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        startMetric = m;
      }
    }

    const recentMetrics = parsedMetrics.filter(m => m.timestampForChart >= startMetric.timestampForChart);
    const endMetric = parsedMetrics[parsedMetrics.length - 1];
    
    let weightChangeStr = "0.0 kg";
    let isLoss = false;
    let avgWeightLostPerWeekStr = "--";
    
    let hasData = true;
    if (startMetric.weight && endMetric.weight && startMetric !== endMetric) {
      const diff = endMetric.weight - startMetric.weight;
      isLoss = diff < 0;
      weightChangeStr = Math.abs(diff).toFixed(1) + " kg";
      
      const exactDays = Math.max(1, (endMetric.timestampForChart - startMetric.timestampForChart) / (1000 * 60 * 60 * 24));
      const weeks = Math.max(1, exactDays / 7);
      
      const avg = Math.abs(diff) / weeks;
      avgWeightLostPerWeekStr = avg.toFixed(1) + " kg/tuần";
    }

    return {
      recentMetrics,
      weightChangeStr,
      isLoss,
      avgWeightLostPerWeekStr,
      hasData: true
    };
  }, [parsedMetrics, summaryMonths]);

  const yAxisConfig = useMemo(() => {
    if (chartType === "weight") {
      if (visibleMetrics.length > 0) {
        const weights = visibleMetrics.map(m => m.weight);
        if (profile?.targetWeight) {
          weights.push(profile.targetWeight);
        }
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        
        let minDomain = Math.floor(minWeight) - 2;
        let maxDomain = Math.ceil(maxWeight) + 2;
        
        if (minDomain < 0) minDomain = 0;
        
        const ticks = [];
        let step = 5;
        if (maxDomain - minDomain <= 10) step = 1;
        else if (maxDomain - minDomain <= 20) step = 2;
        
        const startTick = Math.ceil(minDomain / step) * step;
        for (let i = startTick; i <= maxDomain; i += step) {
          ticks.push(i);
        }
        
        return { domain: [minDomain, maxDomain], ticks };
      }
      return { domain: [0, "auto"], ticks: undefined };
    }
    if (chartType === "bmi") {
      if (visibleMetrics.length > 0) {
        const bmis = visibleMetrics.map(m => m.bmi || 0).filter(b => b > 0);
        if (bmis.length > 0) {
          const minBmi = Math.min(...bmis);
          const maxBmi = Math.max(...bmis);
          return {
            domain: [Math.max(10, Math.floor(minBmi) - 2), Math.ceil(maxBmi) + 2],
            ticks: undefined
          };
        }
      }
      return {
        domain: [20, 40],
        ticks: undefined
      };
    }
    if (chartType === "waist") {
      if (visibleMetrics.length > 0) {
        const waists = visibleMetrics.map(m => m.waist || 0).filter(w => w > 0);
        if (waists.length > 0) {
          const minWaist = Math.min(...waists);
          const maxWaist = Math.max(...waists);
          return {
            domain: [Math.max(40, Math.floor(minWaist) - 5), Math.ceil(maxWaist) + 5],
            ticks: undefined
          };
        }
      }
      return {
        domain: [60, 150],
        ticks: undefined
      };
    }
    return { domain: ["auto", "auto"], ticks: undefined };
  }, [chartType, visibleMetrics]);

  const bentoCard =
    "bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 dark:border-white/5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 font-sans text-slate-800 dark:text-slate-100 selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 border-b border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap sm:flex-nowrap">
              <h1 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tighter leading-tight mt-1 sm:mt-0">
                OnlyTrack
              </h1>
              <span className="text-[11px] sm:text-xs font-black text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-wide mt-1 transform -skew-x-12">
                BS.Sơn
              </span>
              <div className="w-full sm:w-auto h-0 sm:h-auto sm:border-l sm:border-slate-300 dark:sm:border-slate-600 sm:mx-2 sm:pl-2"></div>
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 italic mt-0 sm:mt-1 hidden sm:inline-block">
                Ứng dụng nhật ký tối giản
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 print:hidden">
            <button
              onClick={handleExportDoc}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-colors"
              title="Xuất báo cáo (DOC)"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200 transition-colors"
              title={showStats ? "Ẩn chỉ số" : "Hiện chỉ số"}
            >
              {showStats ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-2 group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 sm:px-4 py-2 rounded-full border border-black/5 dark:border-white/5 shadow-sm transition-colors"
              title="Quản lí tài khoản"
            >
              <UserCircle className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 hidden sm:block">
                {profile?.nickname ? profile.nickname : "Tài khoản"}
              </span>
            </button>
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Slogan */}
        {(profile?.slogan || !profile) && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[140px]">
            <Quote className="absolute top-4 left-4 w-24 h-24 text-white/10 -rotate-12" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-start justify-center gap-1 italic text-indigo-50">
                <span className="text-indigo-300">"</span>
                {profile?.slogan || "Cam kết của bạn là gì? Thêm slogan ngay!"}
                <span className="text-indigo-300">"</span>
              </h2>
              <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase">
                — {username} —
              </p>
            </div>
          </div>
        )}

        {/* Target Banner */}
        {profile?.targetDate && (
          <CountdownBanner
            targetDate={profile.targetDate}
            targetEvent={profile.targetEvent}
          />
        )}

        {/* Mobile Metrics Box */}
        <div className="md:hidden bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 dark:border-white/5 p-5 flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400">
              <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Cân nặng</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-teal-900">
                  {!latestMetric?.weight
                    ? "--"
                    : showStats
                      ? latestMetric.weight
                      : "**"}
                </span>
                <span className="text-teal-700 font-bold text-xs">kg</span>
              </div>
              {latestMetric?.weight && showStats && (
                <button
                  onClick={handleShare}
                  className="p-1.5 text-slate-400 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Chia sẻ cân nặng"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Chỉ số BMI</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="text-xl font-black text-blue-900">
                  {!latestMetric?.bmi
                    ? "--"
                    : showStats
                      ? latestMetric.bmi
                      : "**"}
                </span>
              </div>
              {latestMetric?.bmi && showStats && (
                <button
                  onClick={handleShare}
                  className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Chia sẻ BMI"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Ruler className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Vòng eo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-900">
                  {!latestMetric?.waist
                    ? "--"
                    : showStats
                      ? latestMetric.waist
                      : "**"}
                </span>
                <span className="text-amber-700 font-bold text-xs">cm</span>
              </div>
              {latestMetric?.waist && showStats && (
                <button
                  onClick={handleShare}
                  className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Chia sẻ vòng eo"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                hasMetabolicRisk ? "text-rose-700" : "text-emerald-700",
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  hasMetabolicRisk ? "bg-rose-100" : "bg-emerald-100",
                )}
              >
                {hasMetabolicRisk ? (
                  <Flame className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
              </div>
              <span className="font-bold text-sm">Tỷ lệ WHtR</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                {whtr === null ? (
                  <span className="text-slate-400 text-xs font-medium">
                    Thiếu dữ liệu
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-xl font-black",
                      hasMetabolicRisk ? "text-rose-900" : "text-emerald-900",
                    )}
                  >
                    {!whtr ? "--" : showStats ? whtr.toFixed(2) : "**"}
                  </span>
                )}
              </div>
              {whtr !== null && showStats && whtr > 0 && (
                <button
                  onClick={handleShare}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors bg-slate-50",
                    hasMetabolicRisk 
                      ? "text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      : "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                  )}
                  title="Chia sẻ tỷ lệ WHtR"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Stat: Weight */}
          <div
            className={cn(
              bentoCard,
              "md:col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-teal-100 dark:border-teal-900/50 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-teal-700 dark:text-teal-400">
                <div className="p-2.5 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Cân nặng</h3>
              </div>
              {latestMetric?.weight && showStats && (
                <button
                  onClick={handleShare}
                  className="p-2 text-teal-600/50 hover:text-teal-700 hover:bg-teal-100 dark:text-teal-400/50 dark:hover:text-teal-300 dark:hover:bg-teal-900/50 rounded-xl transition-colors"
                  title="Chia sẻ cân nặng"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-5xl font-black text-teal-900 dark:text-teal-100 tracking-tighter">
                {!latestMetric?.weight
                  ? "--"
                  : showStats
                    ? latestMetric.weight
                    : "**"}
              </span>
              <span className="text-teal-700 dark:text-teal-400 font-bold">kg</span>
            </div>
          </div>

          {/* BMI */}
          <div
            className={cn(
              bentoCard,
              "bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-blue-100 dark:border-blue-900/50 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Chỉ số BMI</h3>
              </div>
              {latestMetric?.bmi && showStats && (
                <button
                  onClick={handleShare}
                  className="p-2 text-blue-600/50 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400/50 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                  title="Chia sẻ BMI"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-baseline mt-auto">
              <span className="text-5xl font-black text-blue-900 dark:text-blue-100 tracking-tighter">
                {!latestMetric?.bmi
                  ? "--"
                  : showStats
                    ? latestMetric.bmi
                    : "**"}
              </span>
            </div>
          </div>

          {/* Waist */}
          <div
            className={cn(
              bentoCard,
              "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-900/50 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                  <Ruler className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Vòng eo</h3>
              </div>
              {latestMetric?.waist && showStats && (
                <button
                  onClick={handleShare}
                  className="p-2 text-amber-600/50 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400/50 dark:hover:text-amber-300 dark:hover:bg-amber-900/50 rounded-xl transition-colors"
                  title="Chia sẻ vòng eo"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-5xl font-black text-amber-900 dark:text-amber-100 tracking-tighter">
                {!latestMetric?.waist
                  ? "--"
                  : showStats
                    ? latestMetric.waist
                    : "**"}
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">cm</span>
            </div>
          </div>

          {/* WHtR Analysis */}
          <div
            className={cn(
              bentoCard,
              "md:col-span-2 lg:col-span-1 flex flex-col justify-between relative overflow-hidden",
              hasMetabolicRisk
                ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200/50 dark:border-rose-900/30"
                : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-900/30",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "flex items-center gap-3",
                  hasMetabolicRisk ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400",
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-xl",
                    hasMetabolicRisk ? "bg-rose-100 dark:bg-rose-900/50" : "bg-emerald-100 dark:bg-emerald-900/50",
                  )}
                >
                  {hasMetabolicRisk ? (
                    <Flame className="w-5 h-5" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                </div>
                <h3 className="font-bold flex items-center gap-1.5">
                  Tỷ lệ WHtR
                  {hasMetabolicRisk && (
                    <span title="Nguy cơ chuyển hóa cao" className="cursor-help">
                      <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    </span>
                  )}
                </h3>
              </div>
              {whtr !== null && showStats && whtr > 0 && (
                <button
                  onClick={handleShare}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    hasMetabolicRisk 
                      ? "text-rose-600/50 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400/50 dark:hover:text-rose-300 dark:hover:bg-rose-900/50"
                      : "text-emerald-600/50 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400/50 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/50"
                  )}
                  title="Chia sẻ tỷ lệ WHtR"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-auto">
              {whtr === null ? (
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Cần nhập{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-300">Chiều cao</span> &{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-300">Vòng eo</span>.
                </p>
              ) : (
                <div className="flex items-baseline gap-2 mt-auto">
                  <span
                    className={cn(
                      "text-5xl font-black tracking-tighter",
                      hasMetabolicRisk ? "text-rose-900 dark:text-rose-400" : "text-emerald-900 dark:text-emerald-400",
                    )}
                  >
                    {!whtr ? "--" : showStats ? whtr.toFixed(2) : "**"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inputs section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          <div className="lg:col-span-5 space-y-6 print:w-full print:block">
            {/* Input Metric */}
            <div className={cn(bentoCard, "transition-all duration-700 print:hidden", !hasTodayMetric ? "shadow-[0_0_20px_rgba(244,63,94,0.15)] border-rose-200 dark:border-rose-900/50" : "")}>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                Cập nhật chỉ số mới
              </h2>
              <form onSubmit={handleSaveMetric} className="space-y-4">
                <div className="w-2/3 sm:w-1/2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    Ngày cập nhật
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10 pointer-events-none" />
                    <span className="absolute left-10 text-slate-700 dark:text-slate-100 font-bold top-1/2 -translate-y-1/2 pointer-events-none">
                      {date ? formatToDDMMYY(date) : "DD/MM/YY"}
                    </span>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50/50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                      style={{ color: "transparent" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      Cân nặng
                      <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 block sm:inline">
                        (kg)
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      inputMode="decimal"
                      value={weight}
                      onChange={handleDecimalInput(setWeight)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50/50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      Vòng eo
                      <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 block sm:inline">
                        (cm)
                      </span>
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      value={waist}
                      onChange={handleDecimalInput(setWaist)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50/50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                      Chiều cao
                      <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 block sm:inline">
                        (cm)
                      </span>
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      value={height}
                      onChange={handleDecimalInput(setHeight)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50/50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 shadow-sm"
                    />
                    <label className="flex items-center gap-1.5 cursor-pointer mt-2 ml-1">
                      <input
                        type="checkbox"
                        checked={rememberHeight}
                        onChange={(e) => setRememberHeight(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
                        Ghi nhớ
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    Ghi chú{" "}
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      (tuỳ chọn)
                    </span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-100"
                    maxLength={500}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingMetric || !weight}
                  className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:shadow-none disabled:transform-none"
                >
                  {savingMetric ? "Đang lưu..." : "Lưu chỉ số"}
                </button>
              </form>
            </div>

            {/* Summary Card */}
            {summaryData && summaryData.hasData && (
              <div className={cn(bentoCard, "flex flex-col relative overflow-hidden group")}>
                {/* Decorative background element background */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>

                <div className="flex items-center justify-between relative z-10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-xl shadow-sm border border-sky-100 dark:border-sky-800">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight">Thống kê xu hướng</h3>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Tiến độ cá nhân</p>
                    </div>
                  </div>
                  {weeklyReportData && weeklyReportData.inputDaysCount > 0 && (
                    <button 
                      onClick={() => setShowWeeklyReport(true)}
                      className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl shadow-sm border border-indigo-100/50 dark:border-indigo-800/30 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1.5 active:scale-95"
                    >
                      <Calendar className="w-4 h-4" /> 
                      <span className="hidden sm:inline">Báo cáo tuần</span>
                      <span className="sm:hidden">Tuần</span>
                    </button>
                  )}
                </div>

                {availableMonths >= 2 && (
                  <div className="relative z-10 mb-6 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-max sm:w-full sm:grid sm:grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 6].filter(m => m <= Math.max(1, availableMonths)).map(m => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setSummaryMonths(m)}
                          className={cn(
                            "px-4 sm:px-2 py-2 text-xs font-bold rounded-xl transition-all duration-300 text-center whitespace-nowrap",
                            summaryMonths === m 
                              ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                          )}
                        >
                          {m} tháng
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-2 relative z-10">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-500 hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                      THAY ĐỔI ({summaryMonths} THÁNG)
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={cn(
                        "text-3xl font-black tracking-tighter drop-shadow-sm",
                        summaryData.isLoss ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {summaryData.isLoss ? "-" : "+"}{summaryData.weightChangeStr}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-500 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"></span>
                      {summaryData.isLoss ? "TRUNG BÌNH GIẢM" : (summaryData.weightChangeStr === "0.0 kg" ? "TRUNG BÌNH" : "TRUNG BÌNH TĂNG")}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-3xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                        {summaryData.avgWeightLostPerWeekStr.split(" ")[0]}
                      </span>
                      <span className="text-sm font-bold text-indigo-500/70 dark:text-indigo-400/70">
                         kg/tuần
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-32 w-full mt-4 relative -mx-2 opacity-90 transition-opacity duration-500 group-hover:opacity-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={summaryData.recentMetrics}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 shadow-lg border border-black/5 dark:border-white/5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col gap-1 items-center">
                                <span className="text-sky-600 dark:text-sky-400 text-[10px] uppercase tracking-widest">{formatToDDMMYY(data.date)}</span>
                                <span className="text-sm">{data.weight} kg</span>
                              </div>
                             )
                          }
                          return null;
                        }}
                        cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                        isAnimationActive={true}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6 print:w-full print:block">
            {/* Chart Widget */}
            <div
              ref={chartRef}
              className={cn(
                bentoCard,
                "flex flex-col min-h-[520px] overflow-hidden",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      Hành trình của tôi...
                    </h2>
                    {(streakData.count > 0 || badges.length > 0) && (
                      <div className="flex items-center gap-2 mt-0.5">
                        {streakData.count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-md border border-orange-200 dark:border-orange-800">
                            🔥 {streakData.count} ngày liên tiếp
                          </span>
                        )}
                        {badges.slice(0, 2).map((b, idx) => (
                           <span key={idx} className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-md border border-sky-200 dark:border-sky-800">
                             {b}
                           </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1.5 opacity-60 mt-1.5 pointer-events-none">
                      <span className="text-[11px] text-slate-500 font-medium italic">Nhật kí tại...</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white tracking-tighter leading-tight">
                        OnlyTrack
                      </span>
                      <span className="text-[11px] font-black text-indigo-600/90 dark:text-indigo-400/90 uppercase tracking-wide transform -skew-x-12">
                        BS.Sơn
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex rounded-xl p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner print:hidden">
                  <button
                    onClick={() => setChartType("weight")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "weight"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
                    )}
                  >
                    Cân nặng
                  </button>
                  <button
                    onClick={() => setChartType("bmi")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "bmi"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
                    )}
                  >
                    BMI
                  </button>
                  <button
                    onClick={() => setChartType("waist")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "waist"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
                    )}
                  >
                    Vòng eo
                  </button>
                </div>
              </div>

              {sortedMetrics.length > 0 ? (
                <div className="w-full mt-4 relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={visibleMetrics}
                      margin={{ top: 10, right: 30, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#94a3b8"
                        strokeOpacity={0.15}
                      />
                      <XAxis
                        dataKey="timestampForChart"
                        type="number"
                        scale="time"
                        domain={chartDomainX}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        dy={15}
                        dx={-5}
                        padding={{ left: 20, right: 20 }}
                        tickFormatter={(val) => {
                          if (!val) return "";
                          const d = new Date(val);
                          const day = d.getDate().toString().padStart(2, "0");
                          const month = (d.getMonth() + 1).toString().padStart(2, "0");
                          const year = d.getFullYear().toString().slice(-2);
                          return `${day}/${month}/${year}`;
                        }}
                      />
                      <YAxis
                        domain={yAxisConfig.domain as any}
                        ticks={yAxisConfig.ticks}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={-8}
                        width={60}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-800 p-2.5 px-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 min-w-[140px]">
                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-1.5 text-[10px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-1.5">
                                  {formatToDDMMYY(data.date)}
                                </p>
                                <div className="space-y-1 mb-1.5">
                                  {data.weight && (
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>Cân nặng</span>
                                      <span className="font-black text-xs text-slate-800 dark:text-slate-100">{data.weight} kg</span>
                                    </div>
                                  )}
                                  {data.bmi && (
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>BMI</span>
                                      <span className="font-black text-xs text-slate-800 dark:text-slate-100">{data.bmi}</span>
                                    </div>
                                  )}
                                  {data.waist && (
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>Vòng eo</span>
                                      <span className="font-black text-xs text-slate-800 dark:text-slate-100">{data.waist} cm</span>
                                    </div>
                                  )}
                                </div>
                                {data.note && (
                                  <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-700">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] italic max-w-[180px] line-clamp-2">
                                      "{data.note}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {showStats &&
                        profile?.targetWeight &&
                        chartType === "weight" && (
                          <ReferenceLine
                            y={profile.targetWeight}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            strokeOpacity={0.6}
                            label={{
                              position: "insideTopLeft",
                              value: "Mục tiêu",
                              fill: "#ef4444",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                      {chartType === "weight" && (
                        <Line
                          type="monotone"
                          dataKey="weight"
                          name="Cân nặng (kg)"
                          stroke="#4f46e5"
                          strokeWidth={4}
                          dot={(props: any) => (
                            <TrendDot 
                              {...props} 
                              isLast={props.index === visibleMetrics.length - 1} 
                              color="#4f46e5" 
                              data={visibleMetrics} 
                              dataKey="weight" 
                              threshold={0.5}
                            />
                          )}
                          activeDot={{
                            r: 8,
                            fill: "#3730a3",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                          animationDuration={1500}
                        />
                      )}
                      {chartType === "bmi" && (
                        <Line
                          type="monotone"
                          dataKey="bmi"
                          name="Chỉ số BMI"
                          stroke="#0ea5e9"
                          strokeWidth={4}
                          dot={(props: any) => (
                            <TrendDot 
                              {...props} 
                              isLast={props.index === visibleMetrics.length - 1} 
                              color="#0ea5e9" 
                              data={visibleMetrics} 
                              dataKey="bmi" 
                              threshold={0}
                            />
                          )}
                          activeDot={{
                            r: 8,
                            fill: "#0369a1",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                          animationDuration={1500}
                        />
                      )}
                      {chartType === "waist" && (
                        <Line
                          type="monotone"
                          dataKey="waist"
                          name="Vòng eo (cm)"
                          stroke="#f59e0b"
                          strokeWidth={4}
                          dot={(props: any) => (
                            <TrendDot 
                              {...props} 
                              isLast={props.index === visibleMetrics.length - 1} 
                              color="#f59e0b" 
                              data={visibleMetrics} 
                              dataKey="waist" 
                              threshold={0}
                            />
                          )}
                          activeDot={{
                            r: 8,
                            fill: "#b45309",
                            stroke: "#fff",
                            strokeWidth: 3,
                          }}
                          animationDuration={1500}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  {parsedMetrics.length > 5 && (
                    <div className="px-10 mt-6 mb-2 print:hidden">
                       <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-5"
                        value={[
                          brushRange.startIndex ?? defaultBrushStartIndex,
                          brushRange.endIndex ?? parsedMetrics.length - 1
                        ]}
                        max={parsedMetrics.length - 1}
                        min={0}
                        step={1}
                        minStepsBetweenThumbs={1}
                        onValueChange={(val) => {
                          setBrushRange({ startIndex: val[0], endIndex: val[1] });
                        }}
                      >
                        <Slider.Track className="bg-slate-200 dark:bg-slate-700 relative grow rounded-full h-1">
                          <Slider.Range className="absolute bg-slate-400 dark:bg-slate-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb
                          className="block w-4 h-4 bg-rose-500 shadow-md rounded-full focus:outline-none focus:ring-4 focus:ring-rose-500/20 transition-shadow"
                          aria-label="Start point"
                        />
                        <Slider.Thumb
                          className="block w-4 h-4 bg-rose-500 shadow-md rounded-full focus:outline-none focus:ring-4 focus:ring-rose-500/20 transition-shadow"
                          aria-label="End point"
                        />
                      </Slider.Root>
                      <div className="flex justify-between text-xs font-medium text-slate-400 mt-2">
                        <span>
                          {formatToDDMMYY(parsedMetrics[Math.max(0, Math.min(brushRange.startIndex ?? defaultBrushStartIndex, parsedMetrics.length - 1))].timestampForChart)}
                        </span>
                        <span>
                           {formatToDDMMYY(parsedMetrics[Math.max(0, Math.min(brushRange.endIndex ?? parsedMetrics.length - 1, parsedMetrics.length - 1))].timestampForChart)}
                        </span>
                      </div>
                    </div>
                  )}
                  {chartType === "weight" && sortedMetrics.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 sm:flex sm:flex-wrap sm:justify-center text-sm sm:text-base">
                      <div className="flex flex-col items-center justify-center w-full sm:w-32 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bắt đầu</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{sortedMetrics[0].weight} <span className="text-xs text-slate-500 font-bold font-sans">kg</span></span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-full sm:w-32 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Đỉnh điểm</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{Math.max(...sortedMetrics.map(m => m.weight))} <span className="text-xs text-slate-500 font-bold font-sans">kg</span></span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-full sm:w-32 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hiện tại</span>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-slate-800 dark:text-slate-100">{sortedMetrics[sortedMetrics.length - 1].weight}</span>
                          <span className="text-xs text-slate-500 font-bold font-sans mt-0.5">kg</span>
                          {sortedMetrics.length > 1 && (
                            <span
                              className={cn(
                                "flex items-center ml-1",
                                sortedMetrics[sortedMetrics.length - 1].weight > sortedMetrics[sortedMetrics.length - 2].weight
                                  ? "text-rose-500"
                                  : sortedMetrics[sortedMetrics.length - 1].weight < sortedMetrics[sortedMetrics.length - 2].weight
                                  ? "text-emerald-500"
                                  : "text-slate-400"
                              )}
                            >
                              {sortedMetrics[sortedMetrics.length - 1].weight > sortedMetrics[sortedMetrics.length - 2].weight ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : sortedMetrics[sortedMetrics.length - 1].weight < sortedMetrics[sortedMetrics.length - 2].weight ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : (
                                <Minus className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center w-full sm:w-32 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Đã giảm</span>
                        <span className={cn(
                          "font-black",
                          (sortedMetrics[0].weight - sortedMetrics[sortedMetrics.length - 1].weight) > 0 ? "text-emerald-600 dark:text-emerald-400" : (sortedMetrics[0].weight - sortedMetrics[sortedMetrics.length - 1].weight) < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
                        )}>
                          {(sortedMetrics[0].weight - sortedMetrics[sortedMetrics.length - 1].weight).toFixed(1)} <span className="text-xs font-bold font-sans opacity-70">kg</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Activity className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="font-bold text-slate-500">
                    Chưa có dữ liệu nào.
                  </p>
                  <p className="text-sm mt-1">
                    Hãy ghi lại chỉ số đầu tiên của bạn!
                  </p>
                </div>
              )}
            </div>

            <MonthlyCheckin profile={profile} updateProfile={updateProfile} />

            {/* History Table */}
            <div
              className={cn(
                bentoCard,
                "p-0 overflow-hidden border-2 border-slate-100 dark:border-slate-800",
              )}
            >
              <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/80">
                <div className="p-2.5 bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Các lần nhập thông tin
                </h2>
              </div>
              {sortedMetrics.length > 0 ? (
                <div className="max-h-[350px] overflow-y-auto print:max-h-none print:overflow-visible">
                  <table className="w-full text-left text-sm print:text-xs">
                    <thead className="bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 sticky top-0 z-10 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                      <tr>
                        <th className="px-6 py-4 font-bold">Ngày</th>
                        <th className="px-6 py-4 font-bold">Cân nặng</th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell print:table-cell">
                          Chiều cao
                        </th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell print:table-cell">
                          BMI
                        </th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell print:table-cell">
                          Waist
                        </th>
                        <th className="px-6 py-4 font-bold text-right print:hidden">
                          Tuỳ chọn
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {[...sortedMetrics].reverse().map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="text-slate-900 dark:text-slate-200 font-bold">
                              {formatToDDMMYY(m.date)}
                            </div>
                            {m.note && (
                              <div
                                className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[120px] truncate"
                                title={m.note}
                              >
                                {m.note}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 font-black text-indigo-600 dark:text-indigo-400 text-base">
                            {m.weight}{" "}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs">
                              kg
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell print:table-cell">
                            {m.height ? `${m.height}` : "-"}{" "}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs">
                              {m.height ? "cm" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell print:table-cell">
                            {m.bmi || "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell print:table-cell">
                            {m.waist ? `${m.waist}` : "-"}{" "}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs hidden sm:inline print:inline">
                              {m.waist ? "cm" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right print:hidden">
                            <button
                              onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xoá dữ liệu này?")) {
                                  deleteMetric(m.id);
                                }
                              }}
                              className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 sm:opacity-0 group-hover:opacity-100"
                              title="Xoá dữ liệu này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-slate-400 font-bold">
                  Xin nhập các chỉ số đầu tiên!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center border-t border-slate-200 mt-6">
        <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Ứng dụng miễn phí hoàn toàn, tham gia hỗ trợ theo dõi
          <br />
          <span className="font-bold text-slate-500">DỮ LIỆU CHỈ LƯU TẠI MÁY NGƯỜI DÙNG</span>
          <br />
          Nhóm Kiểm soát cân nặng trẻ em
          <br />
          <a href="https://tamanhhospital.vn/chuyen-gia/do-tien-son/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">Đặt lịch khám với BS. Đỗ Tiến Sơn</a>
        </p>
      </footer>

      {showAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowAccountModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                  <UserCircle className="w-4 h-4" />
                </div>
                Quản lí tài khoản
              </h2>
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg line-height-1"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Biệt danh
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                      Cân mục tiêu (kg)
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      inputMode="decimal"
                      value={targetWeight}
                      onChange={handleDecimalInput(setTargetWeight)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                      Nhắc nhở (06:00)
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => {
                        setReminderTime(e.target.value);
                        if ("Notification" in window && Notification.permission !== "granted") {
                          Notification.requestPermission();
                        }
                      }}
                      className="w-[110px] px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full relative">
                  <div className="flex justify-between items-center px-1">
                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Sự kiện sắp tới
                      </label>
                      {(targetEvent || targetDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetEvent("");
                            setTargetDate("");
                          }}
                          className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xoá sự kiện</span>
                        </button>
                      )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[150px]">
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Tên sự kiện"
                        value={targetEvent}
                        onChange={(e) => setTargetEvent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 text-slate-700 dark:text-slate-100 font-bold top-1/2 -translate-y-1/2 pointer-events-none text-sm">
                        {targetDate ? formatToDDMMYY(targetDate) : "DD/MM/YY"}
                      </span>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-[140px] px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm shadow-sm"
                        style={{ color: "transparent" }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Slogan quyết tâm ✨
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 mt-2 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white border-2 border-purple-100 dark:border-purple-800 hover:border-purple-600 rounded-xl font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:transform-none text-sm"
                >
                  {savingProfile ? "Đang cập nhật..." : "Cập nhật hồ sơ ✨"}
                </button>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-500 hover:text-white cursor-pointer border-2 border-indigo-50 dark:border-indigo-900/30 hover:border-indigo-500 rounded-xl font-bold transition-all text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Sao lưu
                    </button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImportData}
                        className="hidden"
                        id="import-backup-file"
                      />
                      <label
                        htmlFor="import-backup-file"
                        className="w-full py-2 flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-500 hover:text-white cursor-pointer border-2 border-emerald-50 dark:border-emerald-900/30 hover:border-emerald-500 rounded-xl font-bold transition-all text-xs h-full"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Khôi phục
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Thao tác này sẽ xoá toàn bộ dữ liệu hiện tại của thiết bị này. Bạn có chắc chắn muốn xoá?",
                        )
                      ) {
                        await clearData();
                        setShowAccountModal(false);
                      }
                    }}
                    className="w-full py-2 flex items-center justify-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-500 hover:text-white cursor-pointer border-2 border-red-50 dark:border-red-900/30 hover:border-red-500 rounded-xl font-bold transition-all text-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Xoá toàn bộ dữ liệu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showWeeklyReport && weeklyReportData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowWeeklyReport(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                Báo cáo 7 ngày qua
              </h2>
              <button
                onClick={() => setShowWeeklyReport(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg line-height-1"
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                  Đã ghi chép
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {weeklyReportData.inputDaysCount}
                  </span>
                  <span className="text-lg font-bold text-slate-500 dark:text-slate-400">
                    / 7 ngày
                  </span>
                </div>
                {weeklyReportData.inputDaysCount >= 5 && (
                  <p className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-1 px-2 rounded-md mt-2">
                    🌟 Phong độ xuất sắc!
                  </p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase">
                  So với 7 ngày trước đó
                </p>
                
                {weeklyReportData.avgThisWeek !== null && weeklyReportData.avgLastWeek !== null ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={cn(
                        "text-2xl font-black tracking-tighter",
                        weeklyReportData.isLoss ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {weeklyReportData.isLoss ? "↓ " : "↑ "}{weeklyReportData.changeStr}
                      </span>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {weeklyReportData.isLoss ? "Đã giảm được" : "Tăng nhẹ"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 italic">Chưa đủ dữ liệu tuần trước để so sánh.</p>
                )}
              </div>

              {weeklyReportData.metricsThisWeek.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-3 text-center border border-sky-100 dark:border-sky-800/30">
                    <p className="text-[10px] font-bold text-sky-600/70 dark:text-sky-400/70 uppercase tracking-widest mb-1">Cân nặng Min</p>
                    <p className="text-lg font-black text-sky-700 dark:text-sky-300">{weeklyReportData.minWeight} <span className="text-[10px]">kg</span></p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3 text-center border border-rose-100 dark:border-rose-800/30">
                    <p className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-widest mb-1">Cân nặng Max</p>
                    <p className="text-lg font-black text-rose-700 dark:text-rose-300">{weeklyReportData.maxWeight} <span className="text-[10px]">kg</span></p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 pt-0">
               <button
                 onClick={() => setShowWeeklyReport(false)}
                 className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
               >
                 Đóng
               </button>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center gap-3 p-5 pb-4 border-b border-slate-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800/80">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                Điều khoản sử dụng
              </h2>
            </div>
            
            <div className="p-5 overflow-y-auto hidden-scrollbar text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed font-medium">
              <p>
                Chào mừng bạn đến với <strong className="text-slate-900 dark:text-white">OnlyTrack</strong> - Ứng dụng nhật ký tối giản dành cho Kiểm soát cân nặng, phát triển bởi nhóm của <strong className="text-slate-900 dark:text-white">BS. Đỗ Tiến Sơn</strong>.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-4 rounded-xl text-amber-800 dark:text-amber-300">
                <p className="font-bold mb-1">🔑 Quyền riêng tư & Bảo mật dữ liệu</p>
                <p>Toàn bộ dữ liệu bạn nhập vào ứng dụng (cân nặng, chiều cao, thông tin cá nhân...) <strong>CHỈ ĐƯỢC LƯU TRỮ TẠI THIẾT BỊ BẠN ĐANG SỬ DỤNG</strong> (trong bộ nhớ trình duyệt). Chúng tôi không có máy chủ cơ sở dữ liệu và <strong>TUYỆT ĐỐI KHÔNG</strong> thu thập, đồng bộ hay chia sẻ bất kỳ thông tin nào của bạn cho bên thứ ba.</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">📌 Xin lưu ý:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Nếu bạn xoá lịch sử trình duyệt, sử dụng chế độ Ẩn danh (Incognito), hoặc đổi thiết bị, dữ liệu sẽ không được giữ lại. Tính năng "Sao lưu" và "Khôi phục" trên app dùng để chuyển dữ liệu thủ công giữa các thiết bị.</li>
                  <li>Sản phẩm là công cụ công nghệ hỗ trợ theo dõi sức khoẻ miễn phí, không mang mục đích y khoa, không thay thế cho việc chẩn đoán hay điều trị y tế chuyên nghiệp.</li>
                </ul>
              </div>

              <p className="italic text-slate-500">
                Việc nhấn Đồng ý đồng nghĩa với việc bạn đã đọc, hiểu rõ và chấp nhận các điều khoản về bảo mật và lưu trữ dữ liệu của ứng dụng.
              </p>
            </div>
            
            <div className="p-5 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => {
                  localStorage.setItem("onlytrack_terms_accepted", "true");
                  setShowTermsModal(false);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 shadow-md text-base"
              >
                Tôi đã đọc và Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
