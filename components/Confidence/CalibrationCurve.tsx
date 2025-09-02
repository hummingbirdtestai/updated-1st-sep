import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, Cell } from 'recharts';
import confidenceData from '@/data/confidence-data.json';

interface ConfidenceBin {
  binRange: string;
  predicted_avg: number;
  actual_accuracy: number;
  total_attempts: number;
  correct_attempts: number;
  calibration_gap: number;
  is_well_calibrated: boolean;
}

interface CalibrationMetrics {
  overallCalibration: number;
  perfectlyCalibrated: number;
  overconfident: number;
  underconfident: number;
  totalAttempts: number;
}

export default function CalibrationCurve() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [processedData, setProcessedData] = useState<ConfidenceBin[]>([]);
  const [calibrationMetrics, setCalibrationMetrics] = useState<CalibrationMetrics | null>(null);

  // Process confidence data into bins
  const processConfidenceData = () => {
    // Filter only PYQs (mcq_1)
    const pyqData = confidenceData.filter(entry => entry.mcq_key === 'mcq_1');
    
    // Define confidence bins
    const bins = [
      { min: 0, max: 20, range: '0-20' },
      { min: 21, max: 40, range: '21-40' },
      { min: 41, max: 60, range: '41-60' },
      { min: 61, max: 80, range: '61-80' },
      { min: 81, max: 100, range: '81-100' }
    ];

    const binData: ConfidenceBin[] = [];

    bins.forEach(bin => {
      const binEntries = pyqData.filter(entry => 
        entry.predicted_confidence >= bin.min && entry.predicted_confidence <= bin.max
      );

      if (binEntries.length > 0) {
        const predicted_avg = binEntries.reduce((sum, entry) => sum + entry.predicted_confidence, 0) / binEntries.length;
        const correct_attempts = binEntries.filter(entry => entry.actual_correct === 1).length;
        const actual_accuracy = (correct_attempts / binEntries.length) * 100;
        const calibration_gap = Math.abs(predicted_avg - actual_accuracy);
        const is_well_calibrated = calibration_gap <= 15;

        binData.push({
          binRange: bin.range,
          predicted_avg: Math.round(predicted_avg),
          actual_accuracy: Math.round(actual_accuracy * 100) / 100,
          total_attempts: binEntries.length,
          correct_attempts,
          calibration_gap: Math.round(calibration_gap * 100) / 100,
          is_well_calibrated,
        });
      }
    });

    return binData;
  };

  // Calculate calibration metrics
  const calculateCalibrationMetrics = (data: ConfidenceBin[]): CalibrationMetrics => {
    const totalAttempts = data.reduce((sum, bin) => sum + bin.total_attempts, 0);
    const perfectlyCalibrated = data.filter(bin => bin.is_well_calibrated).length;
    const overconfident = data.filter(bin => bin.predicted_avg > bin.actual_accuracy + 15).length;
    const underconfident = data.filter(bin => bin.actual_accuracy > bin.predicted_avg + 15).length;
    
    // Overall calibration score (inverse of average gap)
    const avgGap = data.reduce((sum, bin) => sum + bin.calibration_gap, 0) / Math.max(data.length, 1);
    const overallCalibration = Math.max(0, 100 - avgGap);

    return {
      overallCalibration,
      perfectlyCalibrated,
      overconfident,
      underconfident,
      totalAttempts,
    };
  };

  // Process data on component mount
  useEffect(() => {
    const data = processConfidenceData();
    setProcessedData(data);
    setCalibrationMetrics(calculateCalibrationMetrics(data));
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            Confidence Range: {data.binRange}%
          </Text>
          <Text className="text-blue-300 text-sm">
            Predicted: {data.predicted_avg}%
          </Text>
          <Text className="text-emerald-300 text-sm">
            Actual: {data.actual_accuracy}%
          </Text>
          <Text className={`text-sm ${
            data.is_well_calibrated ? 'text-emerald-400' : 'text-red-400'
          }`}>
            Gap: {data.calibration_gap.toFixed(1)}%
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {data.total_attempts} attempts
          </Text>
        </View>
      );
    }
    return null;
  };

  const getCalibrationColor = (score: number) => {
    if (score >= 80) return { color: '#10b981', label: 'Well Calibrated' };
    if (score >= 60) return { color: '#f59e0b', label: 'Moderately Calibrated' };
    return { color: '#ef4444', label: 'Poorly Calibrated' };
  };

  const calibrationInfo = getCalibrationColor(calibrationMetrics?.overallCalibration || 0);

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
            <Target size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Confidence vs Reality Calibration</Text>
            <Text className="text-slate-400 text-sm">
              How well do your predictions match actual performance?
            </Text>
          </View>
        </View>

        {/* Calibration Score Badge */}
        <View className="items-center">
          <View 
            className="w-16 h-16 rounded-full border-4 items-center justify-center"
            style={{ borderColor: calibrationInfo.color }}
          >
            <Text className="text-lg font-bold" style={{ color: calibrationInfo.color }}>
              {(calibrationMetrics?.overallCalibration || 0).toFixed(0)}
            </Text>
            <Text className="text-slate-500 text-xs">%</Text>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Calibration
          </Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Calibration Curve (Predicted vs Actual Accuracy)
        </Text>
        
        <View style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="predicted_avg"
                stroke="#94a3b8"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Predicted Confidence %', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <YAxis 
                dataKey="actual_accuracy"
                stroke="#94a3b8"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Actual Accuracy %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Perfect Calibration Reference Line (y = x) */}
              <ReferenceLine 
                segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5,5"
                label={{ value: "Perfect Calibration", position: "topRight", style: { fill: '#64748b', fontSize: 12 } }}
              />
              
              {/* Data Points */}
              <Scatter dataKey="actual_accuracy">
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.is_well_calibrated ? '#10b981' : '#ef4444'}
                    r={6 + (entry.total_attempts / 2)} // Size based on number of attempts
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </View>
      </View>

      {/* Calibration Analysis Metrics */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <CheckCircle size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Well Calibrated</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {calibrationMetrics?.perfectlyCalibrated || 0}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            of {processedData.length} bins
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
            {calibrationMetrics?.overconfident || 0}
          </Text>
          <Text className="text-red-300/80 text-xs">
            bins above line
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Underconfident</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {calibrationMetrics?.underconfident || 0}
          </Text>
          <Text className="text-amber-300/80 text-xs">
            bins below line
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Total PYQs</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {calibrationMetrics?.totalAttempts || 0}
          </Text>
          <Text className="text-blue-300/80 text-xs">
            analyzed
          </Text>
        </MotiView>
      </View>

      {/* Calibration Insights */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Target size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Calibration Analysis</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold" style={{ color: calibrationInfo.color }}>
              Overall Calibration: {(calibrationMetrics?.overallCalibration || 0).toFixed(1)}%
            </Text>
            {' '}— {calibrationInfo.label.toLowerCase()}
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-emerald-400">Well-Calibrated Bins:</Text> {calibrationMetrics?.perfectlyCalibrated || 0} of {processedData.length}
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-red-400">Overconfidence Issues:</Text> {calibrationMetrics?.overconfident || 0} bins (predicted > actual + 15%)
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-amber-400">Underconfidence Issues:</Text> {calibrationMetrics?.underconfident || 0} bins (actual > predicted + 15%)
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4 mt-3">
            {(calibrationMetrics?.overallCalibration || 0) >= 80 
              ? "Excellent calibration! Your confidence predictions closely match actual performance. This indicates good self-awareness of your knowledge."
              : (calibrationMetrics?.overallCalibration || 0) >= 60
              ? "Moderate calibration with some prediction gaps. Work on better assessing your confidence levels before answering."
              : "Poor calibration detected. Significant gaps between predicted confidence and actual performance suggest need for better self-assessment skills."
            }
          </Text>
        </View>
      </MotiView>

      {/* Detailed Bin Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-4"
      >
        <View className="flex-row items-center mb-3">
          <TrendingUp size={16} color="#f59e0b" />
          <Text className="text-slate-100 font-semibold ml-2">Bin-by-Bin Breakdown</Text>
        </View>

        <View className="space-y-3">
          {processedData.map((bin, index) => (
            <View key={bin.binRange} className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-slate-100 font-medium">
                  {bin.binRange}% Confidence Range
                </Text>
                <View className="flex-row items-center">
                  {bin.is_well_calibrated ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <AlertTriangle size={16} color="#ef4444" />
                  )}
                  <Text className={`text-sm font-medium ml-1 ${
                    bin.is_well_calibrated ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {bin.is_well_calibrated ? 'Calibrated' : 'Miscalibrated'}
                  </Text>
                </View>
              </View>
              
              <View className="grid grid-cols-2 gap-4">
                <View>
                  <Text className="text-slate-400 text-xs">Predicted vs Actual</Text>
                  <Text className="text-slate-300 text-sm">
                    {bin.predicted_avg}% → {bin.actual_accuracy}%
                  </Text>
                </View>
                <View>
                  <Text className="text-slate-400 text-xs">Gap & Attempts</Text>
                  <Text className="text-slate-300 text-sm">
                    {bin.calibration_gap.toFixed(1)}% gap • {bin.total_attempts} attempts
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </MotiView>

      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1500 }}
        className="flex-row items-center justify-center mt-4 space-x-6 pt-4 border-t border-slate-600/30"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-slate-300 text-sm">Well Calibrated (≤15% gap)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
          <Text className="text-slate-300 text-sm">Miscalibrated (>15% gap)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-slate-500 rounded mr-2 border-dashed border border-slate-500" />
          <Text className="text-slate-300 text-sm">Perfect Calibration</Text>
        </View>
      </MotiView>
    </MotiView>
  );
}