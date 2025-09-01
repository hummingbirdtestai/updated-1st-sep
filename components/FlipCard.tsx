import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Info, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';

interface FlipCardProps {
  title?: string;
  metric?: string | number;
  status?: string;
  infoText?: string;
  onSeeMore?: () => void;
  icon?: React.ReactNode;
  gradientColors?: string;
  statusColor?: string;
  additionalInfo?: string;
  frontContent?: React.ReactNode;   // ✅ NEW
  backContent?: React.ReactNode;    // ✅ NEW
}

export default function FlipCard({
  title,
  metric,
  status,
  infoText,
  onSeeMore,
  icon,
  gradientColors = 'from-purple-500 to-indigo-600',
  statusColor = 'text-purple-400',
  additionalInfo,
  frontContent,
  backContent,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const flipCard = () => setIsFlipped(!isFlipped);

  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', duration: 800, delay: 600 }}
      className="bg-slate-800/60 rounded-2xl mb-6 border border-slate-700/40 overflow-hidden relative"
      style={{
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Info Icon Button */}
      <Pressable
        onPress={flipCard}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95 z-10"
      >
        <Info size={16} color="#94a3b8" />
      </Pressable>

      {/* Front Side */}
      {!isFlipped ? (
        frontContent ? (
          frontContent   // ✅ custom JSX if provided
        ) : (
          <View className="p-6">
            <View className="flex-row items-center mb-4 pr-10">
              <View className={`w-10 h-10 bg-gradient-to-br ${gradientColors} rounded-xl items-center justify-center mr-3`}>
                {icon}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-100">{title}</Text>
              </View>
            </View>
            
            <View className="bg-slate-700/40 rounded-xl p-4">
              <Text className="text-slate-200 text-center text-lg mb-2">
                At your current speed, you'll finish in
              </Text>
              <Text className={`text-3xl font-bold ${statusColor} text-center mb-2`}>
                {metric}
              </Text>
              {additionalInfo && (
                <View className="flex-row justify-between text-sm">
                  <Text className="text-emerald-400">
                    {additionalInfo.split('|')[0]}
                  </Text>
                  <Text className="text-red-400">
                    {additionalInfo.split('|')[1]}
                  </Text>
                </View>
              )}
              <Text className="text-slate-300 text-center text-sm mt-2">
                {status}
              </Text>
            </View>
          </View>
        )
      ) : (
        /* Back Side */
        backContent ? (
          backContent   // ✅ custom JSX if provided
        ) : (
          <View className="p-6">
            <View className="flex-row items-center mb-4 pr-10">
              <View className={`w-10 h-10 bg-gradient-to-br ${gradientColors} rounded-xl items-center justify-center mr-3`}>
                {icon}
              </View>
              <Text className="text-lg font-bold text-slate-100 flex-1">
                How is this calculated?
              </Text>
            </View>

            <ScrollView 
              className="bg-slate-700/40 rounded-xl p-4 mb-4"
              style={{ maxHeight: isMobile ? 200 : 250 }}
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-slate-300 text-base leading-6">
                {infoText}
              </Text>
            </ScrollView>

            {/* Navigate to InfoPopup page */}
            {onSeeMore && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/info-popup',
                    params: {
                      title: 'How is this calculated?'
                    }
                  })
                }
                className={`rounded-xl py-3 px-4 bg-gradient-to-r ${gradientColors} shadow-lg active:scale-95 flex-row items-center justify-center`}
                style={{
                  shadowColor: gradientColors.includes('purple') ? '#8b5cf6' : '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-white font-semibold text-base mr-2">
                  See More
                </Text>
                <ExternalLink size={16} color="#ffffff" />
              </Pressable>
            )}
          </View>
        )
      )}
    </MotiView>
  );
}