import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Calendar, Clock, X, AlertTriangle, Lightbulb, Target, BookOpen, Play, Info } from 'lucide-react-native';

interface MistakeEvent {
  date: string;
  mistake: string;
  recurrence: number;
}

interface MistakeDetails {
  sentence: string;
  wasted_time: number;
  ai_fix: string;
}

interface TimelinePointProps {
  event: MistakeEvent;
  index: number;
  onPress: () => void;
  isRepeated: boolean;
}

interface MistakeModalProps {
  mistake: string;
  details: MistakeDetails;
  position: { x: number; y: number };
  onClose: () => void;
}

function TimelinePoint({ event, index, onPress, isRepeated }: TimelinePointProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Glow animation for repeated mistakes
  useEffect(() => {
    if (!isRepeated) return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 800);
    
    return () => clearInterval(interval);
  }, [isRepeated]);

  const getRecurrenceColor = (recurrence: number) => {
    if (recurrence >= 3) return { color: '#dc2626', glow: '#ef4444' }; // Dark red
    if (recurrence === 2) return { color: '#ea580c', glow: '#f97316' }; // Orange
    return { color: '#0891b2', glow: '#06b6d4' }; // Cyan for first occurrence
  };

  const colors = getRecurrenceColor(event.recurrence);
  const pulseScale = isRepeated ? (1 + Math.sin(pulsePhase) * 0.2) : 1;
  const pulseOpacity = isRepeated ? (0.8 + Math.sin(pulsePhase) * 0.2) : 1;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: pulseOpacity, 
        scale: pulseScale 
      }}
      transition={{ 
        type: 'spring', 
        duration: 600, 
        delay: index * 100 
      }}
      className="items-center mr-8"
    >
      {/* Glow Effect for Repeated Mistakes */}
      {isRepeated && (
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
            delay: index * 200,
          }}
          className="absolute w-16 h-16 rounded-full"
          style={{ backgroundColor: colors.glow, opacity: 0.3 }}
        />
      )}

      {/* Main Timeline Point */}
      <Pressable
        onPress={onPress}
        className="w-16 h-16 rounded-full items-center justify-center shadow-lg active:scale-95 border-4 border-white"
        style={{
          backgroundColor: colors.color,
          shadowColor: colors.glow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Recurrence Count */}
        <Text className="text-white font-bold text-lg">
          {event.recurrence}
        </Text>
        <Text className="text-white/80 text-xs">
          {event.recurrence === 1 ? 'NEW' : 'RPT'}
        </Text>
      </Pressable>

      {/* Date Label */}
      <View className="mt-3 items-center">
        <Text className="text-slate-300 font-semibold text-sm">
          {new Date(event.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <Text className="text-slate-500 text-xs">
          {new Date(event.date).toLocaleDateString('en-US', { 
            year: 'numeric' 
          })}
        </Text>
      </View>

      {/* Mistake Preview */}
      <View className="mt-2 max-w-24">
        <Text className="text-slate-400 text-xs text-center" numberOfLines={2}>
          {event.mistake}
        </Text>
      </View>

      {/* Repeated Mistake Indicator */}
      {isRepeated && (
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 400, delay: index * 100 + 600 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <AlertTriangle size={12} color="#ffffff" />
        </MotiView>
      )}
    </MotiView>
  );
}

function MistakeModal({ mistake, details, position, onClose }: MistakeModalProps) {
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

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-2xl p-6 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 160, Dimensions.get('window').width - 330)),
        top: position.y - 200,
        width: 320,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
      >
        <X size={16} color="#94a3b8" />
      </Pressable>

      {/* Modal Header */}
      <View className="flex-row items-center mb-4 pr-8">
        <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-3 shadow-lg">
          <AlertTriangle size={20} color="#ffffff" />
        </View>
        <Text className="text-xl font-bold text-slate-100 flex-1">
          Mistake Analysis
        </Text>
      </View>

      {/* Mistake Details */}
      <View className="space-y-4">
        {/* Mistake Sentence */}
        <View>
          <Text className="text-slate-100 font-semibold mb-2">Error Pattern:</Text>
          <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <Text className="text-red-200 text-base leading-6">
              {details.sentence}
            </Text>
          </View>
        </View>

        {/* Time Impact */}
        <View>
          <Text className="text-slate-100 font-semibold mb-2">Time Impact:</Text>
          <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={16} color="#f59e0b" />
                <Text className="text-amber-200 text-sm ml-2">Time Wasted:</Text>
              </View>
              <Text className="text-amber-400 font-bold text-lg">
                {details.wasted_time.toFixed(1)}m
              </Text>
            </View>
            <Text className="text-amber-300/80 text-xs mt-1">
              That's {(details.wasted_time / 60).toFixed(1)} hours of study time lost
            </Text>
          </View>
        </View>

        {/* AI Fix Suggestion */}
        <View>
          <Text className="text-slate-100 font-semibold mb-2">AI Recommendation:</Text>
          <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Lightbulb size={16} color="#10b981" />
              <Text className="text-emerald-300 font-medium ml-2">Suggested Fix:</Text>
            </View>
            <Text className="text-emerald-200 text-sm leading-5 mb-3">
              {details.ai_fix}
            </Text>
            
            {/* Start Fix Button */}
            <Pressable
              onPress={() => {
                if (typeof window !== 'undefined' && window.alert) {
                  window.alert(`Starting fix: ${details.ai_fix}`);
                } else {
                  console.log(`Starting fix: ${details.ai_fix}`);
                }
                onClose();
              }}
              className={`bg-gradient-to-r ${getAIFixColor(details.ai_fix)} rounded-xl py-3 px-4 shadow-lg active:scale-95 flex-row items-center justify-center`}
              style={{
                shadowColor: details.ai_fix.toLowerCase().includes('flashcard') ? '#3b82f6' : 
                           details.ai_fix.toLowerCase().includes('video') ? '#8b5cf6' : '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {getAIFixIcon(details.ai_fix)}
              <Text className="text-white font-bold text-base ml-2">
                Start Fix
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

interface MistakeCostDashboardProps {
  data?: {
    mistakes: Array<{
      sentence: string;
      recurrence_count: number;
      time_wasted_minutes: number;
      ai_fix: string;
    }>;
    subject_summary: Array<{
      subject: string;
      time_wasted_minutes: number;
    }>;
  };
}

// Extended mock data
const mockData = {
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
            <AlertTriangle size={20} color="#ffffff" />
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
              <AlertTriangle size={16} color="#ef4444" />
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
              <Clock size={16} color="#f59e0b" />
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
              <Lightbulb size={16} color="#10b981" />
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
              <AlertTriangle size={16} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-slate-100">
              Top 5 Costliest Mistakes
            </Text>
          </View>

          {topMistakes.map((mistake, index) => {
            const rank = index + 1;
            const costScore = Math.min(100, (mistake.time_wasted_minutes / 60) * 100); // Normalize to 0-100 scale
            const rankColors = [
              { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' },
              { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500' },
              { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500' },
              { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
              { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500' },
            ];
            const colors = rankColors[index];

            return (
              <MotiView
                key={mistake.sentence}
                from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: 'spring', duration: 600, delay: 800 + index * 150 }}
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
                    <View className="relative w-20 h-20">
                      {/* Background Circle */}
                      <View className="absolute inset-0 rounded-full border-4 border-slate-700/60" />
                      
                      {/* Progress Circle */}
                      <MotiView
                        from={{ rotate: '0deg' }}
                        animate={{ rotate: `${(costScore / 100) * 360}deg` }}
                        transition={{ type: 'spring', duration: 1200, delay: 1000 + index * 150 }}
                        className="absolute inset-0 rounded-full border-4 border-transparent"
                        style={{
                          borderTopColor: colors.text.includes('red') ? '#ef4444' : 
                                        colors.text.includes('orange') ? '#f97316' : 
                                        colors.text.includes('amber') ? '#f59e0b' : '#64748b',
                          borderRightColor: costScore > 25 ? (colors.text.includes('red') ? '#ef4444' : 
                                                            colors.text.includes('orange') ? '#f97316' : 
                                                            colors.text.includes('amber') ? '#f59e0b' : '#64748b') : 'transparent',
                          borderBottomColor: costScore > 50 ? (colors.text.includes('red') ? '#ef4444' : 
                                                             colors.text.includes('orange') ? '#f97316' : 
                                                             colors.text.includes('amber') ? '#f59e0b' : '#64748b') : 'transparent',
                          borderLeftColor: costScore > 75 ? (colors.text.includes('red') ? '#ef4444' : 
                                                            colors.text.includes('orange') ? '#f97316' : 
                                                            colors.text.includes('amber') ? '#f59e0b' : '#64748b') : 'transparent',
                        }}
                      />
                      
                      {/* Center Text */}
                      <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-lg font-bold" style={{ 
                          color: colors.text.includes('red') ? '#ef4444' : 
                                colors.text.includes('orange') ? '#f97316' : 
                                colors.text.includes('amber') ? '#f59e0b' : '#64748b' 
                        }}>
                          {costScore.toFixed(0)}
                        </Text>
                        <Text className="text-slate-500 text-xs">cost</Text>
                      </View>
                    </View>
                    <Text className={`text-xs mt-2 font-medium ${colors.text}`}>
                      Cost Impact
                    </Text>
                  </View>
                </View>
              </MotiView>
            );
          })}
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
            <View style={{ width: '100%', height: 300 }}>
              {/* Note: Recharts would be used here in a real implementation */}
              <View className="flex-row items-end justify-between h-full px-4 pb-8">
                {data.subject_summary.map((subject, index) => {
                  const maxTime = Math.max(...data.subject_summary.map(s => s.time_wasted_minutes));
                  const barHeight = (subject.time_wasted_minutes / maxTime) * 200;
                  
                  return (
                    <View key={subject.subject} className="items-center">
                      <Text className="text-slate-300 text-sm font-bold mb-2">
                        {subject.time_wasted_minutes.toFixed(0)}m
                      </Text>
                      <MotiView
                        from={{ height: 0 }}
                        animate={{ height: barHeight }}
                        transition={{ type: 'spring', duration: 800, delay: 1400 + index * 100 }}
                        className="w-12 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg"
                      />
                      <Text className="text-slate-400 text-xs mt-2 text-center" numberOfLines={1}>
                        {subject.subject}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
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