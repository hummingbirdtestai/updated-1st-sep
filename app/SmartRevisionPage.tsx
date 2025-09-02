import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { RotateCcw, Calendar, Target, Clock, BookOpen, TrendingUp } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function SmartRevisionPage() {
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
          <View className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <RotateCcw size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Smart Revision
            </Text>
            <Text className="text-sm text-slate-400 mt-1">
              Spaced repetition engine for MCQs + flashcards
            </Text>
          </View>
        </View>
      </MotiView>

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

          {/* Heatmap Placeholder */}
          <View 
            className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg"
            style={{ height: Math.min(width * 0.6, 400) }}
          >
            <View className="flex-1 items-center justify-center p-8">
              <View className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl items-center justify-center mb-4">
                <Calendar size={32} color="#f97316" />
              </View>
              
              <Text className="text-xl font-bold text-slate-100 mb-2 text-center">
                Memory Decay Heatmap
              </Text>
              
              <Text className="text-slate-300 text-base mb-4 text-center max-w-md">
                Interactive heatmap showing how your knowledge decays over time across different topics and subjects.
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-orange-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </View>

          {/* Heatmap Legend Placeholder */}
          <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <Text className="text-slate-100 font-semibold mb-3">Heatmap Legend</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-emerald-500 rounded mr-2" />
                <Text className="text-slate-300 text-sm">Fresh (0-1 days)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-amber-500 rounded mr-2" />
                <Text className="text-slate-300 text-sm">Fading (2-7 days)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-red-500 rounded mr-2" />
                <Text className="text-slate-300 text-sm">Critical (7+ days)</Text>
              </View>
            </View>
          </View>
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

          {/* Queue Stats */}
          <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 600 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <View className="flex-row items-center mb-2">
                <Clock size={16} color="#ef4444" />
                <Text className="text-red-400 font-semibold text-sm ml-2">Critical</Text>
              </View>
              <Text className="text-red-200 text-xl font-bold">12</Text>
              <Text className="text-red-300/80 text-xs">Due today</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 700 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
            >
              <View className="flex-row items-center mb-2">
                <Target size={16} color="#f59e0b" />
                <Text className="text-amber-400 font-semibold text-sm ml-2">Priority</Text>
              </View>
              <Text className="text-amber-200 text-xl font-bold">8</Text>
              <Text className="text-amber-300/80 text-xs">High priority</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 800 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
            >
              <View className="flex-row items-center mb-2">
                <BookOpen size={16} color="#3b82f6" />
                <Text className="text-blue-400 font-semibold text-sm ml-2">Flashcards</Text>
              </View>
              <Text className="text-blue-200 text-xl font-bold">25</Text>
              <Text className="text-blue-300/80 text-xs">Ready for review</Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 900 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
            >
              <View className="flex-row items-center mb-2">
                <RotateCcw size={16} color="#10b981" />
                <Text className="text-emerald-400 font-semibold text-sm ml-2">MCQs</Text>
              </View>
              <Text className="text-emerald-200 text-xl font-bold">15</Text>
              <Text className="text-emerald-300/80 text-xs">For retry</Text>
            </View>
          </View>

          {/* Revision Queue Placeholder */}
          <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg">
            <View className="flex-1 items-center justify-center py-12">
              <View className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl items-center justify-center mb-4">
                <Target size={32} color="#3b82f6" />
              </View>
              
              <Text className="text-xl font-bold text-slate-100 mb-2 text-center">
                Optimal Revision Queue
              </Text>
              
              <Text className="text-slate-300 text-base mb-6 text-center max-w-md">
                AI-powered spaced repetition queue that prioritizes items based on forgetting curves and performance patterns.
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-blue-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>

            {/* Mock Queue Items */}
            <View className="mt-8 space-y-3">
              <Text className="text-lg font-semibold text-slate-100 mb-4">Preview Queue Items</Text>
              
              {[
                { id: 1, type: 'MCQ', subject: 'Physiology', topic: 'Cardiac Cycle', priority: 'Critical', dueIn: 'Overdue' },
                { id: 2, type: 'Flashcard', subject: 'Biochemistry', topic: 'Glycolysis', priority: 'High', dueIn: '2 hours' },
                { id: 3, type: 'MCQ', subject: 'Anatomy', topic: 'Brachial Plexus', priority: 'Medium', dueIn: '6 hours' },
                { id: 4, type: 'Flashcard', subject: 'Pharmacology', topic: 'Beta Blockers', priority: 'Low', dueIn: '1 day' },
              ].map((item, index) => (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1000 + index * 100 }}
                  className={`bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 ${
                    item.priority === 'Critical' ? 'border-red-500/30 bg-red-500/5' :
                    item.priority === 'High' ? 'border-amber-500/30 bg-amber-500/5' :
                    'border-slate-600/30'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <View className={`px-2 py-1 rounded-full mr-3 ${
                          item.type === 'MCQ' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        }`}>
                          <Text className={`text-xs font-bold ${
                            item.type === 'MCQ' ? 'text-blue-400' : 'text-purple-400'
                          }`}>
                            {item.type}
                          </Text>
                        </View>
                        <Text className="text-slate-100 font-semibold">
                          {item.subject} • {item.topic}
                        </Text>
                      </View>
                      <Text className="text-slate-400 text-sm">
                        Priority: <Text className={`font-medium ${
                          item.priority === 'Critical' ? 'text-red-400' :
                          item.priority === 'High' ? 'text-amber-400' :
                          item.priority === 'Medium' ? 'text-blue-400' :
                          'text-slate-400'
                        }`}>
                          {item.priority}
                        </Text>
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-sm font-bold ${
                        item.dueIn === 'Overdue' ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        {item.dueIn}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {item.dueIn === 'Overdue' ? 'Review now' : 'Due in'}
                      </Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>
          </View>
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