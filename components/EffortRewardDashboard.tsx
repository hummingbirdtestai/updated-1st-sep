import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Target, TrendingUp, Zap, Award, Clock, Star } from 'lucide-react-native';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, Cell } from 'recharts';
import Svg, { Circle, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface EffortRewardData {
  day: string;
  effort: number;
  xp: number;
  chapters: number;
  ratio: number;
}

interface EfficiencyGauge {
  ratio: number;
}

interface EffortRewardDashboardProps {
  data?: EffortRewardData[];
  efficiencyData?: EfficiencyGauge;
}

// Mock data
const mockEffortRewardData: EffortRewardData[] = [
  { day: "Day 1", effort: 45, xp: 800, chapters: 2, ratio: 17.7 },
  { day: "Day 2", effort: 60, xp: 900, chapters: 3, ratio: 15 },
  { day: "Day 3", effort: 90, xp: 1200, chapters: 5, ratio: 13.3 },
  { day: "Day 4", effort: 50, xp: 1100, chapters: 2, ratio: 22 },
  { day: "Day 5", effort: 40, xp: 950, chapters: 1, ratio: 23.7 },
  { day: "Day 6", effort: 75, xp: 1050, chapters: 4, ratio: 14 },
  { day: "Day 7", effort: 55, xp: 1300, chapters: 3, ratio: 23.6 },
  { day: "Day 8", effort: 80, xp: 1400, chapters: 6, ratio: 17.5 },
  { day: "Day 9", effort: 35, xp: 700, chapters: 1, ratio: 20 },
  { day: "Day 10", effort: 65, xp: 1250, chapters: 4, ratio: 19.2 },
  { day: "Day 11", effort: 70, xp: 980, chapters: 3, ratio: 14 },
  { day: "Day 12", effort: 85, xp: 1600, chapters: 7, ratio: 18.8 },
  { day: "Day 13", effort: 45, xp: 1150, chapters: 2, ratio: 25.5 },
  { day: "Day 14", effort: 95, xp: 1350, chapters: 5, ratio: 14.2 },
  { day: "Day 15", effort: 30, xp: 750, chapters: 1, ratio: 25 },
  { day: "Day 16", effort: 60, xp: 1200, chapters: 3, ratio: 20 },
  { day: "Day 17", effort: 75, xp: 1100, chapters: 4, ratio: 14.7 },
  { day: "Day 18", effort: 50, xp: 1300, chapters: 2, ratio: 26 },
  { day: "Day 19", effort: 85, xp: 1450, chapters: 6, ratio: 17.1 },
  { day: "Day 20", effort: 40, xp: 1000, chapters: 1, ratio: 25 },
  { day: "Day 21", effort: 70, xp: 1350, chapters: 4, ratio: 19.3 },
  { day: "Day 22", effort: 55, xp: 1100, chapters: 3, ratio: 20 },
  { day: "Day 23", effort: 90, xp: 1500, chapters: 7, ratio: 16.7 },
  { day: "Day 24", effort: 35, xp: 900, chapters: 1, ratio: 25.7 },
  { day: "Day 25", effort: 65, xp: 1250, chapters: 4, ratio: 19.2 },
  { day: "Day 26", effort: 80, xp: 1400, chapters: 5, ratio: 17.5 },
  { day: "Day 27", effort: 45, xp: 1200, chapters: 2, ratio: 26.7 },
  { day: "Day 28", effort: 75, xp: 1350, chapters: 4, ratio: 18 },
  { day: "Day 29", effort: 50, xp: 1150, chapters: 3, ratio: 23 },
  { day: "Day 30", effort: 60, xp: 1300, chapters: 3, ratio: 21.7 }
];

const mockEfficiencyGauge: EfficiencyGauge = { ratio: 18.5 };

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
}

function CircularGauge({ value, maxValue = 30, size = 120, strokeWidth = 12 }: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;

  // Get color based on efficiency ratio
  const getEfficiencyColor = (ratio: number) => {
    if (ratio >= 20) return { color: '#10b981', label: 'Excellent', zone: 'Green Zone' };
    if (ratio >= 10) return { color: '#f59e0b', label: 'Good', zone: 'Yellow Zone' };
    return { color: '#ef4444', label: 'Needs Improvement', zone: 'Red Zone' };
  };

  const efficiencyInfo = getEfficiencyColor(value);

  return (
    <View className="items-center">
      <View className="relative">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={efficiencyInfo.color} stopOpacity="1" />
              <Stop offset="100%" stopColor={efficiencyInfo.color} stopOpacity="0.6" />
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
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Center Text */}
          <SvgText
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill={efficiencyInfo.color}
          >
            {value.toFixed(1)}
          </SvgText>
          <SvgText
            x={size / 2}
            y={size / 2 + 12}
            textAnchor="middle"
            fontSize="12"
            fill="#94a3b8"
          >
            XP/min
          </SvgText>
        </Svg>
      </View>
      
      <View className="mt-4 items-center">
        <Text 
          className="font-bold text-lg"
          style={{ color: efficiencyInfo.color }}
        >
          {efficiencyInfo.label}
        </Text>
        <Text className="text-slate-400 text-sm">
          {efficiencyInfo.zone}
        </Text>
      </View>
    </View>
  );
}

interface CircularProgressProps {
  strength: number;
  size?: number;
  strokeWidth?: number;
  topic: string;
  timeSpent: number;
  onPress?: () => void;
}

function CircularProgress({ 
  strength, 
  size = 80, 
  strokeWidth = 8, 
  topic, 
  timeSpent,
  onPress 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (strength / 100) * circumference;

  // Get color based on strength score
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return '#10b981'; // Green
    if (strength >= 50) return '#f59e0b'; // Yellow/Amber
    return '#ef4444'; // Red
  };

  const color = getStrengthColor(strength);
  const label = strength >= 80 ? 'Strong' : strength >= 50 ? 'Moderate' : 'Weak';

  return (
    <View className="items-center">
      <View className="relative">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={`gradient-${strength}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
            y={size / 2 - 4}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill={color}
          >
            {strength}%
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
      
      <Text className="text-slate-300 font-semibold text-sm mt-2 text-center" numberOfLines={2}>
        {topic}
      </Text>
      <Text className="text-slate-400 text-xs text-center">
        {timeSpent.toFixed(1)}m spent
      </Text>
      <Text 
        className="text-xs font-medium text-center mt-1"
        style={{ color }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function EffortRewardDashboard({ 
  data = mockEffortRewardData, 
  efficiencyData = mockEfficiencyGauge 
}: EffortRewardDashboardProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Calculate metrics
  const totalEffort = data.reduce((sum, d) => sum + d.effort, 0);
  const totalXP = data.reduce((sum, d) => sum + d.xp, 0);
  const totalChapters = data.reduce((sum, d) => sum + d.chapters, 0);
  const averageRatio = totalXP / totalEffort;
  const bestDay = data.reduce((max, d) => d.ratio > max.ratio ? d : max);
  const worstDay = data.reduce((min, d) => d.ratio < min.ratio ? d : min);

  // Calculate cohort average (mock)
  const cohortAverageRatio = 16.5;

  // Generate cohort average line data
  const cohortLineData = data.map(d => ({
    effort: d.effort,
    cohortXP: d.effort * cohortAverageRatio,
  }));

  // Custom tooltips
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.day}
          </Text>
          <Text className="text-blue-300 text-sm">
            Effort: {data.effort} minutes
          </Text>
          <Text className="text-emerald-300 text-sm">
            XP Earned: {data.xp.toLocaleString()}
          </Text>
          <Text className="text-purple-300 text-sm">
            Chapters: {data.chapters}
          </Text>
          <Text className="text-amber-300 text-sm font-semibold">
            Ratio: {data.ratio.toFixed(1)} XP/min
          </Text>
        </View>
      );
    }
    return null;
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.day}
          </Text>
          <Text className="text-amber-300 text-sm">
            Efficiency: {data.ratio.toFixed(1)} XP/min
          </Text>
          {data.day === bestDay.day && (
            <Text className="text-yellow-400 text-xs mt-1">
              ⭐ Best Performance Day
            </Text>
          )}
        </View>
      );
    }
    return null;
  };

  // Get efficiency color for current ratio
  const getEfficiencyColor = (ratio: number) => {
    if (ratio >= 20) return { color: '#10b981', label: 'Excellent' };
    if (ratio >= 10) return { color: '#f59e0b', label: 'Good' };
    return { color: '#ef4444', label: 'Needs Improvement' };
  };

  const currentEfficiencyInfo = getEfficiencyColor(efficiencyData.ratio);

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
            <Target size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              Effort-to-Reward Dashboard
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              NEET Prep Efficiency Analysis
            </Text>
          </View>
        </View>

        {/* Current Efficiency Badge */}
        <View className="items-center">
          <View 
            className="px-4 py-2 rounded-xl border-2"
            style={{ 
              backgroundColor: `${currentEfficiencyInfo.color}20`,
              borderColor: `${currentEfficiencyInfo.color}50`
            }}
          >
            <Text 
              className="font-bold text-xl"
              style={{ color: currentEfficiencyInfo.color }}
            >
              {efficiencyData.ratio.toFixed(1)}
            </Text>
            <Text className="text-slate-400 text-xs text-center">XP/min</Text>
          </View>
          <Text 
            className="text-sm font-medium mt-1"
            style={{ color: currentEfficiencyInfo.color }}
          >
            {currentEfficiencyInfo.label}
          </Text>
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
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Effort</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {(totalEffort / 60).toFixed(1)}h
            </Text>
            <Text className="text-blue-300/80 text-xs">
              {totalEffort} minutes
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Award size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Total XP</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {(totalXP / 1000).toFixed(1)}k
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              {totalXP.toLocaleString()} points
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Avg Ratio</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {averageRatio.toFixed(1)}
            </Text>
            <Text className="text-purple-300/80 text-xs">
              XP per minute
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Star size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Best Day</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {bestDay.day.replace('Day ', 'D')}
            </Text>
            <Text className="text-amber-300/80 text-xs">
              {bestDay.ratio.toFixed(1)} XP/min
            </Text>
          </MotiView>
        </View>

        {/* Main Dashboard Grid */}
        <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'} mb-8`}>
          {/* XP vs Time Scatter Plot */}
          <MotiView
            from={{ opacity: 0, translateY: 30, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
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
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">
                  XP vs Effort Analysis
                </Text>
                <Text className="text-slate-400 text-sm">
                  Bubble size = chapters covered
                </Text>
              </View>
            </View>

            <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
              <View style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="effort"
                      stroke="#94a3b8"
                      fontSize={12}
                      label={{ value: 'Effort (minutes)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                    />
                    <YAxis 
                      dataKey="xp"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                      label={{ value: 'XP Earned', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                    />
                    <Tooltip content={<ScatterTooltip />} />
                    
                    {/* Cohort Average Reference Line */}
                    <ReferenceLine 
                      segment={[
                        { x: Math.min(...data.map(d => d.effort)), y: Math.min(...data.map(d => d.effort)) * cohortAverageRatio },
                        { x: Math.max(...data.map(d => d.effort)), y: Math.max(...data.map(d => d.effort)) * cohortAverageRatio }
                      ]}
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      label={{ value: "Cohort Average", position: "topRight", style: { fill: '#64748b', fontSize: 12 } }}
                    />
                    
                    {/* Data Points */}
                    <Scatter dataKey="xp">
                      {data.map((entry, index) => {
                        const isAboveAverage = entry.ratio > cohortAverageRatio;
                        const isBestDay = entry.day === bestDay.day;
                        
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={isBestDay ? '#fbbf24' : isAboveAverage ? '#10b981' : '#ef4444'}
                            r={6 + (entry.chapters * 2)} // Size based on chapters
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </View>
            </View>

            {/* Scatter Plot Legend */}
            <View className="flex-row items-center justify-center mt-4 space-x-6">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-slate-300 text-sm">Above Cohort Avg</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
                <Text className="text-slate-300 text-sm">Below Cohort Avg</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
                <Text className="text-slate-300 text-sm">Best Day</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-1 bg-slate-500 rounded mr-2 border-dashed border border-slate-500" />
                <Text className="text-slate-300 text-sm">Cohort Average</Text>
              </View>
            </View>
          </MotiView>

          {/* Efficiency Gauge */}
          <MotiView
            from={{ opacity: 0, translateY: 30, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 800, delay: 700 }}
            className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
            style={{
              shadowColor: currentEfficiencyInfo.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <Zap size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">
                  Efficiency Gauge
                </Text>
                <Text className="text-slate-400 text-sm">
                  Current XP per minute ratio
                </Text>
              </View>
            </View>

            <View className="items-center">
              <CircularGauge 
                value={efficiencyData.ratio} 
                maxValue={30} 
                size={140} 
                strokeWidth={14}
              />
              
              {/* Efficiency Zones */}
              <View className="mt-6 space-y-2">
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                    <Text className="text-slate-400 text-sm">Red Zone</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">0-10 XP/min</Text>
                </View>
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                    <Text className="text-slate-400 text-sm">Yellow Zone</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">10-20 XP/min</Text>
                </View>
                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                    <Text className="text-slate-400 text-sm">Green Zone</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">20+ XP/min</Text>
                </View>
              </View>
            </View>
          </MotiView>
        </View>

        {/* Daily Trend Line Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-8"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg items-center justify-center mr-3">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">
                  30-Day Efficiency Trend
                </Text>
                <Text className="text-slate-400 text-sm">
                  Daily effort-to-reward ratio progression
                </Text>
              </View>
            </View>

            {/* Best Day Indicator */}
            <View className="items-center">
              <View className="bg-yellow-500/20 rounded-full px-3 py-2 border border-yellow-500/30">
                <View className="flex-row items-center">
                  <Star size={16} color="#fbbf24" />
                  <Text className="text-yellow-400 font-bold text-sm ml-2">
                    {bestDay.day}
                  </Text>
                </View>
              </View>
              <Text className="text-yellow-300/80 text-xs mt-1">
                {bestDay.ratio.toFixed(1)} XP/min
              </Text>
            </View>
          </View>

          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <View style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={Math.floor(data.length / 10)} // Show every nth label
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                    label={{ value: 'XP/min Ratio', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                  />
                  <Tooltip content={<LineTooltip />} />
                  
                  {/* Cohort Average Reference Line */}
                  <ReferenceLine 
                    y={cohortAverageRatio}
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    label={{ value: `Cohort Avg (${cohortAverageRatio})`, position: "topRight", style: { fill: '#64748b', fontSize: 12 } }}
                  />
                  
                  {/* Main trend line */}
                  <Line 
                    type="monotone"
                    dataKey="ratio" 
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isBestDay = payload.day === bestDay.day;
                      const isAboveAverage = payload.ratio > cohortAverageRatio;
                      
                      return (
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={isBestDay ? 8 : 5}
                          fill={isBestDay ? '#fbbf24' : isAboveAverage ? '#10b981' : '#ef4444'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      );
                    }}
                    activeDot={{ 
                      r: 8, 
                      fill: '#f59e0b',
                      stroke: '#ffffff',
                      strokeWidth: 3
                    }}
                    name="Efficiency Ratio"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </LineChart>
              </ResponsiveContainer>
            </View>
          </View>

          {/* Trend Analysis */}
          <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-100 font-semibold">Trend Analysis</Text>
              <View className="flex-row items-center">
                <Text className="text-slate-400 text-sm mr-2">vs Cohort:</Text>
                <Text className={`font-bold text-sm ${
                  averageRatio > cohortAverageRatio ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {averageRatio > cohortAverageRatio ? '+' : ''}{(averageRatio - cohortAverageRatio).toFixed(1)}
                </Text>
              </View>
            </View>
            
            <View className="space-y-2">
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-amber-400">Best Performance:</Text> {bestDay.day} ({bestDay.ratio.toFixed(1)} XP/min)
              </Text>
              <Text className="text-slate-300 text-sm">
                <Text className="font-bold text-red-400">Needs Focus:</Text> {worstDay.day} ({worstDay.ratio.toFixed(1)} XP/min)
              </Text>
              <Text className="text-slate-400 text-xs leading-4 mt-2">
                {averageRatio > cohortAverageRatio 
                  ? "Above cohort average! Your efficiency is strong. Focus on consistency."
                  : "Below cohort average. Consider optimizing study methods for better XP/time ratio."
                }
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Performance Comparison */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg items-center justify-center mr-3">
              <Award size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Performance Insights
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Efficiency Distribution */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Efficiency Distribution</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-emerald-400 text-sm">Green Zone Days</Text>
                  <Text className="text-emerald-300 font-bold">
                    {data.filter(d => d.ratio >= 20).length}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-amber-400 text-sm">Yellow Zone Days</Text>
                  <Text className="text-amber-300 font-bold">
                    {data.filter(d => d.ratio >= 10 && d.ratio < 20).length}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-red-400 text-sm">Red Zone Days</Text>
                  <Text className="text-red-300 font-bold">
                    {data.filter(d => d.ratio < 10).length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chapter Coverage */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Chapter Coverage</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Total Chapters</Text>
                  <Text className="text-slate-300 font-bold">
                    {totalChapters}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Avg per Day</Text>
                  <Text className="text-slate-300 font-bold">
                    {(totalChapters / data.length).toFixed(1)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Best Day</Text>
                  <Text className="text-purple-300 font-bold">
                    {Math.max(...data.map(d => d.chapters))} chapters
                  </Text>
                </View>
              </View>
            </View>

            {/* Optimization Potential */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Optimization</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Current Avg</Text>
                  <Text className="text-slate-300 font-bold">
                    {averageRatio.toFixed(1)} XP/min
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Best Achieved</Text>
                  <Text className="text-emerald-300 font-bold">
                    {bestDay.ratio.toFixed(1)} XP/min
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Potential Gain</Text>
                  <Text className="text-cyan-300 font-bold">
                    +{(bestDay.ratio - averageRatio).toFixed(1)} XP/min
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Actionable Insights */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Target size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Actionable Insights</Text>
          </View>
          
          <View className="space-y-3">
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Text className="text-emerald-200 text-sm">
                <Text className="font-bold">Strength:</Text> Your best day achieved {bestDay.ratio.toFixed(1)} XP/min. 
                Analyze what made {bestDay.day} successful and replicate those conditions.
              </Text>
            </View>
            
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <Text className="text-amber-200 text-sm">
                <Text className="font-bold">Opportunity:</Text> You're {
                  averageRatio > cohortAverageRatio ? 'above' : 'below'
                } cohort average by {Math.abs(averageRatio - cohortAverageRatio).toFixed(1)} XP/min. 
                {averageRatio <= cohortAverageRatio && ' Focus on quality over quantity.'}
              </Text>
            </View>
            
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Text className="text-blue-200 text-sm">
                <Text className="font-bold">Strategy:</Text> Target {
                  data.filter(d => d.ratio >= 20).length < data.length / 2 
                    ? 'reaching the green zone (20+ XP/min) more consistently'
                    : 'maintaining your strong efficiency and reducing low-performance days'
                }.
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}