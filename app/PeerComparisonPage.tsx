import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Target, TrendingUp, GitBranch } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import SafePercentileBands from '@/components/SafePercentileBands';
import GapOverlapHeatmap from '@/components/GapOverlapHeatmap';
import GapNetworkGraph from '@/components/GapNetworkGraph';
import PeerMirror from '@/components/PeerMirror';

export default function PeerComparisonPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Mock data for peer insights
  const peerInsights = [
    "65% of your peers also struggled with Long Tracts. Fixing this will boost you into the safer 55–60 percentile band.",
    "Only 5% of peers missed Renin Angiotensin. Fixing it makes you stand out and gives you an edge.",
    "78% of struggling students share your Action Potential confusion. You're not alone—tackle this together!",
    "Your Enzyme Kinetics gap affects only 12% of top performers. Mastering this puts you ahead of the curve."
  ];

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
          <View className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Users size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              Peer Comparison 👥
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              Safe benchmarks, not shaming
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
        {/* Top Section - Safe Percentile Bands */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Performance Percentile Bands
              </Text>
              <Text className="text-slate-400 text-sm">
                Your position relative to peer performance (normalized by study time)
              </Text>
            </View>
          </View>
          <SafePercentileBands />
        </MotiView>

        {/* Middle Section Layout */}
        <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'} mb-8`}>
          {/* Gap Overlap Heatmap */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-100">
                  Gap Overlap Analysis
                </Text>
                <Text className="text-slate-400 text-sm">
                  How your learning gaps compare with different peer groups
                </Text>
              </View>
            </View>
            <GapOverlapHeatmap />
          </MotiView>

          {/* Gap Network Graph */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <GitBranch size={16} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-100">
                  Gap Connection Network
                </Text>
                <Text className="text-slate-400 text-sm">
                  Interactive network showing gap relationships and peer overlap
                </Text>
              </View>
            </View>
            <GapNetworkGraph />
          </MotiView>
        </View>

        {/* Bottom Section - Peer Mirror Insights */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg items-center justify-center mr-3">
              <Users size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                AI Peer Insights
              </Text>
              <Text className="text-slate-400 text-sm">
                Personalized insights comparing your progress with peer patterns
              </Text>
            </View>
          </View>
          <PeerMirror 
            insights={peerInsights}
            onInsightBookmark={(insightId, message) => {
              console.log('Bookmarked insight:', insightId, message);
            }}
            bookmarkedInsights={new Set()}
          />
        </MotiView>
      </ScrollView>
    </View>
  );
}