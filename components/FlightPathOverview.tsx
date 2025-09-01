import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Calendar, Target, BarChart3, Filter, ChevronDown } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import missionData from '@/data/mentor-flight-path-data.json';

interface DayData {
  day: number;
  date: string;
  plannedPyqs: number;
  completedPyqs: number;
  completionRate: number;
  subjects: { [key: string]: { planned: number; completed: number } };
}

interface TrendData {
  slope: number;
  intercept: number;
  correlation: number;
}

type ViewMode = 'daily' | 'subject' | 'long-range';

export default function FlightPathOverview() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = 300;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Generate 30 days of data
  const generate30DayData = (): DayData[] => {
    const data: DayData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // 30 days ago

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Simulate daily missions based on existing data patterns
      const dayMissions = missionData.filter((_, index) => index % 7 === i % 7).slice(0, Math.floor(Math.random() * 3) + 2);
      
      const plannedPyqs = dayMissions.reduce((sum, mission) => sum + mission.planned_pyqs, 0);
      const completedPyqs = dayMissions.reduce((sum, mission) => sum + mission.completed_pyqs, 0);
      
      // Subject breakdown
      const subjects: { [key: string]: { planned: number; completed: number } } = {};
      dayMissions.forEach(mission => {
        if (!subjects[mission.subject]) {
          subjects[mission.subject] = { planned: 0, completed: 0 };
        }
        subjects[mission.subject].planned += mission.planned_pyqs;
        subjects[mission.subject].completed += mission.completed_pyqs;
      });

      data.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        plannedPyqs,
        completedPyqs,
        completionRate: plannedPyqs > 0 ? (completedPyqs / plannedPyqs) * 100 : 0,
        subjects,
      });
    }

    return data;
  };

  const [dayData] = useState<DayData[]>(generate30DayData());

  // Calculate linear regression for trend line
  const calculateTrend = (data: DayData[]): TrendData => {
    const n = data.length;
    const sumX = data.reduce((sum, d, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.completionRate, 0);
    const sumXY = data.reduce((sum, d, i) => sum + (i * d.completionRate), 0);
    const sumX2 = data.reduce((sum, d, i) => sum + (i * i), 0);
    const sumY2 = data.reduce((sum, d) => sum + (d.completionRate * d.completionRate), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const correlation = denominator === 0 ? 0 : Math.abs(numerator / denominator);

    return { slope, intercept, correlation };
  };

  const trend = calculateTrend(dayData);

  // Get filtered data based on view mode
  const getFilteredData = () => {
    switch (viewMode) {
      case 'subject':
        if (selectedSubject === 'all') return dayData;
        return dayData.map(day => ({
          ...day,
          plannedPyqs: day.subjects[selectedSubject]?.planned || 0,
          completedPyqs: day.subjects[selectedSubject]?.completed || 0,
          completionRate: day.subjects[selectedSubject] 
            ? (day.subjects[selectedSubject].completed / Math.max(day.subjects[selectedSubject].planned, 1)) * 100
            : 0,
        }));
      case 'long-range':
        // Show weekly averages
        const weeklyData: DayData[] = [];
        for (let week = 0; week < 4; week++) {
          const weekDays = dayData.slice(week * 7, (week + 1) * 7);
          const avgPlanned = weekDays.reduce((sum, d) => sum + d.plannedPyqs, 0) / weekDays.length;
          const avgCompleted = weekDays.reduce((sum, d) => sum + d.completedPyqs, 0) / weekDays.length;
          
          weeklyData.push({
            day: week + 1,
            date: weekDays[0]?.date || '',
            plannedPyqs: avgPlanned,
            completedPyqs: avgCompleted,
            completionRate: avgPlanned > 0 ? (avgCompleted / avgPlanned) * 100 : 0,
            subjects: {},
          });
        }
        return weeklyData;
      default:
        return dayData;
    }
  };

  const filteredData = getFilteredData();
  const maxPlanned = Math.max(...filteredData.map(d => d.plannedPyqs), 1);
  const maxCompleted = Math.max(...filteredData.map(d => d.completedPyqs), 1);
  const maxValue = Math.max(maxPlanned, maxCompleted);

  // Generate SVG paths
  const generateAreaPath = (dataKey: 'plannedPyqs' | 'completedPyqs') => {
    if (filteredData.length === 0) return '';
    
    const points = filteredData.map((d, i) => {
      const x = padding.left + (i / Math.max(filteredData.length - 1, 1)) * plotWidth;
      const y = padding.top + plotHeight - (d[dataKey] / maxValue) * plotHeight;
      return { x, y };
    });

    // Create area path (line + fill to bottom)
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${padding.left} ${padding.top + plotHeight} Z`;
    
    return areaPath;
  };

  const generateTrendLine = () => {
    if (filteredData.length < 2) return '';
    
    const startX = padding.left;
    const endX = padding.left + plotWidth;
    const startY = padding.top + plotHeight - ((trend.intercept) / 100) * plotHeight;
    const endY = padding.top + plotHeight - ((trend.slope * (filteredData.length - 1) + trend.intercept) / 100) * plotHeight;
    
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const plannedAreaPath = generateAreaPath('plannedPyqs');
  const completedAreaPath = generateAreaPath('completedPyqs');
  const trendLinePath = generateTrendLine();

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Get unique subjects for filter
  const subjects = Array.from(new Set(missionData.map(m => m.subject)));

  const getTrendColor = (slope: number) => {
    if (slope > 0.5) return { color: '#10b981', label: 'Strong Upward' };
    if (slope > 0) return { color: '#f59e0b', label: 'Moderate Upward' };
    if (slope > -0.5) return { color: '#ef4444', label: 'Slight Downward' };
    return { color: '#dc2626', label: 'Strong Downward' };
  };

  const trendInfo = getTrendColor(trend.slope);

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
            <Text className="text-xl font-bold text-slate-100">30-Day Flight Path Overview</Text>
            <Text className="text-slate-400 text-sm">
              Progress tracking • {viewMode === 'long-range' ? 'Weekly' : 'Daily'} view
            </Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          <Filter size={16} color="#94a3b8" />
          <Text className="text-slate-300 text-sm ml-2 capitalize">{viewMode}</Text>
          <ChevronDown 
            size={16} 
            color="#94a3b8" 
            style={{ 
              transform: [{ rotate: showFilters ? '180deg' : '0deg' }] 
            }} 
          />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', duration: 400 }}
          className="mb-6"
        >
          <View className="flex-row space-x-2 mb-4">
            {(['daily', 'subject', 'long-range'] as ViewMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === mode
                    ? 'bg-blue-600/30 border border-blue-500/50'
                    : 'bg-slate-700/40 border border-slate-600/30'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  viewMode === mode ? 'text-blue-300' : 'text-slate-400'
                }`}>
                  {mode === 'daily' ? 'Daily View' : 
                   mode === 'subject' ? 'Subject View' : 
                   'Long-Range View'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Subject Filter (only for subject view) */}
          {viewMode === 'subject' && (
            <View className="flex-row flex-wrap space-x-2">
              <Pressable
                onPress={() => setSelectedSubject('all')}
                className={`px-3 py-1 rounded-full mb-2 ${
                  selectedSubject === 'all'
                    ? 'bg-emerald-600/30 border border-emerald-500/50'
                    : 'bg-slate-700/40 border border-slate-600/30'
                }`}
              >
                <Text className={`text-xs ${
                  selectedSubject === 'all' ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  All Subjects
                </Text>
              </Pressable>
              {subjects.map((subject) => (
                <Pressable
                  key={subject}
                  onPress={() => setSelectedSubject(subject)}
                  className={`px-3 py-1 rounded-full mb-2 ${
                    selectedSubject === subject
                      ? 'bg-emerald-600/30 border border-emerald-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-xs ${
                    selectedSubject === subject ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {subject}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </MotiView>
      )}

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          <View style={{ width: Math.max(chartWidth, 600), height: chartHeight }}>
            <Svg width="100%" height={chartHeight}>
              <Defs>
                {/* Area gradients */}
                <LinearGradient id="plannedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </LinearGradient>
                <LinearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </LinearGradient>
                
                {/* Trend line gradient */}
                <LinearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={trendInfo.color} stopOpacity="0.8" />
                  <Stop offset="100%" stopColor={trendInfo.color} stopOpacity="1" />
                </LinearGradient>

                {/* Animated flight gradient */}
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
                {maxValue}
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

              {/* Planned PYQs Area */}
              <Path
                d={plannedAreaPath}
                fill="url(#plannedGradient)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeOpacity="0.8"
              />

              {/* Completed PYQs Area */}
              <Path
                d={completedAreaPath}
                fill="url(#completedGradient)"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Trend Line */}
              <Path
                d={trendLinePath}
                stroke="url(#trendGradient)"
                strokeWidth="3"
                strokeDasharray="8,4"
                strokeLinecap="round"
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
              {filteredData.map((point, index) => {
                const x = padding.left + (index / Math.max(filteredData.length - 1, 1)) * plotWidth;
                const yPlanned = padding.top + plotHeight - (point.plannedPyqs / maxValue) * plotHeight;
                const yCompleted = padding.top + plotHeight - (point.completedPyqs / maxValue) * plotHeight;

                return (
                  <React.Fragment key={point.day}>
                    {/* Planned Point */}
                    <Circle
                      cx={x}
                      cy={yPlanned}
                      r="3"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    
                    {/* Completed Point */}
                    <Circle
                      cx={x}
                      cy={yCompleted}
                      r="4"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Day Label */}
                    {(index % Math.max(1, Math.floor(filteredData.length / 8)) === 0) && (
                      <SvgText
                        x={x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                      >
                        {viewMode === 'long-range' ? `W${point.day}` : `D${point.day}`}
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
      </View>

      {/* Metrics Dashboard */}
      <View className="space-y-4">
        {/* Trend Analysis */}
        <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <TrendingUp size={16} color={trendInfo.color} />
              <Text className="text-slate-100 font-semibold ml-2">Trend Analysis</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-slate-400 mr-2">Correlation:</Text>
              <Text 
                className="font-bold text-sm"
                style={{ color: trendInfo.color }}
              >
                {(trend.correlation * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-slate-300 text-sm mb-1">
                Trend Direction: <Text className="font-bold" style={{ color: trendInfo.color }}>
                  {trendInfo.label}
                </Text>
              </Text>
              <Text className="text-slate-400 text-xs">
                Slope: {trend.slope.toFixed(3)} • Intercept: {trend.intercept.toFixed(1)}%
              </Text>
            </View>

            {/* Correlation Dial */}
            <View className="ml-4">
              <View className="relative w-16 h-16">
                <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: `${trend.correlation * 360}deg` }}
                  transition={{ type: 'spring', duration: 1200, delay: 600 }}
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: trendInfo.color,
                    borderRightColor: trend.correlation > 0.25 ? trendInfo.color : 'transparent',
                    borderBottomColor: trend.correlation > 0.5 ? trendInfo.color : 'transparent',
                    borderLeftColor: trend.correlation > 0.75 ? trendInfo.color : 'transparent',
                  }}
                />
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-lg font-bold" style={{ color: trendInfo.color }}>
                    {(trend.correlation * 100).toFixed(0)}
                  </Text>
                  <Text className="text-slate-500 text-xs">%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 800 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Calendar size={14} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Days</Text>
            </View>
            <Text className="text-blue-200 text-lg font-bold">
              {filteredData.length}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 900 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Target size={14} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Avg Completion</Text>
            </View>
            <Text className="text-emerald-200 text-lg font-bold">
              {(filteredData.reduce((sum, d) => sum + d.completionRate, 0) / Math.max(filteredData.length, 1)).toFixed(1)}%
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <BarChart3 size={14} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Total PYQs</Text>
            </View>
            <Text className="text-amber-200 text-lg font-bold">
              {filteredData.reduce((sum, d) => sum + d.completedPyqs, 0)}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1100 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={14} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Best Day</Text>
            </View>
            <Text className="text-purple-200 text-lg font-bold">
              {filteredData.reduce((max, d) => d.completionRate > max.completionRate ? d : max, filteredData[0] || { day: 0 }).day}
            </Text>
          </MotiView>
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-center space-x-6 pt-4 border-t border-slate-600/30">
          <View className="flex-row items-center">
            <View className="w-4 h-3 bg-blue-500/60 rounded mr-2" />
            <Text className="text-slate-300 text-sm">Planned PYQs</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-3 bg-emerald-500 rounded mr-2" />
            <Text className="text-slate-300 text-sm">Completed PYQs</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-1 rounded-full mr-2" style={{ backgroundColor: trendInfo.color }} />
            <Text className="text-slate-300 text-sm">Trend Line</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}