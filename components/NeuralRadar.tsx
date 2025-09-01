import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Subject {
  id: string;
  name: string;
  momentumScore: number; // -1 to 1 scale (negative = declining, positive = improving)
  gapDensity: number;    // 0-1 scale
  weeklyChange?: number; // percentage change
  lastActivity?: string; // e.g., "2 hours ago"
}

interface NeuralRadarProps {
  subjects: Subject[];
  size?: number;
}

interface TooltipData {
  subject: Subject;
  x: number;
  y: number;
  visible: boolean;
}

export default function NeuralRadar({ 
  subjects = [], 
  size = 300 
}: NeuralRadarProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  // Responsive sizing
  const radarSize = isMobile ? Math.min(size, width - 64) : size;
  const center = radarSize / 2;
  const maxRadius = center - 60; // Leave more space for labels and trails
  
  // State for tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  
  // Animation state for momentum changes
  const [animationKey, setAnimationKey] = useState(0);
  
  // Grid configuration
  const gridRings = 5;
  const gridLines = 8;
  
  // Trigger re-animation when subjects change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [subjects]);
  
  // Calculate positions for subjects
  const getSubjectPosition = (index: number, total: number, momentumScore: number) => {
    // Evenly space subjects around the circle
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    
    // Use absolute momentum score to determine distance from center
    // Center = 0.2 * maxRadius, Edge = maxRadius
    const normalizedMomentum = Math.abs(momentumScore);
    const radius = maxRadius * (0.2 + normalizedMomentum * 0.8);
    
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    return { x, y, angle, radius, normalizedMomentum };
  };
  
  // Get blip color based on gap density
  const getBlipColor = (gapDensity: number) => {
    if (gapDensity < 0.3) return '#10b981'; // Low gaps = green
    if (gapDensity < 0.7) return '#f59e0b'; // Medium gaps = amber
    return '#ef4444'; // High gaps = red
  };
  
  // Get blip size based on momentum magnitude
  const getBlipSize = (momentumScore: number) => {
    const magnitude = Math.abs(momentumScore);
    return 6 + magnitude * 8; // 6-14px radius
  };
  
  // Get momentum direction indicator
  const getMomentumDirection = (momentumScore: number) => {
    if (momentumScore > 0.1) return 'improving';
    if (momentumScore < -0.1) return 'declining';
    return 'stable';
  };
  
  // Handle blip press for tooltip
  const handleBlipPress = (subject: Subject, x: number, y: number) => {
    setTooltip({
      subject,
      x: x + 10, // Offset tooltip slightly
      y: y + 10,
      visible: true
    });
  };
  
  // Close tooltip
  const closeTooltip = () => {
    setTooltip(null);
  };

  return (
    <View className="items-center justify-center">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 800 }}
        className="relative"
      >
        <Pressable onPress={closeTooltip} className="rounded-2xl border border-slate-700/40 overflow-hidden"
          style={{ 
            backgroundColor: '#0a0f1c',
            width: radarSize + 20,
            height: radarSize + 20,
            shadowColor: '#1e40af',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Svg width={radarSize + 20} height={radarSize + 20}>
            <Defs>
              {/* Gradient for center circle */}
              <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </RadialGradient>
              
              {/* Glow effect for blips */}
              <RadialGradient id="blipGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <Stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            <G x={10} y={10}>
              {/* Grid Rings */}
              {Array.from({ length: gridRings }, (_, i) => {
                const radius = (maxRadius / gridRings) * (i + 1);
                const opacity = 0.15 + (i * 0.05); // Outer rings slightly more visible
                return (
                  <Circle
                    key={`ring-${i}`}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={i === gridRings - 1 ? 2 : 1}
                    strokeOpacity={opacity}
                    strokeDasharray={i % 2 === 0 ? "4,2" : "none"}
                  />
                );
              })}
              
              {/* Grid Lines */}
              {Array.from({ length: gridLines }, (_, i) => {
                const angle = (i / gridLines) * 2 * Math.PI;
                const x2 = center + maxRadius * Math.cos(angle);
                const y2 = center + maxRadius * Math.sin(angle);
                return (
                  <Line
                    key={`line-${i}`}
                    x1={center}
                    y1={center}
                    x2={x2}
                    y2={y2}
                    stroke="#1e293b"
                    strokeWidth={1}
                    strokeOpacity={0.3}
                    strokeDasharray="2,3"
                  />
                );
              })}
              
              {/* Center Circle */}
              <Circle
                cx={center}
                cy={center}
                r={25}
                fill="url(#centerGradient)"
                stroke="#475569"
                strokeWidth={2}
              />
              
              {/* Center Text */}
              <SvgText
                x={center}
                y={center - 4}
                textAnchor="middle"
                fontSize={11}
                fill="#94a3b8"
                fontWeight="600"
              >
                Neural
              </SvgText>
              <SvgText
                x={center}
                y={center + 8}
                textAnchor="middle"
                fontSize={11}
                fill="#94a3b8"
                fontWeight="600"
              >
                Radar
              </SvgText>
              
              {/* Subject Blips with Trails and Animation */}
              {subjects.map((subject, index) => {
                const position = getSubjectPosition(index, subjects.length, subject.momentumScore);
                const blipColor = getBlipColor(subject.gapDensity);
                const blipSize = getBlipSize(subject.momentumScore);
                const direction = getMomentumDirection(subject.momentumScore);
                
                return (
                  <G key={`${subject.id}-${animationKey}`}>
                    {/* Trailing Effect - Multiple fading circles */}
                    {Array.from({ length: 3 }, (_, trailIndex) => {
                      const trailRadius = blipSize * (0.8 - trailIndex * 0.2);
                      const trailOpacity = 0.4 - trailIndex * 0.15;
                      const trailOffset = trailIndex * 8;
                      
                      // Calculate trail position based on momentum direction
                      let trailX = position.x;
                      let trailY = position.y;
                      
                      if (direction === 'improving') {
                        // Trail points inward (subject moving outward)
                        const inwardFactor = 1 - (trailOffset / maxRadius);
                        trailX = center + (position.x - center) * inwardFactor;
                        trailY = center + (position.y - center) * inwardFactor;
                      } else if (direction === 'declining') {
                        // Trail points outward (subject moving inward)
                        const outwardFactor = 1 + (trailOffset / maxRadius);
                        trailX = center + (position.x - center) * outwardFactor;
                        trailY = center + (position.y - center) * outwardFactor;
                      }
                      
                      return (
                        <Circle
                          key={`trail-${trailIndex}`}
                          cx={trailX}
                          cy={trailY}
                          r={trailRadius}
                          fill={blipColor}
                          opacity={trailOpacity}
                        />
                      );
                    })}
                    
                    {/* Glow Effect */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipSize + 6}
                      fill="url(#blipGlow)"
                      opacity={0.6}
                    />
                    
                    {/* Main Blip */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipSize}
                      fill={blipColor}
                      stroke="#ffffff"
                      strokeWidth={2}
                      opacity={0.95}
                    />
                    
                    {/* Momentum Direction Indicator */}
                    {direction !== 'stable' && (
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipSize + 3}
                        fill="none"
                        stroke={direction === 'improving' ? '#10b981' : '#ef4444'}
                        strokeWidth={2}
                        strokeOpacity={0.7}
                        strokeDasharray="3,2"
                      />
                    )}
                    
                    {/* Pulsing Ring for High Momentum */}
                    {Math.abs(subject.momentumScore) > 0.7 && (
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipSize + 8}
                        fill="none"
                        stroke={blipColor}
                        strokeWidth={1}
                        opacity={0.4}
                        strokeDasharray="4,4"
                      />
                    )}
                    
                    {/* Subject Label */}
                    <SvgText
                      x={position.x}
                      y={position.y - blipSize - 12}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#e2e8f0"
                      fontWeight="600"
                    >
                      {subject.name.length > 10 ? subject.name.substring(0, 10) + '...' : subject.name}
                    </SvgText>
                    
                    {/* Momentum Score Label */}
                    <SvgText
                      x={position.x}
                      y={position.y + blipSize + 16}
                      textAnchor="middle"
                      fontSize={8}
                      fill={direction === 'improving' ? '#10b981' : direction === 'declining' ? '#ef4444' : '#64748b'}
                      fontWeight="500"
                    >
                      {subject.momentumScore > 0 ? '+' : ''}{(subject.momentumScore * 100).toFixed(0)}%
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
          
          {/* Invisible touch targets for tooltips */}
          {subjects.map((subject, index) => {
            const position = getSubjectPosition(index, subjects.length, subject.momentumScore);
            const blipSize = getBlipSize(subject.momentumScore);
            
            return (
              <Pressable
                key={`touch-${subject.id}`}
                onPress={() => handleBlipPress(subject, position.x + 10, position.y + 10)}
                className="absolute rounded-full"
                style={{
                  left: position.x + 10 - blipSize - 5,
                  top: position.y + 10 - blipSize - 5,
                  width: (blipSize + 5) * 2,
                  height: (blipSize + 5) * 2,
                }}
              />
            );
          })}
        </Pressable>
        
        {/* Animated Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <MotiView
              from={{ opacity: 0, scale: 0.8, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, translateY: 10 }}
              transition={{ type: 'spring', duration: 400 }}
              className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-2xl backdrop-blur-sm"
              style={{
                left: Math.min(tooltip.x, radarSize - 160),
                top: Math.max(20, tooltip.y - 80),
                width: 160,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <Pressable onPress={closeTooltip} className="absolute top-2 right-2 w-6 h-6 items-center justify-center">
                <Text className="text-slate-400 text-xs">✕</Text>
              </Pressable>
              
              <Text className="text-slate-100 font-bold text-sm mb-2">
                {tooltip.subject.name}
              </Text>
              
              <View className="space-y-1">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Momentum:</Text>
                  <Text className={`text-xs font-semibold ${
                    tooltip.subject.momentumScore > 0 ? 'text-emerald-400' : 
                    tooltip.subject.momentumScore < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {tooltip.subject.momentumScore > 0 ? '+' : ''}
                    {(tooltip.subject.momentumScore * 100).toFixed(1)}%
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Gap Density:</Text>
                  <Text className="text-slate-300 text-xs">
                    {(tooltip.subject.gapDensity * 100).toFixed(0)}%
                  </Text>
                </View>
                
                {tooltip.subject.weeklyChange && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Weekly:</Text>
                    <Text className={`text-xs font-medium ${
                      tooltip.subject.weeklyChange > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tooltip.subject.weeklyChange > 0 ? '+' : ''}
                      {tooltip.subject.weeklyChange}% improvement
                    </Text>
                  </View>
                )}
                
                {tooltip.subject.lastActivity && (
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-xs">Last active:</Text>
                    <Text className="text-slate-300 text-xs">
                      {tooltip.subject.lastActivity}
                    </Text>
                  </View>
                )}
                
                <View className="mt-2 pt-2 border-t border-slate-600/30">
                  <Text className="text-slate-300 text-xs text-center">
                    {getMomentumDirection(tooltip.subject.momentumScore) === 'improving' && '📈 Trending up'}
                    {getMomentumDirection(tooltip.subject.momentumScore) === 'declining' && '📉 Needs attention'}
                    {getMomentumDirection(tooltip.subject.momentumScore) === 'stable' && '➡️ Steady progress'}
                  </Text>
                </View>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
      
      {/* Enhanced Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="mt-6 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40"
        style={{ width: radarSize + 20 }}
      >
        <Text className="text-slate-100 font-semibold mb-3 text-center">Momentum Tracker</Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Distance from center:</Text>
            <Text className="text-slate-400 text-sm">Momentum Magnitude</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Blip size:</Text>
            <Text className="text-slate-400 text-sm">Learning Velocity</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Trailing effect:</Text>
            <Text className="text-slate-400 text-sm">Movement Direction</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Color:</Text>
            <View className="flex-row space-x-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                <Text className="text-slate-400 text-xs">Low gaps</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-amber-500 mr-1" />
                <Text className="text-slate-400 text-xs">Medium</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                <Text className="text-slate-400 text-xs">High gaps</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Momentum Direction Legend */}
        <View className="mt-3 pt-3 border-t border-slate-600/30">
          <Text className="text-slate-300 text-sm font-medium mb-2">Momentum Indicators:</Text>
          <View className="flex-row justify-between text-xs">
            <View className="flex-row items-center">
              <Text className="text-emerald-400 mr-1">📈</Text>
              <Text className="text-slate-400">Improving</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-400 mr-1">➡️</Text>
              <Text className="text-slate-400">Stable</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-red-400 mr-1">📉</Text>
              <Text className="text-slate-400">Declining</Text>
            </View>
          </View>
        </View>
      </MotiView>
      
      {/* Instructions */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 800 }}
        className="mt-4"
      >
        <Text className="text-slate-500 text-xs text-center">
          Tap any blip to see detailed momentum metrics
        </Text>
      </MotiView>
    </View>
  );
}