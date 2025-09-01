import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Clock, Target, Zap, X, Info } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import performanceTimeData from '@/data/performance-time-data.json';

interface SubjectData {
  name: string;
  pyqs_completed: number;
  accuracy: number;
  hours_spent: number;
  efficiency_score: number;
  performance_category: 'high-efficiency' | 'balanced' | 'time-heavy' | 'needs-focus';
}

interface TooltipData {
  subject: SubjectData;
  position: { x: number; y: number };
}

export default function PerformanceTimeTradeoff() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Process data
  const processData = (): SubjectData[] => {
    return performanceTimeData.subjects.map(subject => {
      const hours_spent = (subject.pyqs_completed * 4.5) / 60;
      const efficiency_score = subject.accuracy / (hours_spent / 10); // Accuracy per 10 hours
      
      // Categorize performance
      let performance_category: SubjectData['performance_category'] = 'balanced';
      if (subject.accuracy >= 70 && hours_spent <= 100) {
        performance_category = 'high-efficiency';
      } else if (subject.accuracy < 65 && hours_spent > 120) {
        performance_category = 'time-heavy';
      } else if (subject.accuracy < 60) {
        performance_category = 'needs-focus';
      }

      return {
        name: subject.name,
        pyqs_completed: subject.pyqs_completed,
        accuracy: subject.accuracy,
        hours_spent,
        efficiency_score,
        performance_category,
      };
    });
  };

  const subjectData = processData();

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 600);
  const chartHeight = 400;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scales
  const maxHours = Math.max(...subjectData.map(s => s.hours_spent)) * 1.1;
  const maxAccuracy = 100;
  const maxPyqs = Math.max(...subjectData.map(s => s.pyqs_completed));

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Get position for data point
  const getPosition = (subject: SubjectData) => {
    const x = padding.left + (subject.hours_spent / maxHours) * plotWidth;
    const y = padding.top + plotHeight - (subject.accuracy / maxAccuracy) * plotHeight;
    return { x, y };
  };

  // Get bubble size based on PYQs
  const getBubbleSize = (pyqs: number) => {
    const minSize = 8;
    const maxSize = 24;
    const normalized = pyqs / maxPyqs;
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get subject color
  const getSubjectColor = (category: string, opacity: number = 1) => {
    const colors: Record<string, string> = {
      'high-efficiency': `rgba(16, 185, 129, ${opacity})`, // emerald
      'balanced': `rgba(59, 130, 246, ${opacity})`, // blue
      'time-heavy': `rgba(245, 158, 11, ${opacity})`, // amber
      'needs-focus': `rgba(239, 68, 68, ${opacity})`, // red
    };
    return colors[category] || `rgba(100, 116, 139, ${opacity})`;
  };

  // Handle bubble press
  const handleBubblePress = (subject: SubjectData, position: { x: number; y: number }) => {
    setSelectedTooltip({ subject, position });
  };

  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    const n = subjectData.length;
    const sumX = subjectData.reduce((sum, s) => sum + s.hours_spent, 0);
    const sumY = subjectData.reduce((sum, s) => sum + s.accuracy, 0);
    const sumXY = subjectData.reduce((sum, s) => sum + (s.hours_spent * s.accuracy), 0);
    const sumX2 = subjectData.reduce((sum, s) => sum + (s.hours_spent * s.hours_spent), 0);
    const sumY2 = subjectData.reduce((sum, s) => sum + (s.accuracy * s.accuracy), 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationStrength = Math.abs(correlation);

  const getCorrelationInfo = (corr: number) => {
    const strength = Math.abs(corr);
    if (strength >= 0.7) return { color: '#10b981', label: 'Strong', description: 'Time strongly correlates with accuracy' };
    if (strength >= 0.4) return { color: '#f59e0b', label: 'Moderate', description: 'Some correlation between time and accuracy' };
    return { color: '#ef4444', label: 'Weak', description: 'Time and accuracy are weakly correlated' };
  };

  const correlationInfo = getCorrelationInfo(correlation);

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
            <Text className="text-xl font-bold text-slate-100">Performance vs Time Trade-off</Text>
            <Text className="text-slate-400 text-sm">
              Study efficiency analysis • Bubble size = PYQs attempted
            </Text>
          </View>
        </View>

        {/* Correlation Score */}
        <View className="items-center">
          <View className="relative w-16 h-16">
            <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: `${correlationStrength * 360}deg` }}
              transition={{ type: 'spring', duration: 1200, delay: 600 }}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: correlationInfo.color,
                borderRightColor: correlationStrength > 0.25 ? correlationInfo.color : 'transparent',
                borderBottomColor: correlationStrength > 0.5 ? correlationInfo.color : 'transparent',
                borderLeftColor: correlationStrength > 0.75 ? correlationInfo.color : 'transparent',
              }}
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-lg font-bold" style={{ color: correlationInfo.color }}>
                {(correlationStrength * 100).toFixed(0)}
              </Text>
              <Text className="text-slate-500 text-xs">%</Text>
            </View>
          </View>
          <Text className="text-xs text-slate-400 mt-1 text-center">
            Correlation
          </Text>
        </View>
      </View>

      {/* Scatter Chart */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          <View style={{ width: Math.max(chartWidth, 500), height: chartHeight }}>
            <Svg width="100%" height={chartHeight}>
              <Defs>
                {/* Gradients for different performance categories */}
                <LinearGradient id="highEfficiencyGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="balancedGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="timeHeavyGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="needsFocusGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                </LinearGradient>

                {/* Animated gradient */}
                <LinearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset={`${(animationProgress * 100) - 10}%`} stopColor="transparent" stopOpacity="0" />
                  <Stop offset={`${animationProgress * 100}%`} stopColor="#06b6d4" stopOpacity="1" />
                  <Stop offset={`${(animationProgress * 100) + 10}%`} stopColor="transparent" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              {/* Vertical grid lines (hours) */}
              {[25, 50, 75, 100, 125, 150].map((hours, index) => {
                if (hours > maxHours) return null;
                const x = padding.left + (hours / maxHours) * plotWidth;
                return (
                  <React.Fragment key={`v-grid-${hours}`}>
                    <Line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + plotHeight}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      strokeDasharray="2,2"
                    />
                    <SvgText
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {hours}h
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Horizontal grid lines (accuracy) */}
              {[20, 40, 60, 80, 100].map((accuracy, index) => {
                const y = padding.top + plotHeight - (accuracy / maxAccuracy) * plotHeight;
                return (
                  <React.Fragment key={`h-grid-${accuracy}`}>
                    <Line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
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
                      {accuracy}%
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Animated trend line */}
              <Line
                x1={padding.left}
                y1={padding.top + plotHeight / 2}
                x2={padding.left + plotWidth}
                y2={padding.top + plotHeight / 2}
                stroke="url(#animatedGradient)"
                strokeWidth="2"
              />

              {/* Data Bubbles */}
              {subjectData.map((subject, index) => {
                const position = getPosition(subject);
                const bubbleSize = getBubbleSize(subject.pyqs_completed);
                const color = getSubjectColor(subject.performance_category, 1);
                const gradientId = `${subject.performance_category}Gradient`;

                return (
                  <G key={subject.name}>
                    {/* Glow effect */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={bubbleSize + 8}
                      fill={`url(#${gradientId})`}
                      opacity="0.6"
                    />
                    
                    {/* Main bubble */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={bubbleSize}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      onPress={() => handleBubblePress(subject, position)}
                    />

                    {/* Subject label */}
                    <SvgText
                      x={position.x}
                      y={position.y + bubbleSize + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#94a3b8"
                    >
                      {subject.name}
                    </SvgText>

                    {/* Accuracy label inside bubble */}
                    <SvgText
                      x={position.x}
                      y={position.y + 2}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {subject.accuracy}%
                    </SvgText>
                  </G>
                );
              })}

              {/* Axis Labels */}
              <SvgText
                x={padding.left + plotWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#94a3b8"
              >
                Study Hours
              </SvgText>
              <SvgText
                x={20}
                y={padding.top + plotHeight / 2}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#94a3b8"
                transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
              >
                Accuracy %
              </SvgText>
            </Svg>
          </View>
        </ScrollView>
      </View>

      {/* Tooltip */}
      {selectedTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
          style={{
            left: Math.min(selectedTooltip.position.x - 80, chartWidth - 160),
            top: Math.max(selectedTooltip.position.y - 120, 20),
            width: 160,
            shadowColor: getSubjectColor(selectedTooltip.subject.performance_category),
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setSelectedTooltip(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
          >
            <X size={12} color="#94a3b8" />
          </Pressable>

          {/* Tooltip Content */}
          <View className="pr-6">
            <Text className="text-slate-100 font-bold text-sm mb-2">
              {selectedTooltip.subject.name}
            </Text>
            
            <View className="space-y-2">
              <View>
                <Text className="text-slate-400 text-xs">Study Hours</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {selectedTooltip.subject.hours_spent.toFixed(1)}h
                </Text>
              </View>
              
              <View>
                <Text className="text-slate-400 text-xs">Accuracy</Text>
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: getSubjectColor(selectedTooltip.subject.performance_category) }}
                >
                  {selectedTooltip.subject.accuracy}%
                </Text>
              </View>
              
              <View>
                <Text className="text-slate-400 text-xs">PYQs Attempted</Text>
                <Text className="text-slate-300 text-sm">
                  {selectedTooltip.subject.pyqs_completed}
                </Text>
              </View>
              
              <View>
                <Text className="text-slate-400 text-xs">Efficiency</Text>
                <Text className="text-slate-300 text-sm">
                  {selectedTooltip.subject.efficiency_score.toFixed(1)} acc/10h
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      )}

      {/* Performance Categories Legend */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-emerald-400 font-semibold text-sm">High Efficiency</Text>
          </View>
          <Text className="text-emerald-300/80 text-xs">
            ≥70% accuracy, ≤100h
          </Text>
          <Text className="text-emerald-200 text-lg font-bold">
            {subjectData.filter(s => s.performance_category === 'high-efficiency').length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
            <Text className="text-blue-400 font-semibold text-sm">Balanced</Text>
          </View>
          <Text className="text-blue-300/80 text-xs">
            Moderate time & accuracy
          </Text>
          <Text className="text-blue-200 text-lg font-bold">
            {subjectData.filter(s => s.performance_category === 'balanced').length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
            <Text className="text-amber-400 font-semibold text-sm">Time Heavy</Text>
          </View>
          <Text className="text-amber-300/80 text-xs">
            &lt;65% accuracy, &gt;120h
          </Text>
          <Text className="text-amber-200 text-lg font-bold">
            {subjectData.filter(s => s.performance_category === 'time-heavy').length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
            <Text className="text-red-400 font-semibold text-sm">Needs Focus</Text>
          </View>
          <Text className="text-red-300/80 text-xs">
            &lt;60% accuracy
          </Text>
          <Text className="text-red-200 text-lg font-bold">
            {subjectData.filter(s => s.performance_category === 'needs-focus').length}
          </Text>
        </MotiView>
      </View>

      {/* Correlation Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Target size={16} color={correlationInfo.color} />
            <Text className="text-slate-100 font-semibold ml-2">Time-Performance Analysis</Text>
          </View>
          <Text 
            className="font-bold text-sm"
            style={{ color: correlationInfo.color }}
          >
            {correlationInfo.label} Correlation
          </Text>
        </View>

        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            Correlation Coefficient: <Text className="font-bold" style={{ color: correlationInfo.color }}>
              {correlation.toFixed(3)}
            </Text>
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4">
            {correlationInfo.description}
            {correlation > 0 
              ? " More study time generally leads to better accuracy."
              : " Study time and accuracy show inverse relationship - focus on quality over quantity."
            }
          </Text>

          {/* Efficiency Insights */}
          <View className="mt-3 pt-3 border-t border-slate-600/30">
            <Text className="text-slate-300 text-sm mb-2">
              <Text className="font-bold text-cyan-400">Most Efficient:</Text> {
                subjectData.reduce((max, s) => s.efficiency_score > max.efficiency_score ? s : max).name
              }
            </Text>
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Optimization:</Text> {
                subjectData.reduce((min, s) => s.efficiency_score < min.efficiency_score ? s : min).name
              }
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Chart Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1300 }}
        className="flex-row items-center justify-center mt-4 space-x-6 pt-4 border-t border-slate-600/30"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-slate-400 mr-2" />
          <Text className="text-slate-300 text-sm">Bubble size = PYQs attempted</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-cyan-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">Trend indicator</Text>
        </View>
      </MotiView>
    </MotiView>
  );
}