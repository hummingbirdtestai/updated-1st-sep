import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Bookmark, Target, TrendingUp, ArrowLeft, X, ZoomIn, ZoomOut, Info } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, G, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Topic {
  subject: string;
  chapter: string;
  topic: string;
  bookmarks: number;
  avg_strength: number;
}

interface Subject {
  subject: string;
  chapters: Chapter[];
  totalBookmarks: number;
  avgStrength: number;
}

interface Chapter {
  chapter: string;
  topics: Topic[];
  totalBookmarks: number;
  avgStrength: number;
}

interface TooltipData {
  item: Subject | Chapter | Topic;
  type: 'subject' | 'chapter' | 'topic';
  position: { x: number; y: number };
}

type ViewLevel = 'subjects' | 'chapters' | 'topics';

const mockClusterData: Topic[] = [
  {
    subject: "Physics",
    chapter: "Mechanics",
    topic: "Newton's Laws",
    bookmarks: 22,
    avg_strength: 48
  },
  {
    subject: "Biology",
    chapter: "Genetics",
    topic: "Mendelian Inheritance",
    bookmarks: 30,
    avg_strength: 70
  },
  {
    subject: "Physics",
    chapter: "Thermodynamics",
    topic: "Heat Transfer",
    bookmarks: 15,
    avg_strength: 35
  },
  {
    subject: "Biology",
    chapter: "Cell Biology",
    topic: "Mitochondria",
    bookmarks: 25,
    avg_strength: 85
  },
  {
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Alkanes",
    bookmarks: 18,
    avg_strength: 42
  },
  {
    subject: "Chemistry",
    chapter: "Physical Chemistry",
    topic: "Thermodynamics",
    bookmarks: 12,
    avg_strength: 65
  },
  {
    subject: "Physics",
    chapter: "Electromagnetism",
    topic: "Electric Fields",
    bookmarks: 28,
    avg_strength: 55
  },
  {
    subject: "Biology",
    chapter: "Ecology",
    topic: "Food Chains",
    bookmarks: 20,
    avg_strength: 78
  },
  {
    subject: "Chemistry",
    chapter: "Inorganic Chemistry",
    topic: "Periodic Table",
    bookmarks: 35,
    avg_strength: 90
  },
  {
    subject: "Physics",
    chapter: "Quantum Physics",
    topic: "Wave-Particle Duality",
    bookmarks: 8,
    avg_strength: 25
  }
];

interface BubbleTooltipProps {
  data: TooltipData;
  onClose: () => void;
}

function BubbleTooltip({ data, onClose }: BubbleTooltipProps) {
  const { item, type, position } = data;
  
  const getName = () => {
    if (type === 'subject') return (item as Subject).subject;
    if (type === 'chapter') return (item as Chapter).chapter;
    return (item as Topic).topic;
  };

  const getBookmarks = () => {
    if (type === 'subject') return (item as Subject).totalBookmarks;
    if (type === 'chapter') return (item as Chapter).totalBookmarks;
    return (item as Topic).bookmarks;
  };

  const getStrength = () => {
    if (type === 'subject') return (item as Subject).avgStrength;
    if (type === 'chapter') return (item as Chapter).avgStrength;
    return (item as Topic).avg_strength;
  };

  const strength = getStrength();
  const strengthColor = strength >= 80 ? '#10b981' : strength >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 140,
        width: 240,
        shadowColor: strengthColor,
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

      {/* Tooltip Content */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1 capitalize">
          {type}: {getName()}
        </Text>
        
        {type === 'topic' && (
          <Text className="text-slate-400 text-xs mb-3">
            {(item as Topic).subject} • {(item as Topic).chapter}
          </Text>
        )}
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Bookmarks</Text>
            <Text className="text-amber-400 text-xs font-semibold">
              {getBookmarks()}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Avg Strength</Text>
            <Text 
              className="text-xs font-semibold"
              style={{ color: strengthColor }}
            >
              {strength.toFixed(0)}%
            </Text>
          </View>
          
          {type === 'topic' && (
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Time Invested</Text>
              <Text className="text-slate-300 text-xs">
                {((item as Topic).bookmarks * 4.5).toFixed(1)}m
              </Text>
            </View>
          )}
        </View>

        {(type === 'subject' || type === 'chapter') && (
          <View className="mt-3 pt-3 border-t border-slate-600/30">
            <Text className="text-slate-300 text-xs">
              Click to drill down to {type === 'subject' ? 'chapters' : 'topics'}
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}

export default function BookmarkClusterMap() {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [viewLevel, setViewLevel] = useState<ViewLevel>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = Math.min(height * 0.6, 500);
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Process mock data into hierarchical structure
  const processData = () => {
    const subjectMap = new Map<string, { chapters: Map<string, Topic[]>; totalBookmarks: number; totalStrength: number; count: number }>();
    
    mockClusterData.forEach(topic => {
      if (!subjectMap.has(topic.subject)) {
        subjectMap.set(topic.subject, { 
          chapters: new Map(), 
          totalBookmarks: 0, 
          totalStrength: 0, 
          count: 0 
        });
      }
      
      const subjectData = subjectMap.get(topic.subject)!;
      subjectData.totalBookmarks += topic.bookmarks;
      subjectData.totalStrength += topic.avg_strength;
      subjectData.count += 1;
      
      if (!subjectData.chapters.has(topic.chapter)) {
        subjectData.chapters.set(topic.chapter, []);
      }
      subjectData.chapters.get(topic.chapter)!.push(topic);
    });

    const subjects: Subject[] = Array.from(subjectMap.entries()).map(([subjectName, data]) => {
      const chapters: Chapter[] = Array.from(data.chapters.entries()).map(([chapterName, topics]) => ({
        chapter: chapterName,
        topics,
        totalBookmarks: topics.reduce((sum, t) => sum + t.bookmarks, 0),
        avgStrength: topics.reduce((sum, t) => sum + t.avg_strength, 0) / topics.length,
      }));

      return {
        subject: subjectName,
        chapters,
        totalBookmarks: data.totalBookmarks,
        avgStrength: data.totalStrength / data.count,
      };
    });

    return subjects;
  };

  const subjects = processData();

  // Pulse animation for weak clusters
  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Get current data based on view level
  const getCurrentData = () => {
    switch (viewLevel) {
      case 'subjects':
        return subjects;
      case 'chapters':
        return selectedSubject?.chapters || [];
      case 'topics':
        return selectedChapter?.topics || [];
      default:
        return subjects;
    }
  };

  const currentData = getCurrentData();

  // Get bubble position using simple grid layout
  const getBubblePosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const spacing = Math.min(120, chartWidth / (cols + 1));
    const x = (col + 1) * spacing;
    const y = (row + 1) * spacing + 50;
    
    return { x, y };
  };

  // Get bubble size based on bookmarks
  const getBubbleSize = (bookmarks: number) => {
    const maxBookmarks = Math.max(...mockClusterData.map(t => t.bookmarks));
    const minSize = 20;
    const maxSize = 60;
    const normalized = bookmarks / maxBookmarks;
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get bubble color based on strength
  const getBubbleColor = (strength: number) => {
    if (strength >= 80) return { color: '#10b981', glow: 'emeraldGlow', label: 'Strong' };
    if (strength >= 50) return { color: '#f59e0b', glow: 'amberGlow', label: 'Moderate' };
    return { color: '#ef4444', glow: 'redGlow', label: 'Weak' };
  };

  // Handle bubble press
  const handleBubblePress = (item: any, type: ViewLevel, position: { x: number; y: number }) => {
    setSelectedTooltip({ item, type: type.slice(0, -1) as any, position });

    if (type === 'subjects') {
      setSelectedSubject(item);
      setViewLevel('chapters');
    } else if (type === 'chapters') {
      setSelectedChapter(item);
      setViewLevel('topics');
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    if (viewLevel === 'topics') {
      setViewLevel('chapters');
      setSelectedChapter(null);
    } else if (viewLevel === 'chapters') {
      setViewLevel('subjects');
      setSelectedSubject(null);
    }
  };

  // Pan gesture handler
  const onPanGestureEvent = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE) {
      setTranslateX(nativeEvent.translationX);
      setTranslateY(nativeEvent.translationY);
    }
  };

  // Pinch gesture handler
  const onPinchGestureEvent = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE) {
      setScale(Math.max(0.5, Math.min(3, nativeEvent.scale)));
    }
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // Generate mock 7-day decay data
  const generateDecayData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Simulate decay pattern
      const baseStrength = 75;
      const decayFactor = i * 2;
      const randomVariation = (Math.random() - 0.5) * 8;
      const strength = Math.max(30, Math.min(100, baseStrength - decayFactor + randomVariation));
      
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        averageStrength: Math.round(strength),
      });
    }
    
    return days;
  };

  const decayData = generateDecayData();

  // Calculate decay trend
  const calculateDecayTrend = () => {
    if (decayData.length < 2) return 0;
    
    const n = decayData.length;
    const sumX = decayData.reduce((sum, _, i) => sum + i, 0);
    const sumY = decayData.reduce((sum, d) => sum + d.averageStrength, 0);
    const sumXY = decayData.reduce((sum, d, i) => sum + (i * d.averageStrength), 0);
    const sumX2 = decayData.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const decayTrend = calculateDecayTrend();

  const getDecayTrendInfo = (slope: number) => {
    if (slope > 0.5) return { color: '#10b981', label: 'Improving', icon: '📈' };
    if (slope > -0.5) return { color: '#f59e0b', label: 'Stable', icon: '➡️' };
    return { color: '#ef4444', label: 'Declining', icon: '📉' };
  };

  const trendInfo = getDecayTrendInfo(decayTrend);

  const getViewTitle = () => {
    switch (viewLevel) {
      case 'subjects':
        return 'Subject Overview';
      case 'chapters':
        return `${selectedSubject?.subject} - Chapters`;
      case 'topics':
        return `${selectedChapter?.chapter} - Topics`;
      default:
        return 'Bookmark Cluster Map';
    }
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (viewLevel === 'chapters' || viewLevel === 'topics') {
      parts.push(selectedSubject?.subject);
    }
    if (viewLevel === 'topics') {
      parts.push(selectedChapter?.chapter);
    }
    return parts.join(' → ');
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
          {viewLevel !== 'subjects' && (
            <Pressable
              onPress={handleBackClick}
              className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center mr-3 active:scale-95"
            >
              <ArrowLeft size={18} color="#94a3b8" />
            </Pressable>
          )}
          <View className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Bookmark size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Bookmark Cluster Map
            </Text>
            <Text className="text-sm text-slate-400">
              {getViewTitle()}
              {getBreadcrumb() && (
                <Text className="text-amber-400"> • {getBreadcrumb()}</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Zoom Controls */}
        <View className="flex-row space-x-2">
          <Pressable
            onPress={() => setScale(Math.max(0.5, scale - 0.2))}
            className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center active:scale-95"
          >
            <ZoomOut size={18} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={() => setScale(Math.min(3, scale + 0.2))}
            className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center active:scale-95"
          >
            <ZoomIn size={18} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={resetZoom}
            className="px-3 py-2 rounded-xl bg-slate-700/50 active:scale-95"
          >
            <Text className="text-slate-300 text-sm">Reset</Text>
          </Pressable>
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
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Bookmark size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Total Bookmarks</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {mockClusterData.reduce((sum, t) => sum + t.bookmarks, 0)}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Strong Clusters</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {mockClusterData.filter(t => t.avg_strength >= 80).length}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Weak Clusters</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {mockClusterData.filter(t => t.avg_strength < 50).length}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Info size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Avg Strength</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {(mockClusterData.reduce((sum, t) => sum + t.avg_strength, 0) / mockClusterData.length).toFixed(0)}%
            </Text>
          </MotiView>
        </View>

        {/* Interactive Bubble Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Chart Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-700/30">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg items-center justify-center mr-3">
                <Bookmark size={16} color="#ffffff" />
              </View>
              <Text className="text-lg font-bold text-slate-100">
                Interactive Bookmark Clusters
              </Text>
            </View>
            <Text className="text-slate-400 text-sm">
              Scale: {scale.toFixed(1)}x
            </Text>
          </View>

          {/* Chart Container with Gesture Handling */}
          <View className="p-4">
            <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
              <PanGestureHandler onGestureEvent={onPanGestureEvent}>
                <View 
                  className="bg-slate-900/40 rounded-xl border border-slate-600/30 overflow-hidden"
                  style={{ width: chartWidth, height: chartHeight }}
                >
                  <MotiView
                    animate={{
                      scale,
                      translateX,
                      translateY,
                    }}
                    transition={{ type: 'spring', duration: 300 }}
                    className="w-full h-full"
                  >
                    <Svg width={chartWidth} height={chartHeight}>
                      <Defs>
                        {/* Glow gradients */}
                        <RadialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                          <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                          <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                          <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </RadialGradient>
                      </Defs>

                      {/* Render bubbles */}
                      {currentData.map((item: any, index) => {
                        const position = getBubblePosition(index, currentData.length);
                        const bookmarks = viewLevel === 'subjects' ? item.totalBookmarks :
                                        viewLevel === 'chapters' ? item.totalBookmarks :
                                        item.bookmarks;
                        const strength = viewLevel === 'subjects' ? item.avgStrength :
                                       viewLevel === 'chapters' ? item.avgStrength :
                                       item.avg_strength;
                        
                        const bubbleSize = getBubbleSize(bookmarks);
                        const colors = getBubbleColor(strength);
                        const shouldPulse = strength < 50;
                        const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.2) : 1;

                        return (
                          <G key={index}>
                            {/* Glow effect */}
                            <Circle
                              cx={position.x}
                              cy={position.y}
                              r={bubbleSize * pulseScale + 15}
                              fill={`url(#${colors.glow})`}
                              opacity={shouldPulse ? 0.8 : 0.4}
                            />
                            
                            {/* Main bubble */}
                            <Circle
                              cx={position.x}
                              cy={position.y}
                              r={bubbleSize * pulseScale}
                              fill={colors.color}
                              stroke="#ffffff"
                              strokeWidth="3"
                              onPress={() => handleBubblePress(item, viewLevel, position)}
                            />

                            {/* Bookmark count */}
                            <SvgText
                              x={position.x}
                              y={position.y - 4}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="bold"
                              fill="#ffffff"
                            >
                              {bookmarks}
                            </SvgText>

                            {/* Strength percentage */}
                            <SvgText
                              x={position.x}
                              y={position.y + 8}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#ffffff"
                              opacity="0.9"
                            >
                              {strength.toFixed(0)}%
                            </SvgText>

                            {/* Item label */}
                            <SvgText
                              x={position.x}
                              y={position.y + bubbleSize + 20}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="600"
                              fill="#94a3b8"
                            >
                              {viewLevel === 'subjects' ? item.subject :
                               viewLevel === 'chapters' ? item.chapter :
                               item.topic}
                            </SvgText>
                          </G>
                        );
                      })}
                    </Svg>
                  </MotiView>
                </View>
              </PanGestureHandler>
            </PinchGestureHandler>
          </View>

          {/* Chart Instructions */}
          <View className="px-4 pb-4">
            <Text className="text-slate-400 text-sm text-center">
              Pinch to zoom • Drag to pan • Tap bubbles to drill down • Weak clusters pulse
            </Text>
          </View>
        </MotiView>

        {/* 7-Day Strength Decay Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-6"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">
                  7-Day Strength Decay Trend
                </Text>
                <Text className="text-slate-400 text-sm">
                  Average bookmark strength over time
                </Text>
              </View>
            </View>

            {/* Trend Indicator */}
            <View className="items-center">
              <View 
                className="px-3 py-1 rounded-full border"
                style={{ 
                  backgroundColor: `${trendInfo.color}20`,
                  borderColor: `${trendInfo.color}50`
                }}
              >
                <Text className="text-xs">
                  {trendInfo.icon} <Text 
                    className="font-bold"
                    style={{ color: trendInfo.color }}
                  >
                    {trendInfo.label}
                  </Text>
                </Text>
              </View>
              <Text className="text-xs text-slate-400 mt-1">
                Slope: {decayTrend.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Simple Line Chart using custom implementation */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <View style={{ width: '100%', height: 200 }}>
              <Svg width="100%" height="200">
                <Defs>
                  <RadialGradient id="trendGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={trendInfo.color} stopOpacity="0.8" />
                    <Stop offset="100%" stopColor={trendInfo.color} stopOpacity="0.3" />
                  </RadialGradient>
                </Defs>

                {/* Grid lines */}
                {[25, 50, 75, 100].map((value, index) => {
                  const y = 180 - (value / 100) * 160;
                  return (
                    <React.Fragment key={value}>
                      <SvgText
                        x="25"
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748b"
                      >
                        {value}%
                      </SvgText>
                    </React.Fragment>
                  );
                })}

                {/* Data points and line */}
                {decayData.map((point, index) => {
                  const x = 40 + (index / (decayData.length - 1)) * (chartWidth - 80);
                  const y = 180 - (point.averageStrength / 100) * 160;
                  
                  return (
                    <React.Fragment key={point.day}>
                      {/* Data point */}
                      <Circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill={trendInfo.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      
                      {/* Day label */}
                      <SvgText
                        x={x}
                        y="195"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                      >
                        {point.day}
                      </SvgText>

                      {/* Connect with line to next point */}
                      {index < decayData.length - 1 && (
                        <React.Fragment>
                          {(() => {
                            const nextPoint = decayData[index + 1];
                            const nextX = 40 + ((index + 1) / (decayData.length - 1)) * (chartWidth - 80);
                            const nextY = 180 - (nextPoint.averageStrength / 100) * 160;
                            
                            return (
                              <SvgText
                                x1={x}
                                y1={y}
                                x2={nextX}
                                y2={nextY}
                                stroke={trendInfo.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            );
                          })()}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          </View>
        </MotiView>

        {/* Legend */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Cluster Map Legend</Text>
          </View>
          
          <View className="space-y-3">
            <View>
              <Text className="text-slate-300 text-sm font-medium mb-2">Bubble Size = Number of Bookmarks</Text>
              <Text className="text-slate-400 text-xs">
                Larger bubbles indicate more bookmarked content in that area
              </Text>
            </View>
            
            <View>
              <Text className="text-slate-300 text-sm font-medium mb-2">Color = Average Strength</Text>
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-slate-400 text-xs">Strong (≥80%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
                  <Text className="text-slate-400 text-xs">Moderate (50-79%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
                  <Text className="text-slate-400 text-xs">Weak (<50%) - Pulses</Text>
                </View>
              </View>
            </View>
            
            <View>
              <Text className="text-slate-300 text-sm font-medium mb-2">Interactions</Text>
              <Text className="text-slate-400 text-xs">
                Pinch to zoom • Drag to pan • Tap bubbles to drill down • Long press for details
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Navigation Breadcrumb */}
        {(viewLevel === 'chapters' || viewLevel === 'topics') && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1200 }}
            className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
          >
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-sm">Navigation: </Text>
              <Pressable
                onPress={() => {
                  setViewLevel('subjects');
                  setSelectedSubject(null);
                  setSelectedChapter(null);
                }}
                className="px-2 py-1 rounded bg-slate-600/50"
              >
                <Text className="text-amber-400 text-sm">Subjects</Text>
              </Pressable>
              
              {selectedSubject && (
                <>
                  <Text className="text-slate-500 mx-2">→</Text>
                  <Pressable
                    onPress={() => {
                      setViewLevel('chapters');
                      setSelectedChapter(null);
                    }}
                    className="px-2 py-1 rounded bg-slate-600/50"
                  >
                    <Text className="text-amber-400 text-sm">{selectedSubject.subject}</Text>
                  </Pressable>
                </>
              )}
              
              {selectedChapter && (
                <>
                  <Text className="text-slate-500 mx-2">→</Text>
                  <View className="px-2 py-1 rounded bg-amber-600/30">
                    <Text className="text-amber-300 text-sm">{selectedChapter.chapter}</Text>
                  </View>
                </>
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>

      {/* Tooltip */}
      {selectedTooltip && (
        <BubbleTooltip
          data={selectedTooltip}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}