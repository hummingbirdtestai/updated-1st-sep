import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, Path } from 'react-native-svg';

interface Topic {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
}

interface Chapter {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
  topics?: Topic[];
}

interface Subject {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
  weeklyChange?: number;
  lastActivity?: string;
  chapters?: Chapter[];
}

interface NeuralRadarProps {
  subjects: Subject[];
  size?: number;
}

interface TooltipData {
  node: Subject | Chapter | Topic;
  x: number;
  y: number;
  visible: boolean;
  type: 'subject' | 'chapter' | 'topic';
}

interface SidePanelData {
  node: Subject | Chapter | Topic;
  type: 'subject' | 'chapter' | 'topic';
  visible: boolean;
}

type HierarchyLevel = 'subjects' | 'chapters' | 'topics';

export default function NeuralRadar({ 
  subjects = [], 
  size = 300 
}: NeuralRadarProps) {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  // Responsive sizing
  const radarSize = isMobile ? Math.min(size, width - 64) : size;
  const center = radarSize / 2;
  const maxRadius = center - 60;
  
  // Zoom and pan state
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [zoomLevel, setZoomLevel] = useState<HierarchyLevel>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  // UI state
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanelData | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  // Trigger re-animation when hierarchy changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [zoomLevel, selectedSubject, selectedChapter]);

  // Trigger pulse animation every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Pinch gesture handler
  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      const newScale = context.startScale * event.scale;
      scale.value = Math.max(0.5, Math.min(3, newScale));
      
      // Trigger hierarchy changes based on zoom level
      if (newScale > 2 && zoomLevel === 'subjects') {
        runOnJS(setZoomLevel)('chapters');
      } else if (newScale > 2.5 && zoomLevel === 'chapters') {
        runOnJS(setZoomLevel)('topics');
      } else if (newScale < 1.5 && zoomLevel === 'topics') {
        runOnJS(setZoomLevel)('chapters');
      } else if (newScale < 1 && zoomLevel === 'chapters') {
        runOnJS(setZoomLevel)('subjects');
        runOnJS(setSelectedSubject)(null);
        runOnJS(setSelectedChapter)(null);
      }
    },
    onEnd: () => {
      scale.value = withSpring(1);
    },
  });

  // Pan gesture handler
  const panHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  // Animated style for the radar container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  // Calculate positions for nodes
  const getNodePosition = (index: number, total: number, momentumScore: number, gapDensity: number, radiusMultiplier = 1) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const normalizedMomentum = Math.min(1, Math.max(0, (momentumScore + 20) / 40));
    
    let radius = maxRadius * radiusMultiplier * (0.3 + normalizedMomentum * 0.7);
    
    // Vortex pull effect for very high gap density
    if (gapDensity > 0.85) {
      const vortexPull = (gapDensity - 0.85) / 0.15;
      radius = radius * (1 - vortexPull * 0.3);
    }
    
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    
    return { x, y, angle, radius, normalizedMomentum };
  };

  // Get current nodes to display based on zoom level
  const getCurrentNodes = () => {
    switch (zoomLevel) {
      case 'subjects':
        return { nodes: subjects, type: 'subject' as const };
      case 'chapters':
        if (selectedSubject?.chapters) {
          return { nodes: selectedSubject.chapters, type: 'chapter' as const };
        }
        return { nodes: subjects, type: 'subject' as const };
      case 'topics':
        if (selectedChapter?.topics) {
          return { nodes: selectedChapter.topics, type: 'topic' as const };
        }
        return { nodes: selectedSubject?.chapters || subjects, type: 'chapter' as const };
      default:
        return { nodes: subjects, type: 'subject' as const };
    }
  };

  const { nodes, type } = getCurrentNodes();

  // Color functions
  const getGlowColor = (gapDensity: number) => {
    if (gapDensity < 0.4) return '#10b981';
    if (gapDensity <= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const getBlipColor = (gapDensity: number) => {
    if (gapDensity < 0.4) return '#34d399';
    if (gapDensity <= 0.7) return '#fbbf24';
    return '#f87171';
  };

  const getBlipSize = (momentumScore: number) => {
    const magnitude = Math.abs(momentumScore) / 20;
    return 6 + magnitude * 8;
  };

  const getMomentumDirection = (momentumScore: number) => {
    if (momentumScore > 2) return 'improving';
    if (momentumScore < -2) return 'declining';
    return 'stable';
  };

  // Handle node selection
  const handleNodePress = (node: any, x: number, y: number) => {
    if (type === 'subject') {
      setSelectedSubject(node);
      if (node.chapters && node.chapters.length > 0) {
        setZoomLevel('chapters');
      }
    } else if (type === 'chapter') {
      setSelectedChapter(node);
      if (node.topics && node.topics.length > 0) {
        setZoomLevel('topics');
      }
    }
    
    // Show side panel with details
    setSidePanel({
      node,
      type,
      visible: true
    });
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomLevel === 'topics') {
      setZoomLevel('chapters');
      setSelectedChapter(null);
    } else if (zoomLevel === 'chapters') {
      setZoomLevel('subjects');
      setSelectedSubject(null);
    }
  };

  // Get breadcrumb path
  const getBreadcrumb = () => {
    const path = ['Subjects'];
    if (selectedSubject) path.push(selectedSubject.name);
    if (selectedChapter) path.push(selectedChapter.name);
    return path.join(' > ');
  };

  return (
    <View className="items-center justify-center">
      {/* Breadcrumb Navigation */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="mb-4 bg-slate-800/60 rounded-xl px-4 py-2 border border-slate-700/40"
      >
        <View className="flex-row items-center">
          {zoomLevel !== 'subjects' && (
            <Pressable
              onPress={handleZoomOut}
              className="mr-3 px-2 py-1 bg-slate-700/50 rounded-lg"
            >
              <Text className="text-slate-300 text-xs">← Back</Text>
            </Pressable>
          )}
          <Text className="text-slate-200 text-sm font-medium">
            {getBreadcrumb()}
          </Text>
        </View>
      </MotiView>

      {/* Main Radar Container */}
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View>
          <PanGestureHandler onGestureEvent={panHandler}>
            <Animated.View style={animatedStyle}>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 800 }}
                className="relative"
              >
                <Pressable 
                  onPress={() => setTooltip(null)}
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
                    <Defs>
                      {/* Gradients */}
                      <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                        <Stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
                      </RadialGradient>
                      
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
                      
                      <Filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                        <FeGaussianBlur in="SourceGraphic" stdDeviation="3" />
                      </Filter>
                    </Defs>
                    
                    <G x={10} y={10}>
                      {/* Grid Rings */}
                      {Array.from({ length: 5 }, (_, i) => {
                        const radius = (maxRadius / 5) * (i + 1);
                        const opacity = 0.15 + (i * 0.05);
                        return (
                          <Circle
                            key={`ring-${i}`}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke="#334155"
                            strokeWidth={i === 4 ? 2 : 1}
                            strokeOpacity={opacity}
                            strokeDasharray={i % 2 === 0 ? "4,2" : "none"}
                          />
                        );
                      })}
                      
                      {/* Grid Lines */}
                      {Array.from({ length: 8 }, (_, i) => {
                        const angle = (i / 8) * 2 * Math.PI;
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

                      {/* Hierarchy Arcs for Chapters/Topics */}
                      {zoomLevel !== 'subjects' && selectedSubject && (
                        <G>
                          {/* Subject boundary arc */}
                          <Circle
                            cx={center}
                            cy={center}
                            r={maxRadius * 0.9}
                            fill="none"
                            stroke="#475569"
                            strokeWidth={3}
                            strokeOpacity={0.6}
                            strokeDasharray="8,4"
                          />
                          
                          {/* Chapter arcs when showing topics */}
                          {zoomLevel === 'topics' && selectedChapter && (
                            <Circle
                              cx={center}
                              cy={center}
                              r={maxRadius * 0.7}
                              fill="none"
                              stroke="#64748b"
                              strokeWidth={2}
                              strokeOpacity={0.4}
                              strokeDasharray="4,2"
                            />
                          )}
                        </G>
                      )}
                      
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
                      
                      {/* Render Current Hierarchy Level */}
                      {nodes.map((node: any, index) => {
                        const radiusMultiplier = zoomLevel === 'subjects' ? 1 : 
                                               zoomLevel === 'chapters' ? 0.8 : 0.6;
                        const position = getNodePosition(index, nodes.length, node.momentumScore, node.gapDensity, radiusMultiplier);
                        const glowColor = getGlowColor(node.gapDensity);
                        const blipColor = getBlipColor(node.gapDensity);
                        const blipSize = getBlipSize(node.momentumScore);
                        const direction = getMomentumDirection(node.momentumScore);
                        const isHighDensity = node.gapDensity > 0.7;
                        const isVortexPull = node.gapDensity > 0.85;
                        
                        const glowGradientId = node.gapDensity < 0.4 ? 'greenGlow' : 
                                             node.gapDensity <= 0.7 ? 'yellowGlow' : 'redGlow';
                        
                        return (
                          <G key={`${node.id}-${animationKey}`}>
                            {/* Trailing Effect */}
                            {Array.from({ length: 3 }, (_, trailIndex) => {
                              const trailRadius = blipSize * (0.8 - trailIndex * 0.2);
                              const trailOpacity = 0.4 - trailIndex * 0.15;
                              const trailOffset = trailIndex * 12;
                              
                              let trailX = position.x;
                              let trailY = position.y;
                              
                              if (direction === 'improving') {
                                const inwardFactor = Math.max(0.3, 1 - (trailOffset / maxRadius));
                                trailX = center + (position.x - center) * inwardFactor;
                                trailY = center + (position.y - center) * inwardFactor;
                              } else if (direction === 'declining') {
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
                            
                            {/* Enhanced Glow Effect */}
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
                            
                            {/* Vortex Pull Effect */}
                            {isVortexPull && (
                              <>
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
                            
                            {/* Main Blip with Pulsing */}
                            {isHighDensity ? (
                              <MotiView
                                key={`pulse-${node.id}-${pulseKey}`}
                                from={{ scale: 1, opacity: 0.95 }}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.95, 0.6, 0.95] }}
                                transition={{ 
                                  type: 'timing', 
                                  duration: 2000,
                                  loop: true,
                                }}
                              >
                                <Circle
                                  cx={position.x}
                                  cy={position.y}
                                  r={blipSize}
                                  fill={blipColor}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
                              </MotiView>
                            ) : (
                              <Circle
                                cx={position.x}
                                cy={position.y}
                                r={blipSize}
                                fill={blipColor}
                                stroke="#ffffff"
                                strokeWidth={2}
                                opacity={0.95}
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
                            
                            {/* High Momentum Ring */}
                            {Math.abs(node.momentumScore) > 10 && (
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
                            
                            {/* Node Label */}
                            <SvgText
                              x={position.x}
                              y={position.y - blipSize - 12}
                              textAnchor="middle"
                              fontSize={zoomLevel === 'topics' ? 8 : 9}
                              fill="#e2e8f0"
                              fontWeight="600"
                            >
                              {node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name}
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
                              {node.momentumScore > 0 ? '+' : ''}{node.momentumScore}
                            </SvgText>
                          </G>
                        );
                      })}
                    </G>
                  </Svg>
                  
                  {/* Touch Targets */}
                  {nodes.map((node: any, index) => {
                    const radiusMultiplier = zoomLevel === 'subjects' ? 1 : 
                                           zoomLevel === 'chapters' ? 0.8 : 0.6;
                    const position = getNodePosition(index, nodes.length, node.momentumScore, node.gapDensity, radiusMultiplier);
                    const blipSize = getBlipSize(node.momentumScore);
                    
                    return (
                      <Pressable
                        key={`touch-${node.id}`}
                        onPress={() => handleNodePress(node, position.x + 10, position.y + 10)}
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
              </MotiView>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
      
      {/* Gap Density Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="mt-6 bg-slate-800/60 rounded-xl p-4 border border-slate-700/40"
        style={{ width: radarSize + 20 }}
      >
        <Text className="text-slate-100 font-semibold mb-3 text-center">Gap Density Legend</Text>
        
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
      </MotiView>

      {/* Zoom Instructions */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 800 }}
        className="mt-4 bg-slate-800/40 rounded-lg px-4 py-2"
      >
        <Text className="text-slate-400 text-xs text-center">
          {isMobile ? 'Pinch to zoom • Tap blips for details' : 'Scroll to zoom • Click blips for details'}
        </Text>
      </MotiView>

      {/* Side Panel */}
      <AnimatePresence>
        {sidePanel && (
          <MotiView
            from={{ opacity: 0, translateX: isMobile ? 0 : 300, translateY: isMobile ? 300 : 0 }}
            animate={{ opacity: 1, translateX: 0, translateY: 0 }}
            exit={{ opacity: 0, translateX: isMobile ? 0 : 300, translateY: isMobile ? 300 : 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className={`absolute bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 shadow-2xl ${
              isMobile 
                ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[60%]' 
                : 'top-0 right-0 w-80 h-full rounded-l-2xl'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            {/* Panel Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-slate-600/30">
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100 capitalize">
                  {sidePanel.type} Details
                </Text>
                <Text className="text-slate-400 text-sm">
                  {sidePanel.node.name}
                </Text>
              </View>
              <Pressable
                onPress={() => setSidePanel(null)}
                className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
              >
                <Text className="text-slate-400">✕</Text>
              </Pressable>
            </View>

            {/* Panel Content */}
            <View className="flex-1 p-6">
              <View className="space-y-4">
                {/* Momentum Score */}
                <View className="bg-slate-700/40 rounded-xl p-4">
                  <Text className="text-slate-300 font-semibold mb-2">Momentum Score</Text>
                  <Text className={`text-2xl font-bold ${
                    sidePanel.node.momentumScore > 0 ? 'text-emerald-400' : 
                    sidePanel.node.momentumScore < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {sidePanel.node.momentumScore > 0 ? '+' : ''}{sidePanel.node.momentumScore}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {getMomentumDirection(sidePanel.node.momentumScore) === 'improving' && '📈 Trending upward'}
                    {getMomentumDirection(sidePanel.node.momentumScore) === 'declining' && '📉 Needs attention'}
                    {getMomentumDirection(sidePanel.node.momentumScore) === 'stable' && '➡️ Steady progress'}
                  </Text>
                </View>

                {/* Gap Density */}
                <View className="bg-slate-700/40 rounded-xl p-4">
                  <Text className="text-slate-300 font-semibold mb-2">Gap Density</Text>
                  <Text className={`text-2xl font-bold ${
                    sidePanel.node.gapDensity < 0.4 ? 'text-emerald-400' :
                    sidePanel.node.gapDensity <= 0.7 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {(sidePanel.node.gapDensity * 100).toFixed(0)}%
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {sidePanel.node.gapDensity < 0.4 ? '✅ Low knowledge gaps' :
                     sidePanel.node.gapDensity <= 0.7 ? '⚠️ Medium gaps present' : 
                     sidePanel.node.gapDensity > 0.85 ? '🌀 Critical - Vortex pull active' : '❌ High gaps detected'}
                  </Text>
                </View>

                {/* Sample Learning Gaps */}
                <View className="bg-slate-700/40 rounded-xl p-4">
                  <Text className="text-slate-300 font-semibold mb-3">Learning Gaps</Text>
                  <View className="space-y-2">
                    <Text className="text-slate-400 text-sm">
                      • Confusion between active and passive transport mechanisms
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      • Difficulty with enzyme kinetics calculations
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      • Unclear understanding of feedback loops
                    </Text>
                  </View>
                </View>

                {/* AI Fix Suggestions */}
                <View className="bg-slate-700/40 rounded-xl p-4">
                  <Text className="text-slate-300 font-semibold mb-3">AI Recommendations</Text>
                  <View className="space-y-2">
                    <Text className="text-slate-400 text-sm">
                      🎯 Focus on membrane transport diagrams
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      📚 Review enzyme kinetics with practice problems
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      🔄 Use spaced repetition for feedback mechanisms
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3 mt-6">
                  <Pressable className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-3 px-4 shadow-lg">
                    <Text className="text-white font-semibold text-center">
                      Start Focused Practice
                    </Text>
                  </Pressable>
                  
                  <Pressable className="bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4">
                    <Text className="text-slate-300 font-semibold text-center">
                      View Learning Materials
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

// Helper function for blip color (moved outside component for reuse)
function getBlipColor(gapDensity: number) {
  if (gapDensity < 0.4) return '#34d399';
  if (gapDensity <= 0.7) return '#fbbf24';
  return '#f87171';
}