import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Clock, Target, TrendingUp, Info } from 'lucide-react-native';

interface BuddyProgress {
  buddyA: { name: string; completedPYQs: number };
  buddyB: { name: string; completedPYQs: number };
  totalPYQs: number;
}

interface PeerProgressSyncMeterProps {
  data?: BuddyProgress;
}

interface TooltipData {
  buddy: string;
  pyqs: number;
  hours: number;
  position: { x: number; y: number };
}

// Mock data
const mockData: BuddyProgress = {
  buddyA: { name: "Arjun", completedPYQs: 1800 },
  buddyB: { name: "Meera", completedPYQs: 2100 },
  totalPYQs: 9960
};

export default function PeerProgressSyncMeter({ data = mockData }: PeerProgressSyncMeterProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [animatedSyncScore, setAnimatedSyncScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState<TooltipData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Calculate metrics
  const timeA = data.buddyA.completedPYQs * 4.5; // minutes
  const timeB = data.buddyB.completedPYQs * 4.5; // minutes
  const maxTime = Math.max(timeA, timeB);
  const timeDiff = Math.abs(timeA - timeB);
  const syncPercent = maxTime > 0 ? 100 - (timeDiff / maxTime * 100) : 100;
  
  const progressA = (data.buddyA.completedPYQs / data.totalPYQs) * 100;
  const progressB = (data.buddyB.completedPYQs / data.totalPYQs) * 100;
  
  const hoursA = timeA / 60;
  const hoursB = timeB / 60;

  // Determine overlap zone
  const overlapStart = Math.min(progressA, progressB);
  const overlapEnd = Math.max(progressA, progressB);
  const overlapWidth = Math.abs(progressA - progressB);
  const isHighSync = syncPercent >= 80;

  // Animate sync score counter
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedSyncScore(prev => {
        const increment = syncPercent / 50; // Animate over ~50 frames
        if (prev < syncPercent) {
          return Math.min(prev + increment, syncPercent);
        }
        return syncPercent;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [syncPercent]);

  // Pulse animation for high sync
  useEffect(() => {
    if (!isHighSync) return;
    
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);
    
    return () => clearInterval(timer);
  }, [isHighSync]);

  const handleBuddyPress = (buddy: 'A' | 'B', event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const buddyData = buddy === 'A' ? data.buddyA : data.buddyB;
    const hours = buddy === 'A' ? hoursA : hoursB;
    const pyqs = buddy === 'A' ? data.buddyA.completedPYQs : data.buddyB.completedPYQs;

    setShowTooltip({
      buddy: buddyData.name,
      pyqs,
      hours,
      position,
    });
  };

  const getSyncColor = (score: number) => {
    if (score >= 90) return { color: '#10b981', label: 'Perfect Sync', glow: '#34d399' };
    if (score >= 80) return { color: '#22c55e', label: 'Excellent Sync', glow: '#4ade80' };
    if (score >= 70) return { color: '#eab308', label: 'Good Sync', glow: '#fbbf24' };
    if (score >= 60) return { color: '#f59e0b', label: 'Fair Sync', glow: '#fb923c' };
    return { color: '#ef4444', label: 'Poor Sync', glow: '#f87171' };
  };

  const syncInfo = getSyncColor(syncPercent);
  const pulseScale = isHighSync ? (1 + Math.sin(animationPhase) * 0.05) : 1;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: syncInfo.color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Users size={24} color="#ffffff" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Peer Progress Sync Meter
            </Text>
            <Text className="text-slate-400 text-base">
              How aligned are your study journeys?
            </Text>
          </View>
        </View>

        {/* Animated Sync Score */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: pulseScale, 
            opacity: 1 
          }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View 
            className="w-20 h-20 rounded-full border-4 items-center justify-center shadow-xl"
            style={{ 
              borderColor: syncInfo.color,
              backgroundColor: `${syncInfo.color}20`,
              shadowColor: syncInfo.glow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Text 
              className="text-2xl font-bold"
              style={{ color: syncInfo.color }}
            >
              {animatedSyncScore.toFixed(0)}
            </Text>
            <Text className="text-slate-400 text-xs">sync%</Text>
          </View>
          <Text 
            className="text-sm font-bold mt-2"
            style={{ color: syncInfo.color }}
          >
            {syncInfo.label}
          </Text>
        </MotiView>
      </View>

      {/* Buddy Info Cards */}
      <View className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'} mb-8`}>
        {/* Buddy A Card */}
        <MotiView
          from={{ opacity: 0, translateX: -30, scale: 0.9 }}
          animate={{ opacity: 1, translateX: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 shadow-lg"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full items-center justify-center mr-4 shadow-lg">
              <Text className="text-white font-bold text-xl">A</Text>
            </View>
            <View className="flex-1">
              <Text className="text-blue-300 font-bold text-xl">{data.buddyA.name}</Text>
              <Text className="text-blue-400/80 text-sm">Study Buddy</Text>
            </View>
          </View>
          
          <Pressable
            onPress={(event) => handleBuddyPress('A', event)}
            className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 active:scale-95"
          >
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">PYQs Completed</Text>
                <Text className="text-blue-400 font-bold text-lg">
                  {data.buddyA.completedPYQs.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">Study Time</Text>
                <Text className="text-blue-400 font-bold text-lg">
                  {hoursA.toFixed(1)}h
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">Progress</Text>
                <Text className="text-blue-400 font-bold text-lg">
                  {progressA.toFixed(1)}%
                </Text>
              </View>
            </View>
          </Pressable>
        </MotiView>

        {/* Buddy B Card */}
        <MotiView
          from={{ opacity: 0, translateX: 30, scale: 0.9 }}
          animate={{ opacity: 1, translateX: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 900 }}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6 shadow-lg"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full items-center justify-center mr-4 shadow-lg">
              <Text className="text-white font-bold text-xl">M</Text>
            </View>
            <View className="flex-1">
              <Text className="text-emerald-300 font-bold text-xl">{data.buddyB.name}</Text>
              <Text className="text-emerald-400/80 text-sm">Study Buddy</Text>
            </View>
          </View>
          
          <Pressable
            onPress={(event) => handleBuddyPress('B', event)}
            className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 active:scale-95"
          >
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">PYQs Completed</Text>
                <Text className="text-emerald-400 font-bold text-lg">
                  {data.buddyB.completedPYQs.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">Study Time</Text>
                <Text className="text-emerald-400 font-bold text-lg">
                  {hoursB.toFixed(1)}h
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-300 text-sm">Progress</Text>
                <Text className="text-emerald-400 font-bold text-lg">
                  {progressB.toFixed(1)}%
                </Text>
              </View>
            </View>
          </Pressable>
        </MotiView>
      </View>

      {/* Dual Progress Bars with Overlap Zone */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800, delay: 1000 }}
        className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-6"
      >
        <Text className="text-lg font-bold text-slate-100 mb-6 text-center">
          Progress Synchronization Visualization
        </Text>

        {/* Progress Track Container */}
        <View className="relative mb-8">
          {/* Background Track */}
          <View className="w-full h-8 bg-slate-700/60 rounded-full overflow-hidden">
            {/* Buddy A Progress Bar */}
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${progressA}%` }}
              transition={{ 
                type: 'spring', 
                duration: 2000, 
                delay: 1200,
                damping: 15,
                stiffness: 100
              }}
              className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 4,
              }}
            />

            {/* Buddy B Progress Bar */}
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${progressB}%` }}
              transition={{ 
                type: 'spring', 
                duration: 2000, 
                delay: 1400,
                damping: 15,
                stiffness: 100
              }}
              className="absolute bottom-0 left-0 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 4,
              }}
            />

            {/* Overlap Zone Glow */}
            {isHighSync && (
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0.6 + Math.sin(animationPhase) * 0.2,
                  scale: 1 + Math.sin(animationPhase) * 0.05
                }}
                transition={{ type: 'timing', duration: 500 }}
                className="absolute inset-0 rounded-full"
                style={{
                  left: `${overlapStart}%`,
                  width: `${overlapWidth}%`,
                  backgroundColor: '#fbbf24',
                  shadowColor: '#fbbf24',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              />
            )}
          </View>

          {/* Progress Labels */}
          <View className="flex-row justify-between mt-3">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <Text className="text-blue-300 text-sm font-medium">
                {data.buddyA.name}: {progressA.toFixed(1)}%
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
              <Text className="text-emerald-300 text-sm font-medium">
                {data.buddyB.name}: {progressB.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Overlap Zone Indicator */}
          {isHighSync && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1800 }}
              className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
            >
              <View className="flex-row items-center justify-center">
                <View className="w-4 h-4 bg-yellow-500 rounded-full mr-2 animate-pulse" />
                <Text className="text-yellow-300 font-semibold text-sm">
                  High Sync Zone Active! You're studying at similar paces.
                </Text>
              </View>
            </MotiView>
          )}
        </View>

        {/* Sync Analysis */}
        <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <TrendingUp size={16} color={syncInfo.color} />
              <Text className="text-slate-100 font-semibold ml-2">Sync Analysis</Text>
            </View>
            <Text 
              className="font-bold text-lg"
              style={{ color: syncInfo.color }}
            >
              {syncInfo.label}
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-cyan-400">Time Difference:</Text> {(timeDiff / 60).toFixed(1)} hours
            </Text>
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-purple-400">Leader:</Text> {
                data.buddyA.completedPYQs > data.buddyB.completedPYQs ? data.buddyA.name : data.buddyB.name
              } (+{Math.abs(data.buddyA.completedPYQs - data.buddyB.completedPYQs)} PYQs)
            </Text>
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-amber-400">Sync Formula:</Text> 100 - (|TimeA - TimeB| ÷ max(TimeA, TimeB) × 100)
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {syncPercent >= 90 
                ? "Perfect synchronization! You're both progressing at nearly identical rates."
                : syncPercent >= 80
                ? "Excellent sync! Minor differences in pace - keep supporting each other."
                : syncPercent >= 70
                ? "Good alignment with some variation. Consider coordinating study schedules."
                : syncPercent >= 60
                ? "Fair sync with noticeable gaps. The leader should help mentor the other."
                : "Significant pace difference. Consider adjusting study strategies to better align."
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Detailed Metrics */}
    </MotiView>

      <View className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">{data.buddyA.name}</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {data.buddyA.completedPYQs.toLocaleString()}
          </Text>
          <Text className="text-blue-300/80 text-xs">
            PYQs • {hoursA.toFixed(0)}h
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1700 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">{data.buddyB.name}</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {data.buddyB.completedPYQs.toLocaleString()}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            PYQs • {hoursB.toFixed(0)}h
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1800 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Time Gap</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {(timeDiff / 60).toFixed(1)}h
          </Text>
          <Text className="text-amber-300/80 text-xs">
            difference
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1900 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Remaining</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {((data.totalPYQs - Math.max(data.buddyA.completedPYQs, data.buddyB.completedPYQs)) / 1000).toFixed(1)}k
          </Text>
          <Text className="text-purple-300/80 text-xs">
            PYQs left
          </Text>
        </MotiView>
      </View>

      {/* Hover Tooltip */}
      {showTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
          style={{
            left: Math.max(10, Math.min(showTooltip.position.x - 100, width - 210)),
            top: showTooltip.position.y - 120,
            width: 200,
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setShowTooltip(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
          >
            <Text className="text-slate-300 font-bold text-xs">×</Text>
          </Pressable>

          {/* Tooltip Content */}
          <View className="pr-6">
            <Text className="text-slate-100 font-bold text-base mb-2">
              {showTooltip.buddy}
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">PYQs</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {showTooltip.pyqs.toLocaleString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Study Time</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {showTooltip.hours.toFixed(1)} hours
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Minutes</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {(showTooltip.hours * 60).toFixed(0)}m
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Completion</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {((showTooltip.pyqs / data.totalPYQs) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      )}

      {/* Sync Recommendations */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 2000 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
      >
        <View className="flex-row items-center mb-3">
          <Info size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Sync Recommendations</Text>
        </View>
        
        <View className="space-y-3">
          {syncPercent >= 90 && (
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Text className="text-emerald-200 text-sm">
                🎯 <Text className="font-bold">Perfect Sync!</Text> You're both progressing excellently. 
                Keep up the momentum and continue supporting each other.
              </Text>
            </View>
          )}
          
          {syncPercent >= 70 && syncPercent < 90 && (
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <Text className="text-amber-200 text-sm">
                ⚡ <Text className="font-bold">Good Sync!</Text> Minor pace differences. 
                Consider coordinating study schedules for better alignment.
              </Text>
            </View>
          )}
          
          {syncPercent < 70 && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Text className="text-red-200 text-sm">
                🚨 <Text className="font-bold">Sync Gap Detected!</Text> {
                  data.buddyA.completedPYQs > data.buddyB.completedPYQs ? data.buddyA.name : data.buddyB.name
                } should help mentor the other to close the gap.
              </Text>
            </View>
          )}

          <View className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
            <Text className="text-cyan-200 text-sm">
              💡 <Text className="font-bold">Study Together:</Text> Plan joint study sessions for topics where 
              one buddy is stronger to maximize learning efficiency.
            </Text>
          </View>
        </View>
      </MotiView>
    </MotiView>
  );
}