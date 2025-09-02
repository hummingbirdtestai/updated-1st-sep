import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Lightbulb, BookOpen, Clock, Target, Play } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface RevisionItem {
  pyq_id: string;
  subject: string;
  chapter: string;
  topic: string;
  retention: number;
  last_attempt_days_ago: number;
  recommended_fix: string;
  time_required_min: number;
}

interface RevisionQueueProps {
  items: RevisionItem[];
  onReviewNow?: (item: RevisionItem) => void;
}

interface RevisionCardProps {
  item: RevisionItem;
  index: number;
  onReviewNow?: (item: RevisionItem) => void;
}

function CircularProgress({ 
  retention, 
  size = 60, 
  strokeWidth = 6 
}: { 
  retention: number; 
  size?: number; 
  strokeWidth?: number; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (retention / 100) * circumference;

  // Get color based on retention level
  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return '#10b981'; // emerald
    if (retention >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const color = getRetentionColor(retention);

  return (
    <View className="relative items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`gradient-${retention}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${retention})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Center Text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={color}
        >
          {retention}%
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 10}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
        >
          retention
        </SvgText>
      </Svg>
    </View>
  );
}

function RevisionCard({ item, index, onReviewNow }: RevisionCardProps) {
  const getPriorityLevel = (retention: number, daysAgo: number) => {
    if (retention < 40 || daysAgo >= 7) return 'critical';
    if (retention < 60 || daysAgo >= 5) return 'high';
    if (retention < 80 || daysAgo >= 3) return 'medium';
    return 'low';
  };

  const priority = getPriorityLevel(item.retention, item.last_attempt_days_ago);

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { 
          bg: 'bg-red-500/10', 
          border: 'border-red-500/30', 
          text: 'text-red-400',
          badge: 'bg-red-500'
        };
      case 'high':
        return { 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30', 
          text: 'text-amber-400',
          badge: 'bg-amber-500'
        };
      case 'medium':
        return { 
          bg: 'bg-blue-500/10', 
          border: 'border-blue-500/30', 
          text: 'text-blue-400',
          badge: 'bg-blue-500'
        };
      default:
        return { 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30', 
          text: 'text-slate-400',
          badge: 'bg-slate-500'
        };
    }
  };

  const colors = getPriorityColors(priority);

  const getRecommendationIcon = (fix: string) => {
    if (fix.toLowerCase().includes('flashcard')) {
      return <BookOpen size={16} color="#ffffff" />;
    }
    if (fix.toLowerCase().includes('mcq') || fix.toLowerCase().includes('retry')) {
      return <Target size={16} color="#ffffff" />;
    }
    return <Lightbulb size={16} color="#ffffff" />;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        duration: 600, 
        delay: index * 100 + 200 
      }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-4 mb-4 shadow-lg`}
      style={{
        shadowColor: colors.badge.replace('bg-', '#').replace('-500', ''),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left Section - Content */}
        <View className="flex-1 mr-4">
          {/* Subject Header */}
          <View className="flex-row items-center mb-2">
            <View className={`w-3 h-3 rounded-full ${colors.badge} mr-2`} />
            <Text className="text-slate-100 font-bold text-base">
              {item.subject}
            </Text>
            <View className={`ml-2 px-2 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
              <Text className={`text-xs font-bold ${colors.text} uppercase`}>
                {priority}
              </Text>
            </View>
          </View>

          {/* Chapter & Topic */}
          <Text className="text-slate-300 text-sm mb-2">
            {item.chapter} • {item.topic}
          </Text>

          {/* Last Attempt Info */}
          <View className="flex-row items-center mb-3">
            <Clock size={14} color="#94a3b8" />
            <Text className="text-slate-400 text-sm ml-1">
              Last attempted {item.last_attempt_days_ago} day{item.last_attempt_days_ago !== 1 ? 's' : ''} ago
            </Text>
          </View>

          {/* Recommended Fix */}
          <View className="flex-row items-start mb-3">
            <View className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center mr-2 mt-0.5">
              {getRecommendationIcon(item.recommended_fix)}
            </View>
            <View className="flex-1">
              <Text className="text-slate-300 text-sm leading-5">
                {item.recommended_fix}
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                Est. time: {item.time_required_min}m
              </Text>
            </View>
          </View>

          {/* Review Button */}
          <Pressable
            onPress={() => onReviewNow?.(item)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl py-2 px-4 flex-row items-center justify-center shadow-lg active:scale-95"
            style={{
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Play size={14} color="#ffffff" />
            <Text className="text-white font-semibold text-sm ml-2">
              Review Now
            </Text>
          </Pressable>
        </View>

        {/* Right Section - Circular Progress */}
        <View className="items-center">
          <CircularProgress retention={item.retention} size={70} strokeWidth={8} />
          
          {/* Days Ago Badge */}
          <View className="mt-2 bg-slate-700/40 rounded-full px-2 py-1">
            <Text className="text-slate-400 text-xs font-medium">
              {item.last_attempt_days_ago}d ago
            </Text>
          </View>
        </View>
      </View>

      {/* Critical Alert for Very Low Retention */}
      {item.retention < 40 && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 400, delay: index * 100 + 400 }}
          className="mt-3 pt-3 border-t border-red-500/20"
        >
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white font-bold text-xs">!</Text>
            </View>
            <Text className="text-red-300 text-sm font-medium">
              Critical: Knowledge decay detected - immediate review recommended
            </Text>
          </View>
        </MotiView>
      )}
    </MotiView>
  );
}

export default function RevisionQueue({ items = [], onReviewNow }: RevisionQueueProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Sort items by priority (retention + days ago)
  const sortedItems = [...items].sort((a, b) => {
    const priorityA = a.retention - (a.last_attempt_days_ago * 5); // Lower is higher priority
    const priorityB = b.retention - (b.last_attempt_days_ago * 5);
    return priorityA - priorityB;
  });

  // Calculate summary stats
  const criticalItems = items.filter(item => item.retention < 40 || item.last_attempt_days_ago >= 7).length;
  const totalTime = items.reduce((sum, item) => sum + item.time_required_min, 0);
  const averageRetention = items.length > 0 ? items.reduce((sum, item) => sum + item.retention, 0) / items.length : 0;

  if (items.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 600 }}
        className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40 shadow-lg"
      >
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl items-center justify-center mb-4">
            <Target size={32} color="#10b981" />
          </View>
          <Text className="text-xl font-bold text-slate-100 mb-2 text-center">
            No Items in Queue
          </Text>
          <Text className="text-slate-300 text-base text-center">
            Complete some study sessions to populate your revision queue
          </Text>
        </View>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg items-center justify-center mr-3">
            <Target size={16} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-100">
              Revision Queue
            </Text>
            <Text className="text-slate-400 text-sm">
              {items.length} items • {totalTime.toFixed(0)}m total time
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View className="items-end">
          <View className="flex-row items-center mb-1">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-red-400 text-sm font-semibold">
              {criticalItems} critical
            </Text>
          </View>
          <Text className="text-slate-400 text-xs">
            Avg retention: {averageRetention.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Queue Items */}
      <ScrollView 
        className="p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {sortedItems.map((item, index) => (
          <RevisionCard
            key={item.pyq_id}
            item={item}
            index={index}
            onReviewNow={onReviewNow}
          />
        ))}
      </ScrollView>

      {/* Footer Summary */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: items.length * 100 + 400 }}
        className="p-6 border-t border-slate-700/30 bg-slate-900/20"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-slate-100 font-semibold text-base">
              Queue Summary
            </Text>
            <Text className="text-slate-400 text-sm">
              Prioritized by retention level and time since last review
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-emerald-400 font-bold text-lg">
              {totalTime.toFixed(0)}m
            </Text>
            <Text className="text-slate-400 text-xs">
              Total time needed
            </Text>
          </View>
        </View>
      </MotiView>
    </MotiView>
  );
}