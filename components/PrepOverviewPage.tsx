import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Chrome as Home, Clock, Target, TrendingUp, Zap, BookMarked, Award, Users, Heart, ChevronRight, Play, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Gauge, ArrowUp, ArrowDown, Lock, Info, Plane, Bird } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import FlightPath from './FlightPath';
import FlipCard from './FlipCard';
import { supabase } from '@/lib/supabaseClient';   // ✅ PATCH ADDED
import FlightPathTimeline from './FlightPathTimeline';

interface Subject {
  id: string;
  name: string;
  status: 'mastered' | 'in-progress' | 'weak';
  progress: number;
}

interface TopGap {
  id: string;
  title: string;
  description: string;
  subject: string;
}

export default function PrepOverviewPage() {
  const { user } = useAuth();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [readinessTrend, setReadinessTrend] = useState<number>(0);
  const [trendMessage, setTrendMessage] = useState<"today" | "missed" | "">("");

  // Time-to-Mastery state
  const [daysToMastery, setDaysToMastery] = useState<number | null>(null);
  const [bestCaseDays, setBestCaseDays] = useState<number | null>(null);
  const [worstCaseDays, setWorstCaseDays] = useState<number | null>(null);
  const [dailyGapQuota] = useState(3);
  const [mcqsCompleted, setMcqsCompleted] = useState<number>(0);
  const [mcqsTotal, setMcqsTotal] = useState<number>(0);
  const [bookmarksPending, setBookmarksPending] = useState<number>(0);
  const [flashcardsReviewed, setFlashcardsReviewed] = useState<number>(0);
  const [flashcardsTotal, setFlashcardsTotal] = useState<number>(0);
  const [imagesVideosExplored, setImagesVideosExplored] = useState<number>(0);
  const [imagesVideosTotal, setImagesVideosTotal] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

 useEffect(() => {
    if (!user?.id) return;

    const fetchERI = async () => {
      const { data, error } = await supabase
        .from("current_eri_summary")
        .select("eri_average, change_percent, time_posted")
        .eq("student_id", user.id)
        .order("time_posted", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching ERI:", error);
        return;
      }

      if (data && data.length > 0) {
        const latest = data[0];
        const latestDate = new Date(latest.time_posted);
        const today = new Date();
        const isToday = latestDate.toDateString() === today.toDateString();

        setReadinessScore(Number(latest.eri_average ?? 0));

        if (isToday) {
          setReadinessTrend(Number(latest.change_percent ?? 0));
          setTrendMessage("today");
        } else {
          setReadinessTrend(null);
          setTrendMessage("missed");
        }
      }
    };

    fetchERI();

    const channel = supabase
      .channel("eri-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "current_eri_summary" },
        (payload) => {
          if (payload.new?.student_id === user.id) {
            const latestDate = new Date(payload.new.time_posted);
            const today = new Date();
            const isToday = latestDate.toDateString() === today.toDateString();

            setReadinessScore(Number(payload.new.eri_average ?? 0));
            if (isToday) {
              setReadinessTrend(Number(payload.new.change_percent ?? 0));
              setTrendMessage("today");
            } else {
              setReadinessTrend(null);
              setTrendMessage("missed");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  useEffect(() => {
    if (!user?.id) return;

    const fetchTimeToMastery = async () => {
      const { data, error } = await supabase
        .from("student_exam_progress")
        .select("pending_time_hours, best_case_hours, worst_case_hours, updated_at")
        .eq("student_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching time to mastery:", error.message);
        return;
      }

      if (data) {
        setDaysToMastery(Number(data.pending_time_hours));
        setBestCaseDays(Number(data.best_case_hours));
        setWorstCaseDays(Number(data.worst_case_hours));
      }
    };

    fetchTimeToMastery();
  }, [user?.id]);

  useEffect(() => {
  if (!user?.id) return;

  const fetchProgressSummary = async () => {
    const { data, error } = await supabase
      .from("student_progress_summary")
      .select("mcqs_completed, mcqs_total, bookmarks_pending, pyqs_answered, flashcards_total, flashcards_reviewed, images_videos_total, images_videos_explored")
      .eq("student_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching progress summary:", error.message);
      return;
    }

    if (data) {
      // Example: update state variables here
      setMcqsCompleted(data.mcqs_completed);
      setMcqsTotal(data.mcqs_total);
      setBookmarksPending(data.bookmarks_pending);
      setFlashcardsReviewed(data.flashcards_reviewed);
      setFlashcardsTotal(data.flashcards_total);
      setImagesVideosExplored(data.images_videos_explored);
      setImagesVideosTotal(data.images_videos_total);
    }
  };

  fetchProgressSummary();
}, [user?.id]);

  // Mock data - in real app, this would come from API
  const subjects: Subject[] = [
    { id: '1', name: 'Anatomy', status: 'mastered', progress: 95 },
    { id: '2', name: 'Biochemistry', status: 'mastered', progress: 88 },
    { id: '3', name: 'Pharmacology', status: 'in-progress', progress: 72 },
    { id: '4', name: 'Pathology', status: 'in-progress', progress: 65 },
    { id: '5', name: 'Medicine', status: 'weak', progress: 45 },
    { id: '6', name: 'Surgery', status: 'weak', progress: 38 },
  ];

  const topGaps: TopGap[] = [
    {
      id: '1',
      title: 'NOS cofactor confusion',
      description: 'BH4 (tetrahydrobiopterin) role in nitric oxide synthesis',
      subject: 'Biochemistry'
    },
    {
      id: '2',
      title: 'Arginine → NO pathway',
      description: 'Byproduct formation and citrulline relationship',
      subject: 'Biochemistry'
    },
    {
      id: '3',
      title: 'iNOS vs eNOS differentiation',
      description: 'Isoform differences and clinical significance',
      subject: 'Pharmacology'
    }
  ];

  const achievements = [
    { id: '1', name: 'Flashcard Warrior', description: '300 cards', unlocked: true, icon: '🏆' },
    { id: '2', name: '7-Day Streak', description: 'Consistency', unlocked: true, icon: '🔥' },
    { id: '3', name: 'Gap Closer', description: '14 gaps', unlocked: true, icon: '🎯' },
    { id: '4', name: 'Speed Demon', description: '50 MCQs/hour', unlocked: false, icon: '⚡' },
    { id: '5', name: 'Perfect Week', description: '7 days 100%', unlocked: false, icon: '💎' },
    { id: '6', name: 'Knowledge Master', description: '1000 MCQs', unlocked: false, icon: '👑' },
  ];
  const moodEmojis = ['😫', '😔', '😐', '😊', '🚀'];
  const moodLabels = ['Overwhelmed', 'Tired', 'Okay', 'Good', 'Energized'];
  
  // Unified CTA button component
  const CTAButton = ({ onPress, children, variant = 'primary', size = 'medium', disabled = false }: {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'success': return 'bg-gradient-to-r from-emerald-600 to-teal-600';
        case 'warning': return 'bg-gradient-to-r from-amber-600 to-orange-600';
        case 'secondary': return 'bg-gradient-to-r from-slate-600 to-slate-700';
        default: return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      }
    };
    
    const getSizeStyles = () => {
      switch (size) {
        case 'small': return 'px-3 py-2';
        case 'large': return 'px-6 py-4';
        default: return 'px-4 py-3';
      }
    };
    
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`${getVariantStyles()} ${getSizeStyles()} rounded-full shadow-lg active:scale-95 flex-row items-center justify-center ${
          disabled ? 'opacity-50' : ''
        }`}
        style={{
          shadowColor: variant === 'success' ? '#10b981' : variant === 'warning' ? '#f59e0b' : '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {children}
      </Pressable>
    );
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubjectStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' };
      case 'in-progress': return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' };
      case 'weak': return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-400' };
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 0.8) return { color: "#10b981", label: "Exam Ready" };     // green
    if (score >= 0.6) return { color: "#f59e0b", label: "Good Progress" };  // amber
    return { color: "#ef4444", label: "Needs Focus" };                      // red
  };
  
  const readinessInfo = getReadinessColor(readinessScore);
  
  // Adjust targets based on mood
  const getAdjustedTargets = () => {
    if (moodRating === null) return { gaps: dailyGapQuota, mcqs: 20 };
    if (moodRating < 2) return { gaps: Math.max(1, dailyGapQuota - 1), mcqs: 10 }; // Tired
    if (moodRating >= 4) return { gaps: dailyGapQuota + 2, mcqs: 30 }; // Energized
    return { gaps: dailyGapQuota, mcqs: 20 };
  };
  
  const adjustedTargets = getAdjustedTargets();

  // Helper function to format values safely
  const formatValue = (value: number | null): string => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return 'N/A';
    }
    return value.toString();
  };

  // Helper function for progress bar width
  const getProgressWidth = (completed: number, total: number): string => {
    if (!total || total === 0) return '0%';
    const percent = Math.min(100, Math.round((completed / total) * 100));
    return `${percent}%`;
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-900"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: isMobile ? 16 : 24,
        paddingVertical: 24,
      }}
    >
      {/* 1. Welcoming Mentor Panel */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800 }}
        className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 rounded-2xl p-6 mb-6 border border-teal-500/20"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full items-center justify-center mr-4">
            <Home size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-teal-100">
              {getGreeting()}, {user?.name || 'Dr. Student'}!
            </Text>
            <Text className="text-teal-300/80 text-sm">
              Today is {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} — your Flight Path continues.
            </Text>
          </View>
        </View>
        
        <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
          <Text className="text-slate-200 text-base leading-6">
            Yesterday you closed <Text className="font-bold text-teal-400">14 gaps</Text> in Pharmacology. 
            Today's checkpoint → <Text className="font-bold text-cyan-400">Renal Pathology</Text> (20 questions).
          </Text>
        </View>
      </MotiView>

      {/* 2. NEETPG Flight Path */}
      {user?.id ? (
          <>
            {console.log("🟢 Current user from AuthContext:", user)}
            {console.log("🟢 Passing studentId to FlightPath:", user.id)}
            <FlightPath studentId={user.id} />
            <FlightPathTimeline />
      </>
      ) : (
        <Text className="text-slate-400 text-center">
          Loading your flight path...
        </Text>
      )}
     {/* 3. Cognitive Load Dashboard → FlipCard with custom front */}
<FlipCard
  gradientColors="from-emerald-500 to-teal-600"
  statusColor="text-emerald-400"
  infoText={`The Exam Readiness Index (ERI) is a composite score of your preparation.

It is calculated from:
• Accuracy in PYQs & MCQs
• Consistency in daily practice
• Speed vs retention balance
• Subject mastery trends

✅ ERI > 0.8 → Exam Ready
⚠️ ERI 0.6–0.79 → Good Progress
❌ ERI < 0.6 → Needs Focus`}
  onSeeMore={() =>
    router.push({
      pathname: "/info-popup",
      params: {
        title: "Exam Readiness Index (ERI)",
        content: `The ERI reflects how close you are to being exam-ready. 
It dynamically updates using your latest accuracy, pace, and coverage. 
Aim to keep ERI above 0.8 for consistent exam-level readiness.`
      }
    })
  }
  frontContent={
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "spring", duration: 800, delay: 400 }}
      className="p-6"
    >
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-3">
          <Gauge size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-100">Exam Readiness Index</Text>
          <Text className="text-slate-400 text-sm">Composite score of your preparation</Text>
        </View>

        {/* 🔼/🔽 Weekly Trend */}
        <View className="flex-row items-center">
          {trendMessage === "missed" ? (
            <View className="px-2 py-1 rounded-full bg-amber-500/20">
              <Text className="text-xs font-bold text-amber-400">
                ⚠️ You missed practice yesterday
              </Text>
            </View>
          ) : readinessTrend !== null ? (
            <View className={`flex-row items-center px-2 py-1 rounded-full ${
              readinessTrend >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
            }`}>
              {readinessTrend >= 0 ? (
                <ArrowUp size={12} color="#10b981" />
              ) : (
                <ArrowDown size={12} color="#ef4444" />
              )}
              <Text className={`text-xs font-bold ml-1 ${
                readinessTrend >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {`${readinessTrend >= 0 ? "+" : ""}${readinessTrend.toFixed(2)}% today`}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-slate-400 text-xs">…loading</Text>
            </View>
          )}
        </View>
      </View>

      {/* Circle Gauge */}
      <View className="items-center">
        <View className="relative w-32 h-32 mb-4">
          <View className="absolute inset-0 rounded-full border-8 border-slate-700" />
          <MotiView
            from={{ rotate: "0deg" }}
            animate={{ rotate: `${(readinessScore ?? 0) * 360}deg` }}
            transition={{ type: "spring", duration: 1200, delay: 600 }}
            className="absolute inset-0 rounded-full border-8 border-transparent"
            style={{
              borderTopColor: readinessInfo.color,
              borderRightColor: readinessScore > 0.25 ? readinessInfo.color : "transparent",
              borderBottomColor: readinessScore > 0.5 ? readinessInfo.color : "transparent",
              borderLeftColor: readinessScore > 0.75 ? readinessInfo.color : "transparent",
            }}
          />
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-3xl font-bold text-slate-100">
              {Number.isFinite(readinessScore) ? (readinessScore * 100).toFixed(0) : 0}
            </Text>
            <Text className="text-slate-400 text-xs">/ 100</Text>
          </View>
        </View>
        <View className="bg-slate-700/50 rounded-xl px-4 py-2">
          <Text className="font-semibold" style={{ color: readinessInfo.color }}>
            {readinessInfo.label}
          </Text>
        </View>
      </View>
    </MotiView>
  }
/>


      {/* 4. Time-to-Mastery Meter */}
      <FlipCard
        title="Time-to-Mastery"
        metric={`${formatValue(daysToMastery)} hours`}
        status="Based on your current pace"
        infoText="Your Time-to-Mastery is calculated using advanced AI algorithms that analyze your current study patterns, accuracy rates, and learning velocity across all subjects. The system considers factors like your daily study time, question-solving speed, retention rates, and the complexity of remaining topics. The best-case scenario assumes optimal focus and minimal review time, while the worst-case accounts for potential knowledge gaps requiring additional reinforcement. This dynamic metric updates in real-time as you progress, helping you stay on track for your exam goals."
        icon={<Clock size={20} color="#ffffff" />}
        gradientColors="from-purple-500 to-indigo-600"
        statusColor="text-purple-400"
        additionalInfo={`Best case: ${formatValue(bestCaseDays)} hours|Worst case: ${formatValue(worstCaseDays)} hours`}
        onSeeMore={() => console.log('Navigate to detailed time analysis')}
      />

      {/* 5. Cognitive Load Balancer → FlipCard */}
<FlipCard
  gradientColors="from-cyan-500 to-blue-600"
  statusColor="text-cyan-400"
  infoText={`The Prep Progress Breakdown shows how you're balancing your study effort.

It tracks:
• MCQs completed vs. total
• Flashcards reviewed
• Images & videos explored
• Pending bookmarks

✅ Balanced prep ensures strong coverage.
⚠️ Too many pending items means higher risk of gaps.`}
  onSeeMore={() =>
    router.push({
      pathname: "/info-popup",
      params: {
        title: "Prep Progress Breakdown",
        content: `This metric helps you understand where your time is going. 
Use it to balance practice questions, flashcards, and multimedia review.`
      }
    })
  }
  frontContent={
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 800, delay: 800 }}
      className="p-6"
    >
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3">
          <Target size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-100">Prep Progress Breakdown</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-slate-400 text-sm">AI recommends </Text>
            <Text className="text-cyan-400 font-bold text-sm">{adjustedTargets.gaps} gaps</Text>
            <Text className="text-slate-400 text-sm"> for today</Text>
          </View>
        </View>
      </View>

      {/* Progress bars */}
      <View className="space-y-4">
        {/* MCQs */}
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300">MCQs Completed</Text>
            <Text className="text-slate-300">{mcqsCompleted} / {mcqsTotal}</Text>
          </View>
          <View className="w-full bg-slate-700 rounded-full h-2">
            <View
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
              style={{ width: getProgressWidth(mcqsCompleted, mcqsTotal) }}
            />
          </View>
        </View>

        {/* Flashcards */}
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300">Flashcards Reviewed</Text>
            <Text className="text-slate-300">{flashcardsReviewed} / {flashcardsTotal}</Text>
          </View>
          <View className="w-full bg-slate-700 rounded-full h-2">
            <View
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
              style={{ width: getProgressWidth(flashcardsReviewed, flashcardsTotal) }}
            />
          </View>
        </View>

        {/* Images/Videos */}
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300">Images/Videos Explored</Text>
            <Text className="text-slate-300">{imagesVideosExplored} / {imagesVideosTotal}</Text>
          </View>
          <View className="w-full bg-slate-700 rounded-full h-2">
            <View
              className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full"
              style={{ width: getProgressWidth(imagesVideosExplored, imagesVideosTotal) }}
            />
          </View>
        </View>

        {/* Bookmarks */}
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-300">Bookmarks Pending Review</Text>
          <View className="bg-red-500/20 rounded-full px-3 py-1">
            <Text className="text-red-400 font-bold">{bookmarksPending} 🔔</Text>
          </View>
        </View>
      </View>
    </MotiView>
  }
/>


      {/* 6. Top 3 Gaps Spotlight */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 800, delay: 1000 }}
        className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-3">
            <AlertCircle size={20} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-slate-100">Your 3 Weakest Links Right Now</Text>
        </View>
        
        <View className="space-y-3">
          {topGaps.map((gap, index) => (
            <MotiView
              key={gap.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1200 + index * 100 }}
              className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-100 font-semibold mb-1">{gap.title}</Text>
                  <Text className="text-slate-300 text-sm mb-2">{gap.description}</Text>
                  <Text className="text-xs text-slate-500">{gap.subject}</Text>
                </View>
                <Pressable className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg px-3 py-2 flex-row items-center">
                  <Play size={14} color="#ffffff" />
                  <Text className="text-white font-medium ml-1 text-sm">Fix Now</Text>
                </Pressable>
              </View>
            </MotiView>
          ))}
        </View>
      </MotiView>

      {/* 7. AI Mentor Daily Flight Briefing */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800, delay: 1200 }}
        className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 mb-6 border border-indigo-500/20"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3">
            <Zap size={20} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-indigo-100">Daily Flight Briefing</Text>
        </View>
        
        <Text className="text-indigo-200 text-base leading-6">
          Most students at your level struggled with Biochemistry, but <Text className="font-bold text-indigo-300">80% improved</Text> after 
          1 week of consistent flashcard review. You're on the same track! Keep pushing forward. 🚀
        </Text>
      </MotiView>

      {/* 8. Achievements & Celebrations */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 800, delay: 1400 }}
        className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl items-center justify-center mr-3">
            <Award size={20} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-slate-100">Achievements & Progress</Text>
        </View>
        
        <View className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => (
            <MotiView
              key={achievement.id}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 600, delay: 1600 + index * 100 }}
              className={`items-center p-3 rounded-xl border ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
                  : 'bg-slate-700/30 border-slate-600/30'
              }`}
            >
              <View className="relative mb-2">
                <Text className={`text-2xl ${achievement.unlocked ? '' : 'opacity-30'}`}>
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </Text>
                {!achievement.unlocked && (
                  <View className="absolute inset-0 items-center justify-center">
                    <Lock size={12} color="#64748b" />
                  </View>
                )}
              </View>
              <Text className={`text-xs font-medium text-center ${
                achievement.unlocked ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {achievement.name}
              </Text>
              <Text className={`text-xs text-center ${
                achievement.unlocked ? 'text-amber-300/80' : 'text-slate-600'
              }`}>
                {achievement.description}
              </Text>
            </MotiView>
          ))}
        </View>
      </MotiView>

      {/* 9. Cohort Insights */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'spring', duration: 800, delay: 1600 }}
        className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl items-center justify-center mr-3">
            <Users size={20} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-slate-100">Cohort Insights</Text>
        </View>
        
        <View className="bg-slate-700/40 rounded-xl p-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-slate-200 text-base">
              <Text className="font-bold text-cyan-400">12 peers</Text> also bookmarked Arginine → NO pathway this week.
            </Text>
          </View>
          <CTAButton onPress={() => {}} size="small">
            <Text className="text-white font-medium">Join them</Text>
            <ChevronRight size={16} color="#ffffff" />
          </CTAButton>
        </View>
      </MotiView>

      {/* 10. Wellness Pulse Check */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800, delay: 1800 }}
        className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl items-center justify-center mr-3">
            <Heart size={20} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-slate-100">How are you feeling today?</Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          {moodEmojis.map((emoji, index) => (
            <Pressable
              key={index}
              onPress={() => setMoodRating(index)}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                moodRating === index ? 'bg-pink-500/30 border-2 border-pink-500' : 'bg-slate-700/40'
              }`}
            >
              <Text className="text-2xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>
        
        {moodRating !== null && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mt-4 bg-slate-700/40 rounded-xl p-3"
          >
            <Text className="text-slate-200 text-center">
              You're feeling <Text className="font-bold text-pink-400">{moodLabels[moodRating]}</Text> today.
              {moodRating < 2 && " Let's take it easy with some light micro-sessions."}
              {moodRating >= 3 && " Great energy! Ready for some challenging questions?"}
            </Text>
          </MotiView>
        )}
      </MotiView>
    </ScrollView>
  );
}