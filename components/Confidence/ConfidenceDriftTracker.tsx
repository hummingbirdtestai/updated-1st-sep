import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Calendar, Target, TriangleAlert as AlertTriangle, TrendingDown } from 'lucide-react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import confidenceData from '@/data/confidence-data.json';

interface DayData {
  date: string;
  formattedDate: string;
  avg_confidence: number;
  avg_accuracy: number;
  confidence_gap: number;
  time_spent_min: number;
  total_attempts: number;
}

interface DriftMetrics {
  overconfidentDays: number;
  underconfidentDays: number;
  wellCalibratedDays: number;
  averageGap: number;
  maxOverconfidence: number;
  maxUnderconfidence: number;
  totalDays: number;
  trendSlope: number;
}

export default function ConfidenceDriftTracker() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [processedData, setProcessedData] = useState<DayData[]>([]);
  const [driftMetrics, setDriftMetrics] = useState<DriftMetrics | null>(null);

  // Process confidence data by date
  const processConfidenceData = () => {
    // Filter only PYQs (mcq_1)
    const pyqData = confidenceData.filter(entry => entry.mcq_key === 'mcq_1');
    
    // Group by date
    const dateGroups = new Map<string, typeof pyqData>();
    pyqData.forEach(entry => {
      const date = entry.date;
      if (!dateGroups.has(date)) {
        dateGroups.set(date, []);
      }
      dateGroups.get(date)!.push(entry);
    });

    // Process each date
    const dayData: DayData[] = [];
    dateGroups.forEach((entries, date) => {
      const avg_confidence = entries.reduce((sum, entry) => sum + entry.predicted_confidence, 0) / entries.length;
      const avg_accuracy = (entries.reduce((sum, entry) => sum + entry.actual_correct, 0) / entries.length) * 100;
      const confidence_gap = avg_confidence - avg_accuracy;
      const time_spent_min = entries.length * 4.5;
      
      // Format date for display
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      dayData.push({
        date,
        formattedDate,
        avg_confidence: Math.round(avg_confidence * 100) / 100,
        avg_accuracy: Math.round(avg_accuracy * 100) / 100,
        confidence_gap: Math.round(confidence_gap * 100) / 100,
        time_spent_min,
        total_attempts: entries.length,
      });
    });

    return dayData.sort((a, b) => a.date.localeCompare(b.date));
  };

  // Calculate drift metrics
  const calculateDriftMetrics = (data: DayData[]): DriftMetrics => {
    const overconfidentDays = data.filter(d => d.confidence_gap > 15).length;
    const underconfidentDays = data.filter(d => d.confidence_gap < -15).length;
    const wellCalibratedDays = data.filter(d => Math.abs(d.confidence_gap) <= 15).length;
    const averageGap = data.reduce((sum, d) => sum + Math.abs(d.confidence_gap), 0) / Math.max(data.length, 1);
    const maxOverconfidence = Math.max(...data.map(d => d.confidence_gap), 0);
    const maxUnderconfidence = Math.min(...data.map(d => d.confidence_gap), 0);
    
    // Calculate trend slope using linear regression
    const n = data.length;
    const sumX = data.reduce((sum, d, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.confidence_gap, 0);
    const sumXY = data.reduce((sum, d, i) => sum + (i * d.confidence_gap), 0);
    const sumX2 = data.reduce((sum, d, i) => sum + (i * i), 0);
    
    const trendSlope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;

    return {
      overconfidentDays,
      underconfidentDays,
      wellCalibratedDays,
      averageGap,
      maxOverconfidence,
      maxUnderconfidence,
      totalDays: data.length,
      trendSlope,
    };
  };

  // Process data on component mount
  useEffect(() => {
    const data = processConfidenceData();
    setProcessedData(data);
    setDriftMetrics(calculateDriftMetrics(data));
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.formattedDate}
          </Text>
          <Text className="text-blue-300 text-sm">
            Avg Confidence: {data.avg_confidence}%
          </Text>
          <Text className="text-emerald-300 text-sm">
            Avg Accuracy: {data.avg_accuracy}%
          </Text>
          <Text className={`text-sm font-semibold ${
            data.confidence_gap > 0 ? 'text-red-400' : 'text-cyan-400'
          }`}>
            Confidence Gap: {data.confidence_gap > 0 ? '+' : ''}{data.confidence_gap}%
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Time Spent: {data.time_spent_min}m ({data.total_attempts} PYQs)
          </Text>
        </View>
      );
    }
    return null;
  };

  const getGapColor = (gap: number) => {
    if (gap > 15) return '#ef4444'; // Red for overconfidence
    if (gap < -15) return '#06b6d4'; // Cyan for underconfidence
    return '#10b981'; // Green for well-calibrated
  };

  const getTrendInfo = (slope: number) => {
    if (slope > 0.5) return { color: '#ef4444', label: 'Increasing Overconfidence' };
    if (slope > 0) return { color: '#f59e0b', label: 'Slight Overconfidence Trend' };
    if (slope > -0.5) return { color: '#10b981', label: 'Improving Calibration' };
    return { color: '#06b6d4', label: 'Increasing Underconfidence' };
  };

  const trendInfo = getTrendInfo(driftMetrics?.trendSlope || 0);

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
            <Text className="text-xl font-bold text-slate-100">Confidence Drift Tracker</Text>
            <Text className="text-slate-400 text-sm">
              Daily calibration trends • {processedData.length} days analyzed
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
            <Text 
              className="font-bold text-sm"
              style={{ color: trendInfo.color }}
            >
              {driftMetrics?.trendSlope.toFixed(3)}
            </Text>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Trend Slope
          </Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Confidence Gap Over Time
        </Text>
        
        <View style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="formattedDate"
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Perfect Calibration Reference Line */}
              <ReferenceLine 
                y={0}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5,5"
                label={{ value: "Perfect Calibration", position: "topRight", style: { fill: '#64748b', fontSize: 12 } }}
              />
              
              {/* Confidence Gap Line */}
              <Line 
                type="monotone"
                dataKey="confidence_gap" 
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ 
                  fill: (entry: any) => getGapColor(entry.confidence_gap),
                  strokeWidth: 2, 
                  r: 5 
                }}
                name="Confidence Gap"
              />
            </LineChart>
          </ResponsiveContainer>
        </View>
      </View>

      {/* Drift Analysis Metrics */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Well Calibrated</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {driftMetrics?.wellCalibratedDays || 0}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            days (≤15% gap)
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Overconfident</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {driftMetrics?.overconfidentDays || 0}
          </Text>
          <Text className="text-red-300/80 text-xs">
            days (>15% gap)
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingDown size={16} color="#06b6d4" />
            <Text className="text-cyan-400 font-semibold text-sm ml-2">Underconfident</Text>
          </View>
          <Text className="text-cyan-200 text-xl font-bold">
            {driftMetrics?.underconfidentDays || 0}
          </Text>
          <Text className="text-cyan-300/80 text-xs">
            days (&lt;-15% gap)
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Calendar size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Gap</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {driftMetrics?.averageGap.toFixed(1) || 0}%
          </Text>
          <Text className="text-amber-300/80 text-xs">
            absolute deviation
          </Text>
        </MotiView>
      </View>

      {/* Drift Analysis Insights */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Target size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Confidence Drift Analysis</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold" style={{ color: trendInfo.color }}>
              Trend Direction: {trendInfo.label}
            </Text>
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-emerald-400">Well-Calibrated Days:</Text> {driftMetrics?.wellCalibratedDays || 0} of {driftMetrics?.totalDays || 0}
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-red-400">Peak Overconfidence:</Text> +{driftMetrics?.maxOverconfidence.toFixed(1) || 0}%
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-cyan-400">Peak Underconfidence:</Text> {driftMetrics?.maxUnderconfidence.toFixed(1) || 0}%
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4 mt-3">
            {(driftMetrics?.averageGap || 0) <= 10 
              ? "Excellent calibration stability! Your confidence predictions are consistently accurate over time."
              : (driftMetrics?.averageGap || 0) <= 20
              ? "Moderate calibration drift. Some days show significant gaps between confidence and performance."
              : "High calibration drift detected. Consider tracking your confidence patterns more carefully to improve self-assessment."
            }
          </Text>
        </View>
      </MotiView>

      {/* Daily Breakdown */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-4"
      >
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#f59e0b" />
          <Text className="text-slate-100 font-semibold ml-2">Daily Calibration Breakdown</Text>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <View className="flex-row space-x-3">
            {processedData.map((day, index) => {
              const gapColor = getGapColor(day.confidence_gap);
              const isOverconfident = day.confidence_gap > 15;
              const isUnderconfident = day.confidence_gap < -15;
              
              return (
                <MotiView
                  key={day.date}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 400, delay: 1600 + index * 50 }}
                  className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30 min-w-[120px]"
                >
                  <Text className="text-slate-300 font-medium text-sm text-center mb-2">
                    {day.formattedDate}
                  </Text>
                  
                  <View className="items-center mb-2">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: gapColor }}
                    >
                      <Text className="text-white font-bold text-sm">
                        {Math.abs(day.confidence_gap).toFixed(0)}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400 mt-1">
                      {day.confidence_gap > 0 ? 'Over' : day.confidence_gap < 0 ? 'Under' : 'Balanced'}
                    </Text>
                  </View>
                  
                  <View className="space-y-1">
                    <Text className="text-xs text-slate-400 text-center">
                      Conf: {day.avg_confidence}%
                    </Text>
                    <Text className="text-xs text-slate-400 text-center">
                      Acc: {day.avg_accuracy}%
                    </Text>
                    <Text className="text-xs text-slate-500 text-center">
                      {day.total_attempts} PYQs
                    </Text>
                  </View>
                </MotiView>
              );
            })}
          </View>
        </ScrollView>
      </MotiView>

      {/* Calibration Insights */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1600 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-4"
      >
        <View className="flex-row items-center mb-3">
          <AlertTriangle size={16} color="#f59e0b" />
          <Text className="text-slate-100 font-semibold ml-2">Calibration Insights</Text>
        </View>

        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">Confidence Pattern</Text>
            <Text className="text-slate-400 text-xs">
              Your confidence shows a {Math.abs(driftMetrics?.trendSlope || 0) > 0.5 ? 'strong' : 'moderate'} 
              {' '}{(driftMetrics?.trendSlope || 0) > 0 ? 'upward' : 'downward'} trend over time.
            </Text>
            <Text className="text-cyan-400 text-sm font-bold mt-1">
              {trendInfo.label}
            </Text>
          </View>

          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">Recommendation</Text>
            <Text className="text-slate-400 text-xs">
              {(driftMetrics?.overconfidentDays || 0) > (driftMetrics?.underconfidentDays || 0)
                ? "Focus on being more conservative in confidence ratings. Review questions you got wrong despite high confidence."
                : (driftMetrics?.underconfidentDays || 0) > (driftMetrics?.wellCalibratedDays || 0)
                ? "You tend to underestimate your knowledge. Trust your preparation more."
                : "Good calibration! Continue monitoring your confidence patterns."
              }
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1700 }}
        className="flex-row items-center justify-center mt-4 space-x-6 pt-4 border-t border-slate-600/30"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
          <Text className="text-slate-300 text-sm">Overconfident (>15%)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-slate-300 text-sm">Well Calibrated (±15%)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-cyan-500 mr-2" />
          <Text className="text-slate-300 text-sm">Underconfident (&lt;-15%)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-slate-500 rounded mr-2 border-dashed border border-slate-500" />
          <Text className="text-slate-300 text-sm">Perfect Calibration</Text>
        </View>
      </MotiView>
    </MotiView>
  );
}