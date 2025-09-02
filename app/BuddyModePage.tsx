import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import PeerProgressSyncMeter from '@/components/PeerProgressSyncMeter';
import AccountabilityNudges from '@/components/AccountabilityNudges';
import CoopChallenges from '@/components/CoopChallenges';

// Mock data for BuddyGapRadar
interface GapData {
  gap: string;
  arjun_strength: number;
  meera_strength: number;
  overlap: boolean;
}

const mockGapData: GapData[] = [
  { gap: "Action Potential", arjun_strength: 85, meera_strength: 45, overlap: true },
  { gap: "Long Tracts", arjun_strength: 60, meera_strength: 75, overlap: true },
  { gap: "Enzyme Kinetics", arjun_strength: 40, meera_strength: 80, overlap: false },
  { gap: "Cardiac Cycle", arjun_strength: 90, meera_strength: 55, overlap: true },
  { gap: "Renal Clearance", arjun_strength: 70, meera_strength: 65, overlap: true },
  { gap: "Starling Forces", arjun_strength: 55, meera_strength: 85, overlap: false }
];

// Mock data for other components
const buddyProgressData = {
  buddyA: { name: "Arjun", completedPYQs: 1800 },
  buddyB: { name: "Meera", completedPYQs: 2100 },
  totalPYQs: 9960
};

const mockNudges = [
  { 
    id: 1, 
    type: 'catchup' as const, 
    message: "⚡ Meera is 250 PYQs ahead. Time to close the gap!", 
    buddyFrom: "Meera", 
    buddyTo: "Arjun", 
    timestamp: "2 hours ago" 
  },
  { 
    id: 2, 
    type: 'challenge' as const, 
    message: "🎯 Arjun mastered DNA today. Can you match it?", 
    buddyFrom: "Arjun", 
    buddyTo: "Meera", 
    timestamp: "4 hours ago" 
  },
  { 
    id: 3, 
    type: 'motivation' as const, 
    message: "🔥 You both are crushing it! Keep the momentum going!", 
    buddyFrom: "System", 
    buddyTo: "Both", 
    timestamp: "6 hours ago" 
  },
  { 
    id: 4, 
    type: 'reminder' as const, 
    message: "🔔 Don't forget your daily Biochemistry session!", 
    buddyFrom: "System", 
    buddyTo: "Arjun", 
    timestamp: "1 day ago" 
  }
];

const mockChallenges = [
  {
    id: 1,
    type: "daily" as const,
    target: "20 PYQs",
    status: "in_progress" as const,
    progress: 70,
    title: "Daily Sprint",
    description: "Complete 20 PYQs today",
    timeLeft: "6 hours left",
    reward: "100 XP each",
    buddyProgress: { "Arjun": 70, "Meera": 85 }
  },
  {
    id: 2,
    type: "weekly" as const,
    target: "200 PYQs",
    status: "locked" as const,
    progress: 0,
    title: "Weekly Marathon",
    description: "Complete 200 PYQs this week",
    timeLeft: "Unlocks tomorrow",
    reward: "500 XP + Badge"
  },
  {
    id: 3,
    type: "subject" as const,
    target: "Finish 80% Biochem PYQs",
    status: "completed" as const,
    progress: 100,
    title: "Biochemistry Mastery",
    description: "Master 80% of Biochemistry PYQs",
    reward: "Mastery Badge",
    buddyProgress: { "Arjun": 100, "Meera": 95 }
  }
];

// BuddyGapRadar Component
interface BuddyGapRadarProps {
  gapData: GapData[];
}

function BuddyGapRadar({ gapData }: BuddyGapRadarProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Calculate summary stats
  const overlapGaps = gapData.filter(g => g.overlap).length;
  const arjunStronger = gapData.filter(g => g.arjun_strength > g.meera_strength).length;
  const meeraStronger = gapData.filter(g => g.meera_strength > g.arjun_strength).length;
  const avgStrengthDiff = gapData.reduce((sum, g) => sum + Math.abs(g.arjun_strength - g.meera_strength), 0) / gapData.length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 1200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
      style={{
        shadowColor: '#8b5cf6',
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
            transition={{ type: 'spring', duration: 800, delay: 1400 }}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#8b5cf6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Users size={24} color="#ffffff" />
            
            {/* Rotating glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.4 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 6000,
              }}
              className="absolute inset-0 rounded-xl bg-purple-400/20"
            />
          </MotiView>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Buddy Gap Radar 🎯
            </Text>
            <Text className="text-slate-400 text-base">
              Compare knowledge strengths across key learning gaps
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="items-center"
        >
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30 shadow-lg">
            <Text className="text-purple-400 font-bold text-2xl">
              {overlapGaps}
            </Text>
            <Text className="text-purple-300/80 text-xs text-center font-medium">
              shared gaps
            </Text>
          </View>
        </MotiView>
      </View>

      {/* Summary Metrics */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-700/30">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white font-bold text-sm">A</Text>
            </View>
            <Text className="text-emerald-400 font-semibold text-sm">Arjun Leads</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {arjunStronger}
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            topics
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1900 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white font-bold text-sm">M</Text>
            </View>
            <Text className="text-purple-400 font-semibold text-sm">Meera Leads</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {meeraStronger}
          </Text>
          <Text className="text-purple-300/80 text-xs">
            topics
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 2000 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Users size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Shared Gaps</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {overlapGaps}
          </Text>
          <Text className="text-amber-300/80 text-xs">
            both struggle
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 2100 }}
          className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Heart size={16} color="#06b6d4" />
            <Text className="text-cyan-400 font-semibold text-sm ml-2">Avg Gap</Text>
          </View>
          <Text className="text-cyan-200 text-xl font-bold">
            {avgStrengthDiff.toFixed(0)}%
          </Text>
          <Text className="text-cyan-300/80 text-xs">
            difference
          </Text>
        </MotiView>
      </View>

      {/* Gap Analysis Grid */}
      <View className="p-6">
        <Text className="text-lg font-bold text-slate-100 mb-4 text-center">
          Knowledge Gap Comparison
        </Text>
        
        <View className="space-y-3">
          {gapData.map((gap, index) => {
            const strengthDiff = Math.abs(gap.arjun_strength - gap.meera_strength);
            const stronger = gap.arjun_strength > gap.meera_strength ? 'Arjun' : 'Meera';
            const isBalanced = strengthDiff <= 15;
            
            return (
              <MotiView
                key={gap.gap}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2200 + index * 100 }}
                className={`rounded-xl p-4 border ${
                  isBalanced 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : gap.overlap
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-700/40 border-slate-600/30'
                }`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-slate-100 font-semibold text-base mb-1">
                      {gap.gap}
                    </Text>
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-emerald-400 text-sm">
                        Arjun: <Text className="font-bold">{gap.arjun_strength}%</Text>
                      </Text>
                      <Text className="text-purple-400 text-sm">
                        Meera: <Text className="font-bold">{gap.meera_strength}%</Text>
                      </Text>
                    </View>
                  </View>
                  
                  {/* Status Indicator */}
                  <View className="items-center">
                    {isBalanced ? (
                      <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                        <Text className="text-white text-lg">⚖️</Text>
                      </View>
                    ) : gap.overlap ? (
                      <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center">
                        <Text className="text-white text-lg">🤝</Text>
                      </View>
                    ) : (
                      <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                        <Text className="text-white text-lg">💡</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Progress Bars */}
                <View className="space-y-2">
                  <View>
                    <View className="w-full bg-slate-600 rounded-full h-2">
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${gap.arjun_strength}%` }}
                        transition={{ type: 'spring', duration: 1000, delay: 2400 + index * 100 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      />
                    </View>
                  </View>
                  <View>
                    <View className="w-full bg-slate-600 rounded-full h-2">
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${gap.meera_strength}%` }}
                        transition={{ type: 'spring', duration: 1000, delay: 2500 + index * 100 }}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                      />
                    </View>
                  </View>
                </View>

                {/* Insight */}
                <View className="mt-3 pt-3 border-t border-slate-600/30">
                  <Text className="text-slate-400 text-sm">
                    {isBalanced 
                      ? "⚖️ Balanced strengths - great for peer learning!"
                      : gap.overlap
                      ? `🤝 Both need help - ${stronger} leads by ${strengthDiff}%`
                      : `💡 ${stronger} could mentor this topic (${strengthDiff}% advantage)`
                    }
                  </Text>
                </View>
              </MotiView>
            );
          })}
        </View>
      </View>
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
                  Stay in Sync – 1-to-1 peer accountability
                </Text>
                <Text className="text-sm text-blue-400 mt-2 font-medium">
                  Study together, grow together, succeed together
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Buddy Connection Status */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
            className="items-center"
          >
            <View className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl px-6 py-4 border border-purple-500/30 shadow-xl">
              <View className="flex-row items-center space-x-2 mb-2">
                <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-sm">A</Text>
                </View>
                <MotiView
                  from={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 2000,
                  }}
                >
                  <Heart size={16} color="#ec4899" />
                </MotiView>
                <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
                  <Text className="text-white font-bold text-sm">M</Text>
                </View>
              </View>
              <Text className="text-purple-300/80 text-sm text-center font-medium">
                Connected
              </Text>
              <View className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mt-1 animate-pulse" />
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
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 800 }}
        >
          <PeerProgressSyncMeter data={buddyProgressData} />
        </MotiView>

        {/* Section 2: Accountability Nudges */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1000 }}
        >
          <AccountabilityNudges 
            nudges={mockNudges}
            onNudgeDismiss={(nudgeId) => console.log('Dismissed nudge:', nudgeId)}
            onNudgeAction={(nudge) => console.log('Action on nudge:', nudge)}
          />
        </MotiView>

        {/* Section 3: Buddy Gap Radar */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1200 }}
        >
          <BuddyGapRadar gapData={mockGapData} />
        </MotiView>

        {/* Section 4: Co-op Challenges */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1400 }}
        >
          <CoopChallenges 
            challenges={mockChallenges}
            onChallengeStart={(challenge) => console.log('Starting challenge:', challenge)}
            onChallengeComplete={(challenge) => console.log('Completed challenge:', challenge)}
          />
        </MotiView>

        {/* Motivational Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1600 }}
          className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-pink-900/60 rounded-2xl p-6 border border-indigo-500/20 shadow-xl mt-6"
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