import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Zap, BookOpen, Play, Info, Clock, Target, TrendingUp, Calendar, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import quickfixData from '@/data/quickfix-data.json';

interface ActiveFix {
  id: string;
  gap_id: string;
  gap_sentence: string;
  quickfix_type: 'flashcard' | 'video' | 'micro_explainer';
  triggered_on: string;
  status: string;
}

interface CompletedFix {
  id: string;
  gap_id: string;
  gap_sentence: string;
  quickfix_type: 'flashcard' | 'video' | 'micro_explainer';
  pre_accuracy: number;
  post_accuracy: number;
  pre_avg_time_min: number;
  post_avg_time_min: number;
  impact_score: number;
  completed_on: string;
}

interface TimelineEvent {
  event_type: 'triggered' | 'completed' | 'escalated';
  event_time: string;
  gap_sentence: string;
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function CircularProgress({ value, size = 60, strokeWidth = 6, color = '#10b981' }: CircularProgressProps) {
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
          <Text className="text-slate-500 text-xs">score</Text>
        </View>
      </View>
    </View>
  );
}

interface ActiveFixCardProps {
  fix: ActiveFix;
  index: number;
}

function ActiveFixCard({ fix, index }: ActiveFixCardProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFixIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return <BookOpen size={20} color="#ffffff" />;
      case 'video': return <Play size={20} color="#ffffff" />;
      case 'micro_explainer': return <Info size={20} color="#ffffff" />;
      default: return <Zap size={20} color="#ffffff" />;
    }
  };

  const getFixColor = (type: string) => {
    switch (type) {
      case 'flashcard': return 'from-blue-600 to-indigo-600';
      case 'video': return 'from-purple-600 to-violet-600';
      case 'micro_explainer': return 'from-amber-600 to-orange-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const pulseScale = 1 + Math.sin(pulsePhase) * 0.05;
  const pulseOpacity = 0.9 + Math.sin(pulsePhase) * 0.1;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ 
        opacity: pulseOpacity, 
        translateY: 0, 
        scale: pulseScale 
      }}
      transition={{ type: 'spring', duration: 600, delay: index * 150 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-6 mb-4 shadow-lg"
      style={{
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          {/* Fix Type Header */}
          <View className="flex-row items-center mb-3">
            <View className={`w-10 h-10 bg-gradient-to-br ${getFixColor(fix.quickfix_type)} rounded-xl items-center justify-center mr-3 shadow-lg`}>
              {getFixIcon(fix.quickfix_type)}
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-bold text-base capitalize">
                {fix.quickfix_type.replace('_', ' ')} Fix
              </Text>
              <Text className="text-slate-400 text-sm">
                Triggered {new Date(fix.triggered_on).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Gap Sentence */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <Text className="text-slate-200 text-base leading-6">
              {fix.gap_sentence}
            </Text>
          </View>

          {/* Start Fix Button */}
          <Pressable
            onPress={() => Alert.alert('Start Fix', `Starting ${fix.quickfix_type} fix for: ${fix.gap_sentence}`)}
            className={`bg-gradient-to-r ${getFixColor(fix.quickfix_type)} rounded-xl py-3 px-6 shadow-lg active:scale-95 flex-row items-center justify-center`}
            style={{
              shadowColor: fix.quickfix_type === 'flashcard' ? '#3b82f6' : 
                         fix.quickfix_type === 'video' ? '#8b5cf6' : '#f59e0b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {getFixIcon(fix.quickfix_type)}
            <Text className="text-white font-bold text-base ml-2">
              Start Fix
            </Text>
          </Pressable>
        </View>

        {/* Status Indicator */}
        <View className="items-center">
          <View className="w-16 h-16 bg-red-500/20 rounded-full border-4 border-red-500 items-center justify-center">
            <Text className="text-red-400 font-bold text-sm">NEW</Text>
          </View>
          <Text className="text-red-400 text-xs mt-2 font-medium">
            Active
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

interface CompletedFixCardProps {
  fix: CompletedFix;
  index: number;
}

function CompletedFixCard({ fix, index }: CompletedFixCardProps) {
  const getFixIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return <BookOpen size={16} color="#ffffff" />;
      case 'video': return <Play size={16} color="#ffffff" />;
      case 'micro_explainer': return <Info size={16} color="#ffffff" />;
      default: return <Zap size={16} color="#ffffff" />;
    }
  };

  const getFixColor = (type: string) => {
    switch (type) {
      case 'flashcard': return '#3b82f6';
      case 'video': return '#8b5cf6';
      case 'micro_explainer': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const timeSaved = fix.pre_avg_time_min - fix.post_avg_time_min;
  const accuracyImprovement = fix.post_accuracy - fix.pre_accuracy;

  // Data for mini bar chart
  const chartData = [
    { name: 'Before', accuracy: fix.pre_accuracy, fill: '#ef4444' },
    { name: 'After', accuracy: fix.post_accuracy, fill: '#10b981' }
  ];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 150 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-6 mb-4 shadow-lg"
      style={{
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          {/* Fix Type Header */}
          <View className="flex-row items-center mb-3">
            <View 
              className="w-8 h-8 rounded-lg items-center justify-center mr-3 shadow-md"
              style={{ backgroundColor: getFixColor(fix.quickfix_type) }}
            >
              {getFixIcon(fix.quickfix_type)}
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-bold text-base capitalize">
                {fix.quickfix_type.replace('_', ' ')} Fix
              </Text>
              <Text className="text-emerald-400 text-sm">
                ✅ Completed {new Date(fix.completed_on).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Gap Sentence */}
          <View className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30 mb-4">
            <Text className="text-slate-200 text-sm leading-5">
              {fix.gap_sentence}
            </Text>
          </View>

          {/* Mini Bar Chart */}
          <View className="mb-4">
            <Text className="text-slate-300 font-semibold text-sm mb-2">Accuracy Improvement</Text>
            <View style={{ width: '100%', height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </View>
          </View>

          {/* Time Saved */}
          <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <Text className="text-emerald-200 text-sm">
              ⏱ You saved <Text className="font-bold">{timeSaved.toFixed(1)} minutes</Text> per question
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              Accuracy improved by {accuracyImprovement}%
            </Text>
          </View>
        </View>

        {/* Impact Score Circle */}
        <View className="items-center">
          <CircularProgress 
            value={fix.impact_score} 
            size={70} 
            strokeWidth={8}
            color="#10b981"
          />
          <Text className="text-emerald-400 text-xs mt-2 font-medium">
            Impact Score
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

interface TimelineEventProps {
  event: TimelineEvent;
  index: number;
  onEventPress: (event: TimelineEvent) => void;
}

function TimelineEvent({ event, index, onEventPress }: TimelineEventProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'triggered': return '❌';
      case 'completed': return '✅';
      case 'escalated': return '⚠️';
      default: return '📌';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'triggered': return '#ef4444';
      case 'completed': return '#10b981';
      case 'escalated': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 400, delay: index * 100 }}
      className="items-center mr-6"
    >
      <Pressable
        onPress={() => onEventPress(event)}
        className="w-12 h-12 rounded-full items-center justify-center shadow-lg active:scale-95"
        style={{ 
          backgroundColor: getEventColor(event.event_type),
          shadowColor: getEventColor(event.event_type),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text className="text-xl">
          {getEventIcon(event.event_type)}
        </Text>
      </Pressable>
      
      <Text className="text-slate-400 text-xs mt-2 text-center capitalize">
        {event.event_type}
      </Text>
      <Text className="text-slate-500 text-xs text-center">
        {new Date(event.event_time).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}
      </Text>
    </MotiView>
  );
}

interface EventTooltipProps {
  event: TimelineEvent;
  position: { x: number; y: number };
  onClose: () => void;
}

function EventTooltip({ event, position, onClose }: EventTooltipProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 100,
        width: 240,
        shadowColor: event.event_type === 'completed' ? '#10b981' : 
                     event.event_type === 'escalated' ? '#f59e0b' : '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
      >
        <X size={12} color="#94a3b8" />
      </Pressable>

      {/* Event Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1 capitalize">
          {event.event_type} Event
        </Text>
        <Text className="text-slate-300 text-sm mb-3">
          {event.gap_sentence}
        </Text>
        <Text className="text-slate-400 text-xs">
          {new Date(event.event_time).toLocaleString()}
        </Text>
      </View>
    </MotiView>
  );
}

export default function QuickFixLessonsPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedEvent, setSelectedEvent] = useState<{ event: TimelineEvent; position: { x: number; y: number } } | null>(null);

  const activeFixes: ActiveFix[] = quickfixData.active_fixes;
  const completedFixes: CompletedFix[] = quickfixData.completed_fixes;
  const timeline: TimelineEvent[] = quickfixData.timeline;
  const cumulativeImpact = quickfixData.cumulative_impact;

  // Calculate progress percentage
  const progressPercentage = cumulativeImpact.total_prep_time_min > 0 
    ? (cumulativeImpact.minutes_saved / cumulativeImpact.total_prep_time_min) * 100 
    : 0;

  const handleEventPress = (event: TimelineEvent, x: number, y: number) => {
    setSelectedEvent({ event, position: { x, y } });
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 pt-12 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Zap size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              Quick Fix Lessons 🚑
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              Patch Mistakes, Save Time
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
        {/* Active Fixes Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
              <AlertTriangle size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Active Fixes
              </Text>
              <Text className="text-slate-400 text-sm">
                {activeFixes.length} learning gaps need immediate attention
              </Text>
            </View>
          </View>

          {activeFixes.map((fix, index) => (
            <ActiveFixCard key={fix.id} fix={fix} index={index} />
          ))}
        </MotiView>

        {/* Completed Fixes Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 400 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg items-center justify-center mr-3">
              <CheckCircle size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Completed Fixes
              </Text>
              <Text className="text-slate-400 text-sm">
                {completedFixes.length} gaps successfully resolved
              </Text>
            </View>
          </View>

          {completedFixes.map((fix, index) => (
            <CompletedFixCard key={fix.id} fix={fix} index={index} />
          ))}
        </MotiView>

        {/* Cumulative Impact Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-8 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
              <TrendingUp size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Cumulative Impact
              </Text>
              <Text className="text-slate-400 text-sm">
                Overall time savings from quick fixes
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-300 font-medium">Time Optimization Progress</Text>
              <Text className="text-purple-400 font-bold">
                {progressPercentage.toFixed(2)}%
              </Text>
            </View>
            <View className="w-full bg-slate-700/60 rounded-full h-4 overflow-hidden">
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: 'spring', duration: 1200, delay: 800 }}
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 h-4 rounded-full"
              />
            </View>
          </View>

          {/* Impact Summary */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <Text className="text-slate-200 text-lg text-center">
              <Text className="font-bold text-purple-400">Total Time Saved: {cumulativeImpact.minutes_saved} min</Text>
              {' '}of{' '}
              <Text className="font-bold text-slate-300">{(cumulativeImpact.total_prep_time_min / 60).toFixed(0)} hours</Text>
              {' '}total prep time
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-2">
              That's {((cumulativeImpact.minutes_saved / 60)).toFixed(1)} hours of optimized study time!
            </Text>
          </View>
        </MotiView>

        {/* Contextual Trigger Timeline */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg">
              <Calendar size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Fix Timeline
              </Text>
              <Text className="text-slate-400 text-sm">
                Chronological view of learning gap interventions
              </Text>
            </View>
          </View>

          {/* Timeline Container */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
            >
              <View className="flex-row items-center">
                {timeline
                  .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())
                  .map((event, index) => (
                    <TimelineEvent
                      key={`${event.event_type}-${index}`}
                      event={event}
                      index={index}
                      onEventPress={(e) => {
                        const x = 100 + (index * 80); // Approximate position
                        const y = 200;
                        handleEventPress(e, x, y);
                      }}
                    />
                  ))}
              </View>
            </ScrollView>
          </View>

          {/* Timeline Legend */}
          <View className="flex-row items-center justify-center mt-4 space-x-6">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">❌</Text>
              <Text className="text-slate-300 text-sm">Triggered</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">✅</Text>
              <Text className="text-slate-300 text-sm">Completed</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">⚠️</Text>
              <Text className="text-slate-300 text-sm">Escalated</Text>
            </View>
          </View>
        </MotiView>

        {/* Summary Statistics */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Active Fixes</Text>
            </View>
            <Text className="text-red-200 text-2xl font-bold">
              {activeFixes.length}
            </Text>
            <Text className="text-red-300/80 text-xs">
              Need attention
            </Text>
          </View>

          <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <CheckCircle size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Completed</Text>
            </View>
            <Text className="text-emerald-200 text-2xl font-bold">
              {completedFixes.length}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              Successfully fixed
            </Text>
          </View>

          <View className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Avg Impact</Text>
            </View>
            <Text className="text-purple-200 text-2xl font-bold">
              {completedFixes.length > 0 
                ? (completedFixes.reduce((sum, fix) => sum + fix.impact_score, 0) / completedFixes.length).toFixed(0)
                : 0
              }
            </Text>
            <Text className="text-purple-300/80 text-xs">
              Score per fix
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Event Tooltip */}
      {selectedEvent && (
        <EventTooltip
          event={selectedEvent.event}
          position={selectedEvent.position}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </View>
  );
}