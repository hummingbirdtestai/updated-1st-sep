import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface Subject {
  id: string;
  name: string;
  momentumScore: number; // 0-1 scale
  gapDensity: number;    // 0-1 scale
}

interface NeuralRadarProps {
  subjects: Subject[];
  size?: number;
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
  const maxRadius = center - 40; // Leave space for labels
  
  // Grid configuration
  const gridRings = 4;
  const gridLines = 8;
  
  // Calculate positions for subjects
  const getSubjectPosition = (index: number, total: number, momentumScore: number, gapDensity: number) => {
    // Evenly space subjects around the circle
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    
    // Use momentumScore to determine distance from center (0 = center, 1 = edge)
    const radius = maxRadius * (0.2 + momentumScore * 0.8); // Min 20% from center
    
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    return { x, y, angle, radius };
  };
  
  // Get blip color based on gap density
  const getBlipColor = (gapDensity: number) => {
    if (gapDensity < 0.3) return '#10b981'; // Low gaps = green
    if (gapDensity < 0.7) return '#f59e0b'; // Medium gaps = amber
    return '#ef4444'; // High gaps = red
  };
  
  // Get blip size based on momentum
  const getBlipSize = (momentumScore: number) => {
    return 4 + momentumScore * 8; // 4-12px radius
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 800 }}
      className="items-center justify-center"
    >
      <View 
        className="rounded-2xl border border-slate-700/40 overflow-hidden"
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
          <G x={10} y={10}>
            {/* Grid Rings */}
            {Array.from({ length: gridRings }, (_, i) => {
              const radius = (maxRadius / gridRings) * (i + 1);
              return (
                <Circle
                  key={`ring-${i}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={1}
                  strokeOpacity={0.4}
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
                />
              );
            })}
            
            {/* Center Circle */}
            <Circle
              cx={center}
              cy={center}
              r={20}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth={2}
            />
            
            {/* Center Text */}
            <SvgText
              x={center}
              y={center - 2}
              textAnchor="middle"
              fontSize={10}
              fill="#64748b"
              fontWeight="600"
            >
              Neural
            </SvgText>
            <SvgText
              x={center}
              y={center + 8}
              textAnchor="middle"
              fontSize={10}
              fill="#64748b"
              fontWeight="600"
            >
              Radar
            </SvgText>
            
            {/* Subject Blips */}
            {subjects.map((subject, index) => {
              const position = getSubjectPosition(index, subjects.length, subject.momentumScore, subject.gapDensity);
              const blipColor = getBlipColor(subject.gapDensity);
              const blipSize = getBlipSize(subject.momentumScore);
              
              return (
                <G key={subject.id}>
                  {/* Blip Circle */}
                  <Circle
                    cx={position.x}
                    cy={position.y}
                    r={blipSize}
                    fill={blipColor}
                    stroke="#ffffff"
                    strokeWidth={1}
                    opacity={0.9}
                  />
                  
                  {/* Pulsing Ring for High Momentum */}
                  {subject.momentumScore > 0.7 && (
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={blipSize + 4}
                      fill="none"
                      stroke={blipColor}
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  )}
                  
                  {/* Subject Label */}
                  <SvgText
                    x={position.x}
                    y={position.y - blipSize - 8}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#e2e8f0"
                    fontWeight="500"
                  >
                    {subject.name.length > 8 ? subject.name.substring(0, 8) + '...' : subject.name}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
      
      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40"
      >
        <Text className="text-slate-100 font-semibold mb-3 text-center">Legend</Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Distance from center:</Text>
            <Text className="text-slate-400 text-sm">Momentum Score</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-300 text-sm">Blip size:</Text>
            <Text className="text-slate-400 text-sm">Learning Velocity</Text>
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
      </MotiView>
    </MotiView>
  );
}