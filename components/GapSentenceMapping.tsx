import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Cloud, Target, TrendingUp, Filter, ChevronDown, Hash, Bookmark, BookmarkCheck } from 'lucide-react-native';
import Svg, { Text as SvgText, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import gapSentencesData from '@/data/gap-sentences-data.json';

interface GapFrequency {
  sentence: string;
  frequency: number;
  sessions: string[];
  subjects: string[];
  id: string;
}

interface GapCloudProps {
  gaps: GapFrequency[];
  onGapPress?: (gap: GapFrequency) => void;
  onBookmarkToggle?: (gapId: string, sentence: string) => void;
  bookmarkedGaps?: Set<string>;
}

function GapWordCloud({ gaps, onGapPress, onBookmarkToggle, bookmarkedGaps = new Set() }: GapCloudProps) {
  const { width } = Dimensions.get('window');
  const cloudWidth = Math.min(width - 64, 600);
  const cloudHeight = 400;
  
  const maxFrequency = Math.max(...gaps.map(g => g.frequency), 1);
  const minFontSize = 12;
  const maxFontSize = 28;

  // Generate positions for word cloud
  const generatePositions = () => {
    const positions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const padding = 10;
    
    return gaps.map((gap, index) => {
      const fontSize = minFontSize + ((gap.frequency / maxFrequency) * (maxFontSize - minFontSize));
      const estimatedWidth = gap.sentence.length * (fontSize * 0.6);
      const estimatedHeight = fontSize + 8;
      
      // Simple grid-based positioning to avoid overlaps
      const cols = Math.floor(cloudWidth / (estimatedWidth + padding));
      const row = Math.floor(index / Math.max(cols, 1));
      const col = index % Math.max(cols, 1);
      
      const x = col * (estimatedWidth + padding) + padding;
      const y = row * (estimatedHeight + padding) + padding + 40;
      
      return {
        x: Math.min(x, cloudWidth - estimatedWidth),
        y: Math.min(y, cloudHeight - estimatedHeight),
        width: estimatedWidth,
        height: estimatedHeight,
        fontSize,
      };
    });
  };

  const positions = generatePositions();

  const getGapColor = (frequency: number) => {
    const intensity = frequency / maxFrequency;
    if (intensity >= 0.8) return { color: '#ef4444', glow: 'redGlow' }; // High frequency - red
    if (intensity >= 0.5) return { color: '#f59e0b', glow: 'amberGlow' }; // Medium - amber
    return { color: '#10b981', glow: 'emeraldGlow' }; // Low - emerald
  };

  return (
    <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        <View style={{ width: Math.max(cloudWidth, 500), height: cloudHeight }}>
          <Svg width="100%" height={cloudHeight}>
            <Defs>
              <RadialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Render gap sentences */}
            {gaps.map((gap, index) => {
              const pos = positions[index];
              const colors = getGapColor(gap.frequency);
              const isBookmarked = bookmarkedGaps.has(gap.id);

              return (
                <React.Fragment key={gap.id}>
                  {/* Glow effect */}
                  <Circle
                    cx={pos.x + pos.width / 2}
                    cy={pos.y + pos.height / 2}
                    r={pos.fontSize + 10}
                    fill={`url(#${colors.glow})`}
                  />
                  
                  {/* Text */}
                  <SvgText
                    x={pos.x + pos.width / 2}
                    y={pos.y + pos.height / 2}
                    textAnchor="middle"
                    fontSize={pos.fontSize}
                    fontWeight={gap.frequency >= maxFrequency * 0.7 ? "bold" : "normal"}
                    fill={colors.color}
                    onPress={() => onGapPress?.(gap)}
                  >
                    {gap.sentence}
                  </SvgText>

                  {/* Bookmark indicator */}
                  {isBookmarked && (
                    <Circle
                      cx={pos.x + pos.width - 8}
                      cy={pos.y + 8}
                      r="6"
                      fill="#fbbf24"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </ScrollView>
    </View>
  );
}

export default function GapSentenceMapping() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGap, setSelectedGap] = useState<GapFrequency | null>(null);
  const [bookmarkedGaps, setBookmarkedGaps] = useState<Set<string>>(new Set());

  // Process gap sentences data
  const processGapData = (): GapFrequency[] => {
    const gapMap = new Map<string, { frequency: number; sessions: Set<string>; subjects: Set<string> }>();
    
    gapSentencesData.sessions.forEach(session => {
      session.learning_gap_sentences.forEach(sentence => {
        const existing = gapMap.get(sentence) || { 
          frequency: 0, 
          sessions: new Set(), 
          subjects: new Set() 
        };
        
        existing.frequency += 1;
        existing.sessions.add(session.id);
        existing.subjects.add(session.subject);
        
        gapMap.set(sentence, existing);
      });
    });

    return Array.from(gapMap.entries())
      .map(([sentence, data]) => ({
        id: `gap-${sentence.toLowerCase().replace(/\s+/g, '-')}`,
        sentence,
        frequency: data.frequency,
        sessions: Array.from(data.sessions),
        subjects: Array.from(data.subjects),
      }))
      .sort((a, b) => b.frequency - a.frequency);
  };

  // Filter data based on selected subject
  const getFilteredData = () => {
    const allGaps = processGapData();
    
    if (selectedSubject === 'all') {
      return allGaps;
    }
    
    return allGaps.filter(gap => gap.subjects.includes(selectedSubject));
  };

  const gapData = getFilteredData();
  const top3Gaps = gapData.slice(0, 3);
  const subjects = Array.from(new Set(gapSentencesData.sessions.map(s => s.subject)));

  const handleGapPress = (gap: GapFrequency) => {
    setSelectedGap(gap);
  };

  const handleBookmarkToggle = (gapId: string, sentence: string) => {
    const newBookmarks = new Set(bookmarkedGaps);
    if (newBookmarks.has(gapId)) {
      newBookmarks.delete(gapId);
    } else {
      newBookmarks.add(gapId);
    }
    setBookmarkedGaps(newBookmarks);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <Cloud size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Gap Sentence Mapping</Text>
            <Text className="text-slate-400 text-sm">
              Learning gaps frequency • {gapData.length} unique concepts
            </Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          <Filter size={16} color="#94a3b8" />
          <Text className="text-slate-300 text-sm ml-2 capitalize">{selectedSubject}</Text>
          <ChevronDown 
            size={16} 
            color="#94a3b8" 
            style={{ 
              transform: [{ rotate: showFilters ? '180deg' : '0deg' }] 
            }} 
          />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', duration: 400 }}
          className="mb-6"
        >
          <View className="flex-row flex-wrap space-x-2">
            <Pressable
              onPress={() => setSelectedSubject('all')}
              className={`px-4 py-2 rounded-lg mb-2 ${
                selectedSubject === 'all'
                  ? 'bg-purple-600/30 border border-purple-500/50'
                  : 'bg-slate-700/40 border border-slate-600/30'
              }`}
            >
              <Text className={`text-sm font-medium ${
                selectedSubject === 'all' ? 'text-purple-300' : 'text-slate-400'
              }`}>
                All Subjects
              </Text>
            </Pressable>
            {subjects.map((subject) => (
              <Pressable
                key={subject}
                onPress={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg mb-2 ${
                  selectedSubject === subject
                    ? 'bg-purple-600/30 border border-purple-500/50'
                    : 'bg-slate-700/40 border border-slate-600/30'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedSubject === subject ? 'text-purple-300' : 'text-slate-400'
                }`}>
                  {subject}
                </Text>
              </Pressable>
            ))}
          </View>
        </MotiView>
      )}

      {/* Word Cloud */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Learning Gap Word Cloud
        </Text>
        <GapWordCloud 
          gaps={gapData} 
          onGapPress={handleGapPress}
          onBookmarkToggle={handleBookmarkToggle}
          bookmarkedGaps={bookmarkedGaps}
        />
      </View>

      {/* Top 3 Recurring Gaps */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <Target size={18} color="#ef4444" />
          <Text className="text-lg font-semibold text-slate-100 ml-2">
            Top 3 Recurring Gaps
          </Text>
        </View>
        
        <View className="space-y-3">
          {top3Gaps.map((gap, index) => {
            const isBookmarked = bookmarkedGaps.has(gap.id);
            const rankColors = ['#ef4444', '#f59e0b', '#8b5cf6'];
            const rankBgs = ['bg-red-500/10', 'bg-amber-500/10', 'bg-purple-500/10'];
            const rankBorders = ['border-red-500/30', 'border-amber-500/30', 'border-purple-500/30'];
            
            return (
              <MotiView
                key={gap.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 600, delay: index * 150 + 800 }}
                className={`${rankBgs[index]} border ${rankBorders[index]} rounded-xl p-4`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-2">
                      <View 
                        className="w-6 h-6 rounded-full items-center justify-center mr-2"
                        style={{ backgroundColor: rankColors[index] }}
                      >
                        <Text className="text-white font-bold text-xs">
                          #{index + 1}
                        </Text>
                      </View>
                      <Text className="text-slate-100 font-semibold text-base">
                        {gap.sentence}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-slate-400 text-sm">
                        Frequency: <Text className="font-bold" style={{ color: rankColors[index] }}>
                          {gap.frequency}x
                        </Text>
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        Subjects: <Text className="text-slate-300">
                          {gap.subjects.join(', ')}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Bookmark Button */}
                  <Pressable
                    onPress={() => handleBookmarkToggle(gap.id, gap.sentence)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isBookmarked ? 'bg-amber-500/20' : 'bg-slate-700/40'
                    }`}
                  >
                    <MotiView
                      animate={{
                        scale: isBookmarked ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ type: 'spring', duration: 300 }}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={18} color="#fbbf24" fill="#fbbf24" />
                      ) : (
                        <Bookmark size={18} color="#94a3b8" />
                      )}
                    </MotiView>
                  </Pressable>
                </View>
              </MotiView>
            );
          })}
        </View>
      </View>

      {/* Summary Statistics */}
      <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Hash size={16} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Unique Gaps</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {gapData.length}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1300 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Most Frequent</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {top3Gaps[0]?.frequency || 0}x
          </Text>
          <Text className="text-red-300/80 text-xs">
            {top3Gaps[0]?.sentence.slice(0, 20)}...
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Bookmark size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Bookmarked</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {bookmarkedGaps.size}
          </Text>
        </MotiView>
      </View>

      {/* Gap Details Modal */}
      {selectedGap && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute inset-4 bg-slate-800/95 rounded-xl p-6 border border-slate-600/50 shadow-xl z-50"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-slate-100 flex-1">
              Gap Analysis
            </Text>
            <Pressable
              onPress={() => setSelectedGap(null)}
              className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
            >
              <Text className="text-slate-300 font-bold">×</Text>
            </Pressable>
          </View>

          {/* Gap Details */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-4">
              <View>
                <Text className="text-lg font-semibold text-purple-300 mb-2">
                  {selectedGap.sentence}
                </Text>
                <Text className="text-slate-400 text-sm">
                  This concept appeared {selectedGap.frequency} times across your study sessions
                </Text>
              </View>

              <View>
                <Text className="text-slate-100 font-semibold mb-2">Frequency Analysis</Text>
                <View className="bg-slate-700/40 rounded-lg p-3">
                  <Text className="text-slate-300 text-sm">
                    Appeared in {selectedGap.sessions.length} different sessions
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    Across subjects: {selectedGap.subjects.join(', ')}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-slate-100 font-semibold mb-2">Recommendation</Text>
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <Text className="text-emerald-200 text-sm">
                    This recurring gap suggests a fundamental concept that needs reinforcement. 
                    Consider reviewing related topics and practicing similar questions.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-6">
            <Pressable
              onPress={() => handleBookmarkToggle(selectedGap.id, selectedGap.sentence)}
              className={`flex-1 rounded-xl py-3 px-4 flex-row items-center justify-center ${
                bookmarkedGaps.has(selectedGap.id)
                  ? 'bg-amber-600/30 border border-amber-500/50'
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}
            >
              {bookmarkedGaps.has(selectedGap.id) ? (
                <BookmarkCheck size={16} color="#fbbf24" />
              ) : (
                <Bookmark size={16} color="#94a3b8" />
              )}
              <Text className={`ml-2 font-semibold ${
                bookmarkedGaps.has(selectedGap.id) ? 'text-amber-300' : 'text-slate-300'
              }`}>
                {bookmarkedGaps.has(selectedGap.id) ? 'Bookmarked' : 'Bookmark'}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setSelectedGap(null)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl py-3 px-4 flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold">Study This Gap</Text>
            </Pressable>
          </View>
        </MotiView>
      )}

      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1500 }}
        className="flex-row items-center justify-center mt-6 space-x-6 pt-4 border-t border-slate-600/30"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
          <Text className="text-slate-300 text-sm">High Frequency</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
          <Text className="text-slate-300 text-sm">Medium</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-slate-300 text-sm">Low Frequency</Text>
        </View>
      </MotiView>
    </MotiView>
  );
}