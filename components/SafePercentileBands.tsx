import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Target, TrendingUp, Award, X, Info } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface SubjectData {
  subject: string;
  pyqs_completed: number;
  hours_spent: number;
  percentile_band: string;
}

interface TooltipData {
  subject: SubjectData;
  position: { x: number; y: number };
}

interface SafePercentileBandsProps {
  data?: SubjectData[];
}

// Mock data
const mockData: SubjectData[] = [
  { "subject": "Physiology", "pyqs_completed": 1200, "hours_spent": 90, "percentile_band": "52nd" },
  { "subject": "Biochemistry", "pyqs_completed": 800, "hours_spent": 60, "percentile_band": "68th" },
  { "subject": "Pathology", "pyqs_completed": 400, "hours_spent": 30, "percentile_band": "35th" }
];

function SubjectTooltip({ subject, position, onClose }: { 
  subject: SubjectData; 
  position: { x: number; y: number }; 
  onClose: () => void; 
}) {
  const percentileValue = parseInt(subject.percentile_band.replace(/\D/g, ''));
  const getBandColor = (percentile: number) => {
    if (percentile >= 75) return { color: '#10b981', label: 'Top 25%' };
    if (percentile >= 25) return { color: '#f59e0b', label: 'Mid 50%' };
    return { color: '#ef4444', label: 'Bottom 25%' };
  };

  const bandInfo = getBandColor(percentileValue);
  const expectedTime = subject.pyqs_completed * 4.5 / 60; // Expected hours
  const efficiency = expectedTime > 0 ? (subject.hours_spent / expectedTime) : 1;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 160,
        width: 240,
        shadowColor: bandInfo.color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
      >
        <X size={12} color="#94a3b8" />
      </Pressable>

      {/* Subject Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-base mb-1">
          {subject.subject}
        </Text>
        <Text 
          className="text-sm font-semibold mb-3"
          style={{ color: bandInfo.color }}
        >
          {subject.percentile_band} Percentile • {bandInfo.label}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">PYQs Completed</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              {subject.pyqs_completed.toLocaleString()}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Hours Spent</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              {subject.hours_spent}h
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Expected Time</Text>
            <Text className="text-slate-300 text-xs">
              {expectedTime.toFixed(1)}h
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Efficiency</Text>
            <Text className={`text-xs font-semibold ${
              efficiency <= 1.1 ? 'text-emerald-400' : 
              efficiency <= 1.3 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {efficiency <= 1.1 ? 'Efficient' : 
               efficiency <= 1.3 ? 'On Track' : 'Slow'}
            </Text>
          </View>
        </View>

        {/* Performance Band */}
        <View className="mt-3 pt-3 border-t border-slate-600/30">
          <View 
            className="px-3 py-1 rounded-full border"
            style={{ 
              backgroundColor: `${bandInfo.color}20`,
              borderColor: `${bandInfo.color}50`
            }}
          >
            <Text 
              className="text-xs font-bold text-center"
              style={{ color: bandInfo.color }}
            >
              {bandInfo.label}
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function SafePercentileBands({ data = mockData }: SafePercentileBandsProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Chart dimensions
  const chartSize = Math.min(width * 0.8, 400);
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const maxRadius = chartSize * 0.4;

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Get band radius based on percentile
  const getBandRadius = (percentile: number) => {
    if (percentile >= 75) return maxRadius * 0.3; // Top 25% - inner ring
    if (percentile >= 25) return maxRadius * 0.65; // Mid 50% - middle ring
    return maxRadius * 0.95; // Bottom 25% - outer ring
  };

  // Get band color based on percentile
  const getBandColor = (percentile: number) => {
    if (percentile >= 75) return { color: '#10b981', glow: 'emeraldGlow', label: 'Top 25%' };
    if (percentile >= 25) return { color: '#f59e0b', glow: 'amberGlow', label: 'Mid 50%' };
    return { color: '#ef4444', glow: 'redGlow', label: 'Bottom 25%' };
  };

  // Get subject position on the ring
  const getSubjectPosition = (subject: SubjectData, index: number) => {
    const percentileValue = parseInt(subject.percentile_band.replace(/\D/g, ''));
    const radius = getBandRadius(percentileValue);
    
    // Distribute subjects around the ring based on their index
    const angle = (index / data.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y, radius, percentileValue };
  };

  // Handle subject press
  const handleSubjectPress = (subject: SubjectData, position: { x: number; y: number }) => {
    setSelectedTooltip({ subject, position });
  };

  // Calculate summary metrics
  const averagePercentile = data.reduce((sum, s) => sum + parseInt(s.percentile_band.replace(/\D/g, '')), 0) / data.length;
  const totalPYQs = data.reduce((sum, s) => sum + s.pyqs_completed, 0);
  const totalHours = data.reduce((sum, s) => sum + s.hours_spent, 0);
  const topPerformers = data.filter(s => parseInt(s.percentile_band.replace(/\D/g, '')) >= 75).length;
  const needsImprovement = data.filter(s => parseInt(s.percentile_band.replace(/\D/g, '')) < 25).length;

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
          <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Target size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Safe Percentile Bands</Text>
            <Text className="text-sm text-slate-400">
              Performance normalized by time progress • {data.length} subjects tracked
            </Text>
          </View>
        </View>

        {/* Average Percentile Badge */}
        <View className="items-center">
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30">
            <Text className="text-purple-400 font-bold text-xl">
              {averagePercentile.toFixed(0)}
            </Text>
            <Text className="text-purple-300/80 text-xs text-center">
              Avg Percentile
            </Text>
          </View>
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
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Award size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Top Performers</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {topPerformers}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              ≥75th percentile
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Total PYQs</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {totalPYQs.toLocaleString()}
            </Text>
            <Text className="text-amber-300/80 text-xs">
              across subjects
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Hours</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {totalHours}h
            </Text>
            <Text className="text-blue-300/80 text-xs">
              study time
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Info size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Needs Focus</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {needsImprovement}
            </Text>
            <Text className="text-red-300/80 text-xs">
              <25th percentile
            </Text>
          </MotiView>
        </View>

        {/* Radial Band Visualization */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Percentile Band Visualization
            </Text>
          </View>

          {/* Chart Container */}
          <View className="items-center">
            <View 
              className="bg-slate-900/40 rounded-full border border-slate-600/30 relative"
              style={{ width: chartSize, height: chartSize }}
            >
              <Svg width={chartSize} height={chartSize} className="absolute inset-0">
                <Defs>
                  {/* Gradient definitions for bands */}
                  <RadialGradient id="topBandGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                  </RadialGradient>
                  <RadialGradient id="midBandGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                  </RadialGradient>
                  <RadialGradient id="bottomBandGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                  </RadialGradient>

                  {/* Glow effects for subject dots */}
                  <RadialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Band Rings */}
                {/* Bottom 25% - Outer Ring */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * 0.95}
                  fill="url(#bottomBandGradient)"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeOpacity="0.6"
                  strokeDasharray="8,4"
                />

                {/* Mid 50% - Middle Ring */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * 0.65}
                  fill="url(#midBandGradient)"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeOpacity="0.6"
                  strokeDasharray="8,4"
                />

                {/* Top 25% - Inner Ring */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * 0.3}
                  fill="url(#topBandGradient)"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeOpacity="0.6"
                  strokeDasharray="8,4"
                />

                {/* Center Point */}
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r="4"
                  fill="#64748b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Subject Dots */}
                {data.map((subject, index) => {
                  const position = getSubjectPosition(subject, index);
                  const colors = getBandColor(position.percentileValue);
                  const dotSize = 8 + (subject.pyqs_completed / 200); // Size based on PYQs

                  return (
                    <G key={subject.subject}>
                      {/* Glow effect */}
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={dotSize + 12}
                        fill={`url(#${colors.glow})`}
                        opacity="0.6"
                      />
                      
                      {/* Main dot */}
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={dotSize}
                        fill={colors.color}
                        stroke="#ffffff"
                        strokeWidth="3"
                        onPress={() => handleSubjectPress(subject, position)}
                      />

                      {/* Subject label */}
                      <SvgText
                        x={position.x}
                        y={position.y + dotSize + 20}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill={colors.color}
                      >
                        {subject.subject}
                      </SvgText>

                      {/* Percentile label */}
                      <SvgText
                        x={position.x}
                        y={position.y + dotSize + 35}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                      >
                        {subject.percentile_band}
                      </SvgText>
                    </G>
                  );
                })}

                {/* Band Labels */}
                <SvgText
                  x={centerX}
                  y={centerY - maxRadius * 0.3 - 15}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#10b981"
                >
                  Top 25%
                </SvgText>
                <SvgText
                  x={centerX + maxRadius * 0.65 + 20}
                  y={centerY}
                  textAnchor="start"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#f59e0b"
                >
                  Mid 50%
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + maxRadius * 0.95 + 25}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#ef4444"
                >
                  Bottom 25%
                </SvgText>
              </Svg>

              {/* Animated Progress Ring */}
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: `${animationProgress * 360}deg` }}
                transition={{ type: 'timing', duration: 100 }}
                className="absolute inset-0"
              >
                <Svg width={chartSize} height={chartSize}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={maxRadius * 0.8}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    strokeDasharray="4,20"
                  />
                </Svg>
              </MotiView>
            </View>
          </View>

          {/* Legend */}
          <View className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <Text className="text-slate-100 font-semibold mb-3">Performance Bands</Text>
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-emerald-500 mr-3" />
                  <Text className="text-slate-300 text-sm">Top 25% (75th+ percentile)</Text>
                </View>
                <Text className="text-emerald-400 text-sm font-semibold">
                  {data.filter(s => parseInt(s.percentile_band.replace(/\D/g, '')) >= 75).length} subjects
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-amber-500 mr-3" />
                  <Text className="text-slate-300 text-sm">Mid 50% (25th-74th percentile)</Text>
                </View>
                <Text className="text-amber-400 text-sm font-semibold">
                  {data.filter(s => {
                    const p = parseInt(s.percentile_band.replace(/\D/g, ''));
                    return p >= 25 && p < 75;
                  }).length} subjects
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                  <Text className="text-slate-300 text-sm">Bottom 25% (<25th percentile)</Text>
                </View>
                <Text className="text-red-400 text-sm font-semibold">
                  {needsImprovement} subjects
                </Text>
              </View>
            </View>
            
            <View className="mt-4 pt-3 border-t border-slate-600/30">
              <Text className="text-slate-400 text-xs text-center">
                Dot size = PYQs completed • Tap dots for detailed metrics • Bands normalized by 4.5min/PYQ
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Performance Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Performance Analysis
            </Text>
          </View>

          <View className="space-y-4">
            {data
              .sort((a, b) => parseInt(b.percentile_band.replace(/\D/g, '')) - parseInt(a.percentile_band.replace(/\D/g, '')))
              .map((subject, index) => {
                const percentileValue = parseInt(subject.percentile_band.replace(/\D/g, ''));
                const colors = getBandColor(percentileValue);
                const expectedTime = subject.pyqs_completed * 4.5 / 60;
                const efficiency = expectedTime > 0 ? (subject.hours_spent / expectedTime) : 1;

                return (
                  <MotiView
                    key={subject.subject}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 1000 + index * 150 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                          <View 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: colors.color }}
                          />
                          <Text className="text-slate-100 font-semibold text-lg">
                            {subject.subject}
                          </Text>
                          <View 
                            className="ml-3 px-2 py-1 rounded-full border"
                            style={{ 
                              backgroundColor: `${colors.color}20`,
                              borderColor: `${colors.color}50`
                            }}
                          >
                            <Text 
                              className="text-xs font-bold"
                              style={{ color: colors.color }}
                            >
                              {colors.label}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row items-center space-x-6">
                          <Text className="text-slate-400 text-sm">
                            PYQs: <Text className="text-slate-300 font-semibold">
                              {subject.pyqs_completed.toLocaleString()}
                            </Text>
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            Hours: <Text className="text-slate-300 font-semibold">
                              {subject.hours_spent}h
                            </Text>
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            Efficiency: <Text className={`font-semibold ${
                              efficiency <= 1.1 ? 'text-emerald-400' : 
                              efficiency <= 1.3 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {efficiency <= 1.1 ? 'High' : 
                               efficiency <= 1.3 ? 'Good' : 'Low'}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Percentile Circle */}
                      <View className="items-center">
                        <View className="relative w-16 h-16">
                          <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
                          <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: `${(percentileValue / 100) * 360}deg` }}
                            transition={{ type: 'spring', duration: 1200, delay: 1200 + index * 150 }}
                            className="absolute inset-0 rounded-full border-4 border-transparent"
                            style={{
                              borderTopColor: colors.color,
                              borderRightColor: percentileValue > 25 ? colors.color : 'transparent',
                              borderBottomColor: percentileValue > 50 ? colors.color : 'transparent',
                              borderLeftColor: percentileValue > 75 ? colors.color : 'transparent',
                            }}
                          />
                          <View className="absolute inset-0 items-center justify-center">
                            <Text className="text-lg font-bold" style={{ color: colors.color }}>
                              {percentileValue}
                            </Text>
                            <Text className="text-slate-500 text-xs">%ile</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="mt-3">
                      <View className="w-full bg-slate-600 rounded-full h-2">
                        <MotiView
                          from={{ width: '0%' }}
                          animate={{ width: `${percentileValue}%` }}
                          transition={{ type: 'spring', duration: 1000, delay: 1400 + index * 150 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: colors.color }}
                        />
                      </View>
                      <Text className="text-slate-400 text-xs mt-1">
                        Percentile progression: {percentileValue}% of cohort
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
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Performance Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Strongest Subject:</Text> {
                data.reduce((max, s) => {
                  const maxPercentile = parseInt(max.percentile_band.replace(/\D/g, ''));
                  const sPercentile = parseInt(s.percentile_band.replace(/\D/g, ''));
                  return sPercentile > maxPercentile ? s : max;
                }).subject
              } ({data.reduce((max, s) => {
                const maxPercentile = parseInt(max.percentile_band.replace(/\D/g, ''));
                const sPercentile = parseInt(s.percentile_band.replace(/\D/g, ''));
                return sPercentile > maxPercentile ? s : max;
              }).percentile_band} percentile)
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Focus:</Text> {
                data.reduce((min, s) => {
                  const minPercentile = parseInt(min.percentile_band.replace(/\D/g, ''));
                  const sPercentile = parseInt(s.percentile_band.replace(/\D/g, ''));
                  return sPercentile < minPercentile ? s : min;
                }).subject
              } ({data.reduce((min, s) => {
                const minPercentile = parseInt(min.percentile_band.replace(/\D/g, ''));
                const sPercentile = parseInt(s.percentile_band.replace(/\D/g, ''));
                return sPercentile < minPercentile ? s : min;
              }).percentile_band} percentile)
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-purple-400">Overall Standing:</Text> {averagePercentile.toFixed(0)}th percentile average across subjects
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {averagePercentile >= 75 
                ? "Excellent overall performance! You're in the top quartile across most subjects. Focus on maintaining consistency."
                : averagePercentile >= 50
                ? "Good progress with room for improvement. Target moving more subjects into the top 25% band."
                : averagePercentile >= 25
                ? "Moderate performance. Focus on strengthening fundamentals in lower-performing subjects."
                : "Significant improvement needed. Consider reviewing study strategies and focusing on high-impact topics."
              }
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Subject Tooltip */}
      {selectedTooltip && (
        <SubjectTooltip
          subject={selectedTooltip.subject}
          position={selectedTooltip.position}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}