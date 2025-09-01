import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Plane, Clock, Target, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import Svg, { Line, Circle as SvgCircle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import missionData from '@/data/mentor-flight-path-data.json';

interface Mission {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  mission_date: string;
  planned_pyqs: number;
  completed_pyqs: number;
  time_minutes: number;
  motivation_nudges: number;
  sample_messages: string[];
}

interface MissionTooltipProps {
  mission: Mission;
  position: { x: number; y: number };
  onClose: () => void;
}

function MissionTooltip({ mission, position, onClose }: MissionTooltipProps) {
  const completionPercent = mission.planned_pyqs > 0 ? (mission.completed_pyqs / mission.planned_pyqs) * 100 : 0;
  const isComplete = mission.completed_pyqs === mission.planned_pyqs;
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 120,
        width: 240,
        shadowColor: isComplete ? '#10b981' : '#ef4444',
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

      {/* Mission Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1">
          {mission.subject}
        </Text>
        <Text className="text-slate-300 text-xs mb-3">
          {mission.chapter} • {mission.topic}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Progress</Text>
            <Text className={`text-xs font-semibold ${isComplete ? 'text-emerald-400' : 'text-red-400'}`}>
              {mission.completed_pyqs}/{mission.planned_pyqs} PYQs
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Spent</Text>
            <Text className="text-slate-300 text-xs">
              {mission.time_minutes.toFixed(0)}m
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Completion</Text>
            <Text className={`text-xs font-semibold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
              {completionPercent.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Latest Message */}
        {mission.sample_messages.length > 0 && (
          <View className="mt-3 bg-slate-700/40 rounded-lg p-2">
            <Text className="text-slate-300 text-xs leading-4">
              "{mission.sample_messages[mission.sample_messages.length - 1]}"
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}

export default function FlightPathTimeline() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  // Get today's missions (last 5 for demo)
  const todaysMissions = missionData.slice(-5) as Mission[];
  
  const [selectedMission, setSelectedMission] = useState<{ mission: Mission; position: { x: number; y: number } } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animate the flight line
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleMissionPress = (mission: Mission, index: number) => {
    const checkpointSpacing = Math.min(120, (width - 80) / Math.max(1, todaysMissions.length - 1));
    const x = 40 + (index * checkpointSpacing);
    const y = 100;
    
    setSelectedMission({ mission, position: { x, y } });
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Anatomy': '#3b82f6',
      'Physiology': '#10b981',
      'Biochemistry': '#8b5cf6',
      'Pharmacology': '#f59e0b',
      'Pathology': '#ef4444',
      'Medicine': '#06b6d4',
    };
    return colors[subject] || '#64748b';
  };

  return (
    <View className="bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-700/40">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center mb-6"
      >
        <View className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3 shadow-lg">
          <Plane size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-100">
            Today's Flight Path
          </Text>
          <Text className="text-slate-400 text-sm">
            {todaysMissions.length} missions • Tap checkpoints for details
          </Text>
        </View>
      </MotiView>

      {/* Flight Path Container */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 20,
          paddingVertical: 40,
          minWidth: width - 48,
        }}
      >
        <View className="relative" style={{ height: 120, width: Math.max(width - 88, todaysMissions.length * 120) }}>
          {/* Flight Line SVG */}
          <Svg
            width="100%"
            height="120"
            className="absolute inset-0"
          >
            <Defs>
              <LinearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
                <Stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </LinearGradient>
              <LinearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset={`${(animationProgress * 100) - 10}%`} stopColor="transparent" stopOpacity="0" />
                <Stop offset={`${animationProgress * 100}%`} stopColor="#06b6d4" stopOpacity="1" />
                <Stop offset={`${(animationProgress * 100) + 10}%`} stopColor="transparent" stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Base Flight Line */}
            <Line
              x1="0"
              y1="60"
              x2="100%"
              y2="60"
              stroke="url(#flightGradient)"
              strokeWidth="3"
              strokeDasharray="5,5"
            />

            {/* Animated Flight Line */}
            <Line
              x1="0"
              y1="60"
              x2="100%"
              y2="60"
              stroke="url(#animatedGradient)"
              strokeWidth="4"
            />
          </Svg>

          {/* Mission Checkpoints */}
          {todaysMissions.map((mission, index) => {
            const isComplete = mission.completed_pyqs === mission.planned_pyqs;
            const completionPercent = mission.planned_pyqs > 0 ? (mission.completed_pyqs / mission.planned_pyqs) * 100 : 0;
            const checkpointSpacing = Math.min(120, (width - 80) / Math.max(1, todaysMissions.length - 1));
            const x = index * checkpointSpacing;
            const subjectColor = getSubjectColor(mission.subject);

            return (
              <MotiView
                key={mission.id}
                from={{ opacity: 0, scale: 0, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ 
                  type: 'spring', 
                  duration: 600, 
                  delay: index * 200 + 400 
                }}
                className="absolute items-center"
                style={{ left: x, top: 20 }}
              >
                {/* Checkpoint Dot */}
                <Pressable
                  onPress={() => handleMissionPress(mission, index)}
                  className="items-center"
                >
                  {/* Outer Ring */}
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      duration: 400, 
                      delay: index * 200 + 600 
                    }}
                    className={`w-12 h-12 rounded-full border-4 items-center justify-center shadow-lg ${
                      isComplete 
                        ? 'bg-emerald-500/20 border-emerald-500' 
                        : 'bg-red-500/20 border-red-500'
                    }`}
                    style={{
                      shadowColor: isComplete ? '#10b981' : '#ef4444',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    {/* Inner Dot */}
                    <View 
                      className={`w-6 h-6 rounded-full ${
                        isComplete ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />

                    {/* Completion Icon */}
                    <View className="absolute">
                      {isComplete ? (
                        <CheckCircle size={16} color="#ffffff" />
                      ) : (
                        <AlertCircle size={16} color="#ffffff" />
                      )}
                    </View>
                  </MotiView>

                  {/* Subject Label */}
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ 
                      type: 'spring', 
                      duration: 400, 
                      delay: index * 200 + 800 
                    }}
                    className="mt-2 items-center"
                  >
                    <Text 
                      className="text-xs font-semibold text-center"
                      style={{ color: subjectColor }}
                    >
                      {mission.subject}
                    </Text>
                    <Text className="text-xs text-slate-400 text-center mt-1">
                      {completionPercent.toFixed(0)}%
                    </Text>
                  </MotiView>
                </Pressable>

                {/* Pulsing Effect for Incomplete */}
                {!isComplete && (
                  <MotiView
                    from={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 2000,
                      delay: index * 200 + 1000,
                    }}
                    className="absolute w-12 h-12 rounded-full bg-red-500/30"
                    style={{ top: 0 }}
                  />
                )}

                {/* Success Glow for Complete */}
                {isComplete && (
                  <MotiView
                    from={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 3000,
                      delay: index * 200 + 1000,
                    }}
                    className="absolute w-12 h-12 rounded-full bg-emerald-500/20"
                    style={{ top: 0 }}
                  />
                )}
              </MotiView>
            );
          })}

          {/* Flying Plane Animation */}
          <MotiView
            from={{ translateX: -40 }}
            animate={{ 
              translateX: (width - 88) * animationProgress 
            }}
            transition={{ 
              type: 'timing', 
              duration: 100,
            }}
            className="absolute"
            style={{ top: 45, left: 0 }}
          >
            <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full items-center justify-center shadow-lg">
              <Plane size={14} color="#ffffff" style={{ transform: [{ rotate: '45deg' }] }} />
            </View>
          </MotiView>
        </View>
      </ScrollView>

      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="flex-row items-center justify-center mt-4 space-x-6"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-slate-300 text-sm">Completed</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
          <Text className="text-slate-300 text-sm">In Progress</Text>
        </View>
        <View className="flex-row items-center">
          <Plane size={14} color="#06b6d4" />
          <Text className="text-slate-300 text-sm ml-2">Your Journey</Text>
        </View>
      </MotiView>

      {/* Mission Tooltip */}
      {selectedMission && (
        <MissionTooltip
          mission={selectedMission.mission}
          position={selectedMission.position}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </View>
  );
}