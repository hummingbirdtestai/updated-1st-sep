import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, TrendingUp, Target, Zap, Clock, Award, Bell, Radar, Trophy, ChevronRight, Play, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Heart, Flame, Star, Users as Users2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Text as SvgText, Line, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import PeerProgressSyncMeter from '@/components/PeerProgressSyncMeter';
import AccountabilityNudges from '@/components/AccountabilityNudges';
import CoopChallenges from '@/components/CoopChallenges';

// Mock data
const buddyData = {
  buddyA: { name: "Arjun" },
  buddyB: { name: "Meera" }
};

const mockProgressData = {
  arjun: { pyqs_completed: 1250, accuracy: 72, study_hours: 85, streak: 7 },
  meera: { pyqs_completed: 1180, accuracy: 68, study_hours: 92, streak: 5 }
};

const buddyProgressData = {
  buddyA: { name: "Arjun", completedPYQs: 1800 },
  buddyB: { name: "Meera", completedPYQs: 2100 },
  totalPYQs: 9960
};

const mockNudges = [
  { id: 1, type: 'catchup', message: "⚡ Meera is 250 PYQs ahead. Time to close the gap!", buddyFrom: "Meera", buddyTo: "Arjun", timestamp: "2 hours ago" },
  { id: 2, type: 'challenge', message: "🎯 Arjun mastered DNA today. Can you match it?", buddyFrom: "Arjun", buddyTo: "Meera", timestamp: "4 hours ago" },
  { id: 3, type: 'motivation', message: "🔥 You both are crushing it! Keep the momentum going!", buddyFrom: "System", buddyTo: "Both", timestamp: "6 hours ago" }
];

const mockGapData = [
  { gap: "Action Potential", arjun_strength: 85, meera_strength: 45, overlap: true },
  { gap: "Long Tracts", arjun_strength: 60, meera_strength: 75, overlap: true },
  { gap: "Enzyme Kinetics", arjun_strength: 40, meera_strength: 80, overlap: false },
  { gap: "Cardiac Cycle", arjun_strength: 90, meera_strength: 55, overlap: true }
];

const mockChallenges = [
  { id: 1, title: "Biochemistry Sprint", description: "Complete 50 PYQs in Metabolism", progress: { arjun: 35, meera: 42 }, target: 50, timeLeft: "2 days", reward: "500 XP each" },
  { id: 2, title: "Accuracy Challenge", description: "Maintain >80% accuracy for 3 days", progress: { arjun: 2, meera: 1 }, target: 3, timeLeft: "5 days", reward: "Streak Multiplier" },
  { id: 3, title: "Gap Closer", description: "Fix 5 learning gaps together", progress: { arjun: 3, meera: 4 }, target: 5, timeLeft: "1 week", reward: "Exclusive Badge" }
];

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

function CircularProgress({ 
  value, 
  maxValue = 100, 
  size = 80, 
  strokeWidth = 8, 
  color = '#10b981',
  label = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;

  return (
    <View className="items-center">
      <View className="relative">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${value})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          
          {/* Center Text */}
          <SvgText
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill={color}
          >
            {value}
          </SvgText>
          <SvgText
            x={size / 2}
            y={size / 2 + 12}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {label}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

interface BuddyGapRadarProps {
  gapData: Array<{
    gap: string;
    arjun_strength: number;
    meera_strength: number;
    overlap: boolean;
  }>;
}

function BuddyGapRadar({ gapData }: BuddyGapRadarProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const radarSize = Math.min(width * 0.7, 350);
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;
  const maxRadius = radarSize * 0.35;

  // Generate radar points
  const generateRadarPoints = (dataKey: 'arjun_strength' | 'meera_strength') => {
    const angleStep = (2 * Math.PI) / gapData.length;
    return gapData.map((gap, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const radius = (gap[dataKey] / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, angle, radius, gap: gap.gap };
    });
  };

  const arjunPoints = generateRadarPoints('arjun_strength');
  const meeraPoints = generateRadarPoints('meera_strength');

  // Generate axis points for labels
  const axisPoints = gapData.map((gap, index) => {
    const angleStep = (2 * Math.PI) / gapData.length;
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = maxRadius + 40;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return { x, y, gap: gap.gap };
  });

  // Convert points to SVG path
  const pointsToPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
  };

  const arjunPath = pointsToPath(arjunPoints);
  const meeraPath = pointsToPath(meeraPoints);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 600 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
          <Radar size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-100">Buddy Gap Radar</Text>
          <Text className="text-slate-400 text-sm">
            Compare knowledge strengths across key topics
          </Text>
        </View>
      </View>

      {/* Radar Chart */}
      <View className="items-center mb-6">
        <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
          <View style={{ width: radarSize, height: radarSize }}>
            <Svg width={radarSize} height={radarSize}>
              <Defs>
                <LinearGradient id="arjunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="meeraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
                </LinearGradient>
              </Defs>

              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
                <Circle
                  key={`grid-${index}`}
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * ratio}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              ))}

              {/* Axis lines */}
              {axisPoints.map((point, index) => (
                <Line
                  key={`axis-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + maxRadius * Math.cos(point.x)}
                  y2={centerY + maxRadius * Math.sin(point.y)}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />
              ))}

              {/* Meera's area (background) */}
              <Path
                d={meeraPath}
                fill="url(#meeraGradient)"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeOpacity="0.8"
              />

              {/* Arjun's area (foreground) */}
              <Path
                d={arjunPath}
                fill="url(#arjunGradient)"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* Data points */}
              {arjunPoints.map((point, index) => (
                <Circle
                  key={`arjun-point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {meeraPoints.map((point, index) => (
                <Circle
                  key={`meera-point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#8b5cf6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* Gap labels */}
              {axisPoints.map((point, index) => (
                <SvgText
                  key={`label-${index}`}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {point.gap}
                </SvgText>
              ))}
            </Svg>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center space-x-6">
        <View className="flex-row items-center">
          <View className="w-4 h-3 bg-emerald-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">{buddyData.buddyA.name}</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-3 bg-purple-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">{buddyData.buddyB.name}</Text>
        </View>
      </View>

      {/* Gap Analysis */}
      <View className="mt-6 space-y-3">
        {gapData.map((gap, index) => {
          const strengthDiff = Math.abs(gap.arjun_strength - gap.meera_strength);
          const stronger = gap.arjun_strength > gap.meera_strength ? buddyData.buddyA.name : buddyData.buddyB.name;
          
          return (
            <MotiView
              key={gap.gap}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
              className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-100 font-medium">{gap.gap}</Text>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-emerald-400 text-sm font-bold">{gap.arjun_strength}%</Text>
                  <Text className="text-slate-500 text-sm">vs</Text>
                  <Text className="text-purple-400 text-sm font-bold">{gap.meera_strength}%</Text>
                </View>
              </View>
              {strengthDiff > 20 && (
                <Text className="text-slate-400 text-xs mt-1">
                  💡 {stronger} could help mentor this topic
                </Text>
              )}
            </MotiView>
          );
        })}
      </View>
    </MotiView>
  );
}

interface CoopChallengesProps {
  challenges: Array<{
    id: number;
    title: string;
    description: string;
    progress: { arjun: number; meera: number };
    target: number;
    timeLeft: string;
    reward: string;
  }>;
}

function CoopChallenges({ challenges }: CoopChallengesProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 800 }}
      className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-3 shadow-lg">
          <Trophy size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-100">Co-op Challenges</Text>
          <Text className="text-slate-400 text-sm">
            Team up to complete challenges and earn rewards together
          </Text>
        </View>
        
        {/* Active Challenges Count */}
        <View className="bg-emerald-500/20 rounded-full px-3 py-2 border border-emerald-500/30">
          <Text className="text-emerald-400 font-bold text-lg">
            {challenges.length}
          </Text>
          <Text className="text-emerald-300/80 text-xs text-center">
            active
          </Text>
        </View>
      </View>

      {/* Challenges List */}
      <View className="space-y-4">
        {challenges.map((challenge, index) => {
          const totalProgress = challenge.progress.arjun + challenge.progress.meera;
          const progressPercent = (totalProgress / (challenge.target * 2)) * 100;
          const isCompleted = totalProgress >= challenge.target * 2;
          
          return (
            <MotiView
              key={challenge.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1000 + index * 150 }}
              className={`rounded-xl p-4 border ${
                isCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-slate-700/40 border-slate-600/30'
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-slate-100 font-bold text-lg mb-1">
                    {challenge.title}
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    {challenge.description}
                  </Text>
                </View>
                
                {isCompleted ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <Clock size={24} color="#f59e0b" />
                )}
              </View>

              {/* Progress Bars */}
              <View className="space-y-3 mb-4">
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-emerald-300 text-sm font-medium">{buddyData.buddyA.name}</Text>
                    <Text className="text-emerald-400 font-bold">{challenge.progress.arjun}/{challenge.target}</Text>
                  </View>
                  <View className="w-full bg-slate-600 rounded-full h-2">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${(challenge.progress.arjun / challenge.target) * 100}%` }}
                      transition={{ type: 'spring', duration: 1000, delay: 1200 + index * 150 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-purple-300 text-sm font-medium">{buddyData.buddyB.name}</Text>
                    <Text className="text-purple-400 font-bold">{challenge.progress.meera}/{challenge.target}</Text>
                  </View>
                  <View className="w-full bg-slate-600 rounded-full h-2">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${(challenge.progress.meera / challenge.target) * 100}%` }}
                      transition={{ type: 'spring', duration: 1000, delay: 1300 + index * 150 }}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                    />
                  </View>
                </View>
              </View>

              {/* Challenge Details */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-400 text-sm">Time Left: <Text className="text-amber-400 font-semibold">{challenge.timeLeft}</Text></Text>
                  <Text className="text-slate-400 text-sm">Reward: <Text className="text-cyan-400 font-semibold">{challenge.reward}</Text></Text>
                </View>
                
                <Pressable 
                  className={`rounded-xl px-4 py-2 flex-row items-center ${
                    isCompleted 
                      ? 'bg-emerald-600/30 border border-emerald-500/50' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}
                >
                  {isCompleted ? (
                    <Award size={16} color="#10b981" />
                  ) : (
                    <Play size={16} color="#ffffff" />
                  )}
                  <Text className={`ml-2 font-semibold ${
                    isCompleted ? 'text-emerald-300' : 'text-white'
                  }`}>
                    {isCompleted ? 'Completed' : 'Join'}
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          );
        })}
      </View>

      {/* Create Challenge Button */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="mt-6"
      >
        <Pressable className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 flex-row items-center justify-center shadow-lg active:scale-95">
          <Trophy size={20} color="#ffffff" />
          <Text className="text-white font-bold text-lg ml-2">Create New Challenge</Text>
          <ChevronRight size={20} color="#ffffff" />
        </Pressable>
      </MotiView>
    </MotiView>
  );
}

export default function BuddyModePage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Hero Header */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800 }}
        className="relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 8000,
          }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Text className="text-4xl">🤝</Text>
              
              {/* Rotating glow */}
              <MotiView
                from={{ rotate: '0deg', scale: 1 }}
                animate={{ rotate: '360deg', scale: 1.4 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-3xl bg-blue-400/20"
              />
            </MotiView>
            
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 400 }}
              >
                <Text className="text-4xl font-bold text-slate-100 mb-2">
                  Buddy Mode 🤝
                </Text>
                <Text className="text-xl text-slate-300">
                  1-to-1 peer accountability
                </Text>
                <Text className="text-sm text-blue-400 mt-2 font-medium">
                  Study together, grow together
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Buddy Info */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
            className="items-center"
          >
            <View className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl px-6 py-4 border border-purple-500/30 shadow-xl">
              <View className="flex-row items-center space-x-2">
                <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-sm">A</Text>
                </View>
                <Heart size={16} color="#ec4899" />
                <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-sm">M</Text>
                </View>
              </View>
              <Text className="text-purple-300/80 text-sm text-center font-medium mt-2">
                Study Buddies
              </Text>
            </View>
          </MotiView>
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
        {/* Section 1: Peer Progress Sync Meter */}
        <PeerProgressSyncMeter data={buddyProgressData} />

        {/* Section 2: Accountability Nudges */}
        <AccountabilityNudges 
          nudges={mockNudges}
          onNudgeDismiss={(nudgeId) => console.log('Dismissed nudge:', nudgeId)}
          onNudgeAction={(nudge) => console.log('Action on nudge:', nudge)}
        />

        {/* Section 3: Co-op Challenges */}
        <CoopChallenges 
          challenges={mockChallenges}
          onChallengeStart={(challenge) => console.log('Starting challenge:', challenge)}
          onChallengeComplete={(challenge) => console.log('Completed challenge:', challenge)}
        />

        {/* Section 4: Buddy Gap Radar */}
        <BuddyGapRadar gapData={mockGapData} />

        {/* Motivational Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-pink-900/60 rounded-2xl p-6 border border-indigo-500/20 shadow-xl"
          style={{
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center">
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                loop: true,
                type: 'spring',
                duration: 2000,
              }}
              className="mr-4"
            >
              <Text className="text-4xl">🌟</Text>
            </MotiView>
            <View className="flex-1">
              <Text className="text-indigo-200 text-lg leading-8 font-medium">
                Together you're stronger! Keep supporting each other through the challenges and 
                celebrate every milestone. Your buddy journey makes the path to success more enjoyable! 💪
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Floating Action Elements */}
        <View className="absolute top-32 right-8 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: Math.random() * 100,
                translateX: Math.random() * 100,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.3, 0],
                translateY: Math.random() * -200,
                translateX: Math.random() * 50 - 25,
                scale: [0, 1, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 6000,
                delay: i * 1000,
              }}
              className="absolute"
              style={{
                left: Math.random() * 100,
                top: Math.random() * 200,
              }}
            >
              <View className="w-2 h-2 bg-blue-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}