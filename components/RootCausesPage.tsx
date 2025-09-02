import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TriangleAlert as AlertTriangle, Brain, ChartBar as BarChart3, Clock, Target, TrendingDown, Gauge, ListFilter as Filter, ChevronDown, GitBranch, Lightbulb } from 'lucide-react-native';
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

  return (
    <View className="flex-1 bg-slate-900">
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
          <ErrorFingerprintProfile />
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
          <ConceptPrerequisiteMap />
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
    </View>
  );
}