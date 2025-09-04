import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingDown, BookOpen, Play, Info, Clock, Target, TriangleAlert as AlertTriangle, Lightbulb } from 'lucide-react-native';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Mistake {
  sentence: string;
  recurrence_count: number;
  time_wasted_minutes: number;
  ai_fix: string;
}

interface SubjectSummary {
  subject: string;
  time_wasted_minutes: number;
}

interface MistakeData {
  mistakes: Mistake[];
  subject_summary: SubjectSummary[];
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function CircularProgress({ value, size = 60, strokeWidth = 6, color = '#ef4444' }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <View className="relative items-center justify-center">
      <View 
        className="rounded-full border-4 items-center justify-center"
        style={{ 
          width: size, 
          height: size, 
          borderColor: '#374151' 
        }}
      >
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: `${(value / 100) * 360}deg` }}
          transition={{ type: 'spring', duration: 1000 }}
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: value > 25 ? color : 'transparent',
            borderBottomColor: value > 50 ? color : 'transparent',
            borderLeftColor: value > 75 ? color : 'transparent',
          }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-lg font-bold" style={{ color }}>
            {value}
          </Text>
          <Text className="text-slate-500 text-xs">cost</Text>
        </View>
      </View>
    </View>
  );
}

interface MistakeCardProps {
  mistake: Mistake;
  index: number;
  rank: number;
}

function MistakeCard({ mistake, index, rank }: MistakeCardProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAIFixIcon = (fix: string) => {
    if (fix.toLowerCase().includes('flashcard')) return <BookOpen size={16} color="#ffffff" />;
    if (fix.toLowerCase().includes('video')) return <Play size={16} color="#ffffff" />;
    return <Info size={16} color="#ffffff" />;
  };

  const getAIFixColor = (fix: string) => {
    if (fix.toLowerCase().includes('flashcard')) return 'from-blue-600 to-indigo-600';
    if (fix.toLowerCase().includes('video')) return 'from-purple-600 to-violet-600';
    return 'from-amber-600 to-orange-600';
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' };
      case 2: return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500' };
      case 3: return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', badge: 'bg-slate-500' };
    }
  };

  const colors = getRankColor(rank);
  const costScore = Math.min(100, (mistake.time_wasted_minutes / 60) * 100); // Normalize to 0-100 scale
  const pulseScale = 1 + Math.sin(pulsePhase) * 0.02;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        translateY: 0, 
        scale: pulseScale 
      }}
      transition={{ type: 'spring', duration: 600, delay: index * 150 }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-6 mb-4 shadow-lg`}
      style={{
        shadowColor: colors.badge.replace('bg-', '#').replace('-500', ''),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-start justify-between">
        {/* Left Section - Content */}
        <View className="flex-1 mr-4">
          {/* Rank Badge */}
          <View className="flex-row items-center mb-3">
            <View className={`w-8 h-8 rounded-full ${colors.badge} items-center justify-center mr-3 shadow-lg`}>
              <Text className="text-white font-bold text-sm">#{rank}</Text>
            </View>
            <Text className={`text-xs font-bold ${colors.text} uppercase tracking-wide`}>
              Most Costly Mistake
            </Text>
          </View>

          {/* Mistake Sentence */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <Text className="text-slate-100 text-base font-medium leading-6">
              {mistake.sentence}
            </Text>
          </View>

          {/* Metrics */}
          <View className="flex-row items-center space-x-6 mb-4">
            <View>
              <Text className="text-slate-400 text-xs">Recurrence</Text>
              <Text className={`text-lg font-bold ${colors.text}`}>
                {mistake.recurrence_count}x
              </Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs">Time Wasted</Text>
              <Text className={`text-lg font-bold ${colors.text}`}>
                {mistake.time_wasted_minutes.toFixed(1)}m
              </Text>
            </View>
            <View>
              <Text className="text-slate-400 text-xs">Avg per Mistake</Text>
              <Text className="text-slate-300 text-sm font-semibold">
                {(mistake.time_wasted_minutes / mistake.recurrence_count).toFixed(1)}m
              </Text>
            </View>
          </View>

          {/* AI Fix Suggestion */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Lightbulb size={16} color="#fbbf24" />
              <Text className="text-slate-100 font-semibold ml-2">AI Recommendation</Text>
            </View>
            <View className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <Text className="text-slate-300 text-sm leading-5">
                {mistake.ai_fix}
              </Text>
            </View>
          </View>

          {/* Start Fix Button */}
          <Pressable
            onPress={() => {
              if (typeof window !== 'undefined' && window.alert) {
                window.alert(`Start Fix: ${mistake.ai_fix}`);
              } else {
                console.log(`Start Fix: ${mistake.ai_fix}`);
              }
            }}
            className={`bg-gradient-to-r ${getAIFixColor(mistake.ai_fix)} rounded-xl py-3 px-6 shadow-lg active:scale-95 flex-row items-center justify-center`}
            style={{
              shadowColor: mistake.ai_fix.toLowerCase().includes('flashcard') ? '#3b82f6' : 
                         mistake.ai_fix.toLowerCase().includes('video') ? '#8b5cf6' : '#f59e0b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {getAIFixIcon(mistake.ai_fix)}
            <Text className="text-white font-bold text-base ml-2">
              Start Fix
            </Text>
          </Pressable>
        </View>

        {/* Right Section - Cost Score Circle */}
        <View className="items-center">
          <CircularProgress 
            value={costScore} 
            size={80} 
            strokeWidth={8}
            color={colors.text.includes('red') ? '#ef4444' : 
                  colors.text.includes('orange') ? '#f97316' : 
                  colors.text.includes('amber') ? '#f59e0b' : '#64748b'}
          />
          <Text className={`text-xs mt-2 font-medium ${colors.text}`}>
            Cost Impact
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

interface MistakeCostDashboardProps {
  data?: MistakeData;
}

// Extended mock data
const mockData: MistakeData = {
  "mistakes": [
    {
      "sentence": "Misidentified SA node as AV node",
      "recurrence_count": 11,
      "time_wasted_minutes": 49.5,
      "ai_fix": "Flashcard + retry recursive MCQ set"
    },
    {
      "sentence": "Confused Vmax vs Km in enzyme kinetics",
      "recurrence_count": 8,
      "time_wasted_minutes": 36,
      "ai_fix": "Reinforce concept with video explainer"
    },
    {
      "sentence": "Mixed up Aldosterone vs ADH action",
      "recurrence_count": 7,
      "time_wasted_minutes": 31.5,
      "ai_fix": "Micro-explainer on hormone mechanisms"
    },
    {
      "sentence": "Incorrect Starling Forces direction",
      "recurrence_count": 6,
      "time_wasted_minutes": 27,
      "ai_fix": "Visual diagram flashcard review"
    },
    {
      "sentence": "Forgot Insulin signaling pathway steps",
      "recurrence_count": 5,
      "time_wasted_minutes": 22.5,
      "ai_fix": "Step-by-step video walkthrough"
    },
    {
      "sentence": "Confused inspiratory vs expiratory muscles",
      "recurrence_count": 4,
      "time_wasted_minutes": 18,
      "ai_fix": "Anatomical diagram flashcards"
    }
  ],
  "subject_summary": [
    { "subject": "Physiology", "time_wasted_minutes": 120 },
    { "subject": "Biochemistry", "time_wasted_minutes": 90 },
    { "subject": "Pharmacology", "time_wasted_minutes": 75 },
    { "subject": "Anatomy", "time_wasted_minutes": 60 },
    { "subject": "Pathology", "time_wasted_minutes": 45 }
  ]
};

export default function MistakeCostDashboard({ data = mockData }: MistakeCostDashboardProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Sort mistakes by time wasted and take top 5
  const topMistakes = [...data.mistakes]
    .sort((a, b) => b.time_wasted_minutes - a.time_wasted_minutes)
    .slice(0, 5);

  // Calculate total time wasted
  const totalTimeWasted = data.mistakes.reduce((sum, mistake) => sum + mistake.time_wasted_minutes, 0);
  const totalRecurrences = data.mistakes.reduce((sum, mistake) => sum + mistake.recurrence_count, 0);

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.subject}
          </Text>
          <Text className="text-red-300 text-sm">
            Time Wasted: {data.time_wasted_minutes.toFixed(1)} minutes
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {(data.time_wasted_minutes / 60).toFixed(1)} hours total
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <TrendingDown size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Mistake Cost Dashboard
            </Text>
            <Text className="text-sm text-slate-400">
              Top 5 costliest mistakes • {totalTimeWasted.toFixed(1)}m total waste
            </Text>
          </View>
        </View>

        {/* Summary Badge */}
        <View className="items-center">
          <View className="bg-red-500/20 rounded-full px-4 py-2 border border-red-500/30">
            <Text className="text-red-400 font-bold text-lg">
              {totalRecurrences}
            </Text>
            <Text className="text-red-300/80 text-xs text-center">
              total mistakes
            </Text>
          </View>
        </View>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Summary Metrics */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingDown size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Total Wasted</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {(totalTimeWasted / 60).toFixed(1)}h
            </Text>
            <Text className="text-red-300/80 text-xs">
              {totalTimeWasted.toFixed(0)} minutes
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Avg per Mistake</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {(totalTimeWasted / totalRecurrences).toFixed(1)}m
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Costliest</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {topMistakes[0]?.time_wasted_minutes.toFixed(0) || 0}m
            </Text>
            <Text className="text-blue-300/80 text-xs">
              {topMistakes[0]?.recurrence_count || 0}x recurrence
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Potential Savings</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {(totalTimeWasted * 0.8 / 60).toFixed(1)}h
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              80% recoverable
            </Text>
          </MotiView>
        </View>

        {/* Top 5 Mistakes Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
              <TrendingDown size={16} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-slate-100">
              Top 5 Costliest Mistakes
            </Text>
          </View>

          {topMistakes.map((mistake, index) => (
            <MistakeCard
              key={`${mistake.sentence}-${index}`}
              mistake={mistake}
              index={index}
              rank={index + 1}
            />
          ))}
        </MotiView>

        {/* Subject-wise Bar Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Subject-wise Time Waste Analysis
            </Text>
          </View>

          {/* Bar Chart */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            {data.subject_summary && data.subject_summary.length > 0 ? (
              <View style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.subject_summary}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="subject"
                      stroke="#94a3b8"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="time_wasted_minutes" 
                      fill="url(#wasteGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    
                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </View>
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-slate-400 text-sm">No subject data available</Text>
              </View>
            )}
          </View>

          {/* Subject Analysis */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row items-center mb-3">
              <Target size={16} color="#06b6d4" />
              <Text className="text-slate-100 font-semibold ml-2">Subject Impact Analysis</Text>
            </View>
            
            <View className="space-y-2">
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-red-400">Highest Waste:</Text> {
                  data.subject_summary.reduce((max, subject) => 
                    subject.time_wasted_minutes > max.time_wasted_minutes ? subject : max
                  ).subject
                } ({data.subject_summary.reduce((max, subject) => 
                  subject.time_wasted_minutes > max.time_wasted_minutes ? subject : max
                ).time_wasted_minutes.toFixed(1)}m)
              </Text>
              
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-emerald-400">Most Efficient:</Text> {
                  data.subject_summary.reduce((min, subject) => 
                    subject.time_wasted_minutes < min.time_wasted_minutes ? subject : min
                  ).subject
                } ({data.subject_summary.reduce((min, subject) => 
                  subject.time_wasted_minutes < min.time_wasted_minutes ? subject : min
                ).time_wasted_minutes.toFixed(1)}m)
              </Text>
              
              <Text className="text-slate-400 text-xs leading-4 mt-3">
                Focus your error correction efforts on {
                  data.subject_summary.reduce((max, subject) => 
                    subject.time_wasted_minutes > max.time_wasted_minutes ? subject : max
                  ).subject
                } to maximize time savings. Consider reviewing fundamental concepts in this subject.
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Action Recommendations */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <Lightbulb size={16} color="#fbbf24" />
            <Text className="text-slate-100 font-semibold ml-2">Optimization Strategy</Text>
          </View>
          
          <View className="space-y-3">
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Text className="text-emerald-200 text-sm">
                <Text className="font-bold">Priority 1:</Text> Address the top 3 mistakes first - they account for 
                {' '}{((topMistakes.slice(0, 3).reduce((sum, m) => sum + m.time_wasted_minutes, 0) / totalTimeWasted) * 100).toFixed(0)}% 
                of your total time waste.
              </Text>
            </View>
            
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Text className="text-blue-200 text-sm">
                <Text className="font-bold">Priority 2:</Text> Focus on {
                  data.subject_summary.reduce((max, subject) => 
                    subject.time_wasted_minutes > max.time_wasted_minutes ? subject : max
                  ).subject
                } fundamentals to prevent recurring errors in this subject.
              </Text>
            </View>
            
            <View className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <Text className="text-purple-200 text-sm">
                <Text className="font-bold">Expected Outcome:</Text> Implementing these fixes could save approximately 
                {' '}{(totalTimeWasted * 0.7 / 60).toFixed(1)} hours of study time.
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}