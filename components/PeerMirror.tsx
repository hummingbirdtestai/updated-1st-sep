import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, TrendingUp, Target, Lightbulb, Bookmark, BookmarkCheck } from 'lucide-react-native';

interface PeerInsight {
  id: string;
  message: string;
  type: 'common' | 'unique';
  gap: string;
  peer_overlap_percent: number;
  impact_level: 'high' | 'medium' | 'low';
}

interface PeerMirrorProps {
  insights?: string[];
  onInsightBookmark?: (insightId: string, message: string) => void;
  bookmarkedInsights?: Set<string>;
}

// Mock data with enhanced insights
const mockInsights: PeerInsight[] = [
  {
    id: 'insight_1',
    message: '65% of your peers also struggled with Long Tracts. Fixing this will boost you into the safer 55–60 percentile band.',
    type: 'common',
    gap: 'Long Tracts',
    peer_overlap_percent: 65,
    impact_level: 'high'
  },
  {
    id: 'insight_2',
    message: 'Only 5% of peers missed Renin Angiotensin. Fixing it makes you stand out and gives you an edge.',
    type: 'unique',
    gap: 'Renin Angiotensin',
    peer_overlap_percent: 5,
    impact_level: 'medium'
  },
  {
    id: 'insight_3',
    message: '78% of struggling students share your Action Potential confusion. You\'re not alone—tackle this together!',
    type: 'common',
    gap: 'Action Potential',
    peer_overlap_percent: 78,
    impact_level: 'high'
  },
  {
    id: 'insight_4',
    message: 'Your Enzyme Kinetics gap affects only 12% of top performers. Mastering this puts you ahead of the curve.',
    type: 'unique',
    gap: 'Enzyme Kinetics',
    peer_overlap_percent: 12,
    impact_level: 'high'
  },
  {
    id: 'insight_5',
    message: '42% of mid-tier students struggle with Cardiac Cycle too. Focus here to climb the rankings together.',
    type: 'common',
    gap: 'Cardiac Cycle',
    peer_overlap_percent: 42,
    impact_level: 'medium'
  }
];

interface InsightCardProps {
  insight: PeerInsight;
  index: number;
  onBookmark?: (insightId: string, message: string) => void;
  isBookmarked?: boolean;
}

function InsightCard({ insight, index, onBookmark, isBookmarked = false }: InsightCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);

  const getInsightIcon = (type: string, overlapPercent: number) => {
    if (type === 'unique') return '💎';
    if (overlapPercent >= 70) return '🔥';
    if (overlapPercent >= 40) return '🤝';
    return '👥';
  };

  const getInsightColors = (type: string, impactLevel: string) => {
    if (type === 'unique') {
      return {
        bg: 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10',
        border: 'border-purple-500/30',
        accent: '#8b5cf6',
        glow: 'shadow-purple-500/20'
      };
    } else {
      if (impactLevel === 'high') {
        return {
          bg: 'bg-gradient-to-br from-red-500/10 to-orange-500/10',
          border: 'border-red-500/30',
          accent: '#ef4444',
          glow: 'shadow-red-500/20'
        };
      } else {
        return {
          bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
          border: 'border-blue-500/30',
          accent: '#3b82f6',
          glow: 'shadow-blue-500/20'
        };
      }
    }
  };

  const colors = getInsightColors(insight.type, insight.impact_level);
  const icon = getInsightIcon(insight.type, insight.peer_overlap_percent);

  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    if (onBookmark) {
      onBookmark(insight.id, insight.message);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 200 }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-6 mb-4 shadow-lg ${colors.glow}`}
      style={{
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="flex-row items-start justify-between">
        {/* Left Section - Content */}
        <View className="flex-1 mr-4">
          {/* Header with Icon */}
          <View className="flex-row items-center mb-4">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-4 shadow-lg"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="text-2xl">{icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-bold text-lg mb-1">
                {insight.type === 'unique' ? 'Unique Opportunity' : 'Shared Challenge'}
              </Text>
              <Text className="text-slate-400 text-sm">
                {insight.gap} • {insight.peer_overlap_percent}% peer overlap
              </Text>
            </View>
          </View>

          {/* AI Insight Message */}
          <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <Text className="text-slate-200 text-base leading-7">
              {insight.message}
            </Text>
          </View>

          {/* Impact Metrics */}
          <View className="flex-row items-center space-x-6">
            <View className="flex-row items-center">
              <Users size={16} color={colors.accent} />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Peer Overlap</Text>
                <Text className="text-slate-200 font-bold text-sm">
                  {insight.peer_overlap_percent}%
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Target size={16} color={colors.accent} />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Impact Level</Text>
                <Text 
                  className="font-bold text-sm capitalize"
                  style={{ color: colors.accent }}
                >
                  {insight.impact_level}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TrendingUp size={16} color={colors.accent} />
              <View className="ml-2">
                <Text className="text-slate-400 text-xs">Strategy</Text>
                <Text className="text-slate-200 font-bold text-sm">
                  {insight.type === 'unique' ? 'Individual' : 'Group Study'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Section - Bookmark & Visual Indicator */}
        <View className="items-center">
          {/* Overlap Percentage Circle */}
          <View className="relative w-16 h-16 mb-3">
            <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: `${(insight.peer_overlap_percent / 100) * 360}deg` }}
              transition={{ type: 'spring', duration: 1200, delay: index * 200 + 800 }}
              className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: colors.accent,
                borderRightColor: insight.peer_overlap_percent > 25 ? colors.accent : 'transparent',
                borderBottomColor: insight.peer_overlap_percent > 50 ? colors.accent : 'transparent',
                borderLeftColor: insight.peer_overlap_percent > 75 ? colors.accent : 'transparent',
              }}
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-lg font-bold" style={{ color: colors.accent }}>
                {insight.peer_overlap_percent}
              </Text>
              <Text className="text-slate-500 text-xs">%</Text>
            </View>
          </View>

          {/* Bookmark Button */}
          <Pressable
            onPress={handleBookmarkToggle}
            className={`w-10 h-10 rounded-full items-center justify-center shadow-lg active:scale-95 ${
              localBookmark ? 'bg-amber-500/20' : 'bg-slate-700/40'
            }`}
            style={{
              shadowColor: localBookmark ? '#fbbf24' : '#64748b',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MotiView
              animate={{
                scale: localBookmark ? [1, 1.3, 1] : 1,
                rotate: localBookmark ? [0, 15, -15, 0] : 0,
              }}
              transition={{ type: 'spring', duration: 400 }}
            >
              {localBookmark ? (
                <BookmarkCheck size={20} color="#fbbf24" fill="#fbbf24" />
              ) : (
                <Bookmark size={20} color="#94a3b8" />
              )}
            </MotiView>
          </Pressable>
        </View>
      </View>

      {/* Action Suggestion */}
      <View className="mt-4 pt-4 border-t border-slate-600/30">
        <View className="flex-row items-center">
          <Lightbulb size={16} color="#fbbf24" />
          <Text className="text-slate-100 font-semibold ml-2 text-sm">
            Recommended Action:
          </Text>
        </View>
        <Text className="text-slate-300 text-sm mt-2 leading-6">
          {insight.type === 'unique' 
            ? `Focus on individual study for ${insight.gap}. Create personalized flashcards and practice targeted MCQs to master this concept.`
            : `Join study groups focusing on ${insight.gap}. Share resources and discuss common misconceptions with peers facing the same challenge.`
          }
        </Text>
      </View>
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

  // Use mock data if no insights provided
  const displayInsights = insights.length > 0 
    ? insights.map((message, index) => ({
        id: `insight_${index}`,
        message,
        type: message.includes('Only') || message.includes('5%') ? 'unique' : 'common',
        gap: message.split(' ')[message.includes('Only') ? 6 : 8] || 'Unknown',
        peer_overlap_percent: parseInt(message.match(/\d+%/)?.[0] || '50') || 50,
        impact_level: 'medium'
      } as PeerInsight))
    : mockInsights;

  // Calculate summary stats
  const commonGaps = displayInsights.filter(i => i.type === 'common').length;
  const uniqueGaps = displayInsights.filter(i => i.type === 'unique').length;
  const highImpactInsights = displayInsights.filter(i => i.impact_level === 'high').length;
  const averageOverlap = displayInsights.reduce((sum, i) => sum + i.peer_overlap_percent, 0) / Math.max(displayInsights.length, 1);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Users size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-100">
              Peer Mirror 🪞
            </Text>
            <Text className="text-lg text-slate-300 mt-1">
              AI insights comparing you with peers
            </Text>
          </View>
        </View>

        {/* Summary Badge */}
        <View className="items-center">
          <View className="bg-cyan-500/20 rounded-xl px-4 py-3 border border-cyan-500/30">
            <Text className="text-cyan-400 font-bold text-xl">
              {averageOverlap.toFixed(0)}%
            </Text>
            <Text className="text-cyan-300/80 text-xs text-center">
              Avg Overlap
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
        {/* Summary Metrics */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🤝</Text>
              <Text className="text-blue-400 font-semibold text-sm">Common Gaps</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {commonGaps}
            </Text>
            <Text className="text-blue-300/80 text-xs">
              shared struggles
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">💎</Text>
              <Text className="text-purple-400 font-semibold text-sm">Unique Gaps</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {uniqueGaps}
            </Text>
            <Text className="text-purple-300/80 text-xs">
              rare challenges
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🎯</Text>
              <Text className="text-amber-400 font-semibold text-sm">High Impact</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {highImpactInsights}
            </Text>
            <Text className="text-amber-300/80 text-xs">
              priority insights
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">📊</Text>
              <Text className="text-emerald-400 font-semibold text-sm">Avg Overlap</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {averageOverlap.toFixed(0)}%
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              peer similarity
            </Text>
          </MotiView>
        </View>

        {/* AI Mentor Introduction */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-6 mb-8 border border-cyan-500/20"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg">
              <Users size={20} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-cyan-100">
              AI Peer Analysis
            </Text>
          </View>
          
          <Text className="text-cyan-200 text-base leading-6">
            I've analyzed your learning gaps against thousands of peer patterns. Here are personalized insights 
            to help you understand where you stand and how to strategically improve your preparation! 🚀
          </Text>
        </MotiView>

        {/* Insight Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Lightbulb size={16} color="#ffffff" />
            </View>
            <Text className="text-2xl font-bold text-slate-100">
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

        {/* Study Strategy Recommendations */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Strategic Study Plan
            </Text>
          </View>

          <View className="space-y-4">
            {/* Common Gaps Strategy */}
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-3">🔥</Text>
                <Text className="text-blue-300 font-semibold text-lg">
                  Common Gaps Strategy
                </Text>
              </View>
              <Text className="text-blue-200 text-sm leading-6">
                <Text className="font-bold">{commonGaps} shared challenges</Text> identified. 
                Join study groups, share resources, and tackle these together. You're not alone in these struggles!
              </Text>
            </View>

            {/* Unique Gaps Strategy */}
            <View className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-3">💎</Text>
                <Text className="text-purple-300 font-semibold text-lg">
                  Unique Opportunities
                </Text>
              </View>
              <Text className="text-purple-200 text-sm leading-6">
                <Text className="font-bold">{uniqueGaps} rare gaps</Text> give you competitive advantage potential. 
                Master these with focused individual study to stand out from the crowd!
              </Text>
            </View>

            {/* Priority Action Plan */}
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-3">🎯</Text>
                <Text className="text-emerald-300 font-semibold text-lg">
                  Priority Action Plan
                </Text>
              </View>
              <View className="space-y-2">
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">1.</Text> Start with high-impact common gaps for quick percentile gains
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">2.</Text> Form study groups around shared challenges (🔥 gaps)
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">3.</Text> Dedicate focused time to unique gaps for competitive edge
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">4.</Text> Monitor progress and adjust strategy based on peer movement
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Motivation Footer */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 border border-indigo-500/20 mt-6"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🌟</Text>
            <View className="flex-1">
              <Text className="text-indigo-200 text-base leading-6">
                Remember: Every gap you close moves you up the percentile ladder. 
                Your peers are on the same journey—use these insights to study smarter, not harder! 💪
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}