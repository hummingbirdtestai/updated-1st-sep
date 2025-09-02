import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, TrendingDown, Target, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyData {
  week: string;
  recurrence: number;
}

interface TrajectoryData {
  topic: string;
  error_correction_trajectory: WeeklyData[];
}

interface ErrorCorrectionTrajectoryProps {
  data?: TrajectoryData;
}

// Mock data
const mockData: TrajectoryData = {
  "topic": "Michaelis-Menten",
  "error_correction_trajectory": [
    { "week": "W1", "recurrence": 4 },
    { "week": "W2", "recurrence": 3 },
    { "week": "W3", "recurrence": 2 },
    { "week": "W4", "recurrence": 1 }
  ]
};

export default function ErrorCorrectionTrajectory({ data = mockData }: ErrorCorrectionTrajectoryProps) {
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

  // Calculate trend slope using linear regression
  const calculateTrendSlope = () => {
    const trajectory = data.error_correction_trajectory;
    if (trajectory.length < 2) return 0;

    const n = trajectory.length;
    const sumX = trajectory.reduce((sum, _, i) => sum + i, 0);
    const sumY = trajectory.reduce((sum, point) => sum + point.recurrence, 0);
    const sumXY = trajectory.reduce((sum, point, i) => sum + (i * point.recurrence), 0);
    const sumX2 = trajectory.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const trendSlope = calculateTrendSlope();
  const isImproving = trendSlope < 0; // Negative slope means reducing recurrence
  const isWorsening = trendSlope > 0; // Positive slope means increasing recurrence

  // Get trend info
  const getTrendInfo = () => {
    if (Math.abs(trendSlope) < 0.1) {
      return { 
        color: '#f59e0b', 
        label: 'Stable', 
        icon: Target, 
        description: 'No significant change in error frequency' 
      };
    } else if (isImproving) {
      return { 
        color: '#10b981', 
        label: 'Improving', 
        icon: TrendingDown, 
        description: 'Error frequency is decreasing over time' 
      };
    } else {
      return { 
        color: '#ef4444', 
        label: 'Worsening', 
        icon: TrendingUp, 
        description: 'Error frequency is increasing - needs attention' 
      };
    }
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  // Calculate metrics
  const totalRecurrences = data.error_correction_trajectory.reduce((sum, point) => sum + point.recurrence, 0);
  const averageRecurrence = totalRecurrences / data.error_correction_trajectory.length;
  const maxRecurrence = Math.max(...data.error_correction_trajectory.map(point => point.recurrence));
  const minRecurrence = Math.min(...data.error_correction_trajectory.map(point => point.recurrence));
  const improvement = maxRecurrence - minRecurrence;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {label}
          </Text>
          <Text className="text-red-300 text-sm">
            Recurrence Count: {data.recurrence}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {data.recurrence === 0 ? 'No mistakes this week!' : 
             data.recurrence === 1 ? '1 mistake this week' : 
             `${data.recurrence} mistakes this week`}
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
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <TrendingUp size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Error Correction Trajectory
            </Text>
            <Text className="text-sm text-slate-400">
              {data.topic} • Weekly progress tracking
            </Text>
          </View>
        </View>

        {/* Trend Indicator */}
        <View className="items-center">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: trendInfo.color }}
          >
            <TrendIcon size={20} color="#ffffff" />
          </View>
          <Text 
            className="text-sm font-bold mt-1"
            style={{ color: trendInfo.color }}
          >
            {trendInfo.label}
          </Text>
        </View>
      </MotiView>

      {/* Main Content */}
      <View className="flex-1 p-6">
        {/* Topic Header */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 200 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: trendInfo.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{ backgroundColor: trendInfo.color }}
            >
              <Target size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100">
                {data.topic}
              </Text>
              <Text className="text-slate-400 text-sm">
                {trendInfo.description}
              </Text>
            </View>
          </View>

          {/* Trend Summary */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <View className="text-center">
                <Text className="text-slate-400 text-xs">Slope</Text>
                <Text 
                  className="text-lg font-bold"
                  style={{ color: trendInfo.color }}
                >
                  {trendSlope.toFixed(3)}
                </Text>
              </View>
              <View className="text-center">
                <Text className="text-slate-400 text-xs">Total Errors</Text>
                <Text className="text-slate-200 text-lg font-bold">
                  {totalRecurrences}
                </Text>
              </View>
              <View className="text-center">
                <Text className="text-slate-400 text-xs">Avg per Week</Text>
                <Text className="text-slate-200 text-lg font-bold">
                  {averageRecurrence.toFixed(1)}
                </Text>
              </View>
              <View className="text-center">
                <Text className="text-slate-400 text-xs">Improvement</Text>
                <Text className="text-emerald-400 text-lg font-bold">
                  -{improvement}
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Chart Container */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 400 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-6"
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
            <Text className="text-lg font-bold text-slate-100">
              Weekly Error Trajectory
            </Text>
          </View>

          {/* Chart */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <View style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.error_correction_trajectory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="week"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    domain={[0, 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Main trajectory line */}
                  <Line 
                    type="monotone"
                    dataKey="recurrence" 
                    stroke={trendInfo.color}
                    strokeWidth={4}
                    dot={{ 
                      fill: trendInfo.color, 
                      strokeWidth: 3, 
                      r: 6,
                      stroke: '#ffffff'
                    }}
                    activeDot={{ 
                      r: 8, 
                      fill: trendInfo.color,
                      stroke: '#ffffff',
                      strokeWidth: 3
                    }}
                    name="Recurrence Count"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </LineChart>
              </ResponsiveContainer>
            </View>
          </View>

          {/* Trend Analysis */}
          <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TrendIcon size={16} color={trendInfo.color} />
                <Text className="text-slate-100 font-semibold ml-2">Trend Analysis</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-slate-400 text-sm mr-2">Direction:</Text>
                <Text 
                  className="font-bold text-sm"
                  style={{ color: trendInfo.color }}
                >
                  {isImproving ? '↗ Reducing' : isWorsening ? '↘ Worsening' : '→ Stable'}
                </Text>
              </View>
            </View>
            
            <Text className="text-slate-300 text-sm mt-2">
              {trendInfo.description}
            </Text>
          </View>
        </MotiView>

        {/* Weekly Breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Clock size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Weekly Breakdown
            </Text>
          </View>

          <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.error_correction_trajectory.map((week, index) => {
              const isLowest = week.recurrence === minRecurrence;
              const isHighest = week.recurrence === maxRecurrence;
              
              return (
                <MotiView
                  key={week.week}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 400, delay: 800 + index * 100 }}
                  className={`rounded-xl p-4 border ${
                    isLowest ? 'bg-emerald-500/10 border-emerald-500/30' :
                    isHighest ? 'bg-red-500/10 border-red-500/30' :
                    'bg-slate-700/40 border-slate-600/30'
                  }`}
                >
                  <View className="items-center">
                    <Text className="text-slate-300 font-semibold text-sm mb-2">
                      {week.week}
                    </Text>
                    <View 
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{ 
                        backgroundColor: isLowest ? '#10b981' : 
                                        isHighest ? '#ef4444' : '#64748b' 
                      }}
                    >
                      <Text className="text-white font-bold text-lg">
                        {week.recurrence}
                      </Text>
                    </View>
                    <Text className={`text-xs font-medium ${
                      isLowest ? 'text-emerald-400' : 
                      isHighest ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {isLowest ? 'Best Week' : 
                       isHighest ? 'Worst Week' : 'Errors'}
                    </Text>
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
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <AlertTriangle size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Correction Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold" style={{ color: trendInfo.color }}>
                Trend: {trendInfo.label}
              </Text>
              {' '}(slope: {trendSlope.toFixed(3)})
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Total Improvement:</Text> {improvement} fewer errors from peak
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-blue-400">Average per Week:</Text> {averageRecurrence.toFixed(1)} errors
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {isImproving 
                ? "Great progress! Your error correction strategies are working. Continue with current approach."
                : isWorsening
                ? "Error frequency is increasing. Consider reviewing study methods or seeking additional help with this topic."
                : "Error frequency is stable. Consider implementing new strategies to drive further improvement."
              }
            </Text>
          </View>
        </MotiView>
      </View>
    </View>
  );
}