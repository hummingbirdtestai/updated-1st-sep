import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Info, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

interface InfoPopupProps {
  title?: string;
  content?: string;
  iconSize?: number;
  iconColor?: string;
}

export default function InfoPopup({
  title = "How We Calculate Your Preparation Time",
  content = 
    "Your time estimates are based on the total number of PYQs (Previous Year Questions) in your exam and all the extra learning resources linked to them.\n\n" +
    "Each PYQ = 1 minute to solve.\n\n" +
    "Recursive MCQs = 0.5 × PYQs → about 0.5 minutes extra per PYQ.\n\n" +
    "Revision resources (flashcards, images, videos, Google lookups) → 3 minutes per PYQ.\n\n" +
    "👉 So the Total time per PYQ = 4.5 minutes.\n\n" +
    "🔹 Pending Time (Hours)\nPending Hours = (Pending PYQs × 4.5) ÷ 60\n\n" +
    "This is the time you still need to cover based on how many PYQs are left.\n\n" +
    "🔹 Best & Worst Case Scenarios\n" +
    "Best Case → You're 20% faster than average.\nBest Case Hours = Pending Hours ÷ 1.2\n\n" +
    "Worst Case → You're 20% slower than average.\nWorst Case Hours = Pending Hours ÷ 0.8\n\n" +
    "🎯 Example\nTotal PYQs = 9960\nPending PYQs = 5000\n\n" +
    "Pending Hours = (5000 × 4.5) ÷ 60 = 375 hours\n" +
    "Best Case = 312.5 hours\nWorst Case = 468.8 hours",
  iconSize = 14,
  iconColor = "#64748b"
}: InfoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;

  const openPopup = () => setIsVisible(true);
  const closePopup = () => setIsVisible(false);

  return (
    <>
      {/* Info Icon Button */}
      <Pressable
        onPress={openPopup}
        className="w-6 h-6 rounded-full items-center justify-center active:scale-95"
      >
        <Info size={iconSize} color={iconColor} />
      </Pressable>

      {/* Modal/Popup */}
      <AnimatePresence>
        {isVisible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            className="absolute inset-0 z-50 items-center justify-center"
            style={{ width, height }}
          >
            {/* Background Overlay with Blur */}
            <BlurView
              intensity={20}
              tint="dark"
              className="absolute inset-0"
            >
              <Pressable 
                onPress={closePopup}
                className="flex-1 bg-black/40"
              />
            </BlurView>

            {/* Modal Content */}
            <MotiView
              from={{ 
                opacity: 0, 
                scale: 0.9, 
                translateY: 50 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                translateY: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                translateY: 50 
              }}
              transition={{ 
                type: 'spring', 
                duration: 400,
                damping: 15,
                stiffness: 300
              }}
              className={`bg-slate-800 rounded-2xl border border-slate-600/50 shadow-2xl ${
                isMobile ? 'mx-4 w-full max-w-sm max-h-[80%]' : 'w-96 max-h-[70%]'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 30,
                elevation: 20,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-slate-600/30">
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full items-center justify-center mr-3">
                    <Info size={20} color="#ffffff" />
                  </View>
                  <Text className="text-lg font-bold text-slate-100 flex-1" numberOfLines={2}>
                    {title}
                  </Text>
                </View>
                <Pressable
                  onPress={closePopup}
                  className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
                >
                  <X size={16} color="#94a3b8" />
                </Pressable>
              </View>

              {/* Scrollable Content */}
              <ScrollView 
                className="flex-1 p-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <Text className="text-slate-300 text-base leading-6">
                  {content}
                </Text>
              </ScrollView>

              {/* Footer with Close Button */}
              <View className="p-6 border-t border-slate-600/30">
                <Pressable
                  onPress={closePopup}
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
              </View>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </>
  );
}