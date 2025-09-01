import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { GitBranch, Target, TrendingUp, Filter, ChevronDown, X, CircleCheck as CheckCircle, CircleX as XCircle, Circle, AlertTriangle, Award, Clock, BarChart3 } from 'lucide-react-native';
import Svg, { Circle as SvgCircle, Line, Text as SvgText, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import gapChainsData from '@/data/gap-chains-data.json';

interface ChainLink {
  mcq_id: string;
  is_correct: boolean;
}

interface GapChain {
  pyq_id: string;
  subject: string;
  chapter: string;
  topic: string;
  chain: ChainLink[];
  chain_health_score: number;
  time_credit_minutes: number;
}

interface ChainTooltipProps {
  chain: GapChain;
  position: { x: number; y: number };
  onClose: () => void;
}

function ChainTooltip({ chain, position, onClose }: ChainTooltipProps) {
  const chainLength = chain.chain.length;
  const correctIndex = chain.chain.findIndex(link => link.is_correct);
  const hasCorrect = correctIndex !== -1;
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 160,
        width: 240,
        shadowColor: chain.chain_health_score >= 85 ? '#10b981' : 
                     chain.chain_health_score >= 70 ? '#f59e0b' : '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
      >
        <X size={12} color="#94a3b8" />
      </Pressable>

      {/* Chain Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1">
          {chain.subject}
        </Text>
        <Text className="text-slate-300 text-xs mb-3">
          {chain.chapter} • {chain.topic}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Chain Length</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              {chainLength} MCQ{chainLength !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Health Score</Text>
            <Text className={`text-xs font-semibold ${
              chain.chain_health_score >= 85 ? 'text-emerald-400' : 
              chain.chain_health_score >= 70 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {chain.chain_health_score}/100
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Solved At</Text>
            <Text className={`text-xs font-semibold ${hasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {hasCorrect ? `MCQ ${correctIndex + 1}` : 'Unsolved'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Credit</Text>
            <Text className="text-slate-300 text-xs">
              {chain.time_credit_minutes}m
            </Text>
          </View>
        </View>

        {/* Chain Visualization */}
        <View className="mt-3 bg-slate-700/40 rounded-lg p-2">
          <Text className="text-slate-400 text-xs mb-2">Chain Progress:</Text>
          <View className="flex-row space-x-1">
            {chain.chain.map((link, index) => (
              <View
                key={link.mcq_id}
                className={`w-4 h-4 rounded-full border-2 ${
                  link.is_correct 
                    ? 'bg-emerald-500 border-emerald-400' 
                    : 'bg-red-500 border-red-400'
                }`}
              />
            ))}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function GapChains() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChain, setSelectedChain] = useState<{ chain: GapChain; position: { x: number; y: number } } | null>(null);
  const [sortBy, setSortBy] = useState<'health' | 'length' | 'subject'>('health');

  // Process and filter data
  const getFilteredData = () => {
    let filtered = gapChainsData as GapChain[];
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(chain => chain.subject === selectedSubject);
    }
    
    // Sort data
    switch (sortBy) {
      case 'health':
        return filtered.sort((a, b) => a.chain_health_score - b.chain_health_score);
      case 'length':
        return filtered.sort((a, b) => b.chain.length - a.chain.length);
      case 'subject':
        return filtered.sort((a, b) => a.subject.localeCompare(b.subject));
      default:
        return filtered;
    }
  };

  const chainData = getFilteredData();
  const subjects = Array.from(new Set(gapChainsData.map(chain => chain.subject)));

  // Calculate metrics
  const totalChains = chainData.length;
  const perfectChains = chainData.filter(c => c.chain_health_score === 100).length;
  const averageHealth = chainData.reduce((sum, c) => sum + c.chain_health_score, 0) / Math.max(totalChains, 1);
  const averageLength = chainData.reduce((sum, c) => sum + c.chain.length, 0) / Math.max(totalChains, 1);

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = 400;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Get position for chain visualization
  const getChainPosition = (chain: GapChain, index: number) => {
    const chainLength = chain.chain.length;
    const healthScore = chain.chain_health_score;
    
    const x = padding.left + (chainLength / 6) * plotWidth; // Max 6 MCQs
    const y = padding.top + plotHeight - (healthScore / 100) * plotHeight;
    
    return { x, y };
  };

  // Get chain color based on health score
  const getChainColor = (healthScore: number) => {
    if (healthScore === 100) return { color: '#10b981', glow: 'emeraldGlow' }; // Perfect
    if (healthScore >= 85) return { color: '#34d399', glow: 'emeraldGlow' }; // Excellent
    if (healthScore >= 70) return { color: '#f59e0b', glow: 'amberGlow' }; // Good
    if (healthScore >= 55) return { color: '#fb923c', glow: 'orangeGlow' }; // Fair
    if (healthScore > 0) return { color: '#ef4444', glow: 'redGlow' }; // Poor
    return { color: '#7f1d1d', glow: 'darkRedGlow' }; // Failed
  };

  // Get subject color
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Anatomy': '#3b82f6',
      'Physiology': '#10b981',
      'Biochemistry': '#8b5cf6',
      'Pharmacology': '#f59e0b',
      'Pathology': '#ef4444',
      'Medicine': '#06b6d4',
    };
    return colors[subject] || '#64748b';
  };

  const handleChainPress = (chain: GapChain, x: number, y: number) => {
    setSelectedChain({ chain, position: { x, y } });
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
          <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <GitBranch size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Gap Chains</Text>
            <Text className="text-sm text-slate-400">
              Recursive gap tree per PYQ/MCQ analysis
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
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Filter Controls */}
        {showFilters && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'spring', duration: 400 }}
            className="mb-6"
          >
            {/* Subject Filter */}
            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Filter by Subject:</Text>
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
            </View>

            {/* Sort Options */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Sort by:</Text>
              <View className="flex-row space-x-2">
                {[
                  { key: 'health', label: 'Health Score' },
                  { key: 'length', label: 'Chain Length' },
                  { key: 'subject', label: 'Subject' }
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setSortBy(option.key as any)}
                    className={`px-3 py-2 rounded-lg ${
                      sortBy === option.key
                        ? 'bg-indigo-600/30 border border-indigo-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm ${
                      sortBy === option.key ? 'text-indigo-300' : 'text-slate-400'
                    }`}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </MotiView>
        )}

        {/* Summary Metrics */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Award size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Perfect Chains</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {perfectChains}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              Solved at MCQ 1
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Avg Health</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {averageHealth.toFixed(0)}
            </Text>
            <Text className="text-blue-300/80 text-xs">
              Out of 100
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <GitBranch size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Length</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {averageLength.toFixed(1)}
            </Text>
            <Text className="text-amber-300/80 text-xs">
              MCQs per chain
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <BarChart3 size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Total Chains</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {totalChains}
            </Text>
            <Text className="text-purple-300/80 text-xs">
              PYQs analyzed
            </Text>
          </MotiView>
        </View>

        {/* Chain Scatter Plot */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <GitBranch size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Chain Health vs Length Analysis
            </Text>
          </View>

          {/* Chart Container */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              <View style={{ width: Math.max(chartWidth, 500), height: chartHeight }}>
                <Svg width="100%" height={chartHeight}>
                  <Defs>
                    {/* Gradients for different health levels */}
                    <LinearGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="redGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="darkRedGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.1" />
                    </LinearGradient>
                  </Defs>

                  {/* Grid Lines */}
                  {/* Vertical grid lines (chain length) */}
                  {[1, 2, 3, 4, 5, 6].map((length) => {
                    const x = padding.left + (length / 6) * plotWidth;
                    return (
                      <React.Fragment key={`v-grid-${length}`}>
                        <Line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={padding.top + plotHeight}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        <SvgText
                          x={x}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {length}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Horizontal grid lines (health score) */}
                  {[0, 25, 50, 75, 100].map((score) => {
                    const y = padding.top + plotHeight - (score / 100) * plotHeight;
                    return (
                      <React.Fragment key={`h-grid-${score}`}>
                        <Line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + plotWidth}
                          y2={y}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        <SvgText
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {score}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Chain Data Points */}
                  {chainData.map((chain, index) => {
                    const position = getChainPosition(chain, index);
                    const colors = getChainColor(chain.chain_health_score);
                    const subjectColor = getSubjectColor(chain.subject);
                    const bubbleSize = 6 + (chain.chain.length * 2); // Size based on chain length

                    return (
                      <G key={chain.pyq_id}>
                        {/* Glow effect */}
                        <SvgCircle
                          cx={position.x}
                          cy={position.y}
                          r={bubbleSize + 8}
                          fill={`url(#${colors.glow})`}
                          opacity="0.6"
                        />
                        
                        {/* Main bubble */}
                        <SvgCircle
                          cx={position.x}
                          cy={position.y}
                          r={bubbleSize}
                          fill={colors.color}
                          stroke={subjectColor}
                          strokeWidth="2"
                          onPress={() => handleChainPress(chain, position.x, position.y)}
                        />

                        {/* Chain length indicator */}
                        <SvgText
                          x={position.x}
                          y={position.y + 2}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {chain.chain.length}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Axis Labels */}
                  <SvgText
                    x={padding.left + plotWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#94a3b8"
                  >
                    Chain Length (MCQs)
                  </SvgText>
                  <SvgText
                    x={20}
                    y={padding.top + plotHeight / 2}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#94a3b8"
                    transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                  >
                    Health Score
                  </SvgText>
                </Svg>
              </View>
            </ScrollView>
          </View>

          {/* Chart Legend */}
          <View className="flex-row items-center justify-center space-x-4">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-slate-300 text-sm">Perfect (100)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
              <Text className="text-slate-300 text-sm">Good (70-99)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
              <Text className="text-slate-300 text-sm">Poor (0-69)</Text>
            </View>
          </View>
        </MotiView>

        {/* Chain List View */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <BarChart3 size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Chain Details
            </Text>
          </View>

          <View className="space-y-3">
            {chainData.slice(0, 10).map((chain, index) => {
              const colors = getChainColor(chain.chain_health_score);
              const hasCorrect = chain.chain.some(link => link.is_correct);
              const correctIndex = chain.chain.findIndex(link => link.is_correct);

              return (
                <MotiView
                  key={chain.pyq_id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1000 + index * 100 }}
                  className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold mb-1">
                        {chain.subject} • {chain.topic}
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        {chain.chapter}
                      </Text>
                    </View>
                    
                    {/* Health Score Badge */}
                    <View 
                      className="w-16 h-16 rounded-full border-4 items-center justify-center"
                      style={{ borderColor: colors.color }}
                    >
                      <Text className="text-lg font-bold" style={{ color: colors.color }}>
                        {chain.chain_health_score}
                      </Text>
                      <Text className="text-xs text-slate-400">health</Text>
                    </View>
                  </View>

                  {/* Chain Visualization */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-slate-300 text-sm mb-2">
                        Chain Progress:
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        {chain.chain.map((link, linkIndex) => (
                          <React.Fragment key={link.mcq_id}>
                            {/* MCQ Node */}
                            <View className="items-center">
                              <View
                                className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                                  link.is_correct 
                                    ? 'bg-emerald-500/20 border-emerald-500' 
                                    : 'bg-red-500/20 border-red-500'
                                }`}
                              >
                                {link.is_correct ? (
                                  <CheckCircle size={12} color="#10b981" />
                                ) : (
                                  <XCircle size={12} color="#ef4444" />
                                )}
                              </View>
                              <Text className="text-xs text-slate-400 mt-1">
                                MCQ {linkIndex + 1}
                              </Text>
                            </View>
                            
                            {/* Arrow */}
                            {linkIndex < chain.chain.length - 1 && (
                              <View className="w-4 h-px bg-slate-500" />
                            )}
                          </React.Fragment>
                        ))}
                      </View>
                    </View>

                    {/* Status Summary */}
                    <View className="ml-4 items-end">
                      <Text className="text-slate-400 text-xs">Solved at:</Text>
                      <Text className={`font-bold text-sm ${hasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {hasCorrect ? `MCQ ${correctIndex + 1}` : 'Unsolved'}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {chain.time_credit_minutes}m credit
                      </Text>
                    </View>
                  </View>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* Health Score Distribution */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Health Score Distribution
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { range: '100', label: 'Perfect', color: '#10b981', count: chainData.filter(c => c.chain_health_score === 100).length },
              { range: '85-99', label: 'Excellent', color: '#34d399', count: chainData.filter(c => c.chain_health_score >= 85 && c.chain_health_score < 100).length },
              { range: '70-84', label: 'Good', color: '#f59e0b', count: chainData.filter(c => c.chain_health_score >= 70 && c.chain_health_score < 85).length },
              { range: '1-69', label: 'Poor', color: '#ef4444', count: chainData.filter(c => c.chain_health_score > 0 && c.chain_health_score < 70).length },
              { range: '0', label: 'Failed', color: '#7f1d1d', count: chainData.filter(c => c.chain_health_score === 0).length },
            ].map((category, index) => (
              <MotiView
                key={category.range}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1200 + index * 100 }}
                className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
              >
                <View className="items-center">
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: category.color }}
                  >
                    <Text className="text-white font-bold text-sm">
                      {category.count}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-xs font-semibold text-center">
                    {category.label}
                  </Text>
                  <Text className="text-slate-400 text-xs text-center">
                    {category.range}
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <AlertTriangle size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Chain Analysis Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Best Performance:</Text> {
                chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
              } - {
                chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
              }
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Focus:</Text> {
                chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
              } - {
                chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
              }
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {perfectChains > 0 
                ? `Great job! ${perfectChains} chains solved perfectly at MCQ 1. Focus on improving longer chains to boost overall efficiency.`
                : averageHealth >= 70
                ? "Good progress! Most chains are resolved efficiently. Work on solving more at MCQ 1 for perfect scores."
                : "Consider reviewing fundamental concepts. Longer chains indicate knowledge gaps that need reinforcement."
              }
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Chain Tooltip */}
      {selectedChain && (
        <ChainTooltip
          chain={selectedChain.chain}
          position={selectedChain.position}
          onClose={() => setSelectedChain(null)}
        />
      )}
    </View>
  );
}