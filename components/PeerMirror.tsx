import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, TrendingUp, Target, Lightbulb, Bookmark, BookmarkCheck, Sparkles, Flame, Gem, Rocket } from 'lucide-react-native';

interface PeerInsight {
  id: string;
  message: string;
  type: 'common' | 'unique' | 'percentile_gain';
  icon: string;
  impact_level: 'high' | 'medium' | 'low';
  peer_overlap_percent?: number;
}

interface PeerMirrorProps {
  insights?: string[];
  onInsightBookmark?: (insightId: string, message: string) => void;
  bookmarkedInsights?: Set<string>;
}

interface InsightCardProps {
  insight: PeerInsight;
  index: number;
  onBookmark?: (insightId: string, message: string) => void;
  isBookmarked?: boolean;
}

function InsightCard({ insight, index, onBookmark, isBookmarked = false }: InsightCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);
  const [isHovered, setIsHovered] = useState(false);

  const getInsightTheme = (type: string) => {
    switch (type) {
      case 'common':
        return {
          gradient: 'from-red-500/20 via-orange-500/15 to-amber-500/10',
          border: 'border-red-500/30',
          iconBg: 'from-red-500 to-orange-600',
          textAccent: 'text-red-300',
          shadowColor: '#ef4444',
          icon: Flame,
          emoji: '🔥',
          label: 'Common Challenge'
        };
      case 'unique':
        return {
          gradient: 'from-purple-500/20 via-indigo-500/15 to-blue-500/10',
          border: 'border-purple-500/30',
          iconBg: 'from-purple-500 to-indigo-600',
          textAccent: 'text-purple-300',
          shadowColor: '#8b5cf6',
          icon: Gem,
          emoji: '💎',
          label: 'Unique Opportunity'
        };
      case 'percentile_gain':
        return {
          gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
          border: 'border-emerald-500/30',
          iconBg: 'from-emerald-500 to-teal-600',
          textAccent: 'text-emerald-300',
          shadowColor: '#10b981',
          icon: Rocket,
          emoji: '🚀',
          label: 'Progress Milestone'
        };
      default:
        return {
          gradient: 'from-slate-500/20 via-slate-400/15 to-slate-300/10',
          border: 'border-slate-500/30',
          iconBg: 'from-slate-500 to-slate-600',
          textAccent: 'text-slate-300',
          shadowColor: '#64748b',
          icon: Sparkles,
          emoji: '✨',
          label: 'Insight'
        };
    }
  };

  const theme = getInsightTheme(insight.type);
  const IconComponent = theme.icon;

  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    if (onBookmark) {
      onBookmark(insight.id, insight.message);
    }
  };

  return (
    <MotiView
      from={{ 
        opacity: 0, 
        translateY: 50, 
        scale: 0.9,
        rotateX: '15deg'
      }}
      animate={{ 
        opacity: 1, 
        translateY: 0, 
        scale: isHovered ? 1.02 : 1,
        rotateX: '0deg'
      }}
      transition={{ 
        type: 'spring', 
        duration: 800, 
        delay: index * 200 + 300,
        damping: 15,
        stiffness: 200
      }}
      className={`bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-3xl p-6 mb-6 shadow-2xl`}
      style={{
        shadowColor: theme.shadowColor,
        shadowOffset: { width: 0, height: isHovered ? 12 : 8 },
        shadowOpacity: isHovered ? 0.25 : 0.15,
        shadowRadius: isHovered ? 24 : 16,
        elevation: isHovered ? 12 : 8,
      }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      {/* Animated Background Glow */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.1 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 3000,
          delay: index * 500,
        }}
        className="absolute inset-0 rounded-3xl"
        style={{ backgroundColor: theme.shadowColor }}
      />

      {/* Header Section */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center flex-1">
          {/* Animated Icon Container */}
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ 
              type: 'spring', 
              duration: 800, 
              delay: index * 200 + 500,
              damping: 12,
              stiffness: 300
            }}
            className={`w-16 h-16 bg-gradient-to-br ${theme.iconBg} rounded-2xl items-center justify-center mr-4 shadow-xl`}
            style={{
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Rotating background glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.2 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 8000,
              }}
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{ backgroundColor: theme.shadowColor }}
            />
            
            <IconComponent size={28} color="#ffffff" />
            
            {/* Emoji overlay */}
            <View className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-lg">
              <Text className="text-lg">{theme.emoji}</Text>
            </View>
          </MotiView>

          {/* Insight Type Label */}
          <View className="flex-1">
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ 
                type: 'spring', 
                duration: 600, 
                delay: index * 200 + 700 
              }}
            >
              <Text className={`text-xl font-bold ${theme.textAccent} mb-1`}>
                {theme.label}
              </Text>
              <View className={`bg-gradient-to-r ${theme.iconBg} rounded-full px-3 py-1 self-start`}>
                <Text className="text-white text-xs font-bold uppercase tracking-wide">
                  {insight.impact_level} Impact
                </Text>
              </View>
            </MotiView>
          </View>
        </View>

        {/* Bookmark Button */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring', 
            duration: 400, 
            delay: index * 200 + 900 
          }}
        >
          <Pressable
            onPress={handleBookmarkToggle}
            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-90 ${
              localBookmark 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                : 'bg-slate-700/60 border border-slate-600/50'
            }`}
            style={{
              shadowColor: localBookmark ? '#f59e0b' : '#64748b',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <MotiView
              animate={{
                scale: localBookmark ? [1, 1.3, 1] : 1,
                rotate: localBookmark ? [0, 15, -15, 0] : 0,
              }}
              transition={{ type: 'spring', duration: 600 }}
            >
              {localBookmark ? (
                <BookmarkCheck size={20} color="#ffffff" />
              ) : (
                <Bookmark size={20} color="#94a3b8" />
              )}
            </MotiView>
          </Pressable>
        </MotiView>
      </View>

      {/* Main Insight Message */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ 
          type: 'spring', 
          duration: 600, 
          delay: index * 200 + 800 
        }}
        className="bg-slate-800/40 rounded-2xl p-5 border border-slate-600/30 mb-6 shadow-inner"
      >
        <Text className="text-slate-100 text-lg leading-7 font-medium">
          {insight.message}
        </Text>
      </MotiView>

      {/* Metrics Section */}
      {insight.peer_overlap_percent && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring', 
            duration: 600, 
            delay: index * 200 + 1000 
          }}
          className="flex-row items-center justify-between"
        >
          {/* Overlap Percentage Gauge */}
          <View className="flex-row items-center">
            <View className="relative w-14 h-14 mr-4">
              {/* Background Circle */}
              <View className="absolute inset-0 rounded-full border-4 border-slate-600/60" />
              
              {/* Progress Circle */}
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: `${(insight.peer_overlap_percent / 100) * 360}deg` }}
                transition={{ 
                  type: 'spring', 
                  duration: 1500, 
                  delay: index * 200 + 1200 
                }}
                className="absolute inset-0 rounded-full border-4 border-transparent"
                style={{
                  borderTopColor: theme.shadowColor,
                  borderRightColor: insight.peer_overlap_percent > 25 ? theme.shadowColor : 'transparent',
                  borderBottomColor: insight.peer_overlap_percent > 50 ? theme.shadowColor : 'transparent',
                  borderLeftColor: insight.peer_overlap_percent > 75 ? theme.shadowColor : 'transparent',
                }}
              />
              
              {/* Center Text */}
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-lg font-bold" style={{ color: theme.shadowColor }}>
                  {insight.peer_overlap_percent}
                </Text>
                <Text className="text-slate-500 text-xs">%</Text>
              </View>
            </View>

            <View>
              <Text className="text-slate-300 font-semibold text-base">
                Peer Overlap
              </Text>
              <Text className="text-slate-400 text-sm">
                {insight.peer_overlap_percent >= 60 ? 'Very Common' :
                 insight.peer_overlap_percent >= 30 ? 'Moderately Common' : 'Rare Challenge'}
              </Text>
            </View>
          </View>

          {/* Action Indicator */}
          <View className="items-end">
            <View className={`bg-gradient-to-r ${theme.iconBg} rounded-xl px-4 py-2 shadow-lg`}>
              <Text className="text-white font-bold text-sm">
                {insight.type === 'common' ? 'Group Study' :
                 insight.type === 'unique' ? 'Solo Focus' : 'Keep Going'}
              </Text>
            </View>
            <Text className="text-slate-400 text-xs mt-1">
              Recommended approach
            </Text>
          </View>
        </MotiView>
      )}

      {/* Floating particles effect for unique gaps */}
      {insight.type === 'unique' && (
        <View className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: 20,
                translateX: Math.random() * 200 - 100,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.6, 0],
                translateY: -40,
                translateX: Math.random() * 100 - 50,
                scale: [0, 1, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 3000,
                delay: i * 500 + index * 1000,
              }}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            >
              <View className="w-2 h-2 bg-purple-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      )}

      {/* Fire particles effect for common gaps */}
      {insight.type === 'common' && (
        <View className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: 10,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.8, 0],
                translateY: -30,
                scale: [0, 1.2, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2000,
                delay: i * 400 + index * 800,
              }}
              className="absolute"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
            >
              <View className="w-1.5 h-1.5 bg-orange-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      )}
    </MotiView>
  );
}

export default function PeerMirror({ 
  insights = [],
  onInsightBookmark,
  bookmarkedInsights = new Set()
}: PeerMirrorProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Process insights into structured data
  const processInsights = (rawInsights: string[]): PeerInsight[] => {
    return rawInsights.map((message, index) => {
      let type: 'common' | 'unique' | 'percentile_gain' = 'common';
      let icon = '🔥';
      let impact_level: 'high' | 'medium' | 'low' = 'medium';
      let peer_overlap_percent: number | undefined;

      // Detect insight type based on content
      if (message.includes('🔥') || message.includes('peers also struggled') || message.includes('%')) {
        type = 'common';
        icon = '🔥';
        // Extract percentage
        const percentMatch = message.match(/(\d+)%/);
        if (percentMatch) {
          peer_overlap_percent = parseInt(percentMatch[1]);
          impact_level = peer_overlap_percent >= 60 ? 'high' : peer_overlap_percent >= 30 ? 'medium' : 'low';
        }
      } else if (message.includes('💎') || message.includes('Only') || message.includes('stand out')) {
        type = 'unique';
        icon = '💎';
        impact_level = 'high';
        // Extract percentage for unique gaps (usually low)
        const percentMatch = message.match(/(\d+)%/);
        if (percentMatch) {
          peer_overlap_percent = parseInt(percentMatch[1]);
        }
      } else if (message.includes('🚀') || message.includes('climbing') || message.includes('percentile')) {
        type = 'percentile_gain';
        icon = '🚀';
        impact_level = 'high';
      }

      return {
        id: `insight_${index}`,
        message,
        type,
        icon,
        impact_level,
        peer_overlap_percent,
      };
    });
  };

  // Use mock data if no insights provided
  const mockInsights = [
    "🔥 65% of your peers also struggled with Long Tracts. Fixing this will boost you into the 55–60 percentile band.",
    "💎 Only 5% of peers missed Renin Angiotensin. Fixing it makes you stand out.",
    "🚀 You are climbing into the Top 25% in Biochemistry."
  ];

  const displayInsights = processInsights(insights.length > 0 ? insights : mockInsights);

  // Calculate summary stats
  const commonGaps = displayInsights.filter(i => i.type === 'common').length;
  const uniqueGaps = displayInsights.filter(i => i.type === 'unique').length;
  const milestones = displayInsights.filter(i => i.type === 'percentile_gain').length;
  const highImpactInsights = displayInsights.filter(i => i.impact_level === 'high').length;

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800 }}
        className="flex-row items-center justify-between p-6 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 200 }}
            className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#06b6d4',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Users size={28} color="#ffffff" />
            
            {/* Rotating glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.3 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 6000,
              }}
              className="absolute inset-0 rounded-2xl bg-cyan-400/20"
            />
          </MotiView>
          
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100 mb-1">
              Peer Mirror 🪞
            </Text>
            <Text className="text-lg text-slate-300">
              AI insights comparing you with peers
            </Text>
          </View>
        </View>

        {/* Summary Badge */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 400 }}
          className="items-center"
        >
          <View className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl px-6 py-4 border border-purple-500/30 shadow-xl">
            <Text className="text-purple-300 font-bold text-2xl text-center">
              {displayInsights.length}
            </Text>
            <Text className="text-purple-400/80 text-sm text-center font-medium">
              AI Insights
            </Text>
          </View>
        </MotiView>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Summary Metrics */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MotiView
            from={{ opacity: 0, translateY: 30, rotateY: '45deg' }}
            animate={{ opacity: 1, translateY: 0, rotateY: '0deg' }}
            transition={{ type: 'spring', duration: 800, delay: 600 }}
            className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-5 shadow-lg"
            style={{
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                <Flame size={18} color="#ffffff" />
              </View>
              <Text className="text-red-300 font-bold text-base">Common</Text>
            </View>
            <Text className="text-red-200 text-3xl font-bold mb-1">
              {commonGaps}
            </Text>
            <Text className="text-red-300/80 text-sm">
              shared struggles
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 30, rotateY: '45deg' }}
            animate={{ opacity: 1, translateY: 0, rotateY: '0deg' }}
            transition={{ type: 'spring', duration: 800, delay: 700 }}
            className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-5 shadow-lg"
            style={{
              shadowColor: '#8b5cf6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                <Gem size={18} color="#ffffff" />
              </View>
              <Text className="text-purple-300 font-bold text-base">Unique</Text>
            </View>
            <Text className="text-purple-200 text-3xl font-bold mb-1">
              {uniqueGaps}
            </Text>
            <Text className="text-purple-300/80 text-sm">
              rare opportunities
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 30, rotateY: '45deg' }}
            animate={{ opacity: 1, translateY: 0, rotateY: '0deg' }}
            transition={{ type: 'spring', duration: 800, delay: 800 }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 shadow-lg"
            style={{
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                <Rocket size={18} color="#ffffff" />
              </View>
              <Text className="text-emerald-300 font-bold text-base">Progress</Text>
            </View>
            <Text className="text-emerald-200 text-3xl font-bold mb-1">
              {milestones}
            </Text>
            <Text className="text-emerald-300/80 text-sm">
              milestones
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 30, rotateY: '45deg' }}
            animate={{ opacity: 1, translateY: 0, rotateY: '0deg' }}
            transition={{ type: 'spring', duration: 800, delay: 900 }}
            className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-5 shadow-lg"
            style={{
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                <Target size={18} color="#ffffff" />
              </View>
              <Text className="text-amber-300 font-bold text-base">High Impact</Text>
            </View>
            <Text className="text-amber-200 text-3xl font-bold mb-1">
              {highImpactInsights}
            </Text>
            <Text className="text-amber-300/80 text-sm">
              priority insights
            </Text>
          </MotiView>
        </View>

        {/* AI Mentor Introduction */}
        <MotiView
          from={{ opacity: 0, translateY: 40, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1000 }}
          className="bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-indigo-900/40 rounded-3xl p-8 mb-8 border border-cyan-500/20 shadow-2xl"
          style={{
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          {/* Floating AI particles */}
          <View className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <MotiView
                key={i}
                from={{ 
                  opacity: 0, 
                  translateY: Math.random() * 40,
                  translateX: Math.random() * 200,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  translateY: Math.random() * -60,
                  translateX: Math.random() * 100 - 50,
                  scale: [0, 1, 0]
                }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 4000,
                  delay: i * 600,
                }}
                className="absolute"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
              >
                <View className="w-1 h-1 bg-cyan-400 rounded-full shadow-lg" />
              </MotiView>
            ))}
          </View>

          <View className="flex-row items-center mb-6">
            <MotiView
              from={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1200 }}
              className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
              style={{
                shadowColor: '#06b6d4',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Users size={24} color="#ffffff" />
              
              {/* Pulsing glow */}
              <MotiView
                from={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 2500,
                }}
                className="absolute inset-0 rounded-2xl bg-cyan-400/30"
              />
            </MotiView>
            
            <Text className="text-2xl font-bold text-cyan-100">
              AI Peer Analysis Engine
            </Text>
          </View>
          
          <Text className="text-cyan-200 text-lg leading-8 font-medium">
            I've analyzed your learning patterns against{' '}
            <Text className="font-bold text-cyan-300">thousands of peer trajectories</Text>. 
            Here are personalized insights to help you understand where you stand and how to 
            strategically improve your preparation! 🚀
          </Text>

          {/* Animated stats bar */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1400 }}
            className="mt-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-600/30"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-slate-300 text-sm">Analysis Complete:</Text>
              <View className="flex-row items-center space-x-4">
                <Text className="text-cyan-400 text-sm font-semibold">
                  {displayInsights.length} insights generated
                </Text>
                <View className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </View>
            </View>
          </MotiView>
        </MotiView>

        {/* Insight Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-8">
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 600, delay: 1400 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg"
            >
              <Lightbulb size={20} color="#ffffff" />
            </MotiView>
            <Text className="text-3xl font-bold text-slate-100">
              Personalized Insights
            </Text>
          </View>

          {displayInsights.map((insight, index) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              index={index}
              onBookmark={onInsightBookmark}
              isBookmarked={bookmarkedInsights.has(insight.id)}
            />
          ))}
        </MotiView>

        {/* Strategic Study Plan */}
        <MotiView
          from={{ opacity: 0, translateY: 40, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1600 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-8 border border-slate-700/40 shadow-2xl"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <View className="flex-row items-center mb-8">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1800 }}
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Target size={24} color="#ffffff" />
            </MotiView>
            <Text className="text-2xl font-bold text-slate-100">
              Strategic Study Plan
            </Text>
          </View>

          <View className="space-y-6">
            {/* Common Gaps Strategy */}
            <MotiView
              from={{ opacity: 0, translateX: -30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 2000 }}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 shadow-lg"
            >
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-4">🔥</Text>
                <Text className="text-red-300 font-bold text-xl">
                  Common Gaps Strategy
                </Text>
              </View>
              <Text className="text-red-200 text-base leading-7">
                <Text className="font-bold">{commonGaps} shared challenges</Text> identified. 
                Join study groups, share resources, and tackle these together. You're not alone in these struggles!
              </Text>
            </MotiView>

            {/* Unique Gaps Strategy */}
            <MotiView
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 2200 }}
              className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6 shadow-lg"
            >
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-4">💎</Text>
                <Text className="text-purple-300 font-bold text-xl">
                  Unique Opportunities
                </Text>
              </View>
              <Text className="text-purple-200 text-base leading-7">
                <Text className="font-bold">{uniqueGaps} rare gaps</Text> give you competitive advantage potential. 
                Master these with focused individual study to stand out from the crowd!
              </Text>
            </MotiView>

            {/* Progress Milestones */}
            {milestones > 0 && (
              <MotiView
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2400 }}
                className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-lg"
              >
                <View className="flex-row items-center mb-4">
                  <Text className="text-3xl mr-4">🚀</Text>
                  <Text className="text-emerald-300 font-bold text-xl">
                    Progress Milestones
                  </Text>
                </View>
                <Text className="text-emerald-200 text-base leading-7">
                  <Text className="font-bold">{milestones} achievement{milestones !== 1 ? 's' : ''}</Text> unlocked! 
                  You're making excellent progress. Keep the momentum going!
                </Text>
              </MotiView>
            )}

            {/* Priority Action Plan */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 800, delay: 2600 }}
              className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-600/40 rounded-2xl p-6 shadow-inner"
            >
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-4">🎯</Text>
                <Text className="text-slate-100 font-bold text-xl">
                  Priority Action Plan
                </Text>
              </View>
              <View className="space-y-3">
                <Text className="text-slate-200 text-base">
                  <Text className="font-bold text-emerald-400">1.</Text> Start with high-impact common gaps for quick percentile gains
                </Text>
                <Text className="text-slate-200 text-base">
                  <Text className="font-bold text-purple-400">2.</Text> Form study groups around shared challenges (🔥 gaps)
                </Text>
                <Text className="text-slate-200 text-base">
                  <Text className="font-bold text-blue-400">3.</Text> Dedicate focused time to unique gaps for competitive edge
                </Text>
                <Text className="text-slate-200 text-base">
                  <Text className="font-bold text-amber-400">4.</Text> Monitor progress and adjust strategy based on peer movement
                </Text>
              </View>
            </MotiView>
          </View>
        </MotiView>

        {/* Motivation Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 2800 }}
          className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-pink-900/60 rounded-2xl p-6 border border-indigo-500/20 shadow-xl"
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
                Remember: Every gap you close moves you up the percentile ladder. 
                Your peers are on the same journey—use these insights to study{' '}
                <Text className="font-bold text-indigo-300">smarter, not harder</Text>! 💪
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}