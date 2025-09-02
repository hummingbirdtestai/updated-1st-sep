import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions,Pressable } from 'react-native';
import { MotiView } from 'moti';
import { TriangleAlert as AlertTriangle, Brain, ChartBar as BarChart3, Clock, Target, TrendingDown, Gauge, ListFilter as Filter, ChevronDown, GitBranch, Lightbulb, X, ExternalLink, Play, BookOpen, Video, RotateCcw } from 'lucide-react-native';
import ErrorFingerprintProfile from './ErrorFingerprintProfile';
import ConceptPrerequisiteMap from './ConceptPrerequisiteMap';
import mockRootCausesData from '@/data/mockRootCausesData.json';

type FilterTab = 'today' | 'subject' | 'overall';

interface ProgressSummaryProps {
  pyqsCompleted: number;
  totalTimeSpent: number;
  timeWasted: number;
  improvementPotential: number;
}

interface AISuggestion {
  type: 'mcq_retry' | 'flashcard' | 'video' | 'concept_review';
  title: string;
  description: string;
  link: string;
  estimated_time: number; // minutes
}

interface SidePanelData {
  title: string;
  type: 'error_gap' | 'concept';
  impact: {
    pyqs_affected?: number;
    time_wasted?: number;
    pyqs_blocked?: number;
    time_blocked?: number;
  };
  suggestions: AISuggestion[];
}

function ProgressSummary({ 
  pyqsCompleted, 
  totalTimeSpent, 
  timeWasted, 
  improvementPotential 
}: ProgressSummaryProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const timeDrainPercentage = totalTimeSpent > 0 ? (timeWasted / totalTimeSpent) * 100 : 0;
  
  const getDrainColor = (percentage: number) => {
    if (percentage >= 20) return { color: '#ef4444', label: 'Critical', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (percentage >= 10) return { color: '#f59e0b', label: 'High', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (percentage >= 5) return { color: '#eab308', label: 'Moderate', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { color: '#10b981', label: 'Low', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const drainInfo = getDrainColor(timeDrainPercentage);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className={`${drainInfo.bg} border ${drainInfo.border} rounded-2xl p-6 mb-6 shadow-lg`}
      style={{
        shadowColor: drainInfo.color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View 
          className="w-12 h-12 rounded-xl items-center justify-center mr-4 shadow-lg"
          style={{ backgroundColor: drainInfo.color }}
        >
          <Gauge size={24} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-100">
            Study Efficiency Overview
          </Text>
          <Text className="text-slate-400 text-sm">
            Performance analysis • {drainInfo.label} time drain detected
          </Text>
        </View>
        
        {/* Drain Percentage Badge */}
        <View className={`px-4 py-2 rounded-full ${drainInfo.bg} border ${drainInfo.border}`}>
          <Text 
            className="font-bold text-lg"
            style={{ color: drainInfo.color }}
          >
            {timeDrainPercentage.toFixed(1)}%
          </Text>
          <Text className="text-slate-400 text-xs text-center">drain</Text>
        </View>
      </View>

      {/* Progress Summary Text */}
      <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30 mb-4">
        <Text className="text-slate-200 text-lg leading-7">
          You've attempted <Text className="font-bold text-cyan-400">{pyqsCompleted.toLocaleString()} PYQs</Text> 
          {' '}(~<Text className="font-bold text-blue-400">{(totalTimeSpent / 60).toFixed(1)} hours</Text>). 
          <Text className="font-bold" style={{ color: drainInfo.color }}>
            {' '}{(timeWasted / 60).toFixed(1)} hours wasted
          </Text> due to repeat mistakes.
        </Text>
        
        {improvementPotential > 0 && (
          <View className="mt-3 pt-3 border-t border-slate-600/30">
            <Text className="text-emerald-300 text-base">
              💡 <Text className="font-bold">Potential time savings: {improvementPotential.toFixed(1)} hours</Text> by 
              addressing recurring error patterns.
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats Grid */}
      <View className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 400 }}
          className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-1">
            <Target size={14} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-xs ml-1">PYQs</Text>
          </View>
          <Text className="text-blue-200 text-lg font-bold">
            {pyqsCompleted.toLocaleString()}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 500 }}
          className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-1">
            <Clock size={14} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-xs ml-1">Invested</Text>
          </View>
          <Text className="text-emerald-200 text-lg font-bold">
            {(totalTimeSpent / 60).toFixed(1)}h
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-1">
            <TrendingDown size={14} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-xs ml-1">Wasted</Text>
          </View>
          <Text className="text-red-200 text-lg font-bold">
            {(timeWasted / 60).toFixed(1)}h
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 700 }}
          className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-1">
            <Lightbulb size={14} color="#fbbf24" />
            <Text className="text-amber-400 font-semibold text-xs ml-1">Savings</Text>
          </View>
          <Text className="text-amber-200 text-lg font-bold">
            {improvementPotential.toFixed(1)}h
          </Text>
        </MotiView>
      </View>
    </MotiView>
  );
}

export default function RootCausesPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [activeFilter, setActiveFilter] = useState<FilterTab>('overall');
  const [showFilters, setShowFilters] = useState(false);
  const [sidePanelData, setSidePanelData] = useState<SidePanelData | null>(null);

  // Calculate metrics from mock data
  const pyqsCompleted = mockRootCausesData.pyqs_completed;
  const totalTimeSpent = pyqsCompleted * 4.5; // minutes
  const timeWasted = mockRootCausesData.error_fingerprint.reduce((sum, gap) => sum + gap.time_wasted_min, 0);
  const improvementPotential = mockRootCausesData.analysis_metadata.improvement_potential_hours;

  const filterTabs: { key: FilterTab; label: string; icon: any }[] = [
    { key: 'today', label: 'Today', icon: Clock },
    { key: 'subject', label: 'Subject', icon: Brain },
    { key: 'overall', label: 'Overall', icon: BarChart3 },
  ];

  // Mock AI suggestions generator
  const generateAISuggestions = (title: string, type: 'error_gap' | 'concept'): AISuggestion[] => {
    const baseTitle = title.split(' ')[0]; // Get first word for suggestions
    
    if (type === 'error_gap') {
      return [
        {
          type: 'mcq_retry',
          title: `Retry 5 linked PYQs on ${baseTitle}`,
          description: 'Practice similar questions to reinforce correct patterns',
          link: 'https://example.com/mcq-retry',
          estimated_time: 15
        },
        {
          type: 'flashcard',
          title: `Review Flashcards: ${title} Q&A`,
          description: 'Quick review of key concepts and common mistakes',
          link: 'https://example.com/flashcards',
          estimated_time: 8
        },
        {
          type: 'video',
          title: `Watch 3-min video explainer on ${baseTitle}`,
          description: 'Visual explanation of the concept and common pitfalls',
          link: 'https://example.com/video',
          estimated_time: 3
        }
      ];
    } else {
      return [
        {
          type: 'concept_review',
          title: `Master ${baseTitle} Fundamentals`,
          description: 'Comprehensive review of prerequisite knowledge',
          link: 'https://example.com/concept-review',
          estimated_time: 20
        },
        {
          type: 'flashcard',
          title: `${title} Foundation Cards`,
          description: 'Essential flashcards for building strong fundamentals',
          link: 'https://example.com/foundation-cards',
          estimated_time: 12
        },
        {
          type: 'mcq_retry',
          title: `Practice ${baseTitle} Prerequisites`,
          description: 'Targeted questions to strengthen foundational understanding',
          link: 'https://example.com/prerequisite-mcqs',
          estimated_time: 18
        },
        {
          type: 'video',
          title: `${baseTitle} Concept Map Video`,
          description: 'Visual breakdown of how this concept connects to others',
          link: 'https://example.com/concept-video',
          estimated_time: 7
        }
      ];
    }
  };

  // Handle error gap click
  const handleErrorGapClick = (gap: any) => {
    const suggestions = generateAISuggestions(gap.gap, 'error_gap');
    setSidePanelData({
      title: gap.gap,
      type: 'error_gap',
      impact: {
        pyqs_affected: gap.pyqs_affected,
        time_wasted: gap.time_wasted_min
      },
      suggestions
    });
  };

  // Handle concept click
  const handleConceptClick = (concept: any) => {
    const suggestions = generateAISuggestions(concept.concept, 'concept');
    setSidePanelData({
      title: concept.concept,
      type: 'concept',
      impact: {
        pyqs_blocked: concept.pyqs_blocked,
        time_blocked: concept.time_blocked_min
      },
      suggestions
    });
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'mcq_retry': return <RotateCcw size={16} color="#ffffff" />;
      case 'flashcard': return <BookOpen size={16} color="#ffffff" />;
      case 'video': return <Video size={16} color="#ffffff" />;
      case 'concept_review': return <Brain size={16} color="#ffffff" />;
      default: return <Play size={16} color="#ffffff" />;
    }
  };

  // Get suggestion color
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'mcq_retry': return 'from-emerald-600 to-teal-600';
      case 'flashcard': return 'from-blue-600 to-indigo-600';
      case 'video': return 'from-purple-600 to-violet-600';
      case 'concept_review': return 'from-amber-600 to-orange-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <View className="flex-1 bg-slate-900 relative">
      {/* Sticky Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-4 shadow-lg">
              <AlertTriangle size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Root Causes Analysis
              </Text>
              <Text className="text-sm text-slate-400 mt-1">
                Error patterns • Concept dependencies • Study optimization
              </Text>
            </View>
          </View>

          {/* Filter Toggle */}
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
          >
            <Filter size={16} color="#94a3b8" />
            <Text className="text-slate-300 text-sm ml-2 capitalize">{activeFilter}</Text>
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
            className="mt-4 pt-4 border-t border-slate-700/30"
          >
            <View className="flex-row space-x-2">
              {filterTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeFilter === tab.key;
                
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveFilter(tab.key)}
                    className={`flex-row items-center px-4 py-2 rounded-lg ${
                      isActive
                        ? 'bg-red-600/30 border border-red-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <IconComponent 
                      size={16} 
                      color={isActive ? '#f87171' : '#94a3b8'} 
                    />
                    <Text className={`text-sm font-medium ml-2 ${
                      isActive ? 'text-red-300' : 'text-slate-400'
                    }`}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            
            {/* Filter Description */}
            <Text className="text-slate-500 text-xs mt-2">
              {activeFilter === 'today' && 'Show errors from today\'s study session'}
              {activeFilter === 'subject' && 'Filter by specific subject areas'}
              {activeFilter === 'overall' && 'Complete analysis across all subjects and time periods'}
            </Text>
          </MotiView>
        )}
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
        {/* Top Section: Progress Summary */}
        <ProgressSummary
          pyqsCompleted={pyqsCompleted}
          totalTimeSpent={totalTimeSpent}
          timeWasted={timeWasted}
          improvementPotential={improvementPotential}
        />

        {/* Middle Section: Error Fingerprint Profile */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 400 }}
          className="mb-6"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
              <BarChart3 size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Error Fingerprint Profile
            </Text>
          </View>
          <ErrorFingerprintProfile onErrorGapClick={handleErrorGapClick} />
        </MotiView>

        {/* Bottom Section: Concept Prerequisite Map */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="mb-6"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <GitBranch size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Concept Prerequisite Dependencies
            </Text>
          </View>
          <ConceptPrerequisiteMap onConceptClick={handleConceptClick} />
        </MotiView>

        {/* Insights Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg items-center justify-center mr-3">
              <Lightbulb size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Key Insights & Recommendations
            </Text>
          </View>

          <View className="space-y-4">
            {/* Critical Gap */}
            <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <Text className="text-red-300 font-semibold mb-2">
                🚨 Most Critical Gap
              </Text>
              <Text className="text-red-200 text-sm">
                <Text className="font-bold">{mockRootCausesData.analysis_metadata.most_critical_gap}</Text> is 
                causing the most time waste. Focus here first for maximum impact.
              </Text>
            </View>

            {/* Blocking Concept */}
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <Text className="text-amber-300 font-semibold mb-2">
                🔒 Most Blocking Concept
              </Text>
              <Text className="text-amber-200 text-sm">
                <Text className="font-bold">{mockRootCausesData.analysis_metadata.most_blocking_concept}</Text> is 
                preventing progress in multiple areas. Mastering this will unlock significant learning.
              </Text>
            </View>

            {/* Action Plan */}
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <Text className="text-emerald-300 font-semibold mb-2">
                🎯 Recommended Action Plan
              </Text>
              <View className="space-y-1">
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">1.</Text> Address {mockRootCausesData.analysis_metadata.most_critical_gap.split(' ')[0]} first
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">2.</Text> Master {mockRootCausesData.analysis_metadata.most_blocking_concept.split(' ')[0]} fundamentals
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">3.</Text> Practice dependent topics systematically
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">4.</Text> Monitor progress and adjust focus areas
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Filter-Specific Content Placeholder */}
        {activeFilter !== 'overall' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30 mt-6"
          >
            <View className="items-center text-center">
              <View className="w-16 h-16 bg-slate-600/50 rounded-2xl items-center justify-center mb-4">
                {activeFilter === 'today' ? (
                  <Clock size={32} color="#64748b" />
                ) : (
                  <Brain size={32} color="#64748b" />
                )}
              </View>
              
              <Text className="text-xl font-bold text-slate-100 mb-2">
                {activeFilter === 'today' ? 'Today\'s Analysis' : 'Subject-Specific Analysis'}
              </Text>
              
              <Text className="text-slate-300 text-base mb-4 text-center max-w-md">
                {activeFilter === 'today' 
                  ? 'Detailed breakdown of today\'s error patterns and time usage will be displayed here.'
                  : 'Subject-specific error analysis and prerequisite mapping will be shown here.'
                }
              </Text>
              
              <View className="bg-slate-600/30 rounded-xl px-6 py-3 border border-slate-500/50">
                <Text className="text-slate-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>

      {/* AI Reroute Fix Suggestions Side Panel */}
      {sidePanelData && (
        <MotiView
          from={{ opacity: 0, translateX: 400 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'spring', duration: 600 }}
          className="absolute right-0 top-0 bottom-0 w-96 bg-slate-800/95 border-l border-slate-700/50 shadow-2xl z-50"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Panel Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100 mb-1">
                AI Reroute Fixes
              </Text>
              <Text className="text-sm text-amber-400">
                {sidePanelData.title}
              </Text>
              <Text className="text-xs text-slate-500 mt-1 capitalize">
                {sidePanelData.type.replace('_', ' ')} Analysis
              </Text>
            </View>
            <Pressable
              onPress={() => setSidePanelData(null)}
              className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-6">
            {/* Impact Analysis */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={16} color="#ef4444" />
                <Text className="text-slate-100 font-semibold ml-2">Impact Analysis</Text>
              </View>
              <View className="space-y-3">
                {sidePanelData.impact.pyqs_affected && (
                  <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <Text className="text-red-200 text-sm">
                      <Text className="font-bold">{sidePanelData.impact.pyqs_affected} PYQs affected</Text> by this error pattern
                    </Text>
                  </View>
                )}
                {sidePanelData.impact.time_wasted && (
                  <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <Text className="text-amber-200 text-sm">
                      <Text className="font-bold">{sidePanelData.impact.time_wasted.toFixed(1)} minutes wasted</Text> on repeat mistakes
                    </Text>
                  </View>
                )}
                {sidePanelData.impact.pyqs_blocked && (
                  <View className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <Text className="text-purple-200 text-sm">
                      <Text className="font-bold">{sidePanelData.impact.pyqs_blocked} PYQs blocked</Text> by prerequisite gaps
                    </Text>
                  </View>
                )}
                {sidePanelData.impact.time_blocked && (
                  <View className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                    <Text className="text-cyan-200 text-sm">
                      <Text className="font-bold">{(sidePanelData.impact.time_blocked / 60).toFixed(1)} hours blocked</Text> by missing fundamentals
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* AI Suggestions */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={16} color="#fbbf24" />
                <Text className="text-slate-100 font-semibold ml-2">Recommended Fixes</Text>
              </View>
              
              <View className="space-y-3">
                {sidePanelData.suggestions.map((suggestion, index) => (
                  <MotiView
                    key={`${suggestion.type}-${index}`}
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 400, delay: index * 100 + 200 }}
                  >
                    <Pressable
                      onPress={() => {
                        // Handle suggestion action - will be replaced with real links later
                        console.log(`Opening ${suggestion.type}:`, suggestion.link);
                      }}
                      className={`bg-gradient-to-r ${getSuggestionColor(suggestion.type)} rounded-xl p-4 shadow-lg active:scale-95 border border-white/10`}
                      style={{
                        shadowColor: suggestion.type === 'mcq_retry' ? '#10b981' : 
                                   suggestion.type === 'flashcard' ? '#3b82f6' : 
                                   suggestion.type === 'video' ? '#8b5cf6' : '#f59e0b',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                          {getSuggestionIcon(suggestion.type)}
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-base mb-1">
                            {suggestion.title}
                          </Text>
                          <Text className="text-white/80 text-sm mb-2">
                            {suggestion.description}
                          </Text>
                          <View className="flex-row items-center">
                            <Clock size={12} color="#ffffff" style={{ opacity: 0.7 }} />
                            <Text className="text-white/70 text-xs ml-1">
                              ~{suggestion.estimated_time} min
                            </Text>
                          </View>
                        </View>
                        <ExternalLink size={14} color="#ffffff" style={{ opacity: 0.7 }} />
                      </View>
                    </Pressable>
                  </MotiView>
                ))}
              </View>
            </View>

            {/* Study Plan */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Target size={16} color="#10b981" />
                <Text className="text-slate-100 font-semibold ml-2">Suggested Study Plan</Text>
              </View>
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <View className="space-y-2">
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">1.</Text> Start with the {sidePanelData.type === 'concept' ? 'concept review' : 'video explainer'} (quickest impact)
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">2.</Text> Review flashcards for reinforcement
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">3.</Text> Practice with targeted MCQs
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">4.</Text> Return to original problem area when confident
                  </Text>
                </View>
              </View>
            </View>

            {/* Time Investment Summary */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <View className="flex-row items-center mb-3">
                <Clock size={16} color="#06b6d4" />
                <Text className="text-slate-100 font-semibold ml-2">Time Investment</Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Total Estimated Time</Text>
                  <Text className="text-cyan-400 font-bold text-sm">
                    {sidePanelData.suggestions.reduce((sum, s) => sum + s.estimated_time, 0)} min
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">Potential Time Saved</Text>
                  <Text className="text-emerald-400 font-bold text-sm">
                    {sidePanelData.impact.time_wasted 
                      ? `${sidePanelData.impact.time_wasted.toFixed(0)} min`
                      : sidePanelData.impact.time_blocked
                      ? `${sidePanelData.impact.time_blocked.toFixed(0)} min`
                      : 'N/A'
                    }
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-400 text-sm">ROI Ratio</Text>
                  <Text className="text-purple-400 font-bold text-sm">
                    {(() => {
                      const timeToSave = sidePanelData.impact.time_wasted || sidePanelData.impact.time_blocked || 0;
                      const timeToInvest = sidePanelData.suggestions.reduce((sum, s) => sum + s.estimated_time, 0);
                      const roi = timeToInvest > 0 ? (timeToSave / timeToInvest) : 0;
                      return `${roi.toFixed(1)}x`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </MotiView>
      )}

      {/* Overlay for Side Panel */}
      {sidePanelData && (
        <Pressable
          onPress={() => setSidePanelData(null)}
          className="absolute inset-0 bg-black/30 z-40"
        />
      )}
    </View>
  );
}