import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Trophy, Target, Calendar, BookOpen, Lock, CheckCircle, Clock, Star, Zap, Users } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import ConfettiCannon from 'react-native-confetti-cannon';

interface Challenge {
  id: number;
  type: 'daily' | 'weekly' | 'subject';
  target: string;
  status: 'completed' | 'in_progress' | 'locked';
  progress: number;
  title?: string;
  description?: string;
  timeLeft?: string;
  reward?: string;
  buddyProgress?: { [key: string]: number };
}

interface CoopChallengesProps {
  challenges?: Challenge[];
  onChallengeStart?: (challenge: Challenge) => void;
  onChallengeComplete?: (challenge: Challenge) => void;
}

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status: 'completed' | 'in_progress' | 'locked';
  animated?: boolean;
}

function CircularProgress({ 
  progress, 
  size = 80, 
  strokeWidth = 8, 
  status,
  animated = true 
}: CircularProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Animate progress
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    const timer = setInterval(() => {
      setAnimatedProgress(prev => {
        const increment = progress / 50; // Animate over ~50 frames
        if (prev < progress) {
          return Math.min(prev + increment, progress);
        }
        return progress;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [progress, animated]);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: '#10b981', 
          glow: 'emeraldGlow',
          bg: 'rgba(16, 185, 129, 0.1)',
          label: 'Completed'
        };
      case 'in_progress':
        return { 
          color: '#3b82f6', 
          glow: 'blueGlow',
          bg: 'rgba(59, 130, 246, 0.1)',
          label: 'In Progress'
        };
      default:
        return { 
          color: '#64748b', 
          glow: 'grayGlow',
          bg: 'rgba(100, 116, 139, 0.1)',
          label: 'Locked'
        };
    }
  };

  const colors = getStatusColors(status);

  return (
    <View className="relative items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={colors.glow} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.color} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.color} stopOpacity="0.6" />
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
          stroke={`url(#${colors.glow})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Center Text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill={colors.color}
        >
          {animatedProgress.toFixed(0)}%
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          {colors.label.toLowerCase()}
        </SvgText>
      </Svg>

      {/* Glowing Ring for In Progress */}
      {status === 'in_progress' && (
        <MotiView
          from={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
          }}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: colors.color }}
        />
      )}

      {/* Completion Burst for Completed */}
      {status === 'completed' && (
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 1500,
          }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: colors.color, opacity: 0.2 }}
        />
      )}
    </View>
  );
}

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  onStart?: (challenge: Challenge) => void;
  onComplete?: (challenge: Challenge) => void;
}

function ChallengeCard({ challenge, index, onStart, onComplete }: ChallengeCardProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for in-progress challenges
  useEffect(() => {
    if (challenge.status !== 'in_progress') return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 800);
    
    return () => clearInterval(interval);
  }, [challenge.status]);

  const getChallengeTheme = (type: string) => {
    switch (type) {
      case 'daily':
        return {
          gradient: 'from-blue-500/20 via-cyan-500/15 to-sky-500/10',
          border: 'border-blue-500/30',
          iconBg: 'from-blue-500 to-cyan-600',
          textAccent: 'text-blue-300',
          shadowColor: '#3b82f6',
          icon: Calendar,
          emoji: '📅',
          label: 'Daily Challenge'
        };
      case 'weekly':
        return {
          gradient: 'from-purple-500/20 via-indigo-500/15 to-violet-500/10',
          border: 'border-purple-500/30',
          iconBg: 'from-purple-500 to-indigo-600',
          textAccent: 'text-purple-300',
          shadowColor: '#8b5cf6',
          icon: Target,
          emoji: '🎯',
          label: 'Weekly Challenge'
        };
      case 'subject':
        return {
          gradient: 'from-emerald-500/20 via-teal-500/15 to-green-500/10',
          border: 'border-emerald-500/30',
          iconBg: 'from-emerald-500 to-teal-600',
          textAccent: 'text-emerald-300',
          shadowColor: '#10b981',
          icon: BookOpen,
          emoji: '📚',
          label: 'Subject Mastery'
        };
      default:
        return {
          gradient: 'from-slate-500/20 via-slate-400/15 to-slate-300/10',
          border: 'border-slate-500/30',
          iconBg: 'from-slate-500 to-slate-600',
          textAccent: 'text-slate-300',
          shadowColor: '#64748b',
          icon: Trophy,
          emoji: '🏆',
          label: 'Challenge'
        };
    }
  };

  const theme = getChallengeTheme(challenge.type);
  const IconComponent = theme.icon;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} color="#10b981" />;
      case 'in_progress': return <Clock size={20} color="#3b82f6" />;
      default: return <Lock size={20} color="#64748b" />;
    }
  };

  const pulseScale = challenge.status === 'in_progress' ? (1 + Math.sin(pulsePhase) * 0.03) : 1;

  return (
    <MotiView
      from={{ 
        opacity: 0, 
        translateY: 50, 
        scale: 0.9,
        rotateX: '15deg'
      }}
      animate={{ 
        opacity: challenge.status === 'locked' ? 0.6 : 1, 
        translateY: 0, 
        scale: pulseScale,
        rotateX: '0deg'
      }}
      transition={{ 
        type: 'spring', 
        duration: 800, 
        delay: index * 200 + 300,
        damping: 15,
        stiffness: 200
      }}
      className={`bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-3xl p-6 mb-6 shadow-2xl ${
        challenge.status === 'locked' ? 'opacity-60' : ''
      }`}
      style={{
        shadowColor: theme.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: challenge.status === 'locked' ? 0.1 : 0.15,
        shadowRadius: 16,
        elevation: challenge.status === 'locked' ? 4 : 8,
      }}
    >
      {/* Animated Background Glow */}
      {challenge.status === 'in_progress' && (
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 3000,
            delay: index * 500,
          }}
          className="absolute inset-0 rounded-3xl"
          style={{ backgroundColor: theme.shadowColor }}
        />
      )}

      {/* Header Section */}
      <View className="flex-row items-center justify-between mb-6">
        {/* Challenge Icon and Info */}
        <View className="flex-row items-center flex-1">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              duration: 800, 
              delay: index * 200 + 500,
              damping: 12,
              stiffness: 300
            }}
            className={`w-16 h-16 bg-gradient-to-br ${theme.iconBg} rounded-2xl items-center justify-center mr-4 shadow-xl`}
            style={{
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Rotating background glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.2 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 8000,
              }}
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{ backgroundColor: theme.shadowColor }}
            />
            
            <IconComponent size={28} color="#ffffff" />
            
            {/* Emoji overlay */}
            <View className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-lg">
              <Text className="text-lg">{theme.emoji}</Text>
            </View>
          </MotiView>

          {/* Challenge Details */}
          <View className="flex-1">
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ 
                type: 'spring', 
                duration: 600, 
                delay: index * 200 + 700 
              }}
            >
              <Text className={`text-xl font-bold ${theme.textAccent} mb-1`}>
                {challenge.title || `${theme.label}`}
              </Text>
              <Text className="text-slate-300 text-base mb-2">
                {challenge.description || challenge.target}
              </Text>
              <View className="flex-row items-center space-x-4">
                {challenge.timeLeft && (
                  <View className="flex-row items-center">
                    <Clock size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-1">
                      {challenge.timeLeft}
                    </Text>
                  </View>
                )}
                {challenge.reward && (
                  <View className="flex-row items-center">
                    <Star size={14} color="#fbbf24" />
                    <Text className="text-amber-400 text-sm ml-1">
                      {challenge.reward}
                    </Text>
                  </View>
                )}
              </View>
            </MotiView>
          </View>
        </View>

        {/* Status Icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            duration: 400, 
            delay: index * 200 + 900 
          }}
          className="ml-4"
        >
          {getStatusIcon(challenge.status)}
        </MotiView>
      </View>

      {/* Progress Section */}
      <View className="flex-row items-center justify-between">
        {/* Buddy Progress (if available) */}
        {challenge.buddyProgress && (
          <View className="flex-1 mr-6">
            <Text className="text-slate-300 font-semibold mb-3">Buddy Progress</Text>
            <View className="space-y-3">
              {Object.entries(challenge.buddyProgress).map(([buddy, progress]) => (
                <View key={buddy} className="flex-row items-center">
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    buddy === 'Arjun' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <Text className="text-white font-bold text-sm">
                      {buddy.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-slate-300 text-sm">{buddy}</Text>
                      <Text className={`font-bold text-sm ${theme.textAccent}`}>
                        {progress}%
                      </Text>
                    </View>
                    <View className="w-full bg-slate-600 rounded-full h-2">
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ 
                          type: 'spring', 
                          duration: 1000, 
                          delay: index * 200 + 1000 
                        }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: buddy === 'Arjun' ? '#3b82f6' : '#8b5cf6' }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Main Progress Circle */}
        <View className="items-center">
          <CircularProgress 
            progress={challenge.progress} 
            size={100} 
            strokeWidth={12}
            status={challenge.status}
          />
          
          {/* Action Button */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: 'spring', 
              duration: 600, 
              delay: index * 200 + 1200 
            }}
            className="mt-4"
          >
            {challenge.status === 'completed' ? (
              <View className="bg-emerald-500/20 rounded-xl px-4 py-2 border border-emerald-500/50">
                <View className="flex-row items-center">
                  <CheckCircle size={16} color="#10b981" />
                  <Text className="text-emerald-300 font-semibold ml-2">
                    Completed!
                  </Text>
                </View>
              </View>
            ) : challenge.status === 'locked' ? (
              <View className="bg-slate-600/20 rounded-xl px-4 py-2 border border-slate-500/50">
                <View className="flex-row items-center">
                  <Lock size={16} color="#64748b" />
                  <Text className="text-slate-400 font-semibold ml-2">
                    Locked
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => onStart?.(challenge)}
                className={`bg-gradient-to-r ${theme.iconBg} rounded-xl px-6 py-3 shadow-lg active:scale-95 flex-row items-center`}
                style={{
                  shadowColor: theme.shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Zap size={16} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">
                  Continue
                </Text>
              </Pressable>
            )}
          </MotiView>
        </View>
      </View>

      {/* Completion Confetti */}
      {challenge.status === 'completed' && (
        <View className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: 20,
                translateX: Math.random() * 200 - 100,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                translateY: -60,
                translateX: Math.random() * 100 - 50,
                scale: [0, 1.2, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 3000,
                delay: i * 400 + index * 1000,
              }}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            >
              <View className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      )}
    </MotiView>
  );
}

export default function CoopChallenges({ 
  challenges = [],
  onChallengeStart,
  onChallengeComplete
}: CoopChallengesProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Mock data if none provided
  const mockChallenges: Challenge[] = [
    {
      id: 1,
      type: "daily",
      target: "20 PYQs",
      status: "in_progress",
      progress: 70,
      title: "Daily Sprint",
      description: "Complete 20 PYQs today",
      timeLeft: "6 hours left",
      reward: "100 XP each",
      buddyProgress: { "Arjun": 70, "Meera": 85 }
    },
    {
      id: 2,
      type: "weekly",
      target: "200 PYQs",
      status: "locked",
      progress: 0,
      title: "Weekly Marathon",
      description: "Complete 200 PYQs this week",
      timeLeft: "Unlocks tomorrow",
      reward: "500 XP + Badge"
    },
    {
      id: 3,
      type: "subject",
      target: "Finish 80% Biochem PYQs",
      status: "completed",
      progress: 100,
      title: "Biochemistry Mastery",
      description: "Master 80% of Biochemistry PYQs",
      reward: "Mastery Badge",
      buddyProgress: { "Arjun": 100, "Meera": 95 }
    },
    {
      id: 4,
      type: "daily",
      target: "Perfect accuracy streak",
      status: "in_progress",
      progress: 40,
      title: "Accuracy Challenge",
      description: "Maintain >90% accuracy for 5 PYQs",
      timeLeft: "Today",
      reward: "Streak Multiplier",
      buddyProgress: { "Arjun": 40, "Meera": 60 }
    }
  ];

  const displayChallenges = challenges.length > 0 ? challenges : mockChallenges;

  // Calculate summary stats
  const completedChallenges = displayChallenges.filter(c => c.status === 'completed').length;
  const inProgressChallenges = displayChallenges.filter(c => c.status === 'in_progress').length;
  const lockedChallenges = displayChallenges.filter(c => c.status === 'locked').length;
  const totalProgress = displayChallenges.reduce((sum, c) => sum + c.progress, 0) / displayChallenges.length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
      style={{
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Trophy size={24} color="#ffffff" />
            
            {/* Pulsing notification dot */}
            {inProgressChallenges > 0 && (
              <MotiView
                from={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 2000,
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full"
              />
            )}
          </MotiView>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Co-op Challenges 🏆
            </Text>
            <Text className="text-slate-400 text-base">
              Team up to complete challenges and earn rewards together
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View className="bg-emerald-500/20 rounded-full px-4 py-3 border border-emerald-500/30 shadow-lg">
            <Text className="text-emerald-400 font-bold text-2xl">
              {displayChallenges.length}
            </Text>
            <Text className="text-emerald-300/80 text-xs text-center font-medium">
              challenges
            </Text>
          </View>
        </MotiView>
      </View>

      {/* Summary Metrics */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 border-b border-slate-700/30">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <CheckCircle size={14} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Completed</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {completedChallenges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={14} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Active</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {inProgressChallenges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Lock size={14} color="#64748b" />
            <Text className="text-slate-400 font-semibold text-sm ml-2">Locked</Text>
          </View>
          <Text className="text-slate-200 text-xl font-bold">
            {lockedChallenges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Target size={14} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Avg Progress</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {totalProgress.toFixed(0)}%
          </Text>
        </MotiView>
      </View>

      {/* Challenges List */}
      <ScrollView 
        className="p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {displayChallenges.length > 0 ? (
          <View className="space-y-6">
            {displayChallenges.map((challenge, index) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                index={index}
                onStart={onChallengeStart}
                onComplete={onChallengeComplete}
              />
            ))}
          </View>
        ) : (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="items-center py-12"
          >
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Trophy size={32} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-slate-100 mb-2 text-center">
              No Active Challenges
            </Text>
            <Text className="text-slate-300 text-base text-center max-w-md">
              Complete your current studies to unlock new co-op challenges with your buddy!
            </Text>
          </MotiView>
        )}
      </ScrollView>

      {/* Create New Challenge Button */}
      {displayChallenges.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="p-6 border-t border-slate-700/30"
        >
          <Pressable 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 flex-row items-center justify-center shadow-lg active:scale-95"
            style={{
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Users size={20} color="#ffffff" />
            <Text className="text-white font-bold text-lg ml-2">
              Create New Challenge
            </Text>
            <Trophy size={20} color="#ffffff" style={{ marginLeft: 8 }} />
          </Pressable>
        </MotiView>
      )}
    </MotiView>
  );
}