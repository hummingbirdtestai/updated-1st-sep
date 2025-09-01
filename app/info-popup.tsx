import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Info, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function InfoPopupScreen() {
  const { title, content } = useLocalSearchParams<{
    title?: string;
    content?: string;
  }>();
  
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const handleClose = () => {
    router.back();
  };

  // ✅ Default fallback explanation
  const defaultContent = `
Your time estimates are based on the total number of PYQs (Previous Year Questions) in your exam and all the extra learning resources linked to them.

• Each PYQ = 1 minute to solve.
• Recursive MCQs = 0.5 × PYQs → about 0.5 minutes extra per PYQ.
• Revision resources (flashcards, images, videos, Google lookups) → 3 minutes per PYQ.

👉 So the Total time per PYQ = 4.5 minutes.

🔹 Pending Time (Hours)
Pending Hours = (Pending PYQs × 4.5) ÷ 60

This is the time you still need to cover based on how many PYQs are left.

🔹 Best & Worst Case Scenarios
• Best Case → You're 20% faster than average.
  Formula: Pending Hours ÷ 1.2
• Worst Case → You're 20% slower than average.
  Formula: Pending Hours ÷ 0.8

🎯 Example
Total PYQs = 9960
Pending PYQs = 5000

Pending Hours = (5000 × 4.5) ÷ 60 = 375 hours
Best Case = 312.5 hours
Worst Case = 468.8 hours
`;

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 pt-12 border-b border-slate-600/30 bg-slate-800/60"
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full items-center justify-center mr-3">
            <Info size={20} color="#ffffff" />
          </View>
          <Text className="text-lg font-bold text-slate-100 flex-1" numberOfLines={2}>
            {title || 'How We Calculate Your Preparation Time'}
          </Text>
        </View>
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </Pressable>
      </MotiView>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          flexGrow: 1
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-slate-300 text-base leading-6 whitespace-pre-line">
            {content || defaultContent}
          </Text>
        </MotiView>
      </ScrollView>

      {/* Footer with Close Button */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 400 }}
        className="p-6 border-t border-slate-600/30 bg-slate-800/30"
      >
        <Pressable
          onPress={handleClose}
          className="rounded-xl py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg active:scale-95"
          style={{
            shadowColor: '#64748b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-white text-center font-semibold text-base">
            Close
          </Text>
        </Pressable>
      </MotiView>
    </View>
  );
}