import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Clock, Target, Zap, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockAttempts } from '@/data/mockAttempts';

interface DifficultyData {
  difficulty: string;
  accuracy: number;
  avgTime: number;
  totalAttempts: number;
  correctAttempts: number;
}

interface DifficultyMetrics {
  easyToModerateGap: number;
  moderateToHardGap: number;
  overallDecline: number;
  timeIncrease: number;
  adaptabilityScore: number;
}

export default function AdaptiveDifficultyResponse() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [processedData, setProcessedData] = useState<DifficultyData[]>([]);
  const [difficultyMetrics, setDifficultyMetrics] = useState<DifficultyMetrics | null>(null);

  // Process mock attempts data
  const processAttempts = () => {
    // Bucket attempts by difficulty
    const buckets = {
      Easy: mockAttempts.filter(attempt => attempt.mcq_key === 'mcq_1'),
      Moderate: mockAttempts.filter(attempt => ['mcq_2', 'mcq_3'].includes(attempt.mcq_key)),
      Hard: mockAttempts.filter(attempt => ['mcq_4', 'mcq_5', 'mcq_6'].includes(attempt.mcq_key))
    };

    const difficultyData: DifficultyData[] = [];

    Object.entries(buckets).forEach(([difficulty, attempts]) => {
      if (attempts.length === 0) {
        difficultyData.push({
          difficulty,
          accuracy: 0,
          avgTime: 0,
          totalAttempts: 0,
          correctAttempts: 0,
        });
        return;
      }

      const correctAttempts = attempts.filter(attempt => attempt.is_correct).length;
      const accuracy = (correctAttempts / attempts.length) * 100;
      const avgTime = attempts.reduce((sum, attempt) => sum + attempt.response_time_sec, 0) / attempts.length;

      difficultyData.push({
        difficulty,
        accuracy,
        avgTime,
        totalAttempts: attempts.length,
        correctAttempts,
      });
    });

    return difficultyData;
  };

  // Calculate difficulty metrics
  const calculateMetrics = (data: DifficultyData[]): DifficultyMetrics => {
    const easy = data.find(d => d.difficulty === 'Easy');
    const moderate = data.find(d => d.difficulty === 'Moderate');
    const hard = data.find(d => d.difficulty === 'Hard');

    const easyToModerateGap = (easy?.accuracy || 0) - (moderate?.accuracy || 0);
    const moderateToHardGap = (moderate?.accuracy || 0) - (hard?.accuracy || 0);
    const overallDecline = (easy?.accuracy || 0) - (hard?.accuracy || 0);
    const timeIncrease = ((hard?.avgTime || 0) - (easy?.avgTime || 0)) / Math.max(easy?.avgTime || 1, 1) * 100;
    
    // Adaptability score: lower gaps and time increase = better adaptability
    const adaptabilityScore = Math.max(0, 100 - (overallDecline + timeIncrease / 2));

    return {
      easyToModerateGap,
      moderateToHardGap,
      overallDecline,
      timeIncrease,
      adaptabilityScore,
    };
  };

  // Process data on component mount
  useEffect(() => {
    const data = processAttempts();
    setProcessedData(data);
    setDifficultyMetrics(calculateMetrics(data));
  }, []);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.difficulty} Questions
          </Text>
          <Text className="text-emerald-300 text-sm">
            Accuracy: {data.accuracy.toFixed(1)}%
          </Text>
          <Text className="text-amber-300 text-sm">
            Avg Time: {data.avgTime.toFixed(1)}s
          </Text>
          <Text className="text-slate-400 text-sm">
            Attempts: {data.correctAttempts}/{data.totalAttempts}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Get bubble color based on difficulty
  const getBubbleColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981'; // emerald
      case 'Moderate': return '#f59e0b'; // amber
      case 'Hard': return '#ef4444'; // red
      default: return '#64748b';
    }
  };

  // Get adaptability color
  const getAdaptabilityColor = (score: number) => {
    if (score >= 70) return { color: '#10b981', label: 'Excellent Adaptability' };
    if (score >= 50) return { color: '#f59e0b', label: 'Good Adaptability' };
    if (score >= 30) return { color: '#f97316', label: 'Fair Adaptability' };
    return { color: '#ef4444', label: 'Poor Adaptability' };
  };

  const adaptabilityInfo = getAdaptabilityColor(difficultyMetrics?.adaptabilityScore || 0);

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
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <TrendingUp size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Adaptive Difficulty Response</Text>
            <Text className="text-slate-400 text-sm">
              Performance across difficulty levels • Bubble size = response time
            </Text>
          </View>
        </View>

        {/* Adaptability Score Badge */}
        <View className="items-center">
          <View 
            className="px-3 py-1 rounded-full border"
            style={{ 
              backgroundColor: `${adaptabilityInfo.color}20`,
              borderColor: `${adaptabilityInfo.color}50`
            }}
          >
            <Text 
              className="font-bold text-sm"
              style={{ color: adaptabilityInfo.color }}
            >
              {(difficultyMetrics?.adaptabilityScore || 0).toFixed(0)}
            </Text>
          </View>
          <Text className="text-slate-400 text-xs mt-1 text-center">
            Adaptability
          </Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Accuracy vs Difficulty (Bubble = Response Time)
        </Text>
        
        <View style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="difficulty"
                stroke="#94a3b8"
                fontSize={12}
                type="category"
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="accuracy">
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBubbleColor(entry.difficulty)}
                    r={Math.max(8, Math.min(25, entry.avgTime / 3))} // Scale bubble size based on avgTime
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </View>
      </View>

      {/* Difficulty Analysis Metrics */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Easy Questions</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {processedData.find(d => d.difficulty === 'Easy')?.accuracy.toFixed(1) || 0}%
          </Text>
          <Text className="text-emerald-300/80 text-xs">
            {processedData.find(d => d.difficulty === 'Easy')?.avgTime.toFixed(0) || 0}s avg
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Zap size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Moderate</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {processedData.find(d => d.difficulty === 'Moderate')?.accuracy.toFixed(1) || 0}%
          </Text>
          <Text className="text-amber-300/80 text-xs">
            {processedData.find(d => d.difficulty === 'Moderate')?.avgTime.toFixed(0) || 0}s avg
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Hard Questions</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {processedData.find(d => d.difficulty === 'Hard')?.accuracy.toFixed(1) || 0}%
          </Text>
          <Text className="text-red-300/80 text-xs">
            {processedData.find(d => d.difficulty === 'Hard')?.avgTime.toFixed(0) || 0}s avg
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <TrendingUp size={16} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Adaptability</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {(difficultyMetrics?.adaptabilityScore || 0).toFixed(0)}
          </Text>
          <Text className="text-purple-300/80 text-xs">
            {adaptabilityInfo.label.split(' ')[0]}
          </Text>
        </MotiView>
      </View>

      {/* Difficulty Gap Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Target size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Difficulty Adaptation Analysis</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-emerald-400">Easy → Moderate Gap:</Text> {(difficultyMetrics?.easyToModerateGap || 0).toFixed(1)}% accuracy drop
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-amber-400">Moderate → Hard Gap:</Text> {(difficultyMetrics?.moderateToHardGap || 0).toFixed(1)}% accuracy drop
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-red-400">Overall Decline:</Text> {(difficultyMetrics?.overallDecline || 0).toFixed(1)}% from easy to hard
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-cyan-400">Time Increase:</Text> {(difficultyMetrics?.timeIncrease || 0).toFixed(1)}% slower on hard questions
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4 mt-3">
            {(difficultyMetrics?.adaptabilityScore || 0) >= 70 
              ? "Excellent adaptability! You maintain good performance across difficulty levels with reasonable time increases."
              : (difficultyMetrics?.adaptabilityScore || 0) >= 50
              ? "Good adaptability with some performance gaps. Focus on bridging the moderate-to-hard transition."
              : "Significant difficulty adaptation challenges. Consider targeted practice on moderate-level questions before advancing to hard ones."
            }
          </Text>
        </View>
      </MotiView>

      {/* Performance Breakdown */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-4"
      >
        <View className="flex-row items-center mb-3">
          <Clock size={16} color="#f59e0b" />
          <Text className="text-slate-100 font-semibold ml-2">Performance Insights</Text>
        </View>

        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">Accuracy Pattern</Text>
            <Text className="text-slate-400 text-xs">
              Your accuracy follows a {(difficultyMetrics?.overallDecline || 0) > 40 ? 'steep' : 'gradual'} decline 
              as difficulty increases. This is {(difficultyMetrics?.overallDecline || 0) > 40 ? 'concerning' : 'normal'} 
              and suggests {(difficultyMetrics?.overallDecline || 0) > 40 ? 'knowledge gaps' : 'expected challenge scaling'}.
            </Text>
            <Text className="text-cyan-400 text-sm font-bold mt-1">
              Steepest Drop: {Math.max(difficultyMetrics?.easyToModerateGap || 0, difficultyMetrics?.moderateToHardGap || 0) === (difficultyMetrics?.easyToModerateGap || 0) ? 'Easy → Moderate' : 'Moderate → Hard'}
            </Text>
          </View>

          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">Time Management</Text>
            <Text className="text-slate-400 text-xs">
              Response time increases by {(difficultyMetrics?.timeIncrease || 0).toFixed(0)}% from easy to hard questions. 
              {(difficultyMetrics?.timeIncrease || 0) > 100 ? ' Consider time management strategies.' : ' Good time control.'}
            </Text>
            <Text className="text-emerald-400 text-sm font-bold mt-1">
              Optimal Range: {processedData.find(d => d.difficulty === 'Easy')?.avgTime.toFixed(0) || 0}s - {processedData.find(d => d.difficulty === 'Moderate')?.avgTime.toFixed(0) || 0}s
            </Text>
          </View>
        </View>
      </MotiView>
    </MotiView>
  );
}