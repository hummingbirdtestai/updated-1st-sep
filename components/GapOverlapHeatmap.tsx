import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, TrendingUp, Target, Clock, X, Info, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface GapOverlap {
  Top10: number;
  Mid50: number;
  Bottom40: number;
}

interface GapData {
  gap: string;
  overlap: GapOverlap;
  avg_time_lost_hr: number;
}

interface TooltipData {
  gap: string;
  peerBand: string;
  overlapPercent: number;
  avgTimeLost: number;
  position: { x: number; y: number };
}

interface HeatmapCellProps {
  gap: string;
  peerBand: string;
  overlapPercent: number;
  avgTimeLost: number;
  maxOverlap: number;
  onPress: (data: TooltipData) => void;
  rowIndex: number;
  colIndex: number;
}

interface GapOverlapHeatmapProps {
  data?: GapData[];
}

// Mock data
const mockData: GapData[] = [
  { 
    gap: "Action Potential", 
    overlap: { Top10: 15, Mid50: 42, Bottom40: 68 }, 
    avg_time_lost_hr: 7.5 
  },
  { 
    gap: "Long Tracts", 
    overlap: { Top10: 10, Mid50: 35, Bottom40: 55 }, 
    avg_time_lost_hr: 11 
  },
  { 
    gap: "Renin Angiotensin", 
    overlap: { Top10: 20, Mid50: 30, Bottom40: 50 }, 
    avg_time_lost_hr: 5 
  },
  {
    gap: "Enzyme Kinetics",
    overlap: { Top10: 8, Mid50: 38, Bottom40: 72 },
    avg_time_lost_hr: 9.2
  },
  {
    gap: "Cardiac Cycle",
    overlap: { Top10: 12, Mid50: 45, Bottom40: 63 },
    avg_time_lost_hr: 6.8
  },
  {
    gap: "Starling Forces",
    overlap: { Top10: 18, Mid50: 28, Bottom40: 58 },
    avg_time_lost_hr: 8.3
  }
];

const peerBands = [
  { key: 'Top10', label: 'Top 10%', description: 'High performers', color: '#10b981' },
  { key: 'Mid50', label: 'Mid 50%', description: 'Average performers', color: '#f59e0b' },
  { key: 'Bottom40', label: 'At-risk 40%', description: 'Struggling students', color: '#ef4444' },
];

function HeatmapCell({ 
  gap, 
  peerBand, 
  overlapPercent, 
  avgTimeLost, 
  maxOverlap, 
  onPress, 
  rowIndex, 
  colIndex 
}: HeatmapCellProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for high overlap cells
  useEffect(() => {
    if (overlapPercent < 60) return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 800);
    
    return () => clearInterval(interval);
  }, [overlapPercent]);

  // Get color intensity based on overlap percentage
  const getColorIntensity = (percent: number, maxPercent: number) => {
    const intensity = percent / maxPercent;
    if (intensity >= 0.8) return { bg: '#dc2626', opacity: 0.9, label: 'Very High' }; // Dark red
    if (intensity >= 0.6) return { bg: '#ef4444', opacity: 0.8, label: 'High' }; // Red
    if (intensity >= 0.4) return { bg: '#f59e0b', opacity: 0.7, label: 'Medium' }; // Amber
    if (intensity >= 0.2) return { bg: '#eab308', opacity: 0.6, label: 'Low' }; // Yellow
    return { bg: '#10b981', opacity: 0.5, label: 'Very Low' }; // Green
  };

  const colorInfo = getColorIntensity(overlapPercent, maxOverlap);
  const shouldPulse = overlapPercent >= 60;
  const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.05) : 1;
  const pulseOpacity = shouldPulse ? (0.9 + Math.sin(pulsePhase) * 0.1) : colorInfo.opacity;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: pulseOpacity, 
        scale: pulseScale 
      }}
      transition={{ 
        type: 'spring', 
        duration: 600, 
        delay: (rowIndex * peerBands.length + colIndex) * 50 + 400 
      }}
      className="m-1"
    >
      <Pressable
        onPress={(event) => {
          const { pageX, pageY } = event.nativeEvent;
          onPress({
            gap,
            peerBand,
            overlapPercent,
            avgTimeLost,
            position: { x: pageX, y: pageY }
          });
        }}
        className="rounded-xl border-2 border-slate-600/30 overflow-hidden shadow-lg active:scale-95"
        style={{
          backgroundColor: colorInfo.bg,
          opacity: pulseOpacity,
          width: 120,
          height: 80,
          shadowColor: colorInfo.bg,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <MotiView
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 p-4 items-center justify-center"
        >
          <Text className="text-white font-bold text-xl mb-1">
            {overlapPercent}%
          </Text>
          <Text className="text-white/90 text-xs font-medium text-center">
            {colorInfo.label}
          </Text>
          <Text className="text-white/70 text-xs text-center mt-1">
            Overlap
          </Text>
          
          {/* High overlap indicator */}
          {overlapPercent >= 60 && (
            <View className="absolute top-1 right-1 w-4 h-4 bg-white/30 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">!</Text>
            </View>
          )}
        </MotiView>
      </Pressable>
    </MotiView>
  );
}

function GapTooltip({ data, onClose }: { data: TooltipData; onClose: () => void }) {
  const getOverlapSeverity = (percent: number) => {
    if (percent >= 60) return { color: '#ef4444', label: 'Very High Overlap', icon: '🚨' };
    if (percent >= 40) return { color: '#f59e0b', label: 'High Overlap', icon: '⚠️' };
    if (percent >= 20) return { color: '#eab308', label: 'Medium Overlap', icon: '💡' };
    return { color: '#10b981', label: 'Low Overlap', icon: '✅' };
  };

  const severity = getOverlapSeverity(data.overlapPercent);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(data.position.x - 140, Dimensions.get('window').width - 290)),
        top: data.position.y - 180,
        width: 280,
        shadowColor: severity.color,
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
        <View className="flex-row items-center mb-3">
          <Text className="text-lg mr-2">{severity.icon}</Text>
          <View className="flex-1">
            <Text className="text-slate-100 font-bold text-base">
              {data.gap}
            </Text>
            <Text className="text-slate-400 text-sm">
              vs {data.peerBand} Peers
            </Text>
          </View>
        </View>
        
        <View className="space-y-3">
          {/* Overlap Percentage */}
          <View 
            className="rounded-lg p-3 border"
            style={{ 
              backgroundColor: `${severity.color}20`,
              borderColor: `${severity.color}50`
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-slate-300 text-sm font-medium">Peer Overlap</Text>
              <Text 
                className="text-lg font-bold"
                style={{ color: severity.color }}
              >
                {data.overlapPercent}%
              </Text>
            </View>
            <Text 
              className="text-sm font-medium"
              style={{ color: severity.color }}
            >
              {severity.label}
            </Text>
          </View>

          {/* Time Impact */}
          <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={14} color="#f59e0b" />
                <Text className="text-slate-300 text-sm ml-2">Avg Time Lost</Text>
              </View>
              <Text className="text-amber-400 font-bold text-base">
                {data.avgTimeLost.toFixed(1)}h
              </Text>
            </View>
            <Text className="text-slate-400 text-xs mt-1">
              Per student struggling with this gap
            </Text>
          </View>

          {/* Peer Band Info */}
          <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
            <Text className="text-slate-300 text-sm font-medium mb-1">
              {data.peerBand} Performance Band
            </Text>
            <Text className="text-slate-400 text-xs">
              {data.peerBand === 'Top 10%' && 'High-performing students who rarely struggle with this concept'}
              {data.peerBand === 'Mid 50%' && 'Average-performing students with moderate difficulty'}
              {data.peerBand === 'At-risk 40%' && 'Students who frequently struggle with this concept'}
            </Text>
          </View>

          {/* Insight */}
          <View className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
            <Text className="text-cyan-200 text-sm">
              {data.overlapPercent >= 60 
                ? `This gap is common across ${data.peerBand.toLowerCase()} peers. Consider group study or shared resources.`
                : data.overlapPercent >= 40
                ? `Moderate overlap with ${data.peerBand.toLowerCase()} peers. You're not alone in this struggle.`
                : `Low overlap - this might be a unique challenge. Focus on personalized study strategies.`
              }
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function GapOverlapHeatmap({ data = mockData }: GapOverlapHeatmapProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Calculate max overlap for color scaling
  const maxOverlap = Math.max(
    ...data.flatMap(gap => [gap.overlap.Top10, gap.overlap.Mid50, gap.overlap.Bottom40])
  );

  // Calculate summary metrics
  const totalGaps = data.length;
  const highOverlapCells = data.reduce((count, gap) => {
    return count + Object.values(gap.overlap).filter(overlap => overlap >= 60).length;
  }, 0);
  const averageTimeLost = data.reduce((sum, gap) => sum + gap.avg_time_lost_hr, 0) / data.length;
  const mostCommonGap = data.reduce((max, gap) => {
    const maxOverlapValue = Math.max(...Object.values(gap.overlap));
    const currentMaxOverlap = Math.max(...Object.values(max.overlap));
    return maxOverlapValue > currentMaxOverlap ? gap : max;
  });

  const handleCellPress = (tooltipData: TooltipData) => {
    setSelectedTooltip(tooltipData);
  };

  const getPeerBandColor = (bandKey: string) => {
    switch (bandKey) {
      case 'Top10': return { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'Mid50': return { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'Bottom40': return { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      default: return { color: '#64748b', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    }
  };

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

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
            <Users size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Gap Overlap Heatmap</Text>
            <Text className="text-sm text-slate-400">
              Learning gap overlap across peer performance bands
            </Text>
          </View>
        </View>

        {/* Summary Badge */}
        <View className="items-center">
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30">
            <Text className="text-purple-400 font-bold text-xl">
              {averageTimeLost.toFixed(1)}h
            </Text>
            <Text className="text-purple-300/80 text-xs text-center">
              Avg Time Lost
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
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Gaps</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {totalGaps}
            </Text>
            <Text className="text-blue-300/80 text-xs">
              learning gaps
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">High Overlap</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {highOverlapCells}
            </Text>
            <Text className="text-red-300/80 text-xs">
              cells ≥60%
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Time Lost</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {averageTimeLost.toFixed(1)}h
            </Text>
            <Text className="text-amber-300/80 text-xs">
              per gap
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Most Common</Text>
            </View>
            <Text className="text-emerald-200 text-sm font-bold" numberOfLines={2}>
              {mostCommonGap.gap}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              {Math.max(...Object.values(mostCommonGap.overlap))}% max overlap
            </Text>
          </MotiView>
        </View>

        {/* Heatmap Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-8"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Heatmap Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <Users size={16} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                Gap-Peer Overlap Matrix
              </Text>
            </View>
            <Text className="text-slate-400 text-sm">
              Tap cells for detailed analysis
            </Text>
          </View>

          {/* Sticky Column Headers */}
          <View className="bg-slate-900/60 border-b border-slate-700/30">
            <View className="flex-row p-4">
              <View className="w-32" /> {/* Space for row labels */}
              <View className="flex-1 flex-row justify-around">
                {peerBands.map((band, index) => {
                  const colors = getPeerBandColor(band.key);
                  return (
                    <MotiView
                      key={band.key}
                      from={{ opacity: 0, translateY: -10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', duration: 400, delay: index * 100 + 200 }}
                      className={`${colors.bg} border ${colors.border} rounded-xl p-4 min-w-[120px] shadow-lg`}
                      style={{
                        shadowColor: colors.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                    >
                      <Text 
                        className="font-bold text-base text-center mb-1"
                        style={{ color: colors.color }}
                      >
                        {band.label}
                      </Text>
                      <Text className="text-slate-400 text-xs text-center">
                        {band.description}
                      </Text>
                    </MotiView>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Heatmap Rows */}
          <View className="p-4">
            <View className="space-y-4">
              {data.map((gapData, rowIndex) => (
                <MotiView
                  key={gapData.gap}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 800 + rowIndex * 100 }}
                  className="flex-row items-center"
                >
                  {/* Row Label */}
                  <View className="w-32 mr-4">
                    <View className="bg-slate-700/60 rounded-xl p-4 border border-slate-600/40 shadow-lg">
                      <Text className="text-slate-100 font-bold text-sm text-center mb-2">
                        {gapData.gap}
                      </Text>
                      <View className="items-center">
                        <View className="flex-row items-center">
                          <Clock size={12} color="#f59e0b" />
                          <Text className="text-amber-400 text-xs ml-1 font-semibold">
                            {gapData.avg_time_lost_hr.toFixed(1)}h
                          </Text>
                        </View>
                        <Text className="text-slate-500 text-xs">avg loss</Text>
                      </View>
                    </View>
                  </View>

                  {/* Heatmap Cells */}
                  <View className="flex-1 flex-row justify-around">
                    {peerBands.map((band, colIndex) => {
                      const overlapPercent = gapData.overlap[band.key as keyof GapOverlap];
                      return (
                        <HeatmapCell
                          key={`${gapData.gap}-${band.key}`}
                          gap={gapData.gap}
                          peerBand={band.label}
                          overlapPercent={overlapPercent}
                          avgTimeLost={gapData.avg_time_lost_hr}
                          maxOverlap={maxOverlap}
                          onPress={handleCellPress}
                          rowIndex={rowIndex}
                          colIndex={colIndex}
                        />
                      );
                    })}
                  </View>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Heatmap Legend */}
          <View className="p-6 border-t border-slate-700/30 bg-slate-900/20">
            <Text className="text-slate-100 font-semibold mb-4 text-center">Overlap Intensity Legend</Text>
            <View className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-red-600 mr-2" />
                <Text className="text-slate-300 text-sm">Very High (80%+)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-red-500 mr-2" />
                <Text className="text-slate-300 text-sm">High (60-79%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-amber-500 mr-2" />
                <Text className="text-slate-300 text-sm">Medium (40-59%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-yellow-500 mr-2" />
                <Text className="text-slate-300 text-sm">Low (20-39%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-emerald-500 mr-2" />
                <Text className="text-slate-300 text-sm">Very Low (0-19%)</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs mt-3 text-center">
              💡 Pulsing cells indicate very high overlap (≥60%) • Tap cells for detailed analysis
            </Text>
          </View>
        </MotiView>

        {/* Gap Analysis Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Peer Overlap Analysis
            </Text>
          </View>

          <View className="space-y-4">
            {data.map((gap, index) => {
              const maxOverlapInGap = Math.max(...Object.values(gap.overlap));
              const mostAffectedBand = Object.entries(gap.overlap).reduce((max, [band, overlap]) => 
                overlap > max.overlap ? { band, overlap } : max, { band: '', overlap: 0 }
              );

              return (
                <MotiView
                  key={gap.gap}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1400 + index * 150 }}
                  className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold text-base mb-1">
                        {gap.gap}
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        Most affects: <Text className="font-semibold text-red-400">
                          {peerBands.find(b => b.key === mostAffectedBand.band)?.label} 
                        </Text> ({mostAffectedBand.overlap}% overlap)
                      </Text>
                    </View>
                    
                    {/* Time Lost Badge */}
                    <View className="bg-amber-500/20 rounded-lg px-3 py-2 border border-amber-500/30">
                      <Text className="text-amber-400 font-bold text-lg">
                        {gap.avg_time_lost_hr.toFixed(1)}h
                      </Text>
                      <Text className="text-amber-300/80 text-xs text-center">
                        time lost
                      </Text>
                    </View>
                  </View>

                  {/* Overlap Distribution */}
                  <View className="space-y-2">
                    {peerBands.map((band) => {
                      const overlap = gap.overlap[band.key as keyof GapOverlap];
                      const colors = getPeerBandColor(band.key);
                      
                      return (
                        <View key={band.key} className="flex-row items-center">
                          <Text className="text-slate-300 text-sm w-20">
                            {band.label}:
                          </Text>
                          <View className="flex-1 bg-slate-600 rounded-full h-2 mx-3">
                            <MotiView
                              from={{ width: '0%' }}
                              animate={{ width: `${overlap}%` }}
                              transition={{ type: 'spring', duration: 1000, delay: 1600 + index * 150 }}
                              className="h-2 rounded-full"
                              style={{ backgroundColor: colors.color }}
                            />
                          </View>
                          <Text 
                            className="text-sm font-bold w-12 text-right"
                            style={{ color: colors.color }}
                          >
                            {overlap}%
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* Insights Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1800 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Key Insights & Recommendations</Text>
          </View>
          
          <View className="space-y-4">
            {/* Critical Gap */}
            <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <Text className="text-red-300 font-semibold mb-2">
                🚨 Most Critical Gap
              </Text>
              <Text className="text-red-200 text-sm">
                <Text className="font-bold">{mostCommonGap.gap}</Text> shows highest peer overlap. 
                Focus here for maximum impact and consider group study resources.
              </Text>
            </View>

            {/* Time Impact */}
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <Text className="text-amber-300 font-semibold mb-2">
                ⏰ Time Impact Analysis
              </Text>
              <Text className="text-amber-200 text-sm">
                Students lose an average of <Text className="font-bold">{averageTimeLost.toFixed(1)} hours</Text> per 
                learning gap. High overlap areas benefit most from collaborative study approaches.
              </Text>
            </View>

            {/* Study Strategy */}
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <Text className="text-emerald-300 font-semibold mb-2">
                🎯 Recommended Study Strategy
              </Text>
              <View className="space-y-1">
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">1.</Text> Target high overlap gaps (≥60%) with group study sessions
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">2.</Text> Share resources for commonly struggled concepts
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">3.</Text> Use individual study for low overlap gaps
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">4.</Text> Monitor progress and adjust based on peer movement
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      </ScrollView>

      {/* Tooltip */}
      {selectedTooltip && (
        <GapTooltip
          data={selectedTooltip}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}