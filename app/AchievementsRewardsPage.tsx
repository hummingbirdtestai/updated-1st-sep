import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Award, Trophy, Target, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import EffortRewardDashboard from '@/components/EffortRewardDashboard';

export default function AchievementsRewardsPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 pt-12 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Award size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              Achievements & Rewards 🏆
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              Track progress, earn XP, unlock badges
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
        {/* Effort-to-Reward Dashboard */}
        <EffortRewardDashboard />

        {/* Coming Soon Components */}
        <View className="space-y-6">
          {/* Adaptive Badge Path Placeholder */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 200 }}
            className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40 shadow-lg"
          >
            <View className="items-center text-center">
              <View className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl items-center justify-center mb-4">
                <Trophy size={32} color="#a78bfa" />
              </View>
              
              <Text className="text-2xl font-bold text-slate-100 mb-2">
                Adaptive Badge Path
              </Text>
              
              <Text className="text-slate-300 text-base mb-4 text-center max-w-md">
                Dynamic achievement system that adapts to your learning style and progress patterns
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-purple-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </MotiView>

          {/* Streak Economy Placeholder */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40 shadow-lg"
          >
            <View className="items-center text-center">
              <View className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl items-center justify-center mb-4">
                <Target size={32} color="#5eead4" />
              </View>
              
              <Text className="text-2xl font-bold text-slate-100 mb-2">
                Streak Economy
              </Text>
              
              <Text className="text-slate-300 text-base mb-4 text-center max-w-md">
                Gamified streak system with multipliers, bonus XP, and streak recovery mechanics
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-emerald-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </MotiView>

          {/* Rewards Timeline Placeholder */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
            className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40 shadow-lg"
          >
            <View className="items-center text-center">
              <View className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl items-center justify-center mb-4">
                <TrendingUp size={32} color="#60a5fa" />
              </View>
              
              <Text className="text-2xl font-bold text-slate-100 mb-2">
                Rewards Timeline
              </Text>
              
              <Text className="text-slate-300 text-base mb-4 text-center max-w-md">
                Chronological view of achievements, milestones, and reward unlocks over time
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-cyan-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </MotiView>
        </View>

        {/* Development Progress */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40 mt-6"
        >
          <Text className="text-slate-100 font-semibold mb-4">Development Roadmap</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-sm">Effort-to-Reward Dashboard</Text>
              <Text className="text-emerald-400 text-sm font-medium">✓ Complete</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-sm">Adaptive Badge System</Text>
              <Text className="text-amber-400 text-sm font-medium">⏳ In Progress</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-sm">Streak Economy Engine</Text>
              <Text className="text-slate-500 text-sm font-medium">⏸ Planned</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-sm">Rewards Timeline</Text>
              <Text className="text-slate-500 text-sm font-medium">⏸ Planned</Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}