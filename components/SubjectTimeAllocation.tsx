import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Clock, Target, TrendingUp, BarChart3, Radar, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import subjectTimeData from '@/data/subject-time-allocation-data.json';

interface SubjectData {
  name: string;
  pyqs_completed: number;
  hours_spent: number;
  percentage: number;
  recommended_percentage: number;
  balance_status: 'over' | 'under' | 'balanced';
}

type ViewMode = 'radar' | 'bar' | 'comparison';

export default function SubjectTimeAllocation() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [viewMode, setViewMode] = useState<ViewMode>('radar');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Process data
  const processData = (): SubjectData[] => {
    const totalPyqs = subjectTimeData.subjects.reduce((sum, s) => sum + s.pyqs_completed, 0);
    
    return subjectTimeData.subjects.map(subject => {
      const hours_spent = (subject.pyqs_completed * 4.5) / 60; // Convert to hours
      const percentage = (subject.pyqs_completed / totalPyqs) * 100;
      const recommended_percentage = (subjectTimeData.recommended_allocation[subject.name] || 0.2) * 100;
      
      // Determine balance status
      const deviation = Math.abs(percentage - recommended_percentage);
      let balance_status: 'over' | 'under' | 'balanced' = 'balanced';
      
      if (deviation > 5) {
        balance_status = percentage > recommended_percentage ? 'over' : 'under';
      }
      
      return {
        name: subject.name,
        pyqs_completed: subject.pyqs_completed,
        hours_spent,
        percentage,
        recommended_percentage,
        balance_status,
      };
    });
  };

  const subjectData = processData();
  const totalHours = subjectData.reduce((sum, s) => sum + s.hours_spent, 0);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Radar chart dimensions
  const radarSize = Math.min(width * 0.7, 300);
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize * 0.35;

  // Generate radar chart points
  const generateRadarPoints = (data: number[]) => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((value, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = (value / 100) * maxRadius; // Normalize to 0-100%
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, angle, radius };
    });
  };

  // Generate radar axis points (for labels)
  const generateAxisPoints = () => {
    const angleStep = (2 * Math.PI) / subjectData.length;
    return subjectData.map((subject, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = maxRadius + 30;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      return { x, y, subject: subject.name, angle };
    });
  };

  const actualPoints = generateRadarPoints(subjectData.map(s => s.percentage));
  const recommendedPoints = generateRadarPoints(subjectData.map(s => s.recommended_percentage));
  const axisPoints = generateAxisPoints();

  // Convert points to SVG path
  const pointsToPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
    return pathData;
  };

  const actualPath = pointsToPath(actualPoints);
  const recommendedPath = pointsToPath(recommendedPoints);

  // Bar chart dimensions
  const barChartHeight = 200;
  const barWidth = Math.max(40, (width - 120) / subjectData.length);

  const getSubjectColor = (subject: string, opacity: number = 1) => {
    const colors: Record<string, string> = {
      'Anatomy': `rgba(59, 130, 246, ${opacity})`, // blue
      'Physiology': `rgba(16, 185, 129, ${opacity})`, // emerald
      'Biochemistry': `rgba(139, 92, 246, ${opacity})`, // purple
      'Pathology': `rgba(239, 68, 68, ${opacity})`, // red
      'Pharmacology': `rgba(245, 158, 11, ${opacity})`, // amber
    };
    return colors[subject] || `rgba(100, 116, 139, ${opacity})`;
  };

  const getBalanceStatusColor = (status: string) => {
    switch (status) {
      case 'over': return { color: '#f59e0b', label: 'Over-invested' };
      case 'under': return { color: '#ef4444', label: 'Under-invested' };
      default: return { color: '#10b981', label: 'Well-balanced' };
    }
  };

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
            <Text className="text-xl font-bold text-slate-100">Subject Time Allocation</Text>
            <Text className="text-slate-400 text-sm">
              Study time balance • {totalHours.toFixed(1)} total hours
            </Text>
          </View>
        </View>

        {/* View Mode Tabs */}
        <View className="flex-row space-x-2">
          {(['radar', 'bar', 'comparison'] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              className={`px-3 py-2 rounded-lg ${
                viewMode === mode
                  ? 'bg-blue-600/30 border border-blue-500/50'
                  : 'bg-slate-700/40 border border-slate-600/30'
              }`}
            >
              <Text className={`text-xs font-medium ${
                viewMode === mode ? 'text-blue-300' : 'text-slate-400'
              }`}>
                {mode === 'radar' ? 'Radar' : mode === 'bar' ? 'Bar' : 'Compare'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        {/* Radar Chart View */}
        {viewMode === 'radar' && (
          <View className="items-center">
            <Text className="text-lg font-semibold text-slate-100 mb-4">Time Distribution Radar</Text>
            
            <View style={{ width: radarSize, height: radarSize }}>
              <Svg width={radarSize} height={radarSize}>
                <Defs>
                  <LinearGradient id="actualGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8" />
                  </LinearGradient>
                  <LinearGradient id="recommendedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                  </LinearGradient>
                </Defs>

                {/* Grid circles */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
                  <Circle
                    key={`grid-${index}`}
                    cx={centerX}
                    cy={centerY}
                    r={maxRadius * ratio}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                ))}

                {/* Axis lines */}
                {axisPoints.map((point, index) => (
                  <Line
                    key={`axis-${index}`}
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + maxRadius * Math.cos(point.angle)}
                    y2={centerY + maxRadius * Math.sin(point.angle)}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                ))}

                {/* Recommended allocation (background) */}
                <Path
                  d={recommendedPath}
                  fill="url(#recommendedGradient)"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                  strokeDasharray="5,5"
                />

                {/* Actual allocation */}
                <Path
                  d={actualPath}
                  fill="url(#actualGradient)"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />

                {/* Data points */}
                {actualPoints.map((point, index) => (
                  <Circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}

                {/* Subject labels */}
                {axisPoints.map((point, index) => (
                  <SvgText
                    key={`label-${index}`}
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#94a3b8"
                  >
                    {point.subject}
                  </SvgText>
                ))}
              </Svg>
            </View>

            {/* Radar Legend */}
            <View className="flex-row items-center justify-center space-x-6 mt-4">
              <View className="flex-row items-center">
                <View className="w-4 h-3 bg-blue-500 rounded mr-2" />
                <Text className="text-slate-300 text-sm">Actual Time</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-1 bg-emerald-500 rounded mr-2 border-dashed border border-emerald-500" />
                <Text className="text-slate-300 text-sm">Recommended</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bar Chart View */}
        {viewMode === 'bar' && (
          <View>
            <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">Absolute Hours by Subject</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <View style={{ width: Math.max(width - 88, subjectData.length * (barWidth + 20)), height: barChartHeight + 60 }}>
                <Svg width="100%" height={barChartHeight + 60}>
                  <Defs>
                    {subjectData.map((subject, index) => (
                      <LinearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={getSubjectColor(subject.name, 0.8)} />
                        <Stop offset="100%" stopColor={getSubjectColor(subject.name, 0.4)} />
                      </LinearGradient>
                    ))}
                  </Defs>

                  {/* Y-axis grid lines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
                    <Line
                      key={`grid-${index}`}
                      x1="40"
                      y1={20 + barChartHeight * ratio}
                      x2="100%"
                      y2={20 + barChartHeight * ratio}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Bars */}
                  {subjectData.map((subject, index) => {
                    const maxHours = Math.max(...subjectData.map(s => s.hours_spent));
                    const barHeight = (subject.hours_spent / maxHours) * barChartHeight;
                    const x = 60 + index * (barWidth + 20);
                    const y = 20 + barChartHeight - barHeight;

                    return (
                      <G key={subject.name}>
                        {/* Bar */}
                        <MotiView
                          from={{ height: 0 }}
                          animate={{ height: barHeight }}
                          transition={{ type: 'spring', duration: 800, delay: index * 150 + 400 }}
                        >
                          <Path
                            d={`M ${x} ${20 + barChartHeight} L ${x} ${y} L ${x + barWidth} ${y} L ${x + barWidth} ${20 + barChartHeight} Z`}
                            fill={`url(#barGradient-${index})`}
                            stroke={getSubjectColor(subject.name, 1)}
                            strokeWidth="2"
                          />
                        </MotiView>

                        {/* Value label */}
                        <SvgText
                          x={x + barWidth / 2}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="600"
                          fill="#f1f5f9"
                        >
                          {subject.hours_spent.toFixed(1)}h
                        </SvgText>

                        {/* Subject label */}
                        <SvgText
                          x={x + barWidth / 2}
                          y={barChartHeight + 40}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#94a3b8"
                        >
                          {subject.name}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Y-axis labels */}
                  <SvgText x="35" y="25" textAnchor="end" fontSize="10" fill="#64748b">
                    {Math.max(...subjectData.map(s => s.hours_spent)).toFixed(0)}h
                  </SvgText>
                  <SvgText x="35" y={barChartHeight + 25} textAnchor="end" fontSize="10" fill="#64748b">
                    0h
                  </SvgText>
                </Svg>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Comparison View */}
        {viewMode === 'comparison' && (
          <View>
            <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">Actual vs Recommended Balance</Text>
            
            <View className="space-y-3">
              {subjectData.map((subject, index) => {
                const statusInfo = getBalanceStatusColor(subject.balance_status);
                const deviation = subject.percentage - subject.recommended_percentage;

                return (
                  <MotiView
                    key={subject.name}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: index * 100 + 400 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: getSubjectColor(subject.name, 1) }}
                        />
                        <Text className="text-slate-100 font-semibold">{subject.name}</Text>
                      </View>
                      <View className="flex-row items-center">
                        {subject.balance_status === 'balanced' ? (
                          <CheckCircle size={16} color="#10b981" />
                        ) : (
                          <AlertTriangle size={16} color={statusInfo.color} />
                        )}
                        <Text 
                          className="text-sm font-medium ml-1"
                          style={{ color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-slate-300 text-sm">
                          Actual: {subject.percentage.toFixed(1)}% • 
                          Recommended: {subject.recommended_percentage.toFixed(1)}%
                        </Text>
                        <Text className="text-slate-400 text-xs">
                          {subject.hours_spent.toFixed(1)} hours • {subject.pyqs_completed} PYQs
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text 
                          className="text-sm font-bold"
                          style={{ color: deviation >= 0 ? '#f59e0b' : '#ef4444' }}
                        >
                          {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}%
                        </Text>
                        <Text className="text-xs text-slate-500">deviation</Text>
                      </View>
                    </View>

                    {/* Progress bars */}
                    <View className="mt-3 space-y-2">
                      <View>
                        <Text className="text-xs text-slate-400 mb-1">Actual vs Recommended</Text>
                        <View className="flex-row space-x-2">
                          <View className="flex-1 bg-slate-600 rounded-full h-2">
                            <View
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${(subject.percentage / Math.max(...subjectData.map(s => s.percentage))) * 100}%`,
                                backgroundColor: getSubjectColor(subject.name, 1)
                              }}
                            />
                          </View>
                          <View className="flex-1 bg-slate-600 rounded-full h-2">
                            <View
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ 
                                width: `${(subject.recommended_percentage / Math.max(...subjectData.map(s => s.percentage))) * 100}%`
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Summary Metrics */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={14} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Total Hours</Text>
          </View>
          <Text className="text-blue-200 text-lg font-bold">
            {totalHours.toFixed(1)}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <CheckCircle size={14} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Balanced</Text>
          </View>
          <Text className="text-emerald-200 text-lg font-bold">
            {subjectData.filter(s => s.balance_status === 'balanced').length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={14} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Over-invested</Text>
          </View>
          <Text className="text-amber-200 text-lg font-bold">
            {subjectData.filter(s => s.balance_status === 'over').length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={14} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Under-invested</Text>
          </View>
          <Text className="text-red-200 text-lg font-bold">
            {subjectData.filter(s => s.balance_status === 'under').length}
          </Text>
        </MotiView>
      </View>

      {/* Recommendations Panel */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Info size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Balance Recommendations</Text>
        </View>
        
        <View className="space-y-2">
          {subjectData
            .filter(s => s.balance_status !== 'balanced')
            .slice(0, 2)
            .map((subject, index) => {
              const statusInfo = getBalanceStatusColor(subject.balance_status);
              const deviation = Math.abs(subject.percentage - subject.recommended_percentage);
              
              return (
                <View key={subject.name} className="flex-row items-center">
                  <View 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <Text className="text-slate-300 text-sm flex-1">
                    <Text className="font-semibold">{subject.name}</Text>: 
                    {subject.balance_status === 'over' 
                      ? ` Reduce by ${deviation.toFixed(1)}% (${((deviation / 100) * totalHours).toFixed(1)}h)`
                      : ` Increase by ${deviation.toFixed(1)}% (${((deviation / 100) * totalHours).toFixed(1)}h)`
                    }
                  </Text>
                </View>
              );
            })}
          
          {subjectData.filter(s => s.balance_status !== 'balanced').length === 0 && (
            <View className="flex-row items-center">
              <CheckCircle size={16} color="#10b981" />
              <Text className="text-emerald-300 text-sm ml-2">
                Excellent balance! Your time allocation matches recommended distribution.
              </Text>
            </View>
          )}
        </View>
      </MotiView>
    </MotiView>
  );
}