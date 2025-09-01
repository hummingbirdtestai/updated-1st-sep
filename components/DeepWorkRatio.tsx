import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Brain, Clock, Target, TrendingUp, Focus, AlertTriangle } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, G, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import studySessionsData from '@/data/study-sessions-data.json';

interface SessionData {
  date: string;
  pyqs_completed: number;
  deep_blocks: number;
  distracted_blocks: number;
}

interface DeepWorkMetrics {
  deepWorkRatio: number;
  totalDeepTime: number;
  totalDistractedTime: number;
  totalTime: number;
  averageSessionLength: number;
  focusScore: number;
}

export default function DeepWorkRatio() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedDay, setSelectedDay] = useState<SessionData | null>(null);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.01) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Calculate metrics for a given day
  const calculateDayMetrics = (session: SessionData): DeepWorkMetrics => {
    const totalBlocks = session.deep_blocks + session.distracted_blocks;
    const totalDeepTime = session.deep_blocks * 4.5; // minutes
    const totalDistractedTime = session.distracted_blocks * 4.5;
    const totalTime = totalDeepTime + totalDistractedTime;
    const deepWorkRatio = totalTime > 0 ? (totalDeepTime / totalTime) * 100 : 0;
    const averageSessionLength = totalBlocks > 0 ? totalTime / totalBlocks : 0;
    const focusScore = Math.min(100, deepWorkRatio * 1.2); // Boost score slightly for motivation

    return {
      deepWorkRatio,
      totalDeepTime,
      totalDistractedTime,
      totalTime,
      averageSessionLength,
      focusScore,
    };
  };

  // Get today's data (last entry)
  const todaySession = studySessionsData.sessions[studySessionsData.sessions.length - 1];
  const todayMetrics = calculateDayMetrics(todaySession);

  // Calculate 7-day trend
  const last7Days = studySessionsData.sessions.slice(-7);
  const trendData = last7Days.map((session, index) => {
    const metrics = calculateDayMetrics(session);
    return {
      day: index + 1,
      date: session.date,
      ratio: metrics.deepWorkRatio,
      deepTime: metrics.totalDeepTime,
      distractedTime: metrics.totalDistractedTime,
    };
  });

  // Calculate trend slope
  const calculateTrendSlope = () => {
    const n = trendData.length;
    const sumX = trendData.reduce((sum, _, i) => sum + i, 0);
    const sumY = trendData.reduce((sum, d) => sum + d.ratio, 0);
    const sumXY = trendData.reduce((sum, d, i) => sum + (i * d.ratio), 0);
    const sumX2 = trendData.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const trendSlope = calculateTrendSlope();
  const trendDirection = trendSlope > 0.5 ? 'improving' : trendSlope > -0.5 ? 'stable' : 'declining';

  // Donut chart dimensions
  const donutSize = 160;
  const strokeWidth = 20;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const deepWorkOffset = circumference - (todayMetrics.deepWorkRatio / 100) * circumference;

  // Line chart dimensions
  const chartWidth = Math.min(width - 64, 400);
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Generate line path
  const generateLinePath = () => {
    if (trendData.length === 0) return '';
    
    const maxRatio = Math.max(...trendData.map(d => d.ratio), 100);
    const points = trendData.map((d, i) => {
      const x = padding.left + (i / Math.max(trendData.length - 1, 1)) * plotWidth;
      const y = padding.top + plotHeight - (d.ratio / maxRatio) * plotHeight;
      return { x, y };
    });

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const linePath = generateLinePath();

  const getDeepWorkColor = (ratio: number) => {
    if (ratio >= 80) return { color: '#10b981', label: 'Excellent Focus' };
    if (ratio >= 60) return { color: '#f59e0b', label: 'Good Focus' };
    return { color: '#ef4444', label: 'Needs Improvement' };
  };

  const deepWorkInfo = getDeepWorkColor(todayMetrics.deepWorkRatio);

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
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3 shadow-lg">
          <Brain size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-100">Deep Work Analysis</Text>
          <Text className="text-slate-400 text-sm">
            Focus quality • Last 7 days trend
          </Text>
        </View>
        
        {/* Today's Score Badge */}
        <View className="items-center">
          <View 
            className="w-16 h-16 rounded-full border-4 items-center justify-center"
            style={{ borderColor: deepWorkInfo.color }}
          >
            <Text className="text-lg font-bold" style={{ color: deepWorkInfo.color }}>
              {todayMetrics.deepWorkRatio.toFixed(0)}%
            </Text>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Today's Focus
          </Text>
        </View>
      </View>

      {/* Main Content Grid */}
      <View className={`${isMobile ? 'space-y-6' : 'flex-row space-x-6'}`}>
        {/* Donut Chart - Today's Breakdown */}
        <View className={`${isMobile ? 'items-center' : 'flex-1 items-center'}`}>
          <Text className="text-lg font-semibold text-slate-100 mb-4">Today's Session Breakdown</Text>
          
          <View className="relative items-center justify-center">
            <Svg width={donutSize} height={donutSize}>
              <Defs>
                <LinearGradient id="deepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="distractedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#f87171" stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {/* Background Circle */}
              <Circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                fill="none"
                stroke="#374151"
                strokeWidth={strokeWidth}
              />

              {/* Deep Work Arc */}
              <Circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                fill="none"
                stroke="url(#deepGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={deepWorkOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
              />

              {/* Center Text */}
              <SvgText
                x={donutSize / 2}
                y={donutSize / 2 - 8}
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill={deepWorkInfo.color}
              >
                {todayMetrics.deepWorkRatio.toFixed(0)}%
              </SvgText>
              <SvgText
                x={donutSize / 2}
                y={donutSize / 2 + 12}
                textAnchor="middle"
                fontSize="12"
                fill="#94a3b8"
              >
                Deep Work
              </SvgText>
            </Svg>

            {/* Legend */}
            <View className="mt-4 space-y-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-slate-300 text-sm">
                  Deep Work: {todayMetrics.totalDeepTime.toFixed(0)}m
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
                <Text className="text-slate-300 text-sm">
                  Distracted: {todayMetrics.totalDistractedTime.toFixed(0)}m
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7-Day Trend Chart */}
        <View className={`${isMobile ? '' : 'flex-1'}`}>
          <Text className="text-lg font-semibold text-slate-100 mb-4">7-Day Focus Trend</Text>
          
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              <View style={{ width: Math.max(chartWidth, 350), height: chartHeight }}>
                <Svg width="100%" height={chartHeight}>
                  <Defs>
                    <LinearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                    </LinearGradient>
                    
                    {/* Animated gradient */}
                    <LinearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset={`${(animationProgress * 100) - 10}%`} stopColor="transparent" stopOpacity="0" />
                      <Stop offset={`${animationProgress * 100}%`} stopColor="#06b6d4" stopOpacity="1" />
                      <Stop offset={`${(animationProgress * 100) + 10}%`} stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>

                  {/* Grid Lines */}
                  {[25, 50, 75, 100].map((value, index) => {
                    const y = padding.top + plotHeight - (value / 100) * plotHeight;
                    return (
                      <React.Fragment key={value}>
                        <Path
                          d={`M ${padding.left} ${y} L ${padding.left + plotWidth} ${y}`}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        <SvgText
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {value}%
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Trend Line */}
                  <Path
                    d={linePath}
                    stroke="url(#trendGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Animated Flight Line */}
                  <Path
                    d={`M ${padding.left} ${padding.top + plotHeight / 2} L ${padding.left + plotWidth} ${padding.top + plotHeight / 2}`}
                    stroke="url(#animatedGradient)"
                    strokeWidth="2"
                  />

                  {/* Data Points */}
                  {trendData.map((point, index) => {
                    const x = padding.left + (index / Math.max(trendData.length - 1, 1)) * plotWidth;
                    const y = padding.top + plotHeight - (point.ratio / 100) * plotHeight;

                    return (
                      <React.Fragment key={point.date}>
                        {/* Point Circle */}
                        <Circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={point.ratio >= 80 ? "#10b981" : point.ratio >= 60 ? "#f59e0b" : "#ef4444"}
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
                          D{point.day}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}
                </Svg>
              </View>
            </ScrollView>
          </View>

          {/* Trend Analysis */}
          <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <TrendingUp size={16} color={
                  trendDirection === 'improving' ? '#10b981' : 
                  trendDirection === 'stable' ? '#f59e0b' : '#ef4444'
                } />
                <Text className="text-slate-100 font-semibold ml-2">7-Day Trend</Text>
              </View>
              <Text 
                className="font-bold text-sm"
                style={{ 
                  color: trendDirection === 'improving' ? '#10b981' : 
                         trendDirection === 'stable' ? '#f59e0b' : '#ef4444'
                }}
              >
                {trendDirection === 'improving' ? '📈 Improving' : 
                 trendDirection === 'stable' ? '➡️ Stable' : '📉 Declining'}
              </Text>
            </View>
            <Text className="text-slate-400 text-xs">
              Slope: {trendSlope.toFixed(3)} • 
              {trendDirection === 'improving' && ' Your focus is getting stronger!'}
              {trendDirection === 'stable' && ' Maintaining consistent focus levels.'}
              {trendDirection === 'declining' && ' Consider reviewing your study environment.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics Dashboard */}
      <View className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Focus size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Deep Blocks</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {todaySession.deep_blocks}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            {todayMetrics.totalDeepTime.toFixed(0)} minutes
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Distracted</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {todaySession.distracted_blocks}
          </Text>
          <Text className="text-red-300/80 text-xs">
            {todayMetrics.totalDistractedTime.toFixed(0)} minutes
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Total Time</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {todayMetrics.totalTime.toFixed(0)}m
          </Text>
          <Text className="text-blue-300/80 text-xs">
            {todaySession.pyqs_completed} PYQs completed
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Focus Score</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {todayMetrics.focusScore.toFixed(0)}
          </Text>
          <Text className="text-purple-300/80 text-xs">
            {deepWorkInfo.label}
          </Text>
        </MotiView>
      </View>

      {/* Insights Panel */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Brain size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Deep Work Insights</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold" style={{ color: deepWorkInfo.color }}>
              {todayMetrics.deepWorkRatio.toFixed(1)}% Deep Work Ratio
            </Text>
            {' '}— {deepWorkInfo.label.toLowerCase()}
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4">
            {todayMetrics.deepWorkRatio >= 80 
              ? "Excellent focus! You're in the zone with minimal distractions. This level of concentration is ideal for complex medical concepts."
              : todayMetrics.deepWorkRatio >= 60
              ? "Good focus with some interruptions. Consider using techniques like the Pomodoro method to maintain longer deep work sessions."
              : "High distraction levels detected. Try eliminating notifications, finding a quieter study space, or breaking study sessions into shorter, more focused blocks."
            }
          </Text>

          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-600/30">
            <Text className="text-slate-400 text-xs">
              Average session: {todayMetrics.averageSessionLength.toFixed(1)} minutes
            </Text>
            <Text className="text-slate-400 text-xs">
              {todaySession.deep_blocks + todaySession.distracted_blocks} total blocks
            </Text>
          </View>
        </View>
      </MotiView>
    </MotiView>
  );
}