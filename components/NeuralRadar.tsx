import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Radar } from 'lucide-react-native';

interface Subject {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
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

  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  // Calculate blip positions
  const getBlipPosition = (subject: Subject, index: number) => {
    const angle = (index / subjects.length) * 2 * Math.PI;
    // Map momentum score to radius (0 at center, max at edge)
    const normalizedMomentum = Math.max(0, Math.min(100, subject.momentumScore + 50)) / 100;
    const radius = normalizedMomentum * maxRadius;
    return { ...polarToCartesian(angle, radius), angle };
  };

  // Get color based on momentum score
  const getBlipColor = (momentumScore: number) => {
    if (momentumScore > 10) return '#10b981'; // emerald
    if (momentumScore > 0) return '#f59e0b';  // amber
    return '#ef4444'; // red
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
              Subject performance visualization
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

            {/* Subject Blips */}
            <G>
              {subjects.map((subject, index) => {
                const position = getBlipPosition(subject, index);
                const color = getBlipColor(subject.momentumScore);
                const blipRadius = 6 + (subject.gapDensity * 8); // Size based on gap density

                return (
                  <G key={subject.id}>
                    {/* Glow Effect */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipRadius + 4}
                      fill={color}
                      fillOpacity="0.2"
                    />
                    
                    {/* Main Blip */}
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipRadius}
                      fill={color}
                      stroke={color}
                      strokeWidth="2"
                    />

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
            <Text className="text-slate-300 text-xs font-semibold mb-2">Legend</Text>
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
              Distance from center = Momentum{'\n'}
              Blip size = Gap Density{'\n'}
              Color = Performance Level
            </Text>
          </MotiView>
        </MotiView>
      </View>
    </View>
  );
}