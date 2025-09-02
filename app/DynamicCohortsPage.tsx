import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Flame, Users, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import CohortGapHeatmap from '@/components/CohortGapHeatmap';
import TopicCohesionScore from '@/components/TopicCohesionScore';

export default function DynamicCohortsPage() {
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
          className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/20"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Flame size={32} color="#ffffff" />
              
              {/* Rotating glow */}
              <MotiView
                from={{ rotate: '0deg', scale: 1 }}
                animate={{ rotate: '360deg', scale: 1.4 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-3xl bg-orange-400/20"
              />
            </MotiView>
            
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 400 }}
              >
                <Text className="text-4xl font-bold text-slate-100 mb-2">
                  Dynamic Cohorts 🔥
                </Text>
                <Text className="text-xl text-slate-300">
                  Auto-generated topic groups based on learning patterns
                </Text>
                <Text className="text-sm text-orange-400 mt-2 font-medium">
                  Discover study groups formed by shared gaps and focus areas
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
            <View className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl px-6 py-4 border border-orange-500/30 shadow-xl">
              <Text className="text-orange-300 font-bold text-2xl text-center">
                5
              </Text>
              <Text className="text-orange-400/80 text-sm text-center font-medium">
                Students
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
        {/* Split View Layout */}
        <View className="px-6 py-8">
          <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'}`}>
            {/* Left Panel - Cohort Gap Heatmap */}
            <MotiView
              from={{ opacity: 0, translateX: -50, rotateY: '15deg' }}
              animate={{ opacity: 1, translateX: 0, rotateY: '0deg' }}
              transition={{ type: 'spring', duration: 1000, delay: 800 }}
            >
              {/* Section Header */}
              <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-lg">
                <View className="flex-row items-center">
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 600, delay: 1000 }}
                    className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl items-center justify-center mr-3 shadow-lg"
                  >
                    <TrendingUp size={20} color="#ffffff" />
                  </MotiView>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-slate-100">
                      Gap Intensity Heatmap
                    </Text>
                    <Text className="text-sm text-slate-400">
                      Individual learning gaps across cohort members
                    </Text>
                  </View>
                </View>
              </View>
              
              <CohortGapHeatmap />
            </MotiView>

            {/* Right Panel - Topic Cohesion Score */}
            <MotiView
              from={{ opacity: 0, translateX: 50, rotateY: '-15deg' }}
              animate={{ opacity: 1, translateX: 0, rotateY: '0deg' }}
              transition={{ type: 'spring', duration: 1000, delay: 1000 }}
            >
              {/* Section Header */}
              <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-lg">
                <View className="flex-row items-center">
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 600, delay: 1200 }}
                    className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg"
                  >
                    <Users size={20} color="#ffffff" />
                  </MotiView>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-slate-100">
                      Cohesion Analysis
                    </Text>
                    <Text className="text-sm text-slate-400">
                      Study focus alignment and group formation insights
                    </Text>
                  </View>
                </View>
              </View>
              
              <TopicCohesionScore />
            </MotiView>
          </View>
        </View>

        {/* Floating Action Elements */}
        <View className="absolute top-32 right-8 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: Math.random() * 100,
                translateX: Math.random() * 100,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.4, 0],
                translateY: Math.random() * -200,
                translateX: Math.random() * 50 - 25,
                scale: [0, 1, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 6000,
                delay: i * 800,
              }}
              className="absolute"
              style={{
                left: Math.random() * 100,
                top: Math.random() * 200,
              }}
            >
              <View className="w-2 h-2 bg-orange-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}