import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { GitBranch, Target, TrendingUp, Clock, TriangleAlert as AlertTriangle, Lightbulb, X, Info } from 'lucide-react-native';
import gapChainsData from '@/data/gap-chains-data.json';

interface MCQ {
  mcq_id: string;
  is_correct: boolean;
}

interface GapChain {
  pyq_id: string;
  subject: string;
  chapter: string;
  topic: string;
  chain: MCQ[];
  chain_health_score: number;
  time_credit_minutes: number;
}

interface ChainTooltipProps {
  chain: GapChain;
  position: { x: number; y: number };
  onClose: () => void;
}

function ChainTooltip({ chain, position, onClose }: ChainTooltipProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return { color: '#10b981', label: 'Healthy' };
    if (score >= 60) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#ef4444', label: 'Unhealthy' };
  };

  const healthInfo = getHealthColor(chain.chain_health_score);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 140,
        width: 240,
        shadowColor: healthInfo.color,
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
            <Text className="text-slate-400 text-xs">Health Score</Text>
            <Text className={`text-xs font-semibold`} style={{ color: healthInfo.color }}>
              {chain.chain_health_score}% ({healthInfo.label})
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Chain Length</Text>
            <Text className="text-slate-300 text-xs">
              {chain.chain.length} MCQs
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Credit</Text>
            <Text className="text-slate-300 text-xs">
              {chain.time_credit_minutes.toFixed(1)}m
            </Text>
          </View>
        </View>

        {/* Chain Sequence */}
        <View className="mt-3 bg-slate-700/40 rounded-lg p-2">
          <Text className="text-slate-300 text-xs font-medium mb-1">MCQ Sequence:</Text>
          <View className="flex-row space-x-1">
            {chain.chain.map((mcq, index) => (
              <View
                key={index}
                className={`w-4 h-4 rounded-full items-center justify-center ${
                  mcq.is_correct ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
                <Text className="text-white text-xs font-bold">
                  {index + 1}
                </Text>
              </View>
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
  
  const [selectedTooltip, setSelectedTooltip] = useState<{ chain: GapChain; position: { x: number; y: number } } | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedWeakChain, setSelectedWeakChain] = useState<GapChain | null>(null);

  const chainData: GapChain[] = gapChainsData;

  const handleChainPress = (chain: GapChain, x: number, y: number) => {
    setSelectedTooltip({ chain, position: { x, y } });
  };

  // Calculate summary metrics
  const totalChains = chainData.length;
  const healthyChains = chainData.filter(c => c.chain_health_score >= 80).length;
  const unhealthyChains = chainData.filter(c => c.chain_health_score < 60).length;
  const averageHealth = chainData.reduce((sum, c) => sum + c.chain_health_score, 0) / Math.max(totalChains, 1);
  const totalTimeCredit = chainData.reduce((sum, c) => sum + c.time_credit_minutes, 0);

  // Get chain health color
  const getChainHealthColor = (score: number) => {
    if (score >= 80) return { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 60) return { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' };
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
            <Text className="text-2xl font-bold text-slate-100">Gap Chains Analysis</Text>
            <Text className="text-sm text-slate-400">
              Recursive gap tree per PYQ/MCQ • {totalChains} chains analyzed
            </Text>
          </View>
        </View>

        {/* Average Health Badge */}
        <View className="items-center">
          <View 
            className="w-16 h-16 rounded-full border-4 items-center justify-center"
            style={{ borderColor: getChainHealthColor(averageHealth).color }}
          >
            <Text className="text-lg font-bold" style={{ color: getChainHealthColor(averageHealth).color }}>
              {averageHealth.toFixed(0)}
            </Text>
            <Text className="text-slate-500 text-xs">avg</Text>
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
              <GitBranch size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total Chains</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {totalChains}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Healthy</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {healthyChains}
            </Text>
            <Text className="text-emerald-300/80 text-xs">
              ≥80% score
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Unhealthy</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {unhealthyChains}
            </Text>
            <Text className="text-red-300/80 text-xs">
              {"<60% score"}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Time Credit</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {(totalTimeCredit / 60).toFixed(1)}h
            </Text>
            <Text className="text-amber-300/80 text-xs">
              {totalTimeCredit.toFixed(0)} minutes
            </Text>
          </MotiView>
        </View>

        {/* Gap Chains Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-8"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <GitBranch size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Gap Chain Health Overview
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chainData.map((chain, index) => {
              const healthColors = getChainHealthColor(chain.chain_health_score);
              const correctCount = chain.chain.filter(mcq => mcq.is_correct).length;
              const totalCount = chain.chain.length;

              return (
                <MotiView
                  key={chain.pyq_id}
                  from={{ opacity: 0, translateY: 20, scale: 0.9 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
                  className={`${healthColors.bg} border ${healthColors.border} rounded-xl p-4 shadow-lg`}
                  style={{
                    shadowColor: healthColors.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Pressable
                    onPress={(event) => {
                      const { pageX, pageY } = event.nativeEvent;
                      handleChainPress(chain, pageX, pageY);
                    }}
                    className="active:scale-95"
                  >
                    {/* Chain Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-slate-100 font-bold text-base mb-1">
                          {chain.subject}
                        </Text>
                        <Text className="text-slate-300 text-sm">
                          {chain.topic}
                        </Text>
                      </View>
                      
                      {/* Health Score Circle */}
                      <View className="items-center">
                        <View 
                          className="w-12 h-12 rounded-full border-3 items-center justify-center"
                          style={{ borderColor: healthColors.color }}
                        >
                          <Text 
                            className="text-lg font-bold"
                            style={{ color: healthColors.color }}
                          >
                            {chain.chain_health_score}
                          </Text>
                        </View>
                        <Text className="text-xs text-slate-400 mt-1">
                          health
                        </Text>
                      </View>
                    </View>

                    {/* MCQ Chain Visualization */}
                    <View className="mb-3">
                      <Text className="text-slate-400 text-xs mb-2">MCQ Chain ({totalCount} questions):</Text>
                      <View className="flex-row space-x-1">
                        {chain.chain.map((mcq, mcqIndex) => (
                          <View
                            key={mcqIndex}
                            className={`w-6 h-6 rounded-full items-center justify-center ${
                              mcq.is_correct ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          >
                            <Text className="text-white text-xs font-bold">
                              {mcqIndex + 1}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <Text className="text-slate-400 text-xs mt-1">
                        {correctCount}/{totalCount} correct
                      </Text>
                    </View>

                    {/* Time Credit */}
                    <View className="bg-slate-700/40 rounded-lg p-2">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Clock size={12} color="#f59e0b" />
                          <Text className="text-amber-400 text-xs ml-1">Time Credit</Text>
                        </View>
                        <Text className="text-amber-300 text-xs font-semibold">
                          {chain.time_credit_minutes.toFixed(1)}m
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* Chain Health Distribution */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-8"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Chain Health Distribution
            </Text>
          </View>

          <View className="space-y-4">
            {chainData
              .sort((a, b) => a.chain_health_score - b.chain_health_score)
              .map((chain, index) => {
                const healthColors = getChainHealthColor(chain.chain_health_score);
                const correctCount = chain.chain.filter(mcq => mcq.is_correct).length;
                const totalCount = chain.chain.length;

                return (
                  <MotiView
                    key={chain.pyq_id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 1400 + index * 100 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <Text className="text-slate-100 font-semibold text-base mb-1">
                          {chain.subject} • {chain.topic}
                        </Text>
                        <Text className="text-slate-400 text-sm mb-2">
                          {chain.chapter}
                        </Text>
                        <View className="flex-row items-center space-x-4">
                          <Text className="text-slate-400 text-sm">
                            Chain: <Text className="text-slate-300 font-semibold">
                              {correctCount}/{totalCount}
                            </Text>
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            Time: <Text className="text-amber-400 font-semibold">
                              {chain.time_credit_minutes.toFixed(1)}m
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Health Score Progress */}
                      <View className="items-center">
                        <View className="relative w-16 h-16">
                          <View className="absolute inset-0 rounded-full border-4 border-slate-700/60" />
                          <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: `${(chain.chain_health_score / 100) * 360}deg` }}
                            transition={{ type: 'spring', duration: 1000, delay: 1600 + index * 100 }}
                            className="absolute inset-0 rounded-full border-4 border-transparent"
                            style={{
                              borderTopColor: healthColors.color,
                              borderRightColor: chain.chain_health_score > 25 ? healthColors.color : 'transparent',
                              borderBottomColor: chain.chain_health_score > 50 ? healthColors.color : 'transparent',
                              borderLeftColor: chain.chain_health_score > 75 ? healthColors.color : 'transparent',
                            }}
                          />
                          <View className="absolute inset-0 items-center justify-center">
                            <Text className="text-lg font-bold" style={{ color: healthColors.color }}>
                              {chain.chain_health_score}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-slate-400 mt-1">health</Text>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
          </View>
        </MotiView>

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1800 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Lightbulb size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Gap Chain Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Healthiest Chain:</Text> {
                chainData.length > 0 
                  ? chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
                  : 'N/A'
              } • {
                chainData.length > 0 
                  ? chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
                  : 'N/A'
              }
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Focus:</Text> {
                chainData.length > 0 
                  ? chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
                  : 'N/A'
              } • {
                chainData.length > 0 
                  ? chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
                  : 'N/A'
              }
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-amber-400">Average Health:</Text> {averageHealth.toFixed(1)}% across all chains
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {averageHealth >= 75 
                ? "Excellent chain health! Your recursive learning patterns are strong across most topics."
                : averageHealth >= 50
                ? "Moderate chain health. Focus on strengthening the weakest chains for better knowledge retention."
                : "Low chain health detected. Consider reviewing fundamental concepts before attempting recursive MCQs."
              }
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Chain Tooltip */}
      {selectedTooltip && (
        <ChainTooltip
          chain={selectedTooltip.chain}
          position={selectedTooltip.position}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}