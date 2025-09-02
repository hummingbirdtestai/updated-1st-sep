import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Brain, Clock, Target, TrendingDown, X, Info } from 'lucide-react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface PYQ {
  id: number;
  completed_count: number;
  last_reviewed: string;
  strength_score: number;
}

interface Topic {
  subject: string;
  chapter: string;
  topic: string;
  pyqs: PYQ[];
}

interface TooltipData {
  topic: Topic;
  position: { x: number; y: number };
}

interface CircularProgressProps {
  strength: number;
  size?: number;
  strokeWidth?: number;
  topic: string;
  timeSpent: number;
}

interface RetentionStrengthMeterProps {
  data?: Topic[];
}

const mockRetentionData: Topic[] = [
  {
    subject: "Biology",
    chapter: "Cell Biology",
    topic: "Mitochondria",
    pyqs: [
      { id: 1, completed_count: 12, last_reviewed: "2025-08-28", strength_score: 82 },
      { id: 2, completed_count: 8, last_reviewed: "2025-08-25", strength_score: 60 }
    ]
  },
  {
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Alkanes",
    pyqs: [
      { id: 3, completed_count: 5, last_reviewed: "2025-08-29", strength_score: 45 }
    ]
  },
  {
    subject: "Biology",
    chapter: "Genetics",
    topic: "DNA Replication",
    pyqs: [
      { id: 4, completed_count: 15, last_reviewed: "2025-08-30", strength_score: 88 },
      { id: 5, completed_count: 10, last_reviewed: "2025-08-27", strength_score: 75 }
    ]
  },
  {
    subject: "Chemistry",
    chapter: "Physical Chemistry",
    topic: "Thermodynamics",
    pyqs: [
      { id: 6, completed_count: 7, last_reviewed: "2025-08-26", strength_score: 35 },
      { id: 7, completed_count: 9, last_reviewed: "2025-08-29", strength_score: 52 }
    ]
  },
  {
    subject: "Biology",
    chapter: "Ecology",
    topic: "Food Chains",
    pyqs: [
      { id: 8, completed_count: 6, last_reviewed: "2025-08-31", strength_score: 78 }
    ]
  },
  {
    subject: "Chemistry",
    chapter: "Inorganic Chemistry",
    topic: "Periodic Table",
    pyqs: [
      { id: 9, completed_count: 20, last_reviewed: "2025-08-30", strength_score: 92 },
      { id: 10, completed_count: 14, last_reviewed: "2025-08-28", strength_score: 85 }
    ]
  }
];

function CircularProgress({ strength, size = 80, strokeWidth = 8, topic, timeSpent }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (strength / 100) * circumference;

  // Get color based on strength score
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return { color: '#10b981', label: 'Strong' }; // Green
    if (strength >= 50) return { color: '#f59e0b', label: 'Moderate' }; // Yellow/Amber
    return { color: '#ef4444', label: 'Weak' }; // Red
  };

  const strengthInfo = getStrengthColor(strength);

  return (
    <View className="items-center">
      <View className="relative">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={`gradient-${strength}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={strengthInfo.color} stopOpacity="1" />
              <Stop offset="100%" stopColor={strengthInfo.color} stopOpacity="0.6" />
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
            stroke={`url(#gradient-${strength})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Center Text */}
          <SvgText
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill={strengthInfo.color}
          >
            {strength}
          </SvgText>
          <SvgText
            x={size / 2}
            y={size / 2 + 12}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            strength
          </SvgText>
        </Svg>
      </View>
      
      <Text className="text-slate-300 font-semibold text-sm mt-2 text-center" numberOfLines={2}>
        {topic}
      </Text>
      <Text className="text-slate-400 text-xs text-center">
        {timeSpent.toFixed(1)}m spent
      </Text>
      <Text 
        className="text-xs font-medium text-center mt-1"
        style={{ color: strengthInfo.color }}
      >
        {strengthInfo.label}
      </Text>
    </View>
  );
}

function TopicTooltip({ topic, position, onClose }: { topic: Topic; position: { x: number; y: number }; onClose: () => void }) {
  const totalCompleted = topic.pyqs.reduce((sum, pyq) => sum + pyq.completed_count, 0);
  const totalTimeSpent = totalCompleted * 4.5;
  const averageStrength = topic.pyqs.reduce((sum, pyq) => sum + pyq.strength_score, 0) / topic.pyqs.length;
  const lastReviewed = new Date(Math.max(...topic.pyqs.map(pyq => new Date(pyq.last_reviewed).getTime())));

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 160,
        width: 240,
        shadowColor: averageStrength >= 80 ? '#10b981' : averageStrength >= 50 ? '#f59e0b' : '#ef4444',
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

      {/* Topic Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1">
          {topic.topic}
        </Text>
        <Text className="text-slate-300 text-xs mb-3">
          {topic.subject} • {topic.chapter}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Avg Strength</Text>
            <Text 
              className="text-xs font-semibold"
              style={{ color: averageStrength >= 80 ? '#10b981' : averageStrength >= 50 ? '#f59e0b' : '#ef4444' }}
            >
              {averageStrength.toFixed(0)}%
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Total Time</Text>
            <Text className="text-slate-300 text-xs">
              {totalTimeSpent.toFixed(1)}m
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">PYQs Count</Text>
            <Text className="text-slate-300 text-xs">
              {topic.pyqs.length}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Last Reviewed</Text>
            <Text className="text-slate-300 text-xs">
              {lastReviewed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function RetentionStrengthMeter({ data = mockRetentionData }: RetentionStrengthMeterProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);

  // Process data to get topic-level aggregates
  const processTopicData = () => {
    return data.map(item => {
      const totalCompleted = item.pyqs.reduce((sum, pyq) => sum + pyq.completed_count, 0);
      const totalTimeSpent = totalCompleted * 4.5;
      const averageStrength = item.pyqs.reduce((sum, pyq) => sum + pyq.strength_score, 0) / item.pyqs.length;
      
      return {
        ...item,
        totalCompleted,
        totalTimeSpent,
        averageStrength,
      };
    });
  };

  // Generate mock 7-day decay data
  const generateDecayData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Simulate decay pattern - start high and gradually decrease
      const baseStrength = 85;
      const decayFactor = i * 3; // 3% decay per day
      const randomVariation = (Math.random() - 0.5) * 10; // ±5% random variation
      const strength = Math.max(20, Math.min(100, baseStrength - decayFactor + randomVariation));
      
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        averageStrength: Math.round(strength),
      });
    }
    
    return days;
  };

  const topicData = processTopicData();
  const decayData = generateDecayData();

  // Calculate summary metrics
  const totalTopics = topicData.length;
  const strongTopics = topicData.filter(t => t.averageStrength >= 80).length;
  const weakTopics = topicData.filter(t => t.averageStrength < 50).length;
  const totalTimeSpent = topicData.reduce((sum, t) => sum + t.totalTimeSpent, 0);
  const overallAverageStrength = topicData.reduce((sum, t) => sum + t.averageStrength, 0) / totalTopics;

  // Calculate decay trend
  const calculateDecayTrend = () => {
    if (decayData.length < 2) return 0;
    
    const n = decayData.length;
    const sumX = decayData.reduce((sum, _, i) => sum + i, 0);
    const sumY = decayData.reduce((sum, d) => sum + d.averageStrength, 0);
    const sumXY = decayData.reduce((sum, d, i) => sum + (i * d.averageStrength), 0);
    const sumX2 = decayData.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const decayTrend = calculateDecayTrend();

  const handleTopicPress = (topic: Topic, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setSelectedTooltip({ topic, position });
  };

  // Custom tooltip for decay chart
  const DecayTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.day} ({data.date})
          </Text>
          <Text className="text-blue-300 text-sm">
            Average Strength: {data.averageStrength}%
          </Text>
        </View>
      );
    }
    return null;
  };

  const getDecayTrendInfo = (slope: number) => {
    if (slope > 0.5) return { color: '#10b981', label: 'Improving', icon: '📈' };
    if (slope > -0.5) return { color: '#f59e0b', label: 'Stable', icon: '➡️' };
    return { color: '#ef4444', label: 'Declining', icon: '📉' };
  };

  const trendInfo = getDecayTrendInfo(decayTrend);

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
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Brain size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Retention Strength Meter
            </Text>
            <Text className="text-sm text-slate-400">
              Topic mastery analysis • {totalTopics} topics tracked
            </Text>
          </View>
        </View>

        {/* Overall Strength Badge */}
        <View className="items-center">
          <View 
            className="w-16 h-16 rounded-full border-4 items-center justify-center"
            style={{ 
              borderColor: overallAverageStrength >= 80 ? '#10b981' : 
                          overallAverageStrength >= 50 ? '#f59e0b' : '#ef4444'
            }}
          >
            <Text 
              className="text-lg font-bold"
              style={{ 
                color: overallAverageStrength >= 80 ? '#10b981' : 
                       overallAverageStrength >= 50 ? '#f59e0b' : '#ef4444'
              }}
            >
              {overallAverageStrength.toFixed(0)}
            </Text>
            <Text className="text-slate-500 text-xs">avg</Text>
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
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Strong Topics</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {strongTopics}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              ≥80% strength
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingDown size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Weak Topics</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {weakTopics}
            </Text>
            <Text className="text-red-300/80 text-xs">
              <50% strength
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Time</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {(totalTimeSpent / 60).toFixed(1)}h
            </Text>
            <Text className="text-blue-300/80 text-xs">
              {totalTimeSpent.toFixed(0)} minutes
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Brain size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Avg Strength</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {overallAverageStrength.toFixed(0)}%
            </Text>
            <Text className="text-purple-300/80 text-xs">
              Overall retention
            </Text>
          </MotiView>
        </View>

        {/* Topic Strength Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-8 border border-slate-700/40 shadow-lg"
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
              Topic Retention Strength
            </Text>
          </View>

          {/* Circular Progress Grid */}
          <View className="bg-slate-900/40 rounded-xl p-6 border border-slate-600/30">
            <View className={`${isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3 lg:grid-cols-4'} gap-6`}>
              {topicData.map((topic, index) => (
                <MotiView
                  key={`${topic.subject}-${topic.chapter}-${topic.topic}`}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
                >
                  <Pressable
                    onPress={(event) => handleTopicPress(topic, event)}
                    className="active:scale-95"
                  >
                    <CircularProgress
                      strength={topic.averageStrength}
                      size={isMobile ? 70 : 80}
                      strokeWidth={8}
                      topic={topic.topic}
                      timeSpent={topic.totalTimeSpent}
                    />
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View className="mt-6 flex-row items-center justify-center space-x-6">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-slate-300 text-sm">Strong (≥80%)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
              <Text className="text-slate-300 text-sm">Moderate (50-79%)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
              <Text className="text-slate-300 text-sm">Weak (<50%)</Text>
            </View>
          </View>
        </MotiView>

        {/* 7-Day Strength Decay Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <TrendingDown size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">
                  7-Day Strength Decay Trend
                </Text>
                <Text className="text-slate-400 text-sm">
                  Average retention strength over time
                </Text>
              </View>
            </View>

            {/* Trend Indicator */}
            <View className="items-center">
              <View 
                className="px-3 py-1 rounded-full border"
                style={{ 
                  backgroundColor: `${trendInfo.color}20`,
                  borderColor: `${trendInfo.color}50`
                }}
              >
                <Text className="text-xs">
                  {trendInfo.icon} <Text 
                    className="font-bold"
                    style={{ color: trendInfo.color }}
                  >
                    {trendInfo.label}
                  </Text>
                </Text>
              </View>
              <Text className="text-xs text-slate-400 mt-1">
                Slope: {decayTrend.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Line Chart */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <View style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={decayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<DecayTooltip />} />
                  
                  {/* Strength decay line */}
                  <Line 
                    type="monotone"
                    dataKey="averageStrength" 
                    stroke={trendInfo.color}
                    strokeWidth={3}
                    dot={{ 
                      fill: trendInfo.color, 
                      strokeWidth: 2, 
                      r: 5,
                      stroke: '#ffffff'
                    }}
                    activeDot={{ 
                      r: 7, 
                      fill: trendInfo.color,
                      stroke: '#ffffff',
                      strokeWidth: 3
                    }}
                    name="Average Strength"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </LineChart>
              </ResponsiveContainer>
            </View>
          </View>

          {/* Decay Analysis */}
          <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row items-center mb-3">
              <Info size={16} color="#06b6d4" />
              <Text className="text-slate-100 font-semibold ml-2">Decay Analysis</Text>
            </View>
            
            <View className="space-y-2">
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold" style={{ color: trendInfo.color }}>
                  Trend: {trendInfo.label}
                </Text>
                {' '}(slope: {decayTrend.toFixed(3)})
              </Text>
              
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-blue-400">Current Average:</Text> {overallAverageStrength.toFixed(1)}%
              </Text>
              
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-emerald-400">Strongest Day:</Text> {
                  decayData.reduce((max, d) => d.averageStrength > max.averageStrength ? d : max).day
                } ({decayData.reduce((max, d) => d.averageStrength > max.averageStrength ? d : max).averageStrength}%)
              </Text>
              
              <Text className="text-slate-400 text-xs leading-4 mt-3">
                {decayTrend > 0.5 
                  ? "Excellent! Your retention strength is improving over time. Keep up the current study routine."
                  : decayTrend > -0.5
                  ? "Stable retention levels. Consider implementing spaced repetition to boost strength."
                  : "Declining retention detected. Review your study schedule and consider more frequent revision sessions."
                }
              </Text>
            </div>
          </View>
        </MotiView>

        {/* Detailed Topic Breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1400 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <Brain size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Topic Details
            </Text>
          </View>

          <View className="space-y-4">
            {topicData
              .sort((a, b) => b.averageStrength - a.averageStrength)
              .map((topic, index) => {
                const strengthColor = topic.averageStrength >= 80 ? '#10b981' : 
                                   topic.averageStrength >= 50 ? '#f59e0b' : '#ef4444';
                const strengthLabel = topic.averageStrength >= 80 ? 'Strong' : 
                                    topic.averageStrength >= 50 ? 'Moderate' : 'Weak';

                return (
                  <MotiView
                    key={`${topic.subject}-${topic.chapter}-${topic.topic}`}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 1600 + index * 100 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <Text className="text-slate-100 font-semibold text-base mb-1">
                          {topic.topic}
                        </Text>
                        <Text className="text-slate-400 text-sm mb-2">
                          {topic.subject} • {topic.chapter}
                        </Text>
                        <View className="flex-row items-center space-x-4">
                          <Text className="text-slate-400 text-sm">
                            Time: <Text className="text-slate-300 font-semibold">
                              {topic.totalTimeSpent.toFixed(1)}m
                            </Text>
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            PYQs: <Text className="text-slate-300 font-semibold">
                              {topic.pyqs.length}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Strength Badge */}
                      <View className="items-center">
                        <View 
                          className="w-12 h-12 rounded-full border-3 items-center justify-center"
                          style={{ borderColor: strengthColor }}
                        >
                          <Text 
                            className="text-lg font-bold"
                            style={{ color: strengthColor }}
                          >
                            {topic.averageStrength.toFixed(0)}
                          </Text>
                        </View>
                        <Text 
                          className="text-xs font-medium mt-1"
                          style={{ color: strengthColor }}
                        >
                          {strengthLabel}
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
          </View>
        </MotiView>

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1800 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <Brain size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Retention Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Strongest Topic:</Text> {
                topicData.reduce((max, t) => t.averageStrength > max.averageStrength ? t : max).topic
              } ({topicData.reduce((max, t) => t.averageStrength > max.averageStrength ? t : max).averageStrength.toFixed(0)}%)
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Focus:</Text> {
                topicData.reduce((min, t) => t.averageStrength < min.averageStrength ? t : min).topic
              } ({topicData.reduce((min, t) => t.averageStrength < min.averageStrength ? t : min).averageStrength.toFixed(0)}%)
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {strongTopics > weakTopics 
                ? `Great retention profile! ${strongTopics} strong topics vs ${weakTopics} weak. Focus on strengthening the weak areas.`
                : weakTopics > strongTopics
                ? `${weakTopics} topics need attention. Consider implementing spaced repetition for better retention.`
                : "Balanced retention profile. Maintain current study patterns while targeting specific weak areas."
              }
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Topic Tooltip */}
      {selectedTooltip && (
        <TopicTooltip
          topic={selectedTooltip.topic}
          position={selectedTooltip.position}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}