import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Zap, TrendingDown, TrendingUp, ListFilter as Filter, ChevronDown } from 'lucide-react-native';
import FatigueImpactCurve from './FatigueImpactCurve';
import AdaptiveDifficultyResponse from './AdaptiveDifficultyResponse';
import { mockAttempts } from '@/data/mockAttempts';

type ChartMode = 'fatigue' | 'difficulty';
type TimeRange = 'today' | 'week' | 'month';

export default function SpeedAccuracyTab() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [chartMode, setChartMode] = useState<ChartMode>('fatigue');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique filter options from mock data
  const getFilterOptions = () => {
    const subjects = Array.from(new Set(mockAttempts.map(a => a.subject)));
    const chapters = Array.from(new Set(
      mockAttempts
        .filter(a => selectedSubject === 'all' || a.subject === selectedSubject)
        .map(a => a.chapter)
    ));
    const topics = Array.from(new Set(
      mockAttempts
        .filter(a => 
          (selectedSubject === 'all' || a.subject === selectedSubject) &&
          (selectedChapter === 'all' || a.chapter === selectedChapter)
        )
        .map(a => a.topic)
    ));
    
    return { subjects, chapters, topics };
  };

  const { subjects, chapters, topics } = getFilterOptions();

  const resetFilters = () => {
    setSelectedSubject('all');
    setSelectedChapter('all');
    setSelectedTopic('all');
  };

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
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Zap size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Speed & Accuracy</Text>
            <Text className="text-sm text-slate-400">
              Performance analysis • {chartMode === 'fatigue' ? 'Fatigue tracking' : 'Difficulty adaptation'}
            </Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          <Filter size={16} color="#94a3b8" />
          <Text className="text-slate-300 text-sm ml-2">Filters</Text>
          <ChevronDown 
            size={16} 
            color="#94a3b8" 
            style={{ 
              transform: [{ rotate: showFilters ? '180deg' : '0deg' }] 
            }} 
          />
        </Pressable>
      </MotiView>

      {/* Filter Panel */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', duration: 400 }}
          className="bg-slate-800/60 border-b border-slate-700/50 p-6"
        >
          <View className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Subject:</Text>
              <View className="flex-row flex-wrap space-x-2">
                <Pressable
                  onPress={() => {
                    setSelectedSubject('all');
                    setSelectedChapter('all');
                    setSelectedTopic('all');
                  }}
                  className={`px-3 py-2 rounded-lg mb-2 ${
                    selectedSubject === 'all'
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedSubject === 'all' ? 'text-blue-300' : 'text-slate-400'
                  }`}>
                    All
                  </Text>
                </Pressable>
                {subjects.map((subject) => (
                  <Pressable
                    key={subject}
                    onPress={() => {
                      setSelectedSubject(subject);
                      setSelectedChapter('all');
                      setSelectedTopic('all');
                    }}
                    className={`px-3 py-2 rounded-lg mb-2 ${
                      selectedSubject === subject
                        ? 'bg-blue-600/30 border border-blue-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedSubject === subject ? 'text-blue-300' : 'text-slate-400'
                    }`}>
                      {subject}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Chapter Filter */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Chapter:</Text>
              <View className="flex-row flex-wrap space-x-2">
                <Pressable
                  onPress={() => {
                    setSelectedChapter('all');
                    setSelectedTopic('all');
                  }}
                  className={`px-3 py-2 rounded-lg mb-2 ${
                    selectedChapter === 'all'
                      ? 'bg-emerald-600/30 border border-emerald-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedChapter === 'all' ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    All
                  </Text>
                </Pressable>
                {chapters.map((chapter) => (
                  <Pressable
                    key={chapter}
                    onPress={() => {
                      setSelectedChapter(chapter);
                      setSelectedTopic('all');
                    }}
                    className={`px-3 py-2 rounded-lg mb-2 ${
                      selectedChapter === chapter
                        ? 'bg-emerald-600/30 border border-emerald-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedChapter === chapter ? 'text-emerald-300' : 'text-slate-400'
                    }`}>
                      {chapter}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Topic Filter */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Topic:</Text>
              <View className="flex-row flex-wrap space-x-2">
                <Pressable
                  onPress={() => setSelectedTopic('all')}
                  className={`px-3 py-2 rounded-lg mb-2 ${
                    selectedTopic === 'all'
                      ? 'bg-purple-600/30 border border-purple-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedTopic === 'all' ? 'text-purple-300' : 'text-slate-400'
                  }`}>
                    All
                  </Text>
                </Pressable>
                {topics.map((topic) => (
                  <Pressable
                    key={topic}
                    onPress={() => setSelectedTopic(topic)}
                    className={`px-3 py-2 rounded-lg mb-2 ${
                      selectedTopic === topic
                        ? 'bg-purple-600/30 border border-purple-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      selectedTopic === topic ? 'text-purple-300' : 'text-slate-400'
                    }`}>
                      {topic}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Time Range Filter */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Time Range:</Text>
              <View className="flex-row space-x-2">
                {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => setTimeRange(range)}
                    className={`px-3 py-2 rounded-lg ${
                      timeRange === range
                        ? 'bg-amber-600/30 border border-amber-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm font-medium capitalize ${
                      timeRange === range ? 'text-amber-300' : 'text-slate-400'
                    }`}>
                      {range}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Reset Filters Button */}
          <View className="flex-row justify-end mt-4">
            <Pressable
              onPress={resetFilters}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2"
            >
              <Text className="text-slate-300 text-sm">Reset Filters</Text>
            </Pressable>
          </View>
        </MotiView>
      )}

      {/* Chart Mode Toggle */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 200 }}
        className="p-6 border-b border-slate-700/50"
      >
        <View className="flex-row items-center justify-center space-x-4">
          <Pressable
            onPress={() => setChartMode('fatigue')}
            className={`flex-row items-center px-6 py-3 rounded-xl ${
              chartMode === 'fatigue'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-lg'
                : 'bg-slate-700/50 border border-slate-600/50'
            }`}
            style={{
              shadowColor: chartMode === 'fatigue' ? '#ef4444' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: chartMode === 'fatigue' ? 4 : 0,
            }}
          >
            <TrendingDown size={18} color={chartMode === 'fatigue' ? '#ffffff' : '#94a3b8'} />
            <Text className={`ml-2 font-semibold ${
              chartMode === 'fatigue' ? 'text-white' : 'text-slate-400'
            }`}>
              Fatigue Impact Curve
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setChartMode('difficulty')}
            className={`flex-row items-center px-6 py-3 rounded-xl ${
              chartMode === 'difficulty'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'bg-slate-700/50 border border-slate-600/50'
            }`}
            style={{
              shadowColor: chartMode === 'difficulty' ? '#3b82f6' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: chartMode === 'difficulty' ? 4 : 0,
            }}
          >
            <TrendingUp size={18} color={chartMode === 'difficulty' ? '#ffffff' : '#94a3b8'} />
            <Text className={`ml-2 font-semibold ${
              chartMode === 'difficulty' ? 'text-white' : 'text-slate-400'
            }`}>
              Adaptive Difficulty Response
            </Text>
          </Pressable>
        </View>

        {/* Mode Description */}
        <Text className="text-slate-400 text-sm text-center mt-3">
          {chartMode === 'fatigue' 
            ? 'Track how accuracy declines over study time and identify optimal session lengths'
            : 'Analyze performance adaptation across different question difficulty levels'
          }
        </Text>
      </MotiView>

      {/* Chart Area */}
      <View className="flex-1">
        {chartMode === 'fatigue' ? (
          <FatigueImpactCurve />
        ) : (
          <AdaptiveDifficultyResponse />
        )}
      </View>
    </View>
  );
}