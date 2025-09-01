import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, Path } from 'react-native-svg';
import { Radar, X, ZoomIn, ZoomOut, ChevronRight, TriangleAlert as AlertTriangle, Lightbulb, Target, Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface Topic {
  id: string;
  name: string;
  gapDensity: number;
  momentumScore?: number;
}

interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
  gapDensity?: number;
  momentumScore?: number;
}

interface Subject {
  id: string;
  name: string;
  momentumScore: number;
  gapDensity: number;
  chapters: Chapter[];
}

interface TooltipData {
  item: Subject | Chapter | Topic;
  position: { x: number; y: number };
  type: 'subject' | 'chapter' | 'topic';
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity: number;
}

interface SidePanelData {
  item: Subject | Chapter | Topic;
  type: 'subject' | 'chapter' | 'topic';
}

interface Snapshot {
  day: string;
  subjects: Array<{
    id: string;
    momentumScore: number;
    gapDensity?: number;
  }>;
}

type ZoomLevel = 'subjects' | 'chapters' | 'topics';

// Dummy time-lapse data
const snapshots: Snapshot[] = [
  { 
    day: 'Day 1', 
    subjects: [
      { id: '1', momentumScore: 10, gapDensity: 0.3 }, 
      { id: '2', momentumScore: -5, gapDensity: 0.6 },
      { id: '3', momentumScore: 15, gapDensity: 0.2 }
    ] 
  },
  { 
    day: 'Day 2', 
    subjects: [
      { id: '1', momentumScore: 20, gapDensity: 0.25 }, 
      { id: '2', momentumScore: -10, gapDensity: 0.65 },
      { id: '3', momentumScore: 18, gapDensity: 0.15 }
    ] 
  },
  { 
    day: 'Day 3', 
    subjects: [
      { id: '1', momentumScore: 25, gapDensity: 0.2 }, 
      { id: '2', momentumScore: -15, gapDensity: 0.7 },
      { id: '3', momentumScore: 22, gapDensity: 0.1 }
    ] 
  },
  { 
    day: 'Day 4', 
    subjects: [
      { id: '1', momentumScore: 30, gapDensity: 0.15 }, 
      { id: '2', momentumScore: -8, gapDensity: 0.55 },
      { id: '3', momentumScore: 28, gapDensity: 0.08 }
    ] 
  },
  { 
    day: 'Day 5', 
    subjects: [
      { id: '1', momentumScore: 35, gapDensity: 0.1 }, 
      { id: '2', momentumScore: 5, gapDensity: 0.4 },
      { id: '3', momentumScore: 32, gapDensity: 0.05 }
    ] 
  }
];

const hierarchicalData: Subject[] = [
  {
    id: '1',
    name: 'Anatomy',
    momentumScore: 20,
    gapDensity: 0.3,
    chapters: [
      {
        id: 'c1',
        name: 'Upper Limb',
        gapDensity: 0.5,
        momentumScore: 15,
        topics: [
          { id: 't1', name: 'Shoulder Joint', gapDensity: 0.7, momentumScore: 10 },
          { id: 't2', name: 'Brachial Plexus', gapDensity: 0.4, momentumScore: 25 },
          { id: 't3', name: 'Elbow Joint', gapDensity: 0.6, momentumScore: -5 }
        ]
      },
      {
        id: 'c2',
        name: 'Lower Limb',
        gapDensity: 0.2,
        momentumScore: 25,
        topics: [
          { id: 't4', name: 'Hip Joint', gapDensity: 0.3, momentumScore: 20 },
          { id: 't5', name: 'Knee Joint', gapDensity: 0.1, momentumScore: 30 }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Physiology',
    momentumScore: -10,
    gapDensity: 0.6,
    chapters: [
      {
        id: 'c3',
        name: 'Cardiovascular',
        gapDensity: 0.8,
        momentumScore: -15,
        topics: [
          { id: 't6', name: 'Heart Cycle', gapDensity: 0.9, momentumScore: -20 },
          { id: 't7', name: 'Blood Pressure', gapDensity: 0.7, momentumScore: -10 }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Biochemistry',
    momentumScore: 15,
    gapDensity: 0.2,
    chapters: [
      {
        id: 'c4',
        name: 'Metabolism',
        gapDensity: 0.3,
        momentumScore: 20,
        topics: [
          { id: 't8', name: 'Glycolysis', gapDensity: 0.2, momentumScore: 25 },
          { id: 't9', name: 'Krebs Cycle', gapDensity: 0.4, momentumScore: 15 }
        ]
      }
    ]
  }
];

export default function NeuralRadar() {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const radarSize = Math.min(width * 0.8, height * 0.6, 400);
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize * 0.4;

  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [sidePanelData, setSidePanelData] = useState<SidePanelData | null>(null);
  const [subjectTrails, setSubjectTrails] = useState<Map<string, TrailPoint[]>>(new Map());
  const [pulsePhase, setPulsePhase] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(snapshots.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms between frames

  // Time-lapse playback effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSnapshotIndex(prev => {
        const next = prev + 1;
        if (next >= snapshots.length) {
          setIsPlaying(false);
          return snapshots.length - 1;
        }
        return next;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Update hierarchical data based on current snapshot
  useEffect(() => {
    const currentSnapshot = snapshots[currentSnapshotIndex];
    if (currentSnapshot) {
      currentSnapshot.subjects.forEach(snapshotSubject => {
        const subject = hierarchicalData.find(s => s.id === snapshotSubject.id);
        if (subject) {
          subject.momentumScore = snapshotSubject.momentumScore;
          if (snapshotSubject.gapDensity !== undefined) {
            subject.gapDensity = snapshotSubject.gapDensity;
          }
        }
      });
    }
  }, [currentSnapshotIndex]);

  // Pulse animation for high-density items
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(pulseInterval);
  }, []);

  // Convert polar coordinates to cartesian
  const polarToCartesian = (angle: number, radius: number) => {
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  // Calculate blip positions based on momentum
  const getBlipPosition = (item: any, index: number, totalItems: number, baseRadius: number = maxRadius) => {
    const angle = (index / totalItems) * 2 * Math.PI;
    
    // Map momentum score to radius
    let normalizedMomentum = Math.max(0, Math.min(100, Math.abs(item.momentumScore || 0))) / 100;
    let radius = normalizedMomentum * baseRadius;
    
    // Vortex pull effect for high gap density (>0.8)
    if (item.gapDensity > 0.8) {
      const vortexPull = 0.15;
      radius = Math.max(radius * (1 - vortexPull), baseRadius * 0.1);
    }
    
    return { ...polarToCartesian(angle, radius), angle };
  };

  // Get color based on momentum score
  const getBlipColor = (momentumScore: number) => {
    if (momentumScore > 10) return '#10b981'; // emerald
    if (momentumScore > 0) return '#f59e0b';  // amber
    return '#ef4444'; // red
  };

  // Get gap density color and glow
  const getGapDensityColor = (gapDensity: number) => {
    if (gapDensity < 0.3) return { color: '#10b981', glow: 'emeraldGapGlow' };
    if (gapDensity <= 0.6) return { color: '#f59e0b', glow: 'amberGapGlow' };
    return { color: '#ef4444', glow: 'redGapGlow' };
  };

  // Handle item press
  const handleItemPress = (item: any, type: 'subject' | 'chapter' | 'topic', position: any) => {
    setSelectedTooltip({ item, position, type });
    setSidePanelData({ item, type });
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (zoomLevel === 'subjects' && selectedSubject) {
      setZoomLevel('chapters');
    } else if (zoomLevel === 'chapters' && selectedChapter) {
      setZoomLevel('topics');
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'topics') {
      setZoomLevel('chapters');
      setSelectedChapter(null);
    } else if (zoomLevel === 'chapters') {
      setZoomLevel('subjects');
      setSelectedSubject(null);
    }
  };

  // Handle subject selection for drilling down
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setZoomLevel('chapters');
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setZoomLevel('topics');
  };

  // Get current data based on zoom level
  const getCurrentData = () => {
    switch (zoomLevel) {
      case 'subjects':
        return hierarchicalData;
      case 'chapters':
        return selectedSubject?.chapters || [];
      case 'topics':
        return selectedChapter?.topics || [];
      default:
        return hierarchicalData;
    }
  };

  const currentData = getCurrentData();
  const currentSnapshot = snapshots[currentSnapshotIndex];

  // Time-lapse control handlers
  const handlePlay = () => setIsPlaying(!isPlaying);
  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentSnapshotIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentSnapshotIndex(prev => Math.min(snapshots.length - 1, prev + 1));
  };
  const handleSliderChange = (value: number) => {
    setIsPlaying(false);
    setCurrentSnapshotIndex(Math.round(value));
  };

  // Mock data for side panel
  const getMockSidePanelData = (item: any, type: string) => {
    return {
      recentMistakes: [
        `Confused ${item.name} mechanism with related concept`,
        `Missed key detail about ${item.name} function`,
        `Incorrect association in ${item.name} pathway`
      ],
      gapSentences: [
        `Need to understand ${item.name} relationship to other systems`,
        `Clarify ${item.name} clinical significance`,
        `Review ${item.name} anatomical variations`
      ],
      aiSuggestions: `Focus on ${item.name} fundamentals. Practice with flashcards and visual diagrams. Review related concepts in context. Consider creating mind maps to connect this topic with broader subject knowledge.`
    };
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
              {zoomLevel === 'subjects' ? 'Subject Overview' : 
               zoomLevel === 'chapters' ? `${selectedSubject?.name} Chapters` :
               `${selectedChapter?.name} Topics`}
            </Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Text className="text-xs text-slate-500 mr-2">Time-lapse:</Text>
            <Text className="text-sm font-semibold text-cyan-400">
              {currentSnapshot?.day || 'Current'}
            </Text>
          </View>
        </View>

        {/* Zoom Controls */}
        <View className="flex-row space-x-2">
          <Pressable
            onPress={handleZoomOut}
            disabled={zoomLevel === 'subjects'}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              zoomLevel === 'subjects' ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <ZoomOut size={18} color={zoomLevel === 'subjects' ? '#64748b' : '#94a3b8'} />
          </Pressable>
          <Pressable
            onPress={handleZoomIn}
            disabled={
              (zoomLevel === 'subjects' && !selectedSubject) ||
              (zoomLevel === 'chapters' && !selectedChapter) ||
              zoomLevel === 'topics'
            }
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              (zoomLevel === 'subjects' && !selectedSubject) ||
              (zoomLevel === 'chapters' && !selectedChapter) ||
              zoomLevel === 'topics'
                ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <ZoomIn size={18} color={
              (zoomLevel === 'subjects' && !selectedSubject) ||
              (zoomLevel === 'chapters' && !selectedChapter) ||
              zoomLevel === 'topics'
                ? '#64748b' : '#94a3b8'
            } />
          </Pressable>
        </View>
      </MotiView>

      <View className="flex-1 flex-row">
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
                
                {/* Gap density glows */}
                <RadialGradient id="emeraldGapGlow" cx="50%" cy="50%" r="80%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <Stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="amberGapGlow" cx="50%" cy="50%" r="80%">
                  <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <Stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient id="redGapGlow" cx="50%" cy="50%" r="80%">
                  <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <Stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </RadialGradient>
                
                {/* Blur filter for vortex effect */}
                <Filter id="vortexBlur">
                  <FeGaussianBlur stdDeviation="1" />
                </Filter>
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
              <SvgText
                x={centerX}
                y={centerY + 15}
                textAnchor="middle"
                fontSize="12"
                fill="#475569"
              >
                {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)}
              </SvgText>

              {/* Render current level items */}
              <G>
                {currentData.map((item: any, index) => {
                  const position = getBlipPosition(item, index, currentData.length);
                  const color = getBlipColor(item.momentumScore || 0);
                  const baseRadius = zoomLevel === 'topics' ? 4 : zoomLevel === 'chapters' ? 6 : 8;
                  const finalRadius = baseRadius + (item.gapDensity * (zoomLevel === 'topics' ? 4 : 6));
                  const gapInfo = getGapDensityColor(item.gapDensity);
                  
                  // Pulsing effect for high gap density
                  const shouldPulse = item.gapDensity > 0.6;
                  const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.3) : 1;
                  const pulseOpacity = shouldPulse ? (0.7 + Math.sin(pulsePhase) * 0.3) : 1;
                  const blipRadius = finalRadius * pulseScale;
                  
                  // Momentum glow
                  const momentumGlowId = color === '#10b981' ? 'emeraldGlow' : 
                                      color === '#f59e0b' ? 'amberGlow' : 'redGlow';

                  return (
                    <G key={item.id}>
                      {/* Gap Density Glow (larger, outer) */}
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipRadius + 16}
                        fill={`url(#${gapInfo.glow})`}
                        opacity={pulseOpacity * 0.6}
                      />
                      
                      {/* Momentum Glow (smaller, inner) */}
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipRadius + 8}
                        fill={`url(#${momentumGlowId})`}
                        opacity={pulseOpacity * 0.8}
                      />
                      
                      {/* Main Blip */}
                      <Circle
                        cx={position.x}
                        cy={position.y}
                        r={blipRadius}
                        fill={color}
                        stroke={gapInfo.color}
                        strokeWidth="3"
                        opacity={pulseOpacity}
                        onPress={() => {
                          const itemType = zoomLevel === 'subjects' ? 'subject' : 
                                         zoomLevel === 'chapters' ? 'chapter' : 'topic';
                          handleItemPress(item, itemType, position);
                          
                          // Handle drilling down
                          if (zoomLevel === 'subjects') {
                            handleSubjectSelect(item);
                          } else if (zoomLevel === 'chapters') {
                            handleChapterSelect(item);
                          }
                        }}
                        filter={item.gapDensity > 0.8 ? "url(#vortexBlur)" : undefined}
                      />

                      {/* Momentum Direction Indicator */}
                      {Math.abs(item.momentumScore || 0) > 5 && (
                        <Circle
                          cx={position.x}
                          cy={position.y}
                          r={blipRadius + 4}
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          strokeOpacity={pulseOpacity * 0.6}
                          strokeDasharray="2,2"
                        />
                      )}

                      {/* Item Label */}
                      <SvgText
                        x={position.x}
                        y={position.y + blipRadius + 16}
                        textAnchor="middle"
                        fontSize={zoomLevel === 'topics' ? "8" : "10"}
                        fontWeight="500"
                        fill="#94a3b8"
                      >
                        {item.name}
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            </Svg>

            {/* Performance Legend */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 800 }}
              className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600/50"
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

            {/* Gap Density Legend */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 900 }}
              className="absolute bottom-20 left-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600/50"
            >
              <Text className="text-slate-300 text-xs font-semibold mb-2">Gap Density</Text>
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-slate-400 text-xs">Low (&lt;30%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                  <Text className="text-slate-400 text-xs">Medium (30-60%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                  <Text className="text-slate-400 text-xs">High (&gt;60%)</Text>
                </View>
              </View>
            </MotiView>

            {/* Info Panel */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1000 }}
              className="absolute bottom-4 right-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600/50"
            >
              <Text className="text-slate-300 text-xs font-semibold mb-1">Radar Guide</Text>
              <Text className="text-slate-400 text-xs">
                Distance = Momentum{'\n'}
                Border = Gap Density{'\n'}
                Pulse = High Gaps{'\n'}
                Tap to drill down{'\n'}
                Use zoom controls
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
                  shadowColor: getBlipColor(selectedTooltip.item.momentumScore || 0),
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
                    {selectedTooltip.item.name}
                  </Text>
                  
                  <View className="space-y-2">
                    <View>
                      <Text className="text-slate-400 text-xs">Momentum</Text>
                      <Text 
                        className="font-semibold text-sm"
                        style={{ color: getBlipColor(selectedTooltip.item.momentumScore || 0) }}
                      >
                        {selectedTooltip.item.momentumScore >= 0 ? '+' : ''}{selectedTooltip.item.momentumScore?.toFixed(1)}% weekly change
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-slate-400 text-xs">Gap Density</Text>
                      <Text className="text-slate-300 text-sm">
                        {(selectedTooltip.item.gapDensity * 100).toFixed(0)}% knowledge gaps
                        {selectedTooltip.item.gapDensity > 0.8 && ' (Vortex Effect)'}
                      </Text>
                    </View>
                    
                    <View>
                      <Text className="text-slate-400 text-xs">Type</Text>
                      <Text className="text-slate-300 text-sm capitalize">
                        {selectedTooltip.type}
                      </Text>
                    </View>
                  </View>
                </View>
              </MotiView>
            )}
          </MotiView>
        </View>

        {/* Side Panel */}
        {sidePanelData && (
          <MotiView
            from={{ opacity: 0, translateX: 300 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="w-80 bg-slate-800/90 border-l border-slate-700/50 p-6"
          >
            {/* Panel Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100 mb-1">
                  {sidePanelData.item.name}
                </Text>
                <Text className="text-sm text-slate-400 capitalize">
                  {sidePanelData.type} Analysis
                </Text>
              </View>
              <Pressable
                onPress={() => setSidePanelData(null)}
                className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Recent Mistakes */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <AlertTriangle size={16} color="#ef4444" />
                  <Text className="text-slate-100 font-semibold ml-2">Recent Mistakes</Text>
                </View>
                <View className="space-y-2">
                  {getMockSidePanelData(sidePanelData.item, sidePanelData.type).recentMistakes.map((mistake, index) => (
                    <View key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <Text className="text-red-200 text-sm">{mistake}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Gap Sentences */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Target size={16} color="#f59e0b" />
                  <Text className="text-slate-100 font-semibold ml-2">Knowledge Gaps</Text>
                </View>
                <View className="space-y-2">
                  {getMockSidePanelData(sidePanelData.item, sidePanelData.type).gapSentences.map((gap, index) => (
                    <View key={index} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <Text className="text-amber-200 text-sm">{gap}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* AI Suggestions */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Lightbulb size={16} color="#10b981" />
                  <Text className="text-slate-100 font-semibold ml-2">AI Recommendations</Text>
                </View>
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <Text className="text-emerald-200 text-sm leading-6">
                    {getMockSidePanelData(sidePanelData.item, sidePanelData.type).aiSuggestions}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="space-y-3">
                <Pressable className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-3 px-4 flex-row items-center justify-center">
                  <Text className="text-white font-semibold mr-2">Start Practice</Text>
                  <ChevronRight size={16} color="#ffffff" />
                </Pressable>
                
                <Pressable className="bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 flex-row items-center justify-center">
                  <Text className="text-slate-300 font-semibold">Review Materials</Text>
                </Pressable>
              </View>
            </ScrollView>
          </MotiView>
        )}
      </View>

      {/* Time-lapse Controls */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="bg-slate-800/90 border-t border-slate-700/50 p-4"
      >
        {/* Control Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-100 font-semibold">Time-lapse Playback</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-xs text-slate-400">Speed:</Text>
            <Pressable
              onPress={() => setPlaybackSpeed(2000)}
              className={`px-2 py-1 rounded ${playbackSpeed === 2000 ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
              <Text className="text-xs text-white">0.5x</Text>
            </Pressable>
            <Pressable
              onPress={() => setPlaybackSpeed(1000)}
              className={`px-2 py-1 rounded ${playbackSpeed === 1000 ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
              <Text className="text-xs text-white">1x</Text>
            </Pressable>
            <Pressable
              onPress={() => setPlaybackSpeed(500)}
              className={`px-2 py-1 rounded ${playbackSpeed === 500 ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
              <Text className="text-xs text-white">2x</Text>
            </Pressable>
          </View>
        </View>

        {/* Playback Controls */}
        <View className="flex-row items-center space-x-4 mb-4">
          {/* Previous */}
          <Pressable
            onPress={handlePrevious}
            disabled={currentSnapshotIndex === 0}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentSnapshotIndex === 0 ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <SkipBack size={16} color={currentSnapshotIndex === 0 ? '#64748b' : '#94a3b8'} />
          </Pressable>

          {/* Play/Pause */}
          <Pressable
            onPress={handlePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center shadow-lg active:scale-95"
            style={{
              shadowColor: '#06b6d4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {isPlaying ? (
              <Pause size={20} color="#ffffff" />
            ) : (
              <Play size={20} color="#ffffff" style={{ marginLeft: 2 }} />
            )}
          </Pressable>

          {/* Next */}
          <Pressable
            onPress={handleNext}
            disabled={currentSnapshotIndex === snapshots.length - 1}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentSnapshotIndex === snapshots.length - 1 ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <SkipForward size={16} color={currentSnapshotIndex === snapshots.length - 1 ? '#64748b' : '#94a3b8'} />
          </Pressable>

          {/* Timeline Slider */}
          <View className="flex-1 mx-4">
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={snapshots.length - 1}
              step={1}
              value={currentSnapshotIndex}
              onValueChange={handleSliderChange}
              minimumTrackTintColor="#06b6d4"
              maximumTrackTintColor="#475569"
              thumbStyle={{
                backgroundColor: '#06b6d4',
                width: 20,
                height: 20,
              }}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-slate-400">Day 1</Text>
              <Text className="text-xs text-cyan-400 font-semibold">
                {currentSnapshot?.day || 'Current'}
              </Text>
              <Text className="text-xs text-slate-400">Day {snapshots.length}</Text>
            </View>
          </View>
        </View>

        {/* Progress Indicators */}
        <View className="flex-row justify-center space-x-2">
          {snapshots.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => handleSliderChange(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentSnapshotIndex 
                  ? 'bg-cyan-400' 
                  : index < currentSnapshotIndex 
                    ? 'bg-cyan-600/60' 
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </View>
      </MotiView>
    </View>
  );
}

export default NeuralRadar

export default NeuralRadar