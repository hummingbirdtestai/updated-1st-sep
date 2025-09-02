import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Target, TrendingUp, Award, X, Info, Users } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, G, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';

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

// Mock peer data for ghost circles
const mockPeerData = [
  { subject: "Physiology", percentile: 45, x: 0, y: 0 },
  { subject: "Physiology", percentile: 72, x: 0, y: 0 },
  { subject: "Physiology", percentile: 28, x: 0, y: 0 },
  { subject: "Biochemistry", percentile: 55, x: 0, y: 0 },
  { subject: "Biochemistry", percentile: 81, x: 0, y: 0 },
  { subject: "Biochemistry", percentile: 33, x: 0, y: 0 },
  { subject: "Pathology", percentile: 42, x: 0, y: 0 },
  { subject: "Pathology", percentile: 67, x: 0, y: 0 },
  { subject: "Pathology", percentile: 19, x: 0, y: 0 },
];

function SubjectTooltip({ subject, position, onClose }: { 
  subject: SubjectData; 
  position: { x: number; y: number }; 
  onClose: () => void; 
}) {
  const percentileValue = parseInt(subject.percentile_band.replace(/\D/g, ''));
  const getBandColor = (percentile: number) => {
    if (percentile >= 75) return { color: '#10b981', label: 'Safe Zone', zone: '🟢' };
    if (percentile >= 25) return { color: '#f59e0b', label: 'Mid Zone', zone: '🟡' };
    return { color: '#ef4444', label: 'Risk Zone', zone: '🔴' };
  };

  const bandInfo = getBandColor(percentileValue);
  const expectedTime = subject.pyqs_completed * 4.5 / 60; // Expected hours
  const efficiency = expectedTime > 0 ? (subject.hours_spent / expectedTime) : 1;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-2xl p-6 border border-slate-600/50 shadow-2xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 140, Dimensions.get('window').width - 290)),
        top: position.y - 200,
        width: 280,
        shadowColor: bandInfo.color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
      >
        <X size={16} color="#94a3b8" />
      </Pressable>

      {/* Subject Header */}
      <View className="pr-8 mb-4">
        <View className="flex-row items-center mb-2">
          <Text className="text-2xl mr-3">{bandInfo.zone}</Text>
          <View className="flex-1">
            <Text className="text-slate-100 font-bold text-xl">
              {subject.subject}
            </Text>
            <Text 
              className="text-base font-semibold"
              style={{ color: bandInfo.color }}
            >
              {subject.percentile_band} Percentile
            </Text>
          </View>
        </View>
        
        <View 
          className="px-4 py-2 rounded-full border-2"
          style={{ 
            backgroundColor: `${bandInfo.color}20`,
            borderColor: `${bandInfo.color}60`
          }}
        >
          <Text 
            className="text-center font-bold text-base"
            style={{ color: bandInfo.color }}
          >
            {bandInfo.label}
          </Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View className="space-y-4">
        <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <Text className="text-slate-100 font-semibold mb-3">Performance Metrics</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">PYQs Completed</Text>
              <Text className="text-slate-100 text-lg font-bold">
                {subject.pyqs_completed.toLocaleString()}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Study Hours</Text>
              <Text className="text-slate-100 text-lg font-bold">
                {subject.hours_spent}h
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Expected Time</Text>
              <Text className="text-slate-300 text-sm">
                {expectedTime.toFixed(1)}h
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 text-sm">Efficiency</Text>
              <Text className={`text-sm font-bold ${
                efficiency <= 1.1 ? 'text-emerald-400' : 
                efficiency <= 1.3 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {efficiency <= 1.1 ? '🚀 Efficient' : 
                 efficiency <= 1.3 ? '⚡ Good' : '🐌 Needs Focus'}
              </Text>
            </View>
          </View>
        </View>

        {/* Percentile Progress */}
        <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <Text className="text-slate-100 font-semibold mb-3">Percentile Progress</Text>
          <View className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${percentileValue}%` }}
              transition={{ type: 'spring', duration: 1200, delay: 200 }}
              className="h-3 rounded-full"
              style={{ backgroundColor: bandInfo.color }}
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-slate-500 text-xs">0th</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              {percentileValue}th percentile
            </Text>
            <Text className="text-slate-500 text-xs">100th</Text>
          </View>
        </View>

        {/* Zone Description */}
        <View 
          className="rounded-xl p-4 border-2"
          style={{ 
            backgroundColor: `${bandInfo.color}10`,
            borderColor: `${bandInfo.color}30`
          }}
        >
          <Text 
            className="text-base font-semibold mb-2"
            style={{ color: bandInfo.color }}
          >
            {bandInfo.zone} {bandInfo.label}
          </Text>
          <Text className="text-slate-300 text-sm leading-5">
            {percentileValue >= 75 && "Excellent performance! You're in the top quartile. Focus on maintaining consistency across all subjects."}
            {percentileValue >= 25 && percentileValue < 75 && "Good progress with room for improvement. Target moving into the safe zone (75th+ percentile)."}
            {percentileValue < 25 && "Significant improvement needed. Focus on fundamentals and consider additional study resources for this subject."}
          </Text>
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
  const [ripplePhase, setRipplePhase] = useState(0);

  // Chart dimensions
  const chartSize = Math.min(width * 0.8, 450);
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const maxRadius = chartSize * 0.42;

  // Animation effects
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.01) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const rippleTimer = setInterval(() => {
      setRipplePhase(prev => (prev + 1) % 8);
    }, 400);
    return () => clearInterval(rippleTimer);
  }, []);

  // Get band radius based on percentile (inverted - higher percentile = inner ring)
  const getBandRadius = (percentile: number) => {
    if (percentile >= 75) return maxRadius * 0.35; // Safe Zone - inner ring
    if (percentile >= 25) return maxRadius * 0.68; // Mid Zone - middle ring
    return maxRadius * 0.95; // Risk Zone - outer ring
  };

  // Get band color and info
  const getBandInfo = (percentile: number) => {
    if (percentile >= 75) return { 
      color: '#10b981', 
      glow: 'safeGlow', 
      label: 'Safe Zone',
      description: 'Top 25% - Excellent Performance',
      emoji: '🟢'
    };
    if (percentile >= 25) return { 
      color: '#f59e0b', 
      glow: 'midGlow', 
      label: 'Mid Zone',
      description: 'Mid 50% - Good Progress',
      emoji: '🟡'
    };
    return { 
      color: '#ef4444', 
      glow: 'riskGlow', 
      label: 'Risk Zone',
      description: 'Bottom 25% - Needs Focus',
      emoji: '🔴'
    };
  };

  // Get subject position on the appropriate ring
  const getSubjectPosition = (subject: SubjectData, index: number) => {
    const percentileValue = parseInt(subject.percentile_band.replace(/\D/g, ''));
    const radius = getBandRadius(percentileValue);
    
    // Distribute subjects around their respective rings
    const subjectsInSameBand = data.filter(s => {
      const p = parseInt(s.percentile_band.replace(/\D/g, ''));
      if (percentileValue >= 75) return p >= 75;
      if (percentileValue >= 25) return p >= 25 && p < 75;
      return p < 25;
    });
    
    const indexInBand = subjectsInSameBand.findIndex(s => s.subject === subject.subject);
    const angleStep = (2 * Math.PI) / Math.max(subjectsInSameBand.length, 1);
    const angle = indexInBand * angleStep - Math.PI / 2; // Start from top
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y, radius, percentileValue, angle };
  };

  // Generate peer positions
  const generatePeerPositions = () => {
    return mockPeerData.map((peer, index) => {
      const radius = getBandRadius(peer.percentile);
      const angle = (index * 0.7) % (2 * Math.PI); // Spread peers around
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...peer, x, y };
    });
  };

  const peerPositions = generatePeerPositions();

  // Handle subject press
  const handleSubjectPress = (subject: SubjectData, position: { x: number; y: number }) => {
    setSelectedTooltip({ subject, position });
  };

  // Calculate summary metrics
  const averagePercentile = data.reduce((sum, s) => sum + parseInt(s.percentile_band.replace(/\D/g, '')), 0) / data.length;
  const totalPYQs = data.reduce((sum, s) => sum + s.pyqs_completed, 0);
  const totalHours = data.reduce((sum, s) => sum + s.hours_spent, 0);
  const safeZoneSubjects = data.filter(s => parseInt(s.percentile_band.replace(/\D/g, '')) >= 75).length;
  const riskZoneSubjects = data.filter(s => parseInt(s.percentile_band.replace(/\D/g, '')) < 25).length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/40 shadow-2xl"
      style={{
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#8b5cf6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Target size={24} color="#ffffff" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100 mb-1">
              Performance Zones
            </Text>
            <Text className="text-slate-400 text-base">
              Your position in the peer landscape
            </Text>
          </View>
        </View>

        {/* Overall Score Badge */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View className="relative">
            <View 
              className="w-20 h-20 rounded-full border-4 items-center justify-center shadow-xl"
              style={{ 
                borderColor: getBandInfo(averagePercentile).color,
                backgroundColor: `${getBandInfo(averagePercentile).color}20`
              }}
            >
              <Text 
                className="text-2xl font-bold"
                style={{ color: getBandInfo(averagePercentile).color }}
              >
                {averagePercentile.toFixed(0)}
              </Text>
              <Text className="text-slate-400 text-xs">avg</Text>
            </View>
            
            {/* Pulsing ring for overall score */}
            <MotiView
              from={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2000,
              }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: getBandInfo(averagePercentile).color }}
            />
          </View>
          <Text 
            className="text-sm font-bold mt-2"
            style={{ color: getBandInfo(averagePercentile).color }}
          >
            {getBandInfo(averagePercentile).label}
          </Text>
        </MotiView>
      </View>

      {/* Concentric Rings Visualization */}
      <View className="items-center mb-8">
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 800 }}
          className="relative"
        >
          <View 
            className="bg-slate-900/60 rounded-full border-2 border-slate-700/50 relative overflow-hidden"
            style={{ width: chartSize, height: chartSize }}
          >
            <Svg width={chartSize} height={chartSize} className="absolute inset-0">
              <Defs>
                {/* Zone Gradients */}
                <RadialGradient id="safeZoneGradient" cx="50%" cy="50%" r="35%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <Stop offset="80%" stopColor="#10b981" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </RadialGradient>
                <RadialGradient id="midZoneGradient" cx="50%" cy="50%" r="68%">
                  <Stop offset="35%" stopColor="#f59e0b" stopOpacity="0" />
                  <Stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <Stop offset="68%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                </RadialGradient>
                <RadialGradient id="riskZoneGradient" cx="50%" cy="50%" r="95%">
                  <Stop offset="68%" stopColor="#ef4444" stopOpacity="0" />
                  <Stop offset="80%" stopColor="#ef4444" stopOpacity="0.25" />
                  <Stop offset="95%" stopColor="#ef4444" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                </RadialGradient>

                {/* Glow effects for dots */}
                <RadialGradient id="studentGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="peerGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                </RadialGradient>

                {/* Ripple gradient */}
                <RadialGradient id="rippleGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                  <Stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Zone Rings */}
              {/* Risk Zone - Outer Ring */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.95}
                fill="url(#riskZoneGradient)"
                stroke="#ef4444"
                strokeWidth="3"
                strokeOpacity="0.6"
                strokeDasharray="12,8"
              />

              {/* Mid Zone - Middle Ring */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.68}
                fill="url(#midZoneGradient)"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeOpacity="0.6"
                strokeDasharray="12,8"
              />

              {/* Safe Zone - Inner Ring */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.35}
                fill="url(#safeZoneGradient)"
                stroke="#10b981"
                strokeWidth="3"
                strokeOpacity="0.6"
                strokeDasharray="12,8"
              />

              {/* Animated Ripple Effect */}
              <Circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.2 + (ripplePhase * 10)}
                fill="none"
                stroke="url(#rippleGradient)"
                strokeWidth="2"
                opacity={1 - (ripplePhase / 8)}
              />

              {/* Center Point */}
              <Circle
                cx={centerX}
                cy={centerY}
                r="6"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Zone Labels */}
              <SvgText
                x={centerX}
                y={centerY - maxRadius * 0.35 - 25}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#10b981"
              >
                🟢 Safe Zone
              </SvgText>
              <SvgText
                x={centerX + maxRadius * 0.68 + 30}
                y={centerY}
                textAnchor="start"
                fontSize="16"
                fontWeight="bold"
                fill="#f59e0b"
              >
                🟡 Mid Zone
              </SvgText>
              <SvgText
                x={centerX}
                y={centerY + maxRadius * 0.95 + 35}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#ef4444"
              >
                🔴 Risk Zone
              </SvgText>

              {/* Peer Ghost Circles */}
              {peerPositions.map((peer, index) => (
                <Circle
                  key={`peer-${index}`}
                  cx={peer.x}
                  cy={peer.y}
                  r="4"
                  fill="#64748b"
                  opacity="0.3"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              ))}

              {/* Student Subject Dots */}
              {data.map((subject, index) => {
                const position = getSubjectPosition(subject, index);
                const bandInfo = getBandInfo(position.percentileValue);
                const dotSize = 8 + (subject.pyqs_completed / 200); // Size based on PYQs

                return (
                  <G key={subject.subject}>
                    {/* Pulsing Glow Effect */}
                    <MotiView
                      from={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{
                        loop: true,
                        type: 'timing',
                        duration: 2000,
                        delay: index * 400,
                      }}
                    >
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={dotSize + 20}
                        fill="url(#studentGlow)"
                      />
                    </MotiView>
                    
                    {/* Main Student Dot */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={dotSize}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="3"
                      onPress={() => handleSubjectPress(subject, position)}
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))',
                      }}
                    />

                    {/* Subject Label */}
                    <SvgText
                      x={position.x}
                      y={position.y + dotSize + 20}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#3b82f6"
                    >
                      {subject.subject}
                    </SvgText>

                    {/* Percentile Badge */}
                    <SvgText
                      x={position.x}
                      y={position.y + dotSize + 35}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={bandInfo.color}
                    >
                      {subject.percentile_band}
                    </SvgText>

                    {/* Performance Indicator Ring */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={dotSize + 6}
                      fill="none"
                      stroke={bandInfo.color}
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      strokeDasharray="4,4"
                    />
                  </G>
                );
              })}

              {/* Animated Scanning Line */}
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 8000,
                }}
              >
                <G transform={`rotate(${animationProgress * 360} ${centerX} ${centerY})`}>
                  <LinearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                    <Stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </LinearGradient>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={maxRadius * 0.8}
                    fill="none"
                    stroke="url(#scanGradient)"
                    strokeWidth="2"
                  />
                </G>
              </MotiView>
            </Svg>
          </View>
        </MotiView>

        {/* Zone Legend */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="mt-8 bg-slate-700/40 rounded-2xl p-6 border border-slate-600/30"
        >
          <Text className="text-slate-100 font-bold text-lg mb-4 text-center">
            Performance Zone Guide
          </Text>
          
          <View className="space-y-4">
            {/* Safe Zone */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-emerald-500 mr-4 items-center justify-center shadow-lg">
                <Text className="text-white text-lg">🟢</Text>
              </View>
              <View className="flex-1">
                <Text className="text-emerald-400 font-bold text-base">
                  Safe Zone (75th+ percentile)
                </Text>
                <Text className="text-emerald-300/90 text-sm">
                  Top 25% performance - Excellent preparation level
                </Text>
              </View>
              <Text className="text-emerald-400 font-bold text-lg">
                {safeZoneSubjects}
              </Text>
            </View>

            {/* Mid Zone */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-amber-500 mr-4 items-center justify-center shadow-lg">
                <Text className="text-white text-lg">🟡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-amber-400 font-bold text-base">
                  Mid Zone (25th-74th percentile)
                </Text>
                <Text className="text-amber-300/90 text-sm">
                  Average performance - Good progress with room to grow
                </Text>
              </View>
              <Text className="text-amber-400 font-bold text-lg">
                {data.filter(s => {
                  const p = parseInt(s.percentile_band.replace(/\D/g, ''));
                  return p >= 25 && p < 75;
                }).length}
              </Text>
            </View>

            {/* Risk Zone */}
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-red-500 mr-4 items-center justify-center shadow-lg">
                <Text className="text-white text-lg">🔴</Text>
              </View>
              <View className="flex-1">
                <Text className="text-red-400 font-bold text-base">
                  Risk Zone (&lt;25th percentile)
                </Text>
                <Text className="text-red-300/90 text-sm">
                  Needs focused attention - High improvement potential
                </Text>
              </View>
              <Text className="text-red-400 font-bold text-lg">
                {riskZoneSubjects}
              </Text>
            </View>
          </View>

          {/* Interactive Guide */}
          <View className="mt-6 pt-4 border-t border-slate-600/30">
            <View className="flex-row items-center justify-center space-x-6">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-blue-500 mr-2 shadow-lg" />
                <Text className="text-slate-300 text-sm">Your Subjects (pulsing)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-slate-500 mr-2 opacity-50" />
                <Text className="text-slate-300 text-sm">Peer Distribution</Text>
              </View>
              <View className="flex-row items-center">
                <Users size={16} color="#06b6d4" />
                <Text className="text-slate-300 text-sm ml-2">Tap dots for details</Text>
              </View>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Summary Stats */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Award size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Safe Zone</Text>
          </View>
          <Text className="text-emerald-200 text-2xl font-bold">
            {safeZoneSubjects}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            subjects
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1500 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Total PYQs</Text>
          </View>
          <Text className="text-amber-200 text-2xl font-bold">
            {(totalPYQs / 1000).toFixed(1)}k
          </Text>
          <Text className="text-amber-300/80 text-xs">
            completed
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Study Hours</Text>
          </View>
          <Text className="text-blue-200 text-2xl font-bold">
            {totalHours}h
          </Text>
          <Text className="text-blue-300/80 text-xs">
            invested
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1700 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Info size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Risk Zone</Text>
          </View>
          <Text className="text-red-200 text-2xl font-bold">
            {riskZoneSubjects}
          </Text>
          <Text className="text-red-300/80 text-xs">
            subjects
          </Text>
        </MotiView>
      </View>

      {/* Subject Tooltip */}
      {selectedTooltip && (
        <SubjectTooltip
          subject={selectedTooltip.subject}
          position={selectedTooltip.position}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </MotiView>
  );
}