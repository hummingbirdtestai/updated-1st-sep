import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Radar, X } from 'lucide-react-native';

interface Subject {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
}

interface TooltipData {
  subject: Subject;
  position: { x: number; y: number };
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity: number;
}

const subjects: Subject[] = [
  { id: '1', name: 'Anatomy', momentumScore: 20, gapDensity: 0.3 },
  { id: '2', name: 'Physiology', momentumScore: -10, gapDensity: 0.6 },
  { id: '3', name: 'Biochemistry', momentumScore: 15, gapDensity: 0.2 },
  { id: '4', name: 'Pathology', momentumScore: 5, gapDensity: 0.4 },
  { id: '5', name: 'Pharmacology', momentumScore: -5, gapDensity: 0.5 },
  { id: '6', name: 'Microbiology', momentumScore: 12, gapDensity: 0.35 },
];

export default function NeuralRadar() {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const radarSize = Math.min(width * 0.8, height * 0.6, 400);
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize * 0.4;

  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [subjectTrails, setSubjectTrails] = useState<Map<string, TrailPoint[]>>(new Map());
  const [animatedSubjects, setAnimatedSubjects] = useState(subjects);

  // Simulate momentum changes every 3 seconds for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedSubjects(prev => prev.map(subject => ({
        ...subject,
        momentumScore: subject.momentumScore + (Math.random() - 0.5) * 10,
        gapDensity: Math.max(0.1, Math.min(1, subject.gapDensity + (Math.random() - 0.5) * 0.2))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update trails when subjects move
  useEffect(() => {
    const newTrails = new Map(subjectTrails);
    
    animatedSubjects.forEach((subject, index) => {
      const position = getBlipPosition(subject, index);
      const currentTrail = newTrails.get(subject.id) || [];
      
      // Add new position to trail
      const newPoint: TrailPoint = {
        x: position.x,
        y: position.y,
        timestamp: Date.now(),
        opacity: 0.8
      };
      
      // Keep only last 8 trail points and fade them
      const updatedTrail = [newPoint, ...currentTrail]
        .slice(0, 8)
        .map((point, idx) => ({
          ...point,
          opacity: Math.max(0, 0.8 - (idx * 0.1))
        }));
      
      newTrails.set(subject.id, updatedTrail);
    });
    
    setSubjectTrails(newTrails);
  }, [animatedSubjects]);

  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  // Calculate blip positions based on momentum
  const getBlipPosition = (subject: Subject, index: number) => {
    const angle = (index / animatedSubjects.length) * 2 * Math.PI;
    // Map momentum score to radius (center = 0, edge = max momentum)
    const normalizedMomentum = Math.max(0, Math.min(100, Math.abs(subject.momentumScore))) / 100;
    const radius = normalizedMomentum * maxRadius;
    return { ...polarToCartesian(angle, radius), angle };
  };

  // Get color based on momentum score
  const getBlipColor = (momentumScore: number) => {
    if (momentumScore > 10) return '#10b981'; // emerald
    if (momentumScore > 0) return '#f59e0b';  // amber
    return '#ef4444'; // red
  };

  // Handle blip press
  const handleBlipPress = (subject: Subject, index: number) => {
    const position = getBlipPosition(subject, index);
    setSelectedTooltip({ subject, position });
  };

  // Format momentum for tooltip
  const formatMomentum = (score: number) => {
    const sign = score >= 0 ? '+' : '';
    return `${sign}${score.toFixed(1)}% weekly change`;
  };

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
          <View className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-4">
            <Radar size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-slate-100">Neural Radar</Text>
            <Text className="text-sm text-slate-400">
              Subject performance with momentum tracking
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Radar Container */}
      <View className="flex-1 items-center justify-center p-6">
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="relative"
          style={{
            width: radarSize,
            height: radarSize,
          }}
        >
          {/* Background Circle */}
          <View
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: '#0a0f1c',
              borderWidth: 1,
              borderColor: '#1e293b',
            }}
          />

          {/* SVG Radar */}
          <Svg width={radarSize} height={radarSize} className="absolute inset-0">
            <Defs>
              {/* Gradient definitions for glow effects */}
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

            {/* Grid Circles */}
            {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <Circle
                key={`grid-${index}`}
                cx={centerX}
                cy={centerY}
                r={maxRadius * ratio}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}

            {/* Grid Lines (spokes) */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * 2 * Math.PI;
              const { x, y } = polarToCartesian(angle, maxRadius);
              return (
                <Line
                  key={`spoke-${i}`}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                />
              );
            })}

            {/* Center Text */}
            <SvgText
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#64748b"
            >
              Neural Radar
            </SvgText>

            {/* Subject Trails */}
            <G>
              {animatedSubjects.map((subject, index) => {
                const trail = subjectTrails.get(subject.id) || [];
                const color = getBlipColor(subject.momentumScore);
                
                return trail.map((point, trailIndex) => (
                  <Circle
                    key={`trail-${subject.id}-${trailIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r={2 + (subject.gapDensity * 3)}
                    fill={color}
                    fillOpacity={point.opacity * 0.3}
                  />
                ));
              })}
            </G>

            {/* Subject Blips */}
            <G>
              {animatedSubjects.map((subject, index) => {
                const position = getBlipPosition(subject, index);
                const color = getBlipColor(subject.momentumScore);
                const blipRadius = 6 + (subject.gapDensity * 8);
                const glowId = color === '#10b981' ? 'emeraldGlow' : 
                            color === '#f59e0b' ? 'amberGlow' : 'redGlow';

                return (
                  <G key={subject.id}>
                    {/* Glow Effect */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipRadius + 8}
                      fill={`url(#${glowId})`}
                    />
                    
                    {/* Main Blip */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipRadius}
                      fill={color}
                      stroke={color}
                      strokeWidth="2"
                      onPress={() => handleBlipPress(subject, index)}
                    />

                    {/* Momentum Direction Indicator */}
                    {Math.abs(subject.momentumScore) > 5 && (
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipRadius + 4}
                        fill="none"
                        stroke={color}
                        strokeWidth="1"
                        strokeOpacity="0.6"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Subject Label */}
                    <SvgText
                      x={position.x}
                      y={position.y + blipRadius + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      fill="#94a3b8"
                    >
                      {subject.name}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>

          {/* Legend */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 800 }}
            className="absolute bottom-4 left-4 bg-slate-800/80 rounded-lg p-3 border border-slate-600/50"
          >
            <Text className="text-slate-300 text-xs font-semibold mb-2">Performance</Text>
            <View className="space-y-1">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-slate-400 text-xs">High Momentum</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                <Text className="text-slate-400 text-xs">Moderate</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text className="text-slate-400 text-xs">Low/Negative</Text>
              </View>
            </View>
          </MotiView>

          {/* Info Panel */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="absolute bottom-4 right-4 bg-slate-800/80 rounded-lg p-3 border border-slate-600/50"
          >
            <Text className="text-slate-300 text-xs font-semibold mb-1">Radar Guide</Text>
            <Text className="text-slate-400 text-xs">
              Distance = Momentum{'\n'}
              Size = Gap Density{'\n'}
              Trails = Recent Movement{'\n'}
              Tap blips for details
            </Text>
          </MotiView>

          {/* Tooltip */}
          {selectedTooltip && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 400 }}
              className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl"
              style={{
                left: Math.min(selectedTooltip.position.x - 80, radarSize - 160),
                top: Math.max(selectedTooltip.position.y - 80, 20),
                width: 160,
                shadowColor: getBlipColor(selectedTooltip.subject.momentumScore),
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
                    <Text className="text-slate-400 text-xs">Momentum</Text>
                    <Text 
                      className="font-semibold text-sm"
                      style={{ color: getBlipColor(selectedTooltip.subject.momentumScore) }}
                    >
                      {formatMomentum(selectedTooltip.subject.momentumScore)}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-slate-400 text-xs">Gap Density</Text>
                    <Text className="text-slate-300 text-sm">
                      {(selectedTooltip.subject.gapDensity * 100).toFixed(0)}% knowledge gaps
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-slate-400 text-xs">Status</Text>
                    <Text className="text-slate-300 text-sm">
                      {selectedTooltip.subject.momentumScore > 10 ? 'Accelerating' :
                       selectedTooltip.subject.momentumScore > 0 ? 'Improving' :
                       selectedTooltip.subject.momentumScore > -10 ? 'Declining' : 'Needs Focus'}
                    </Text>
                  </View>
                </View>
              </View>
            </MotiView>
          )}
        </MotiView>
      </View>
    </View>
  );
}