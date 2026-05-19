import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signIn, signOut, testConnection } from "./firebase";
import { useMetrics, Metric, UserProfile } from "./hooks/useMetrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

          <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
            Ứng dụng chuyên dùng theo dõi hành trình thay đổi sức vóc của bạn.
            Thông tin sẽ được đồng bộ nếu đăng nhập với Google
          </p>

          <div className="space-y-4">
            <button
              onClick={signIn}
              className="w-full py-4 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Đăng nhập với Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">
                hoặc
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full py-4 px-4 bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 rounded-2xl font-bold transition-all active:scale-[0.98]"
            >
              Bắt đầu ngay không cần tài khoản
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Khi lựa chọn bắt đầu ngay, dữ liệu sẽ chỉ lưu trên thiết bị này và
              không đồng bộ khi đổi thiết bị khác
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
  const { metrics, profile, loading, addMetric, deleteMetric, updateProfile } =
    useMetrics(user, isGuest);

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [height, setHeight] = useState("");
  const [nickname, setNickname] = useState("");
  const [slogan, setSlogan] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetEvent, setTargetEvent] = useState("");

  const [savingMetric, setSavingMetric] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [chartType, setChartType] = useState<"weight" | "bmi" | "waist">(
    "weight",
  );

  const isProfileComplete =
    profile?.height && profile?.nickname && profile?.slogan;
  const [showProfile, setShowProfile] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.height && height === "") setHeight(profile.height.toString());
      if (profile.nickname && nickname === "") setNickname(profile.nickname);
      if (profile.slogan && slogan === "") setSlogan(profile.slogan);
      if (profile.targetDate && targetDate === "")
        setTargetDate(profile.targetDate);
      if (profile.targetEvent && targetEvent === "")
        setTargetEvent(profile.targetEvent);

      if (profile.height && profile.nickname && profile.slogan) {
        setShowProfile(false);
      }
    }
  }, [profile]);

  useEffect(() => {
    // Request notification permission and show reminder
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const lastNotif = localStorage.getItem("betteryou_last_notif");
          const today = new Date().toISOString().split("T")[0];
          if (lastNotif !== today) {
            new Notification("OnlyTrack by Dr.Son", {
              body: "Hôm nay bạn đã cập nhật chỉ số chưa? Hãy ghi lại tiến bộ nhé!",
              icon: "/vite.svg",
            });
            localStorage.setItem("betteryou_last_notif", today);
          }
        }
      });
    }
  }, []);

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setSavingMetric(true);

    const parsedWeight = parseFloat(weight);
    await addMetric(
      parsedWeight,
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const updates: Partial<UserProfile> = {};
    if (height) updates.height = parseFloat(height);
    if (nickname) updates.nickname = nickname;
    if (slogan) updates.slogan = slogan;
    if (targetDate) updates.targetDate = targetDate;
    if (targetEvent) updates.targetEvent = targetEvent;

    await updateProfile(updates);
    setSavingProfile(false);
  };

  const sortedMetrics = useMemo(
    () => [...metrics].sort((a, b) => a.date.localeCompare(b.date)),
    [metrics],
  );
  const latestMetric = sortedMetrics[sortedMetrics.length - 1];

  const parsedMetrics = useMemo(() => {
    return sortedMetrics.map((m) => ({
      ...m,
      timestampForChart: new Date(m.date).getTime(),
    }));
  }, [sortedMetrics]);

  const chartDomainX = useMemo(() => {
    if (parsedMetrics.length === 0) return ["auto", "auto"];
    const minT = parsedMetrics[0].timestampForChart;
    const actualMax = parsedMetrics[parsedMetrics.length - 1].timestampForChart;
    const minExpectedMax = minT + 365 * 24 * 60 * 60 * 1000; // +1 year in milliseconds
    return [minT, Math.max(actualMax, minExpectedMax)];
  }, [parsedMetrics]);

  let whtr = null;
  if (latestMetric?.waist && profile?.height) {
    whtr = latestMetric.waist / profile.height;
  }

  const hasMetabolicRisk = whtr !== null && whtr > 0.5;
  const username =
    profile?.nickname ||
    (isGuest ? "Khách" : user?.displayName?.split(" ")[0] || "Bạn");

  const bentoCard =
    "bg-white p-4 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md";

  const getCalculatedDomain = (domain: [number, number]) => {
    const [dataMin, dataMax] = domain;
    if (!isFinite(dataMin) || !isFinite(dataMax)) return [0, "auto"];
    const diff = dataMax - dataMin;
    const padding = diff === 0 ? 5 : diff * 0.2;
    const min = Math.floor(dataMin - padding);
    return [Math.max(0, min), "auto"];
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800 selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Apple className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
                OnlyTrack
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-indigo-500 uppercase tracking-widest">
                by Dr.Son
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.nickname && (
              <span className="text-sm font-medium text-slate-600 hidden sm:block bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Hi, {profile.nickname} 👋
              </span>
            )}
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Stat: Weight */}
          <div
            className={cn(
              bentoCard,
              "md:col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 border-teal-100 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-teal-700">
                <div className="p-2.5 bg-teal-100 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Cân nặng</h3>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-5xl font-black text-teal-900 tracking-tighter">
                {latestMetric?.weight || "--"}
              </span>
              <span className="text-teal-700 font-bold">kg</span>
            </div>
          </div>

          {/* BMI */}
          <div
            className={cn(
              bentoCard,
              "bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center gap-3 text-blue-700 mb-6">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Chỉ số BMI</h3>
            </div>
            <div className="flex items-baseline mt-auto">
              <span className="text-5xl font-black text-blue-900 tracking-tighter">
                {latestMetric?.bmi || "--"}
              </span>
            </div>
          </div>

          {/* Waist */}
          <div
            className={cn(
              bentoCard,
              "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 flex flex-col justify-between",
            )}
          >
            <div className="flex items-center gap-3 text-amber-700 mb-6">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Vòng eo</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-5xl font-black text-amber-900 tracking-tighter">
                {latestMetric?.waist || "--"}
              </span>
              <span className="text-amber-700 font-bold">cm</span>
            </div>
          </div>

          {/* WHtR Analysis */}
          <div
            className={cn(
              bentoCard,
              "md:col-span-2 lg:col-span-1 flex flex-col justify-between relative overflow-hidden border-2",
              hasMetabolicRisk
                ? "bg-rose-50 border-rose-200"
                : "bg-emerald-50 border-emerald-200",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 mb-4",
                hasMetabolicRisk ? "text-rose-700" : "text-emerald-700",
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl",
                  hasMetabolicRisk ? "bg-rose-100" : "bg-emerald-100",
                )}
              >
                {hasMetabolicRisk ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
              <h3 className="font-bold">Tỷ lệ WHtR</h3>
            </div>
            <div className="mt-auto">
              {whtr === null ? (
                <p className="text-slate-500 font-medium">
                  Cần nhập{" "}
                  <span className="font-bold text-slate-700">Chiều cao</span> &{" "}
                  <span className="font-bold text-slate-700">Vòng eo</span>.
                </p>
              ) : (
                <div className="flex items-baseline gap-2 mb-3">
                  <span
                    className={cn(
                      "text-5xl font-black tracking-tighter",
                      hasMetabolicRisk ? "text-rose-900" : "text-emerald-900",
                    )}
                  >
                    {whtr.toFixed(2)}
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
            <div className={cn(bentoCard, "border-2 border-indigo-50")}>
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                Cập nhật chỉ số mới
              </h2>
              <form onSubmit={handleSaveMetric} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Ngày cập nhật
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Vòng eo{" "}
                      <span className="text-slate-400 font-medium">(cm)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-lg text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                    Ghi chú{" "}
                    <span className="text-slate-400 font-medium">
                      (tuỳ chọn)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all font-bold text-slate-700"
                    maxLength={500}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingMetric || !weight}
                  className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:shadow-none disabled:transform-none"
                >
                  {savingMetric ? "Đang lưu..." : "Lưu chỉ số 🚀"}
                </button>
              </form>
            </div>

            {/* Profile Settings */}
            <div
              className={cn(
                bentoCard,
                "border-2 border-purple-50 flex flex-col",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  Thông tin cá nhân
                </h2>
                {isProfileComplete && (
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="text-sm font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg"
                  >
                    {showProfile ? "Thu gọn" : "Hiển thị"}
                  </button>
                )}
              </div>

              {(showProfile || !isProfileComplete) && (
                <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Biệt danh
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Chiều cao (cm){" "}
                      <span className="text-amber-500 font-medium ml-1">
                        (dùng trong tính BMI)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Slogan quyết tâm ✨
                    </label>
                    <textarea
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-slate-700 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Ngày mục tiêu
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                      Sự kiện mục tiêu
                    </label>
                    <input
                      type="text"
                      value={targetEvent}
                      onChange={(e) => setTargetEvent(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-3 text-purple-700 bg-purple-50 hover:bg-purple-600 hover:text-white border-2 border-purple-100 hover:border-purple-600 rounded-xl font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:transform-none"
                  >
                    {savingProfile ? "Đang cập nhật..." : "Cập nhật hồ sơ ✨"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {/* Chart Widget */}
            <div
              className={cn(
                bentoCard,
                "flex flex-col h-[520px] border-2 border-slate-100",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  Biểu đồ tiến độ
                </h2>

                <div className="inline-flex rounded-xl p-1.5 bg-slate-100 border border-slate-200 shadow-inner">
                  <button
                    onClick={() => setChartType("weight")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "weight"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    Cân nặng
                  </button>
                  <button
                    onClick={() => setChartType("bmi")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "bmi"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    BMI
                  </button>
                  <button
                    onClick={() => setChartType("waist")}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      chartType === "waist"
                        ? "bg-white shadow-sm text-indigo-600"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    Vòng eo
                  </button>
                </div>
              </div>

              {sortedMetrics.length > 0 ? (
                <div className="flex-grow w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={parsedMetrics}
                      margin={{ top: 10, right: 20, bottom: 0, left: -20 }}
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
                          const d = new Date(val);
                          return d.toLocaleDateString("vi-VN", {
                            month: "2-digit",
                            year: "2-digit",
                          });
                        }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={-8}
                        width={40}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100">
                                <p className="text-slate-500 font-bold mb-2 text-sm">
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
                                  <p className="text-slate-800 font-black text-lg">
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
                                  <p className="text-slate-500 text-xs mt-2 italic max-w-[200px]">
                                    "{data.note}"
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
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
                "p-0 overflow-hidden border-2 border-slate-100",
              )}
            >
              <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80">
                <div className="p-2.5 bg-slate-200 text-slate-600 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Các lần nhập thông tin
                </h2>
              </div>
              {sortedMetrics.length > 0 ? (
                <div className="max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-400 sticky top-0 z-10 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                      <tr>
                        <th className="px-6 py-4 font-bold">Ngày</th>
                        <th className="px-6 py-4 font-bold">Cân nặng</th>
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
                    <tbody className="divide-y divide-slate-50">
                      {[...sortedMetrics].reverse().map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="text-slate-900 font-bold">
                              {m.date}
                            </div>
                            {m.note && (
                              <div
                                className="text-xs text-slate-500 mt-1 max-w-[120px] truncate"
                                title={m.note}
                              >
                                {m.note}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 font-black text-indigo-600 text-base">
                            {m.weight}{" "}
                            <span className="font-bold text-slate-400 text-xs">
                              kg
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-500 font-bold hidden sm:table-cell">
                            {m.bmi || "-"}
                          </td>
                          <td className="px-6 py-5 text-slate-500 font-bold hidden sm:table-cell">
                            {m.waist ? `${m.waist}` : "-"}{" "}
                            <span className="font-bold text-slate-400 text-xs hidden sm:inline">
                              {m.waist ? "cm" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => deleteMetric(m.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-2.5 rounded-xl hover:bg-rose-50 sm:opacity-0 group-hover:opacity-100"
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
                  Lịch sử trống. Ghi chỉ số đầu tiên ngay thôi! 😊
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center border-t border-slate-200 mt-6">
        <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Ứng dụng là sản phẩm hỗ trợ điều trị của BS. Đỗ Tiến Sơn
        </p>
      </footer>
    </div>
  );
}
