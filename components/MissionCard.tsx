import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Clock, Target, Award, BookOpen, CheckCircle, Circle } from 'lucide-react-native';
import missionData from '@/data/mentor-flight-path-data.json';

interface MissionCardProps {
  subject: string;
  chapter: string;
  topic: string;
  planned_pyqs: number;
  completed_pyqs: number;
  time_minutes: number;
  delay?: number;
}

function MissionCard({
  subject,
  chapter,
  topic,
  planned_pyqs,
  completed_pyqs,
  time_minutes,
  delay = 0,
}: MissionCardProps) {
  const completionPercent = planned_pyqs > 0 ? (completed_pyqs / planned_pyqs) * 100 : 0;
  const isFullyCompleted = completed_pyqs === planned_pyqs;
  const rewardBadge = isFullyCompleted ? "Full Badge" : "Partial Badge";
  
  // Calculate expected time vs actual time
  const expectedTime = planned_pyqs * 4.5;
  const timeEfficiency = expectedTime > 0 ? (time_minutes / expectedTime) : 1;
  
  // Get subject color theme
  const getSubjectTheme = (subject: string) => {
    const themes: Record<string, { bg: string; border: string; text: string; accent: string }> = {
      'Anatomy': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: '#3b82f6' },
      'Physiology': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: '#10b981' },
      'Biochemistry': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: '#8b5cf6' },
      'Pharmacology': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: '#f59e0b' },
      'Pathology': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', accent: '#ef4444' },
      'Medicine': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', accent: '#06b6d4' },
    };
    return themes[subject] || themes['Anatomy'];
  };

  const theme = getSubjectTheme(subject);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay }}
      className={`${theme.bg} rounded-2xl border ${theme.border} p-6 mb-4 shadow-lg`}
      style={{
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className={`text-xl font-bold ${theme.text} mb-1`}>
            {subject}
          </Text>
          <Text className="text-slate-300 text-sm">
            {chapter} • {topic}
          </Text>
        </View>
        
        {/* Reward Badge */}
        <View className="items-center">
          {isFullyCompleted ? (
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 600, delay: delay + 300 }}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center shadow-lg"
              style={{
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Award size={20} color="#ffffff" />
            </MotiView>
          ) : (
            <View className="w-12 h-12 bg-slate-700/40 rounded-full items-center justify-center border-2 border-slate-600/50">
              <Award size={20} color="#64748b" />
            </View>
          )}
          <Text className={`text-xs mt-1 font-medium ${
            isFullyCompleted ? 'text-amber-400' : 'text-slate-500'
          }`}>
            {rewardBadge}
          </Text>
        </View>
      </View>

      {/* Progress Metrics */}
      <View className="space-y-4">
        {/* PYQ Progress */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <BookOpen size={16} color={theme.accent} />
              <Text className="text-slate-300 ml-2 font-medium">PYQ Progress</Text>
            </View>
            <Text className={`font-bold ${theme.text}`}>
              {completed_pyqs}/{planned_pyqs}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ type: 'spring', duration: 1000, delay: delay + 400 }}
              className="h-3 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
          </View>
          <Text className="text-slate-400 text-xs mt-1">
            {completionPercent.toFixed(0)}% completed
          </Text>
        </View>

        {/* Time Tracking */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Clock size={16} color={theme.accent} />
              <Text className="text-slate-300 ml-2 font-medium">Time Spent</Text>
            </View>
            <Text className={`font-bold ${theme.text}`}>
              {time_minutes.toFixed(0)}m
            </Text>
          </View>
          
          {/* Time Efficiency Indicator */}
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${
              timeEfficiency <= 1.1 ? 'bg-emerald-500' : 
              timeEfficiency <= 1.3 ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <Text className="text-slate-400 text-xs">
              Expected: {expectedTime.toFixed(0)}m • 
              {timeEfficiency <= 1.1 ? ' Efficient' : 
               timeEfficiency <= 1.3 ? ' On track' : ' Needs focus'}
            </Text>
          </View>
        </View>

        {/* Circular Completion Meter */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Target size={16} color={theme.accent} />
            <Text className="text-slate-300 ml-2 font-medium">Completion</Text>
          </View>
          
          {/* Circular Progress */}
          <View className="relative w-16 h-16">
            {/* Background Circle */}
            <View className="absolute inset-0 rounded-full border-4 border-slate-700/60" />
            
            {/* Progress Circle */}
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: `${(completionPercent / 100) * 360}deg` }}
              transition={{ type: 'spring', duration: 1200, delay: delay + 500 }}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: theme.accent,
                borderRightColor: completionPercent > 25 ? theme.accent : 'transparent',
                borderBottomColor: completionPercent > 50 ? theme.accent : 'transparent',
                borderLeftColor: completionPercent > 75 ? theme.accent : 'transparent',
              }}
            />
            
            {/* Center Text */}
            <View className="absolute inset-0 items-center justify-center">
              <Text className={`text-lg font-bold ${theme.text}`}>
                {completionPercent.toFixed(0)}
              </Text>
              <Text className="text-slate-500 text-xs">%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status Footer */}
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-600/30">
        <View className="flex-row items-center">
          {isFullyCompleted ? (
            <CheckCircle size={16} color="#10b981" />
          ) : (
            <Circle size={16} color="#64748b" />
          )}
          <Text className={`ml-2 text-sm font-medium ${
            isFullyCompleted ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {isFullyCompleted ? 'Mission Complete' : 'In Progress'}
          </Text>
        </View>
        
        <Text className="text-slate-500 text-xs">
          {new Date().toLocaleDateString()} • Flight Path
        </Text>
      </View>
    </MotiView>
  );
}

// Main component that renders the list
export default function MentorFlightPath() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Get today's missions (for demo, we'll show the last 5 missions)
  const todaysMissions = missionData.slice(-5);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="p-6 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Target size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Today's Flight Missions
            </Text>
            <Text className="text-slate-400 text-sm">
              {todaysMissions.length} missions • Your daily learning path
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Mission Cards List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {todaysMissions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            subject={mission.subject}
            chapter={mission.chapter}
            topic={mission.topic}
            planned_pyqs={mission.planned_pyqs}
            completed_pyqs={mission.completed_pyqs}
            time_minutes={mission.time_minutes}
            delay={index * 150}
          />
        ))}

        {/* Summary Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: todaysMissions.length * 150 + 300 }}
          className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40 mt-4"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-slate-100 font-bold text-lg">Daily Summary</Text>
              <Text className="text-slate-400 text-sm">
                {todaysMissions.filter(m => m.completed_pyqs === m.planned_pyqs).length} of {todaysMissions.length} missions completed
              </Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full items-center justify-center shadow-lg">
                <Text className="text-white font-bold text-lg">
                  {Math.round(
                    (todaysMissions.reduce((sum, m) => sum + m.completed_pyqs, 0) /
                     todaysMissions.reduce((sum, m) => sum + m.planned_pyqs, 0)) * 100
                  )}%
                </Text>
              </View>
              <Text className="text-emerald-400 text-xs mt-1 font-medium">
                Overall Progress
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}