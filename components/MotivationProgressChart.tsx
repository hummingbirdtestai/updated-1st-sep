import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Zap, Target, BarChart3 } from 'lucide-react-native';
import Svg, { Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import missionData from '@/data/mentor-flight-path-data.json';

interface DayData {
  day: string;
  date: string;
  completedPyqs: number;
  motivationNudges: number;
}

interface CorrelationChartProps {
  data?: DayData[];
  title?: string;
}

export default function MotivationProgressChart({ 
  data,
  title = "Motivation vs Progress Correlation"
}: CorrelationChartProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const chartWidth = Math.min(width - 64, 600);
  const chartHeight = 300;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const [animationProgress, setAnimationProgress] = useState(0);
  const [correlationScore, setCorrelationScore] = useState(0);

  // Process mission data into daily aggregates
  const processData = (): DayData[] => {
    const dailyMap = new Map<string, { completed: number; nudges: number }>();
    
    missionData.forEach(mission => {
      const date = new Date(mission.mission_date).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { completed: 0, nudges: 0 };
      
      dailyMap.set(date, {
        completed: existing.completed + mission.completed_pyqs,
        nudges: existing.nudges + mission.motivation_nudges
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, values], index) => ({
        day: `Day ${index + 1}`,
        date,
        completedPyqs: values.completed,
        motivationNudges: values.nudges
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 14); // Last 14 days
  };

  const chartData = data || processData();

  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (data: DayData[]): number => {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.completedPyqs, 0);
    const sumY = data.reduce((sum, d) => sum + d.motivationNudges, 0);
    const sumXY = data.reduce((sum, d) => sum + (d.completedPyqs * d.motivationNudges), 0);
    const sumX2 = data.reduce((sum, d) => sum + (d.completedPyqs * d.completedPyqs), 0);
    const sumY2 = data.reduce((sum, d) => sum + (d.motivationNudges * d.motivationNudges), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    return denominator === 0 ? 0 : Math.abs(numerator / denominator);
  };

  // Get scales for plotting
  const maxCompleted = Math.max(...chartData.map(d => d.completedPyqs), 1);
  const maxNudges = Math.max(...chartData.map(d => d.motivationNudges), 1);

  const getXPosition = (index: number) => {
    return padding.left + (index / Math.max(chartData.length - 1, 1)) * plotWidth;
  };

  const getYPosition = (value: number, maxValue: number) => {
    return padding.top + plotHeight - (value / maxValue) * plotHeight;
  };

  // Generate path strings for lines
  const generatePath = (dataKey: 'completedPyqs' | 'motivationNudges', maxValue: number) => {
    if (chartData.length === 0) return '';
    
    const points = chartData.map((d, i) => {
      const x = getXPosition(i);
      const y = getYPosition(d[dataKey], maxValue);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return points;
  };

  const completedPath = generatePath('completedPyqs', maxCompleted);
  const nudgesPath = generatePath('motivationNudges', maxNudges);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.01) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Calculate correlation when data changes
  useEffect(() => {
    const correlation = calculateCorrelation(chartData);
    setCorrelationScore(correlation);
  }, [chartData]);

  const getCorrelationColor = (score: number) => {
    if (score >= 0.7) return { color: '#10b981', label: 'Strong Positive' };
    if (score >= 0.4) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#ef4444', label: 'Weak' };
  };

  const correlationInfo = getCorrelationColor(correlationScore);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <TrendingUp size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">{title}</Text>
            <Text className="text-slate-400 text-sm">
              {chartData.length} days • Analyzing motivation impact
            </Text>
          </View>
        </View>

        {/* Correlation Score Dial */}
        <View className="items-center">
          <View className="relative w-16 h-16">
            {/* Background Circle */}
            <View className="absolute inset-0 rounded-full border-4 border-slate-700/60" />
            
            {/* Progress Circle */}
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: `${correlationScore * 360}deg` }}
              transition={{ type: 'spring', duration: 1200, delay: 600 }}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: correlationInfo.color,
                borderRightColor: correlationScore > 0.25 ? correlationInfo.color : 'transparent',
                borderBottomColor: correlationScore > 0.5 ? correlationInfo.color : 'transparent',
                borderLeftColor: correlationScore > 0.75 ? correlationInfo.color : 'transparent',
              }}
            />
            
            {/* Center Text */}
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-lg font-bold" style={{ color: correlationInfo.color }}>
                {(correlationScore * 100).toFixed(0)}
              </Text>
              <Text className="text-slate-500 text-xs">%</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Impact Index
          </Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          <View style={{ width: Math.max(chartWidth, 500), height: chartHeight }}>
            <Svg width="100%" height={chartHeight}>
              <Defs>
                {/* Gradients for lines */}
                <LinearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="nudgesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                </LinearGradient>
                
                {/* Animated gradient for flight effect */}
                <LinearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset={`${(animationProgress * 100) - 10}%`} stopColor="transparent" stopOpacity="0" />
                  <Stop offset={`${animationProgress * 100}%`} stopColor="#06b6d4" stopOpacity="1" />
                  <Stop offset={`${(animationProgress * 100) + 10}%`} stopColor="transparent" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <Line
                  key={`grid-${index}`}
                  x1={padding.left}
                  y1={padding.top + plotHeight * ratio}
                  x2={padding.left + plotWidth}
                  y2={padding.top + plotHeight * ratio}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Y-axis labels */}
              <SvgText
                x={padding.left - 10}
                y={padding.top + 5}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {maxCompleted}
              </SvgText>
              <SvgText
                x={padding.left - 10}
                y={padding.top + plotHeight + 5}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                0
              </SvgText>

              {/* Completed PYQs Line */}
              <Path
                d={completedPath}
                stroke="url(#completedGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Motivation Nudges Line */}
              <Path
                d={nudgesPath}
                stroke="url(#nudgesGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,5"
              />

              {/* Animated Flight Line */}
              <Line
                x1={padding.left}
                y1={padding.top + plotHeight / 2}
                x2={padding.left + plotWidth}
                y2={padding.top + plotHeight / 2}
                stroke="url(#flightGradient)"
                strokeWidth="2"
              />

              {/* Data Points */}
              {chartData.map((point, index) => {
                const x = getXPosition(index);
                const yCompleted = getYPosition(point.completedPyqs, maxCompleted);
                const yNudges = getYPosition(point.motivationNudges, maxNudges);

                return (
                  <React.Fragment key={point.day}>
                    {/* Completed PYQs Point */}
                    <Circle
                      cx={x}
                      cy={yCompleted}
                      r="4"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    
                    {/* Motivation Nudges Point */}
                    <Circle
                      cx={x}
                      cy={yNudges}
                      r="4"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Day Label */}
                    <SvgText
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {point.day.replace('Day ', 'D')}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
      </View>

      {/* Legend and Metrics */}
      <View className="space-y-4">
        {/* Chart Legend */}
        <View className="flex-row items-center justify-center space-x-6">
          <View className="flex-row items-center">
            <View className="w-4 h-1 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-slate-300 text-sm">Completed PYQs</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-1 bg-amber-500 rounded-full mr-2 border-dashed border border-amber-500" />
            <Text className="text-slate-300 text-sm">Motivation Nudges</Text>
          </View>
        </View>

        {/* Correlation Analysis */}
        <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Target size={16} color="#06b6d4" />
              <Text className="text-slate-100 font-semibold ml-2">Motivational Impact Analysis</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-slate-400 mr-2">Correlation:</Text>
              <Text 
                className="font-bold text-sm"
                style={{ color: correlationInfo.color }}
              >
                {correlationInfo.label}
              </Text>
            </View>
          </View>

          {/* Correlation Score Display */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-slate-300 text-sm mb-2">
                Impact Score: <Text className="font-bold" style={{ color: correlationInfo.color }}>
                  {(correlationScore * 100).toFixed(1)}%
                </Text>
              </Text>
              <Text className="text-slate-400 text-xs leading-4">
                {correlationScore >= 0.7 
                  ? "Strong correlation! Motivation nudges significantly boost your performance."
                  : correlationScore >= 0.4
                  ? "Moderate correlation. Nudges help, but other factors also influence progress."
                  : "Weak correlation. Your progress is driven more by consistency than motivation nudges."
                }
              </Text>
            </View>

            {/* Visual Correlation Meter */}
            <View className="ml-4">
              <View className="w-20 h-3 bg-slate-600 rounded-full overflow-hidden">
                <MotiView
                  from={{ width: '0%' }}
                  animate={{ width: `${correlationScore * 100}%` }}
                  transition={{ type: 'spring', duration: 1000, delay: 800 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: correlationInfo.color }}
                />
              </View>
              <Text className="text-xs text-slate-400 text-center mt-1">
                0 → 1
              </Text>
            </View>
          </View>
        </View>

        {/* Key Insights */}
        <View className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <BarChart3 size={14} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Avg Daily PYQs</Text>
            </View>
            <Text className="text-emerald-200 text-lg font-bold">
              {(chartData.reduce((sum, d) => sum + d.completedPyqs, 0) / Math.max(chartData.length, 1)).toFixed(1)}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1100 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Zap size={14} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Nudges</Text>
            </View>
            <Text className="text-amber-200 text-lg font-bold">
              {(chartData.reduce((sum, d) => sum + d.motivationNudges, 0) / Math.max(chartData.length, 1)).toFixed(1)}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1200 }}
            className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Target size={14} color="#06b6d4" />
              <Text className="text-cyan-400 font-semibold text-sm ml-2">Peak Day</Text>
            </View>
            <Text className="text-cyan-200 text-lg font-bold">
              {chartData.reduce((max, d) => d.completedPyqs > max.completedPyqs ? d : max, chartData[0] || { day: 'N/A' }).day}
            </Text>
          </MotiView>
        </View>
      </View>
    </MotiView>
  );
}