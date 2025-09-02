import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users2, Target, TrendingUp, GitBranch } from 'lucide-react-native';
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
    "🔥 65% of your peers also struggled with Long Tracts. Fixing this will boost you into the 55–60 percentile band.",
    "💎 Only 5% of peers missed Renin Angiotensin. Fixing it makes you stand out and gives you an edge.",
    "🚀 You are climbing into the Top 25% in Biochemistry. Keep the momentum going!",
    "🔥 78% of struggling students share your Action Potential confusion. You're not alone—tackle this together!"
  ];

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
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Users2 size={32} color="#ffffff" />
              
              {/* Rotating glow */}
              <MotiView
                from={{ rotate: '0deg', scale: 1 }}
                animate={{ rotate: '360deg', scale: 1.4 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-3xl bg-cyan-400/20"
              />
            </MotiView>
            
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 400 }}
              >
                <Text className="text-4xl font-bold text-slate-100 mb-2">
                  Peer Comparison 👥
                </Text>
                <Text className="text-xl text-slate-300">
                  Safe benchmarks, not shaming
                </Text>
                <Text className="text-sm text-cyan-400 mt-2 font-medium">
                  Understand your position in the peer landscape
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Floating stats */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
            className="items-center"
          >
            <View className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl px-6 py-4 border border-purple-500/30 shadow-xl">
              <Text className="text-purple-300 font-bold text-2xl text-center">
                3
              </Text>
              <Text className="text-purple-400/80 text-sm text-center font-medium">
                Subjects Tracked
              </Text>
            </View>
          </MotiView>
        </View>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 32,
        }}
      >
        {/* Hero Section - SafePercentileBands */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 800 }}
          className="px-6 py-8"
        >
          {/* Section Header */}
          <View className="flex-row items-center mb-8">
            <MotiView
              from={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1000 }}
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Target size={24} color="#ffffff" />
            </MotiView>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-slate-100 mb-1">
                Performance Radar
              </Text>
              <Text className="text-lg text-slate-400">
                Your position in the peer performance landscape
              </Text>
            </View>
          </View>

          {/* SafePercentileBands Component */}
          <SafePercentileBands />
        </MotiView>

        {/* Middle Section - Split Layout */}
        <View className="px-6">
          <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'} mb-8`}>
            {/* Left Panel - GapOverlapHeatmap */}
            <MotiView
              from={{ opacity: 0, translateX: -50, rotateY: '15deg' }}
              animate={{ opacity: 1, translateX: 0, rotateY: '0deg' }}
              transition={{ type: 'spring', duration: 1000, delay: 1200 }}
            >
              {/* Sticky Section Header */}
              <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-lg">
                <View className="flex-row items-center">
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 600, delay: 1400 }}
                    className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-3 shadow-lg"
                  >
                    <TrendingUp size={20} color="#ffffff" />
                  </MotiView>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-slate-100">
                      Gap Overlap Analysis
                    </Text>
                    <Text className="text-sm text-slate-400">
                      How your gaps compare across peer performance bands
                    </Text>
                  </View>
                </View>
              </View>
              
              <GapOverlapHeatmap />
            </MotiView>

            {/* Right Panel - GapNetworkGraph */}
            <MotiView
              from={{ opacity: 0, translateX: 50, rotateY: '-15deg' }}
              animate={{ opacity: 1, translateX: 0, rotateY: '0deg' }}
              transition={{ type: 'spring', duration: 1000, delay: 1400 }}
            >
              {/* Sticky Section Header */}
              <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-lg">
                <View className="flex-row items-center">
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 600, delay: 1600 }}
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg"
                  >
                    <GitBranch size={20} color="#ffffff" />
                  </MotiView>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-slate-100">
                      Gap Network
                    </Text>
                    <Text className="text-sm text-slate-400">
                      Interactive network of learning gap connections
                    </Text>
                  </View>
                </View>
              </View>
              
              <GapNetworkGraph />
            </MotiView>
          </View>
        </View>

        {/* Bottom Section - PeerMirror */}
        <MotiView
          from={{ opacity: 0, translateY: 60, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1200, delay: 1600 }}
          className="px-6"
        >
          {/* Sticky Section Header */}
          <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-slate-700/50 shadow-lg">
            <View className="flex-row items-center">
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 600, delay: 1800 }}
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg"
              >
                <Users2 size={20} color="#ffffff" />
              </MotiView>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-100">
                  AI Peer Insights
                </Text>
                <Text className="text-sm text-slate-400">
                  Personalized insights comparing your progress with peer patterns
                </Text>
              </View>
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
              <View className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}