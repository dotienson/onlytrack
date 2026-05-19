import { useEffect, useState, useMemo, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signIn, signOut, testConnection } from "./firebase";
import { useMetrics, Metric, UserProfile } from "./hooks/useMetrics";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
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
  Camera,
} from "lucide-react";
import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    <div className="bg-amber-100/50 rounded-[2rem] p-6 shadow-sm border border-amber-200 flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-3 text-amber-700 max-w-sm text-center md:text-left">
        <Target className="w-10 h-10 text-amber-500 animate-pulse hidden md:block" />
        <div>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest text-amber-600 mb-1">
            Mục tiêu sắp tới
          </p>
          <h3 className="text-xl font-black text-amber-900 leading-tight">
            {targetEvent || "Ngày trọng đại"}
          </h3>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4 text-center">
        <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm border border-amber-100 min-w-[60px] sm:min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {timeLeft.days}
          </div>
          <div className="text-[10px] font-bold text-amber-400 uppercase mt-1">
            Ngày
          </div>
        </div>
        <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm border border-amber-100 min-w-[60px] sm:min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {timeLeft.hours}
          </div>
          <div className="text-[10px] font-bold text-amber-400 uppercase mt-1">
            Giờ
          </div>
        </div>
        <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm border border-amber-100 min-w-[60px] sm:min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {timeLeft.mins}
          </div>
          <div className="text-[10px] font-bold text-amber-400 uppercase mt-1">
            Phút
          </div>
        </div>
        <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm border border-amber-100 min-w-[60px] sm:min-w-[70px]">
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
            {timeLeft.secs}
          </div>
          <div className="text-[10px] font-bold text-amber-400 uppercase mt-1">
            Giây
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 text-slate-800 p-4 font-sans">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-sky-100 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Apple className="w-10 h-10 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-center gap-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              OnlyTrack
            </h1>
            <p className="text-indigo-600 font-medium text-lg sm:text-xl">
              by Dr.Son
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGuestLogin}
              className="w-full py-4 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Bắt đầu ngay không cần tài khoản
            </button>
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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [height, setHeight] = useState("");
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

  const [showStats, setShowStats] = useState(false);

  const isProfileComplete = profile?.nickname && profile?.slogan;
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.nickname && nickname === "") setNickname(profile.nickname);
      if (profile.slogan && slogan === "") setSlogan(profile.slogan);
      if (profile.targetDate && targetDate === "")
        setTargetDate(profile.targetDate);
      if (profile.targetEvent && targetEvent === "")
        setTargetEvent(profile.targetEvent);
      if (profile.targetWeight && targetWeight === "")
        setTargetWeight(profile.targetWeight.toString());
      if (profile.reminderTime) setReminderTime(profile.reminderTime);
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
        new Notification("OnlyTrack by Dr.Son", {
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

  const handleScreenshotChart = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
          scale: 2
        });
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        const now = new Date();
        const backupDate = now.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
        const backupTime = now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
        link.download = `ProgressChart_${backupDate}_${backupTime}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Lỗi khi chụp màn hình:", error);
      }
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
    if (nickname) updates.nickname = nickname;
    if (slogan) updates.slogan = slogan;
    if (targetDate) updates.targetDate = targetDate;
    if (targetEvent) updates.targetEvent = targetEvent;
    if (targetWeight) updates.targetWeight = parseFloat(targetWeight);
    if (reminderTime) updates.reminderTime = reminderTime;

    await updateProfile(updates);
    setSavingProfile(false);
    setShowAccountModal(false);
  };

  const handleShare = async (title: string, text: string) => {
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
        await navigator.clipboard.writeText(`${title}\n${text}`);
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

  const latestMetric = parsedMetrics[parsedMetrics.length - 1];

  const chartDomainX = useMemo(() => {
    const now = Date.now();
    const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    return [now - sixMonths, now + sixMonths];
  }, []);

  let whtr = null;
  const currentHeight = latestMetric?.height || profile?.height;
  if (latestMetric?.waist && currentHeight) {
    whtr = latestMetric.waist / currentHeight;
  }

  const hasMetabolicRisk = whtr !== null && whtr > 0.5;
  const username =
    profile?.nickname ||
    (isGuest ? "Khách" : user?.displayName?.split(" ")[0] || "Bạn");

  const yAxisConfig = useMemo(() => {
    if (chartType === "weight") {
      const maxWeight = Math.max(...parsedMetrics.map(m => m.weight), 0);
      if (maxWeight > 70) {
        // Start at 50, jump by 5
        const maxTick = Math.ceil(maxWeight / 5) * 5 + 10; 
        const ticks = [];
        for (let i = 50; i <= maxTick; i += 5) ticks.push(i);
        return { domain: [50, "auto"], ticks };
      }
      return {
        domain: [0, "auto"],
        ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80]
      };
    }
    if (chartType === "bmi") {
      return {
        domain: [20, 40],
        ticks: undefined
      };
    }
    if (chartType === "waist") {
      return {
        domain: [60, 150],
        ticks: undefined
      };
    }
    return { domain: ["auto", "auto"], ticks: undefined };
  }, [chartType, parsedMetrics]);

  const bentoCard =
    "bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans text-slate-800 dark:text-slate-100 selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-50/50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                OnlyTrack
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                by Dr.Son
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
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
              className="flex items-center gap-2 group bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 py-2 rounded-full border border-slate-200 transition-colors"
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
        <div className="md:hidden bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700">
              <div className="p-1.5 bg-teal-100 rounded-lg">
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
                  onClick={() => handleShare("Cân nặng của tôi", `Tôi đang nặng ${latestMetric.weight} kg!`)}
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
                  onClick={() => handleShare("Chỉ số BMI", `Chỉ số BMI của tôi hiện tại là ${latestMetric.bmi}`)}
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
                  onClick={() => handleShare("Vòng eo", `Vòng eo của tôi hiện tại là ${latestMetric.waist} cm!`)}
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
                  onClick={() => handleShare("Tỷ lệ WHtR", `Tỷ lệ WHtR của tôi đang là ${whtr.toFixed(2)}`)}
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
                  onClick={() => handleShare("Cân nặng của tôi", `Tôi đang nặng ${latestMetric.weight} kg!`)}
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
                  onClick={() => handleShare("Chỉ số BMI", `Chỉ số BMI của tôi hiện tại là ${latestMetric.bmi}`)}
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
                  onClick={() => handleShare("Vòng eo", `Vòng eo của tôi hiện tại là ${latestMetric.waist} cm!`)}
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
              "md:col-span-2 lg:col-span-1 flex flex-col justify-between relative overflow-hidden border-2",
              hasMetabolicRisk
                ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30"
                : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30",
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
                  onClick={() => handleShare("Tỷ lệ WHtR", `Tỷ lệ WHtR của tôi đang là ${whtr.toFixed(2)}`)}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            {/* Input Metric */}
            <div className={cn(bentoCard, "border-2 border-indigo-50 dark:border-indigo-900/30")}>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
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
                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-100"
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
                      type="number"
                      step="0.1"
                      required
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100"
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
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100"
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
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-2 sm:px-3 py-3 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100"
                    />
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
                  {savingMetric ? "Đang lưu..." : "Lưu chỉ số 🚀"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Chart Widget */}
            <div
              ref={chartRef}
              className={cn(
                bentoCard,
                "flex flex-col h-[520px] border-2 border-slate-100 dark:border-slate-800",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Biểu đồ tiến độ
                  </h2>
                  <button
                    onClick={handleScreenshotChart}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/50 rounded-lg transition-colors ml-2"
                    title="Chụp ảnh biểu đồ"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="inline-flex rounded-xl p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
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
                <div className="w-full mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={parsedMetrics}
                      margin={{ top: 10, right: 30, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#e2e8f0"
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
                        dy={15}
                        padding={{ left: 20, right: 20 }}
                        tickFormatter={(val) => {
                          if (!val) return "";
                          const d = new Date(val);
                          return d.toLocaleDateString("vi-VN", {
                            month: "2-digit",
                            year: "2-digit",
                          });
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
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700">
                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-2 text-sm">
                                  {new Date(data.date).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: payload[0].color,
                                    }}
                                  ></span>
                                  <p className="text-slate-800 dark:text-slate-100 font-black text-lg">
                                    {username}:{" "}
                                    <span style={{ color: payload[0].color }}>
                                      {payload[0].value}
                                    </span>{" "}
                                    {chartType === "weight"
                                      ? "kg"
                                      : chartType === "waist"
                                        ? "cm"
                                        : ""}
                                  </p>
                                </div>
                                {data.note && (
                                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic max-w-[200px]">
                                    "{data.note}"
                                  </p>
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
                          dot={(props: any) => {
                            const isLast =
                              props.index === sortedMetrics.length - 1;
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={isLast ? 6 : 4}
                                fill={isLast ? "#ef4444" : "#4f46e5"}
                                stroke="#fff"
                                strokeWidth={2}
                                key={props.index}
                              />
                            );
                          }}
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
                          dot={(props: any) => {
                            const isLast =
                              props.index === sortedMetrics.length - 1;
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={isLast ? 6 : 4}
                                fill={isLast ? "#ef4444" : "#0ea5e9"}
                                stroke="#fff"
                                strokeWidth={2}
                                key={props.index}
                              />
                            );
                          }}
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
                          dot={(props: any) => {
                            const isLast =
                              props.index === sortedMetrics.length - 1;
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={isLast ? 6 : 4}
                                fill={isLast ? "#ef4444" : "#f59e0b"}
                                stroke="#fff"
                                strokeWidth={2}
                                key={props.index}
                              />
                            );
                          }}
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
                  {chartType === "weight" && sortedMetrics.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bắt đầu</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{sortedMetrics[0].weight} <span className="text-xs text-slate-500 font-bold font-sans">kg</span></span>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hiện tại</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{sortedMetrics[sortedMetrics.length - 1].weight} <span className="text-xs text-slate-500 font-bold font-sans">kg</span></span>
                      </div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col items-center">
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
                <div className="max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 sticky top-0 z-10 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                      <tr>
                        <th className="px-6 py-4 font-bold">Ngày</th>
                        <th className="px-6 py-4 font-bold">Cân nặng</th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell">
                          Chiều cao
                        </th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell">
                          BMI
                        </th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell">
                          Waist
                        </th>
                        <th className="px-6 py-4 font-bold text-right">
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
                              {m.date}
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
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell">
                            {m.height ? `${m.height}` : "-"}{" "}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs">
                              {m.height ? "cm" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell">
                            {m.bmi || "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-bold hidden sm:table-cell">
                            {m.waist ? `${m.waist}` : "-"}{" "}
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs hidden sm:inline">
                              {m.waist ? "cm" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => deleteMetric(m.id)}
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
          Ứng dụng là sản phẩm hỗ trợ điều trị của BS. Đỗ Tiến Sơn
          <br />
          Khoa Nhi - Bệnh viện Đa khoa Tâm Anh
          <br />
          dotienson.com/apps
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
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                      Cân mục tiêu (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                      Ngày sự kiện
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Sự kiện sắp tới
                  </label>
                  <input
                    type="text"
                    value={targetEvent}
                    onChange={(e) => setTargetEvent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Thời gian nhắc nhở (Mặc định: 06:00)
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-sm text-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Slogan quyết tâm ✨
                  </label>
                  <input
                    type="text"
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
    </div>
  );
}
