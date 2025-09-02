import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { RotateCcw, Calendar, Target, Clock, BookOpen, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import DecayHeatmap from '@/components/SmartRevision/DecayHeatmap';
import RevisionQueue from '@/components/SmartRevision/RevisionQueue';
import smartRevisionData from '@/data/smart-revision-data.json';

export default function SmartRevisionPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Temporary handler for cell selection
  const handleCellSelect = (subject: string, day: string, retention: number) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Selected: ${subject} - ${day} - ${retention}% retention`);
    } else {
      console.log(`Selected: ${subject} - ${day} - ${retention}% retention`);
    }
  };

  // Temporary handler for review action
  const handleReviewNow = (item: any) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Starting review for: ${item.subject} - ${item.topic}`);
    } else {
      console.log(`Starting review for: ${item.subject} - ${item.topic}`);
    }
  };

  // Temporary handler for cell selection
  const handleCellSelect = (subject: string, day: string, retention: number) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Selected: ${subject} - ${day} - ${retention}% retention`);
    } else {
      console.log(`Selected: ${subject} - ${day} - ${retention}% retention`);
    }
  };

  // Temporary handler for review action
  const handleReviewNow = (item: any) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Starting review for: ${item.subject} - ${item.topic}`);
    } else {
      console.log(`Starting review for: ${item.subject} - ${item.topic}`);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Main Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Decay Heatmap Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="mb-8"
        >
          {/* Section Header */}
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100">
                Memory Decay Heatmap
              </Text>
              <Text className="text-slate-400 text-sm">
                Visual representation of knowledge retention over time
              </Text>
            </View>
          </View>

          {/* Decay Heatmap Component */}
          <DecayHeatmap 
            data={smartRevisionData.decayHeatmap}
            onCellSelect={handleCellSelect}
          />
        </MotiView>

        {/* Divider */}
        <View className="border-t border-slate-700/50 my-8" />

        {/* Optimal Revision Queue Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 400 }}
        >
          {/* Section Header */}
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100">
                Today's Optimal Revision Queue
              </Text>
              <Text className="text-slate-400 text-sm">
                AI-prioritized items based on spaced repetition algorithm
              </Text>
            </View>
          </View>

          {/* Revision Queue Component */}
          <RevisionQueue 
            items={smartRevisionData.revisionQueue}
            onReviewNow={handleReviewNow}
          />
        </MotiView>

        {/* Algorithm Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <RotateCcw size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Spaced Repetition Algorithm</Text>
          </View>
          
          <Text className="text-slate-300 text-sm leading-5 mb-3">
            Our AI-powered revision system uses advanced spaced repetition algorithms to optimize your review schedule. 
            Items are prioritized based on:
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
              <Text className="text-slate-400 text-sm">Forgetting curve predictions</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
              <Text className="text-slate-400 text-sm">Your historical performance patterns</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
              <Text className="text-slate-400 text-sm">Topic difficulty and importance</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-amber-500 rounded-full mr-3" />
              <Text className="text-slate-400 text-sm">Time since last review</Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}