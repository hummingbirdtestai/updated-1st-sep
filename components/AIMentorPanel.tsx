import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Brain, BookOpen, Play, RotateCcw, Target, Clock, Zap, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react-native';

interface MistakeData {
  id: string;
  mistake: string;
  mri_score: number;
  time_wasted_minutes: number;
  ai_fix: string;
}

interface AIMentorPanelProps {
  mistakes?: MistakeData[];
  onFixStart?: (mistake: MistakeData) => void;
}

interface MistakeCardProps {
  mistake: MistakeData;
  index: number;
  onFixStart?: (mistake: MistakeData) => void;
}

interface CircularMRIScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function CircularMRIScore({ score, size = 70, strokeWidth = 8 }: CircularMRIScoreProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Get color based on MRI score
  const getMRIColor = (score: number) => {
    if (score >= 80) return '#dc2626'; // Dark red - critical
    if (score >= 60) return '#ef4444'; // Red - high
    if (score >= 40) return '#f59e0b'; // Amber - medium
    if (score >= 20) return '#eab308'; // Yellow - low
    return '#10b981'; // Green - minimal
  };

  const color = getMRIColor(score);

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
          animate={{ rotate: `${(score / 100) * 360}deg` }}
          transition={{ type: 'spring', duration: 1200 }}
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: score > 25 ? color : 'transparent',
            borderBottomColor: score > 50 ? color : 'transparent',
            borderLeftColor: score > 75 ? color : 'transparent',
          }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-xl font-bold" style={{ color }}>
            {score}
          </Text>
          <Text className="text-slate-500 text-xs">MRI</Text>
        </View>
      </View>
    </View>
  );
}

function MistakeCard({ mistake, index, onFixStart }: MistakeCardProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for high MRI scores
  React.useEffect(() => {
    if (mistake.mri_score < 60) return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [mistake.mri_score]);

  // Parse AI fix to determine type and get appropriate styling
  const getFixType = (aiFixText: string) => {
    const text = aiFixText.toLowerCase();
    if (text.includes('flashcard')) return 'flashcard';
    if (text.includes('video')) return 'video';
    if (text.includes('retry') || text.includes('mcq') || text.includes('recursive')) return 'mcq_retry';
    return 'flashcard'; // default
  };

  const getFixIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return <BookOpen size={18} color="#ffffff" />;
      case 'video': return <Play size={18} color="#ffffff" />;
      case 'mcq_retry': return <RotateCcw size={18} color="#ffffff" />;
      default: return <BookOpen size={18} color="#ffffff" />;
    }
  };

  const getFixColor = (type: string) => {
    switch (type) {
      case 'flashcard': return 'from-blue-600 to-indigo-600';
      case 'video': return 'from-purple-600 to-violet-600';
      case 'mcq_retry': return 'from-emerald-600 to-teal-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getMRISeverity = (score: number) => {
    if (score >= 80) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Critical' };
    if (score >= 60) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'High' };
    if (score >= 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Medium' };
    if (score >= 20) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Low' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Minimal' };
  };

  const fixType = getFixType(mistake.ai_fix);
  const severity = getMRISeverity(mistake.mri_score);
  const shouldPulse = mistake.mri_score >= 60;
  const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.03) : 1;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        translateY: 0, 
        scale: pulseScale 
      }}
      transition={{ type: 'spring', duration: 600, delay: index * 200 }}
      className={`${severity.bg} border ${severity.border} rounded-2xl p-6 mb-6 shadow-lg`}
      style={{
        shadowColor: severity.text.includes('red') ? '#ef4444' : 
                    severity.text.includes('orange') ? '#f97316' : 
                    severity.text.includes('amber') ? '#f59e0b' : 
                    severity.text.includes('yellow') ? '#eab308' : '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* High MRI Glow Effect */}
      {shouldPulse && (
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
            delay: index * 200,
          }}
          className="absolute inset-0 rounded-2xl"
          style={{ 
            backgroundColor: severity.text.includes('red') ? '#ef4444' : '#f97316',
            opacity: 0.1 
          }}
        />
      )}

      <View className="flex-row items-start justify-between">
        {/* Left Section - Content */}
        <View className="flex-1 mr-6">
          {/* Header with MRI Severity */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3 shadow-lg">
                <Brain size={16} color="#ffffff" />
              </View>
              <Text className="text-slate-100 font-bold text-lg">
                Mistake Analysis
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${severity.bg} border ${severity.border}`}>
              <Text className={`text-xs font-bold ${severity.text} uppercase`}>
                {severity.label} MRI
              </Text>
            </View>
          </View>

          {/* Mistake Sentence */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <Text className="text-slate-100 text-base font-medium leading-6">
              {mistake.mistake}
            </Text>
          </View>

          {/* Metrics Row */}
          <View className="flex-row items-center space-x-6 mb-4">
            <View className="flex-row items-center">
              <Target size={16} color="#94a3b8" />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Recurrence</Text>
                <Text className={`text-lg font-bold ${severity.text}`}>
                  {mistake.recurrence_count}x
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Clock size={16} color="#94a3b8" />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Time Wasted</Text>
                <Text className={`text-lg font-bold ${severity.text}`}>
                  {mistake.time_wasted_minutes.toFixed(1)}m
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TrendingUp size={16} color="#94a3b8" />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Avg per Error</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {(mistake.time_wasted_minutes / mistake.recurrence_count).toFixed(1)}m
                </Text>
              </View>
            </View>
          </View>

          {/* AI Fix Suggestion */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Lightbulb size={16} color="#fbbf24" />
              <Text className="text-slate-100 font-semibold ml-2">AI Recommendation</Text>
            </View>
            <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-300 text-sm leading-6">
                {mistake.ai_fix}
              </Text>
            </View>
          </View>

          {/* Start Fix Button */}
          <Pressable
            onPress={() => onFixStart?.(mistake)}
            className={`bg-gradient-to-r ${getFixColor(fixType)} rounded-xl py-3 px-6 shadow-lg active:scale-95 flex-row items-center justify-center`}
            style={{
              shadowColor: fixType === 'flashcard' ? '#3b82f6' : 
                         fixType === 'video' ? '#8b5cf6' : '#10b981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {getFixIcon(fixType)}
            <Text className="text-white font-bold text-base ml-2">
              Start Fix
            </Text>
          </Pressable>
        </View>

        {/* Right Section - MRI Score Circle */}
        <View className="items-center">
          <CircularMRIScore score={mistake.mri_score} size={80} strokeWidth={10} />
          
          {/* MRI Score Label */}
          <Text className={`text-sm mt-3 font-bold ${severity.text}`}>
            MRI Score
          </Text>
          <Text className="text-slate-400 text-xs text-center">
            Mistake Recurrence Index
          </Text>

          {/* Critical Alert for High MRI */}
          {mistake.mri_score >= 80 && (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 400, delay: index * 200 + 800 }}
              className="mt-2 bg-red-500/20 rounded-full px-3 py-1 border border-red-500/30"
            >
              <Text className="text-red-400 text-xs font-bold">
                🚨 CRITICAL
              </Text>
            </MotiView>
          )}
        </View>
      </View>

      {/* Progress Bar showing relative impact */}
      <View className="mt-4 pt-4 border-t border-slate-600/30">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-400 text-xs">Impact Relative to Other Mistakes</Text>
          <Text className="text-slate-300 text-xs">
            {((mistake.time_wasted_minutes / 200) * 100).toFixed(0)}% of max impact
          </Text>
        </View>
        <View className="w-full bg-slate-700/60 rounded-full h-2">
          <MotiView
            from={{ width: '0%' }}
            animate={{ width: `${(mistake.time_wasted_minutes / 200) * 100}%` }}
            transition={{ type: 'spring', duration: 1000, delay: index * 200 + 600 }}
            className="h-2 rounded-full"
            style={{ backgroundColor: severity.text.includes('red') ? '#ef4444' : 
                                    severity.text.includes('orange') ? '#f97316' : 
                                    severity.text.includes('amber') ? '#f59e0b' : 
                                    severity.text.includes('yellow') ? '#eab308' : '#10b981' }}
          />
        </View>
      </View>
    </MotiView>
  );
}

// Mock data with multiple mistakes
const mockMistakes: MistakeData[] = [
  {
    id: "mistake_1",
    mistake: "SA node vs AV node confusion",
    mri_score: 82,
    time_wasted_minutes: 49.5,
    ai_fix: "Flashcard: 'Pacemaker Hierarchy' + retry 3 recursives"
  },
  {
    id: "mistake_2",
    mistake: "Confused Vmax vs Km in enzyme kinetics",
    mri_score: 67,
    time_wasted_minutes: 36,
    ai_fix: "Video: 'Michaelis-Menten Curve Explained' + practice problems"
  },
  {
    id: "mistake_3",
    mistake: "Mixed up Aldosterone vs ADH action",
    mri_score: 54,
    time_wasted_minutes: 31.5,
    ai_fix: "Retry recursive MCQs on hormone mechanisms"
  },
  {
    id: "mistake_4",
    mistake: "Incorrect Starling Forces direction",
    mri_score: 43,
    time_wasted_minutes: 27,
    ai_fix: "Flashcard: 'Capillary Exchange Forces' with diagrams"
  },
  {
    id: "mistake_5",
    mistake: "Forgot Insulin signaling pathway steps",
    mri_score: 38,
    time_wasted_minutes: 22.5,
    ai_fix: "Video: 'Insulin Cascade Step-by-Step' walkthrough"
  },
  {
    id: "mistake_6",
    mistake: "Confused inspiratory vs expiratory muscles",
    mri_score: 29,
    time_wasted_minutes: 18,
    ai_fix: "Retry MCQs on respiratory muscle anatomy"
  }
];

export default function AIMentorPanel({ 
  mistakes = mockMistakes, 
  onFixStart 
}: AIMentorPanelProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Sort mistakes by MRI score (highest first)
  const sortedMistakes = [...mistakes].sort((a, b) => b.mri_score - a.mri_score);

  // Calculate summary metrics
  const totalTimeWasted = mistakes.reduce((sum, mistake) => sum + mistake.time_wasted_minutes, 0);
  const averageMRI = mistakes.reduce((sum, mistake) => sum + mistake.mri_score, 0) / mistakes.length;
  const criticalMistakes = mistakes.filter(m => m.mri_score >= 80).length;
  const highMistakes = mistakes.filter(m => m.mri_score >= 60 && m.mri_score < 80).length;

  const handleFixStart = (mistake: MistakeData) => {
    if (onFixStart) {
      onFixStart(mistake);
    } else {
      // Default behavior - show alert
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Starting AI fix for: ${mistake.mistake}\n\nRecommendation: ${mistake.ai_fix}`);
      } else {
        console.log(`Starting AI fix for: ${mistake.mistake}`, mistake.ai_fix);
      }
    }
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
          <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Brain size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              AI Mentor Panel 🤖
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              Intelligent mistake analysis & targeted fixes
            </Text>
          </View>
        </View>

        {/* Summary Badge */}
        <View className="items-center">
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30">
            <Text className="text-purple-400 font-bold text-xl">
              {averageMRI.toFixed(0)}
            </Text>
            <Text className="text-purple-300/80 text-xs text-center">
              Avg MRI
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
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Critical</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {criticalMistakes}
            </Text>
            <Text className="text-red-300/80 text-xs">
              MRI ≥ 80
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#f97316" />
              <Text className="text-orange-400 font-semibold text-sm ml-2">High Priority</Text>
            </View>
            <Text className="text-orange-200 text-xl font-bold">
              {highMistakes}
            </Text>
            <Text className="text-orange-300/80 text-xs">
              MRI 60-79
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Time Wasted</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {(totalTimeWasted / 60).toFixed(1)}h
            </Text>
            <Text className="text-amber-300/80 text-xs">
              {totalTimeWasted.toFixed(0)} minutes
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Zap size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Avg MRI</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {averageMRI.toFixed(0)}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              Mistake index
            </Text>
          </MotiView>
        </View>

        {/* AI Mentor Introduction */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
              <Brain size={20} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-purple-100">
              AI Mentor Analysis
            </Text>
          </View>
          
          <Text className="text-purple-200 text-base leading-6">
            I've analyzed your mistake patterns and calculated MRI (Mistake Recurrence Index) scores. 
            Higher scores indicate mistakes that are both frequent and costly. Let's tackle the 
            <Text className="font-bold text-purple-300"> {criticalMistakes + highMistakes} high-priority items</Text> first 
            to maximize your study efficiency! 🎯
          </Text>
        </MotiView>

        {/* Mistake Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
              <AlertTriangle size={16} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-slate-100">
              Priority Mistakes (Ranked by MRI Score)
            </Text>
          </View>

          {sortedMistakes.map((mistake, index) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              index={index}
              onFixStart={handleFixStart}
            />
          ))}
        </MotiView>

        {/* MRI Score Explanation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Target size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">MRI Score Explanation</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-purple-400">MRI (Mistake Recurrence Index)</Text> combines frequency and time impact:
            </Text>
            
            <View className="ml-4 space-y-1">
              <Text className="text-slate-400 text-sm">
                • <Text className="text-red-400 font-semibold">80-100:</Text> Critical - Immediate attention required
              </Text>
              <Text className="text-slate-400 text-sm">
                • <Text className="text-orange-400 font-semibold">60-79:</Text> High Priority - Address soon
              </Text>
              <Text className="text-slate-400 text-sm">
                • <Text className="text-amber-400 font-semibold">40-59:</Text> Medium Priority - Monitor and improve
              </Text>
              <Text className="text-slate-400 text-sm">
                • <Text className="text-emerald-400 font-semibold">0-39:</Text> Low Priority - Occasional review
              </Text>
            </View>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              💡 Focus on mistakes with MRI ≥ 60 for maximum study efficiency improvement. 
              Each point reduction in MRI score represents meaningful time savings.
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}