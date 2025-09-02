import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions,Pressable  } from 'react-native';
import { MotiView } from 'moti';
import { TriangleAlert as AlertTriangle, Clock, Target, TrendingDown, Gauge } from 'lucide-react-native';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import rootCausesData from '@/data/root-causes-data.json';

interface ErrorGap {
  gap: string;
  pyqs_affected: number;
  time_wasted_min: number;
}

interface ErrorFingerprintData {
  student_id: string;
  pyq_total: number;
  pyqs_completed: number;
  error_fingerprint: ErrorGap[];
  analysis_metadata: {
    total_time_wasted_hours: number;
    improvement_potential_hours: number;
  };
}

interface ErrorFingerprintProfileProps {
  onErrorGapClick?: (gap: ErrorGap) => void;
}

export default function ErrorFingerprintProfile({ onErrorGapClick }: ErrorFingerprintProfileProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [data] = useState<ErrorFingerprintData>(rootCausesData);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Calculate metrics
  const totalTimeSpent = data.pyqs_completed * 4.5; // minutes
  const totalTimeWasted = data.error_fingerprint.reduce((sum, gap) => sum + gap.time_wasted_min, 0);
  const timeDrainPercentage = totalTimeSpent > 0 ? (totalTimeWasted / totalTimeSpent) * 100 : 0;
  const totalPyqsAffected = data.error_fingerprint.reduce((sum, gap) => sum + gap.pyqs_affected, 0);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Prepare chart data
  const chartData = data.error_fingerprint
    .sort((a, b) => b.time_wasted_min - a.time_wasted_min)
    .map((gap, index) => ({
      name: gap.gap.length > 25 ? `${gap.gap.substring(0, 25)}...` : gap.gap,
      fullName: gap.gap,
      timeWasted: gap.time_wasted_min,
      pyqsAffected: gap.pyqs_affected,
      index,
    }));

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.fullName}
          </Text>
          <Text className="text-red-300 text-sm">
            Time Wasted: {data.timeWasted.toFixed(1)} minutes
          </Text>
          <Text className="text-amber-300 text-sm">
            PYQs Affected: {data.pyqsAffected}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Get color for time drain meter
  const getDrainColor = (percentage: number) => {
    if (percentage >= 20) return { color: '#ef4444', label: 'Critical Drain' };
    if (percentage >= 10) return { color: '#f59e0b', label: 'High Drain' };
    if (percentage >= 5) return { color: '#eab308', label: 'Moderate Drain' };
    return { color: '#10b981', label: 'Low Drain' };
  };

  const drainInfo = getDrainColor(timeDrainPercentage);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <AlertTriangle size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Error Fingerprint Profile</Text>
            <Text className="text-slate-400 text-sm">
              Recurring mistakes • {data.error_fingerprint.length} patterns identified
            </Text>
          </View>
        </View>

        {/* Time Drain Meter */}
        <View className="items-center">
          <View className="relative w-16 h-16">
            {/* Background Circle */}
            <View className="absolute inset-0 rounded-full border-4 border-slate-700/60" />
            
            {/* Progress Circle */}
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: `${(timeDrainPercentage / 100) * 360}deg` }}
              transition={{ type: 'spring', duration: 1200, delay: 600 }}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: drainInfo.color,
                borderRightColor: timeDrainPercentage > 25 ? drainInfo.color : 'transparent',
                borderBottomColor: timeDrainPercentage > 50 ? drainInfo.color : 'transparent',
                borderLeftColor: timeDrainPercentage > 75 ? drainInfo.color : 'transparent',
              }}
            />
            
            {/* Center Text */}
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-lg font-bold" style={{ color: drainInfo.color }}>
                {timeDrainPercentage.toFixed(0)}
              </Text>
              <Text className="text-slate-500 text-xs">%</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Time Drain
          </Text>
        </View>
      </View>

      {/* Summary Metrics */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 400 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">PYQs Completed</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {data.pyqs_completed.toLocaleString()}
          </Text>
          <Text className="text-blue-300/80 text-xs">
            of {data.pyq_total.toLocaleString()} total
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
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Time Invested</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {(totalTimeSpent / 60).toFixed(1)}h
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            {totalTimeSpent.toFixed(0)} minutes
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingDown size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Time Wasted</Text>
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
          transition={{ type: 'spring', duration: 600, delay: 700 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Gauge size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Drain Rate</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {timeDrainPercentage.toFixed(1)}%
          </Text>
          <Text className="text-amber-300/80 text-xs">
            {drainInfo.label}
          </Text>
        </MotiView>
      </View>

      {/* Horizontal Bar Chart */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Time Wasted by Error Pattern
        </Text>
        
        <View style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
              <XAxis 
                type="number" 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                width={90}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="timeWasted" 
                fill="url(#errorGradient)"
                radius={[0, 4, 4, 0]}
              />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </View>
      </View>

      {/* Error Pattern Details */}
      <View className="space-y-3">
        <Text className="text-lg font-semibold text-slate-100 mb-4">
          Detailed Error Analysis
        </Text>
        
        {data.error_fingerprint
          .sort((a, b) => b.time_wasted_min - a.time_wasted_min)
          .map((gap, index) => {
            const impactLevel = gap.time_wasted_min >= 60 ? 'high' : 
                              gap.time_wasted_min >= 30 ? 'medium' : 'low';
            const impactColors = {
              high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
              medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
              low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
            };
            const colors = impactColors[impactLevel];

            return (
              <MotiView
                key={gap.gap}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
                className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
              >
                <Pressable
                  onPress={() => onErrorGapClick?.(gap)}
                  className="flex-row items-center justify-between active:bg-black/10"
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-slate-100 font-semibold text-base mb-2">
                      {gap.gap}
                    </Text>
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-slate-400 text-sm">
                        PYQs Affected: <Text className={`font-bold ${colors.text}`}>
                          {gap.pyqs_affected}
                        </Text>
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        Time Wasted: <Text className={`font-bold ${colors.text}`}>
                          {gap.time_wasted_min.toFixed(1)}m
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Impact Level Badge */}
                  <View className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
                    <Text className={`text-xs font-bold ${colors.text} uppercase`}>
                      {impactLevel} Impact
                    </Text>
                  </View>
                </Pressable>

                {/* Progress Bar showing relative impact */}
                <View className="mt-3">
                  <View className="w-full bg-slate-700/60 rounded-full h-2">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ 
                        width: `${(gap.time_wasted_min / Math.max(...data.error_fingerprint.map(g => g.time_wasted_min))) * 100}%` 
                      }}
                      transition={{ type: 'spring', duration: 1000, delay: 1000 + index * 100 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: colors.text.includes('red') ? '#ef4444' : 
                                                colors.text.includes('amber') ? '#f59e0b' : '#10b981' }}
                    />
                  </View>
                  <Text className="text-slate-500 text-xs mt-1">
                    {((gap.time_wasted_min / totalTimeWasted) * 100).toFixed(1)}% of total waste
                  </Text>
                </View>
              </MotiView>
            );
          })}
      </View>

      {/* Summary Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <AlertTriangle size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Error Pattern Insights</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-red-400">Most Costly Error:</Text> {
              data.error_fingerprint.reduce((max, gap) => 
                gap.time_wasted_min > max.time_wasted_min ? gap : max
              ).gap
            }
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-amber-400">Most Frequent Error:</Text> {
              data.error_fingerprint.reduce((max, gap) => 
                gap.pyqs_affected > max.pyqs_affected ? gap : max
              ).gap
            }
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-emerald-400">Efficiency Impact:</Text> {
              timeDrainPercentage.toFixed(1)}% of study time wasted on recurring errors
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4 mt-3">
            {timeDrainPercentage >= 15 
              ? "High time drain detected! Focus on addressing the top 3 error patterns to significantly improve study efficiency."
              : timeDrainPercentage >= 8
              ? "Moderate time drain. Addressing recurring errors could boost your study efficiency."
              : "Good efficiency! Your error patterns have minimal impact on overall study time."
            }
          </Text>
        </View>
      </MotiView>

      {/* Time Drain Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1600 }}
        className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Gauge size={16} color={drainInfo.color} />
            <Text className="text-slate-100 font-semibold ml-2">Time Drain Analysis</Text>
          </View>
          <Text 
            className="font-bold text-sm"
            style={{ color: drainInfo.color }}
          >
            {drainInfo.label}
          </Text>
        </View>

        <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <View className="text-center">
            <Text className="text-slate-400 text-xs">Total Study Time</Text>
            <Text className="text-slate-200 text-lg font-bold">
              {(totalTimeSpent / 60).toFixed(1)}h
            </Text>
          </View>
          <View className="text-center">
            <Text className="text-slate-400 text-xs">Time Wasted</Text>
            <Text className="text-red-400 text-lg font-bold">
              {(totalTimeWasted / 60).toFixed(1)}h
            </Text>
          </View>
          <View className="text-center">
            <Text className="text-slate-400 text-xs">Potential Savings</Text>
            <Text className="text-emerald-400 text-lg font-bold">
              {(data.analysis_metadata.improvement_potential_hours).toFixed(1)}h
            </Text>
          </View>
        </View>

        <View className="mt-4 pt-3 border-t border-slate-600/30">
          <Text className="text-slate-400 text-xs text-center">
            Drain Rate = Time Wasted ÷ Total Study Time • 
            Lower is better for efficiency
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
}