import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, FeColorMatrix } from 'react-native-svg';

interface Subject {
  id: string;
  name: string;
  momentumScore: number; // Can be any number (e.g., -10 to +15)
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
  
  // Animation state for pulsing high-density blips
  const [pulseKey, setPulseKey] = useState(0);
  
  // Grid configuration
  const gridRings = 5;
  const gridLines = 8;
  
  // Trigger re-animation when subjects change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [subjects]);
  
  // Trigger pulse animation every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate positions for subjects
  const getSubjectPosition = (index: number, total: number, momentumScore: number, gapDensity: number) => {
    // Evenly space subjects around the circle
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    
    // Normalize momentum score to 0-1 range (assuming -20 to +20 range)
    const normalizedMomentum = Math.min(1, Math.max(0, (momentumScore + 20) / 40));
    
    // Base radius calculation
    let radius = maxRadius * (0.3 + normalizedMomentum * 0.7);
    
    // Apply vortex pull effect for very high gap density
    if (gapDensity > 0.85) {
      const vortexPull = (gapDensity - 0.85) / 0.15; // 0-1 scale for >0.85 density
      radius = radius * (1 - vortexPull * 0.3); // Pull up to 30% inward
    }
    
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    return { x, y, angle, radius, normalizedMomentum };
  };
  
  // Get glow color based on gap density
  const getGlowColor = (gapDensity: number) => {
    if (gapDensity < 0.3) return '#10b981'; // Low gaps = green
    if (gapDensity <= 0.7) return '#f59e0b'; // Medium gaps = yellow/amber
    return '#ef4444'; // High gaps = red
  };
  
  // Get blip color (slightly different from glow for contrast)
  const getBlipColor = (gapDensity: number) => {
    if (gapDensity < 0.4) return '#34d399'; // Light green
    if (gapDensity <= 0.7) return '#fbbf24'; // Light yellow
    return '#f87171'; // Light red
  };
  
  // Get blip size based on momentum magnitude
  const getBlipSize = (momentumScore: number) => {
    const magnitude = Math.abs(momentumScore) / 20; // Normalize to 0-1
    return 6 + magnitude * 8; // 6-14px radius
  };
  
  // Get momentum direction indicator
  const getMomentumDirection = (momentumScore: number) => {
    if (momentumScore > 2) return 'improving';
    if (momentumScore < -2) return 'declining';
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
              
              {/* Glow effects for different gap densities */}
              <RadialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <Stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </RadialGradient>
              
              <RadialGradient id="yellowGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <Stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </RadialGradient>
              
              <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <Stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </RadialGradient>
              
              {/* Blur filter for glow effect */}
              <Filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                <FeGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </Filter>
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
                const position = getSubjectPosition(index, subjects.length, subject.momentumScore, subject.gapDensity);
                const glowColor = getGlowColor(subject.gapDensity);
                const blipColor = getBlipColor(subject.gapDensity);
                const blipSize = getBlipSize(subject.momentumScore);
                const direction = getMomentumDirection(subject.momentumScore);
                const isHighDensity = subject.gapDensity > 0.7;
                const isVortexPull = subject.gapDensity > 0.85;
                
                // Get glow gradient ID
                const glowGradientId = subject.gapDensity < 0.4 ? 'greenGlow' : 
                                     subject.gapDensity <= 0.7 ? 'yellowGlow' : 'redGlow';
                
                return (
                  <G key={`${subject.id}-${animationKey}`}>
                    {/* Trailing Effect - Multiple fading circles */}
                    {Array.from({ length: 3 }, (_, trailIndex) => {
                      const trailRadius = blipSize * (0.8 - trailIndex * 0.2);
                      const trailOpacity = 0.4 - trailIndex * 0.15;
                      const trailOffset = trailIndex * 12;
                      
                      // Calculate trail position based on momentum direction
                      let trailX = position.x;
                      let trailY = position.y;
                      
                      if (direction === 'improving') {
                        // Trail points inward (subject moving outward)
                        const inwardFactor = Math.max(0.3, 1 - (trailOffset / maxRadius));
                        trailX = center + (position.x - center) * inwardFactor;
                        trailY = center + (position.y - center) * inwardFactor;
                      } else if (direction === 'declining') {
                        // Trail points outward (subject moving inward)
                        const outwardFactor = Math.min(1.5, 1 + (trailOffset / maxRadius));
                        trailX = center + (position.x - center) * outwardFactor;
                        trailY = center + (position.y - center) * outwardFactor;
                      }
                      
                      return (
                        <Circle
                          key={`trail-${trailIndex}`}
                          cx={trailX}
                          cy={trailY}
                          r={trailRadius}
                          fill={glowColor}
                          opacity={trailOpacity}
                        />
                      );
                    })}
                    
                    {/* Enhanced Glow Effect with Gap Density Colors */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipSize + 12}
                      fill={`url(#${glowGradientId})`}
                      opacity={0.8}
                      filter="url(#blur)"
                    />
                    
                    {/* Secondary Glow Ring */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipSize + 8}
                      fill={glowColor}
                      opacity={0.4}
                    />
                    
                    {/* Vortex Pull Effect for Very High Density */}
                    {isVortexPull && (
                      <>
                        {/* Vortex rings pulling inward */}
                        {Array.from({ length: 2 }, (_, vortexIndex) => (
                          <Circle
                            key={`vortex-${vortexIndex}`}
                            cx={position.x}
                            cy={position.y}
                            r={blipSize + 15 + vortexIndex * 8}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeOpacity={0.3 - vortexIndex * 0.1}
                            strokeDasharray="2,4"
                          />
                        ))}
                        
                        {/* Inward pull lines */}
                        {Array.from({ length: 4 }, (_, lineIndex) => {
                          const lineAngle = (lineIndex / 4) * 2 * Math.PI;
                          const innerX = position.x + (blipSize + 5) * Math.cos(lineAngle);
                          const innerY = position.y + (blipSize + 5) * Math.sin(lineAngle);
                          const outerX = position.x + (blipSize + 20) * Math.cos(lineAngle);
                          const outerY = position.y + (blipSize + 20) * Math.sin(lineAngle);
                          
                          return (
                            <Line
                              key={`vortex-line-${lineIndex}`}
                              x1={outerX}
                              y1={outerY}
                              x2={innerX}
                              y2={innerY}
                              stroke="#ef4444"
                              strokeWidth={1}
                              strokeOpacity={0.4}
                              strokeDasharray="1,2"
                            />
                          );
                        })}
                      </>
                    )}
                    
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
                    
                    {/* Pulsing Effect for High Density */}
                    {isHighDensity && (
                      <Circle
                        key={`pulse-${subject.id}-${pulseKey}`}
                        cx={position.x}
                        cy={position.y}
                        r={blipSize}
                        fill={blipColor}
                        opacity={0.6}
                      />
                    )}
                    
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
                    {Math.abs(subject.momentumScore) > 10 && (
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipSize + 10}
                        fill="none"
                        stroke={glowColor}
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
                      {subject.momentumScore > 0 ? '+' : ''}{subject.momentumScore}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
          
          {/* Invisible touch targets for tooltips */}
          {subjects.map((subject, index) => {
            const position = getSubjectPosition(index, subjects.length, subject.momentumScore, subject.gapDensity);
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
                    {tooltip.subject.momentumScore > 0 ? '+' : ''}{tooltip.subject.momentumScore}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Gap Density:</Text>
                  <Text className={`text-xs font-semibold ${
                    tooltip.subject.gapDensity < 0.4 ? 'text-emerald-400' :
                    tooltip.subject.gapDensity <= 0.7 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {(tooltip.subject.gapDensity * 100).toFixed(0)}%
                  </Text>
                </View>
                
                {/* Gap Density Status */}
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-xs">Status:</Text>
                  <Text className={`text-xs font-medium ${
                    tooltip.subject.gapDensity < 0.4 ? 'text-emerald-400' :
                    tooltip.subject.gapDensity <= 0.7 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {tooltip.subject.gapDensity < 0.4 ? 'Low gaps' :
                     tooltip.subject.gapDensity <= 0.7 ? 'Medium gaps' : 'High gaps'}
                    {tooltip.subject.gapDensity > 0.85 && ' (Vortex)'}
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
      
      {/* Gap Density Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="mt-6 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 mr-4"
        style={{ width: radarSize + 20 }}
      >
        <Text className="text-slate-100 font-semibold mb-3 text-center">Gap Density Legend</Text>
        
        {/* Density Color Indicators */}
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <View className="w-6 h-6 rounded-full mb-2 shadow-lg" style={{ backgroundColor: '#10b981', shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 8 }} />
            <Text className="text-emerald-400 text-xs font-semibold">Low</Text>
            <Text className="text-slate-500 text-xs">0-40%</Text>
          </View>
          <View className="items-center">
            <View className="w-6 h-6 rounded-full mb-2 shadow-lg" style={{ backgroundColor: '#f59e0b', shadowColor: '#f59e0b', shadowOpacity: 0.5, shadowRadius: 8 }} />
            <Text className="text-amber-400 text-xs font-semibold">Medium</Text>
            <Text className="text-slate-500 text-xs">40-70%</Text>
          </View>
          <View className="items-center">
            <View className="w-6 h-6 rounded-full mb-2 shadow-lg" style={{ backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 8 }} />
            <Text className="text-red-400 text-xs font-semibold">High</Text>
            <Text className="text-slate-500 text-xs">70%+</Text>
          </View>
        </View>
        
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Distance from center:</Text>
            <Text className="text-slate-400 text-sm">Momentum Magnitude</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Glow intensity:</Text>
            <Text className="text-slate-400 text-sm">Gap Density Level</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Pulsing effect:</Text>
            <Text className="text-slate-400 text-sm">High Density (>70%)</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Vortex pull:</Text>
            <Text className="text-slate-400 text-sm">Critical (>85%)</Text>
          </View>
        </View>
        
        {/* Special Effects Legend */}
        <View className="mt-3 pt-3 border-t border-slate-600/30">
          <Text className="text-slate-300 text-sm font-medium mb-2">Special Effects:</Text>
          <View className="flex-row justify-between text-xs">
            <View className="flex-row items-center">
              <Text className="text-red-400 mr-1">🌀</Text>
              <Text className="text-slate-400">Vortex Pull</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-amber-400 mr-1">💫</Text>
              <Text className="text-slate-400">Pulsing</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-emerald-400 mr-1">✨</Text>
              <Text className="text-slate-400">Glow Trail</Text>
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
          Tap any blip to see detailed momentum and gap density metrics
        </Text>
      </MotiView>
    </View>
  );
}