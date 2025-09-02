import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Target, TrendingUp, ToggleLeft, ToggleRight, Brain } from 'lucide-react-native';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import cohortData from '@/data/neet-cohort-data.json';

interface Student {
  student_id: string;
  name: string;
  pyqs_attempted: number;
  total_minutes_spent: number;
  subject_focus: { [key: string]: number };
  topic_gap_sentences: Array<{
    topic: string;
    gap_intensity: number;
  }>;
}

interface CohesionData {
  cohesionScore: number;
  topTopics: Array<{
    topic: string;
    totalTime: number;
    percentage: number;
    studentsInvolved: number;
  }>;
  totalCohortTime: number;
  cohesionLevel: 'High' | 'Moderate' | 'Low';
  aiInsight: string;
}

interface TopicCohesionScoreProps {
  data?: Student[];
  showMultipleCohorts?: boolean;
  compareMode?: boolean;
  cohortA?: Student[];
  cohortB?: Student[];
}

interface DonutMeterProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

function DonutMeter({ score, size = 140, strokeWidth = 16, animated = true }: DonutMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Animate score
  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score * 100);
      return;
    }

    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        const increment = (score * 100) / 60; // Animate over ~60 frames
        if (prev < score * 100) {
          return Math.min(prev + increment, score * 100);
        }
        return score * 100;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [score, animated]);

  // Get color based on cohesion score
  const getCohesionColor = (score: number) => {
    if (score >= 0.7) return { color: '#10b981', glow: 'emeraldGlow', label: 'High Cohesion' };
    if (score >= 0.4) return { color: '#f59e0b', glow: 'amberGlow', label: 'Moderate Cohesion' };
    return { color: '#ef4444', glow: 'redGlow', label: 'Low Cohesion' };
  };

  const cohesionInfo = getCohesionColor(score);

  return (
    <View className="relative items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="emeraldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
            <Stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
            <Stop offset="100%" stopColor="#f87171" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${cohesionInfo.glow})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Center Text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fontSize="28"
          fontWeight="bold"
          fill={cohesionInfo.color}
        >
          {animatedScore.toFixed(0)}%
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fontSize="12"
          fill="#94a3b8"
        >
          cohesion
        </SvgText>
      </Svg>

      {/* Pulsing glow for high cohesion */}
      {score >= 0.7 && (
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
          }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: cohesionInfo.color, opacity: 0.2 }}
        />
      )}
    </View>
  );
}

export default function TopicCohesionScore({ 
  data = cohortData, 
  showMultipleCohorts = false,
  compareMode = false,
  cohortA = cohortData,
  cohortB = cohortData.map(s => ({ ...s, student_id: s.student_id + '_b', name: s.name + ' (B)' }))
}: TopicCohesionScoreProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [currentCohort, setCurrentCohort] = useState(0);
  const [cohesionData, setCohesionData] = useState<CohesionData | null>(null);
  const [cohortAData, setCohortAData] = useState<CohesionData | null>(null);
  const [cohortBData, setCohortBData] = useState<CohesionData | null>(null);

  // Calculate cohesion score and insights
  const calculateCohesion = (students: Student[]): CohesionData => {
    // Get all unique topics from gap sentences
    const topicTimeMap = new Map<string, { totalTime: number; studentsInvolved: Set<string> }>();
    
    students.forEach(student => {
      student.topic_gap_sentences.forEach(gap => {
        // Estimate time spent on this topic based on gap intensity and total time
        const estimatedTime = student.total_minutes_spent * gap.gap_intensity * 0.15; // 15% allocation factor
        
        if (!topicTimeMap.has(gap.topic)) {
          topicTimeMap.set(gap.topic, { totalTime: 0, studentsInvolved: new Set() });
        }
        
        const topicData = topicTimeMap.get(gap.topic)!;
        topicData.totalTime += estimatedTime;
        topicData.studentsInvolved.add(student.student_id);
      });
    });

    // Convert to array and sort by total time
    const topicsArray = Array.from(topicTimeMap.entries()).map(([topic, data]) => ({
      topic,
      totalTime: data.totalTime,
      percentage: 0, // Will calculate after sorting
      studentsInvolved: data.studentsInvolved.size,
    }));

    topicsArray.sort((a, b) => b.totalTime - a.totalTime);

    // Calculate total cohort time
    const totalCohortTime = students.reduce((sum, student) => sum + student.total_minutes_spent, 0);

    // Get top 3 topics and calculate percentages
    const topTopics = topicsArray.slice(0, 3).map(topic => ({
      ...topic,
      percentage: (topic.totalTime / totalCohortTime) * 100,
    }));

    // Calculate cohesion score (time spent on top 3 topics / total cohort time)
    const top3Time = topTopics.reduce((sum, topic) => sum + topic.totalTime, 0);
    const cohesionScore = top3Time / totalCohortTime;

    // Determine cohesion level
    let cohesionLevel: 'High' | 'Moderate' | 'Low' = 'Low';
    if (cohesionScore >= 0.6) cohesionLevel = 'High';
    else if (cohesionScore >= 0.35) cohesionLevel = 'Moderate';

    // Generate AI insight
    const topTopic = topTopics[0];
    const aiInsight = generateAIInsight(cohesionScore, topTopic, students.length);

    return {
      cohesionScore,
      topTopics,
      totalCohortTime,
      cohesionLevel,
      aiInsight,
    };
  };

  // Generate AI insight based on cohesion data
  const generateAIInsight = (score: number, topTopic: any, studentCount: number): string => {
    const percentage = topTopic ? topTopic.percentage.toFixed(0) : '0';
    const topicName = topTopic ? topTopic.topic.replace(/([A-Z])/g, ' $1').trim() : 'Unknown';
    const studentsInvolved = topTopic ? topTopic.studentsInvolved : 0;
    
    if (score >= 0.7) {
      return `🎯 Excellent cohort alignment! ${studentsInvolved} of ${studentCount} students are heavily focused on "${topicName}" with ${percentage}% of total study time. This creates strong peer learning opportunities.`;
    } else if (score >= 0.5) {
      return `⚡ Good cohort focus on "${topicName}" with ${percentage}% time allocation. ${studentsInvolved} students share this priority - consider forming study groups around this topic.`;
    } else if (score >= 0.35) {
      return `📊 Moderate cohort alignment. "${topicName}" leads with ${percentage}% focus, but study patterns are somewhat dispersed. Mixed individual and group study recommended.`;
    } else {
      return `🌐 Diverse study patterns detected. Top focus "${topicName}" only represents ${percentage}% of cohort time. Students are pursuing varied learning paths - individual mentoring may be more effective.`;
    }
  };

  // Mock multiple cohorts for toggle feature
  const mockCohorts = [
    { name: 'NEET 2025 Batch A', students: data },
    { name: 'NEET 2025 Batch B', students: data.map(s => ({ ...s, student_id: s.student_id + '_b', name: s.name + ' (B)' })) },
    { name: 'FMGE 2025 Cohort', students: data.map(s => ({ ...s, student_id: s.student_id + '_f', name: s.name + ' (F)' })) },
  ];

  const currentCohortData = showMultipleCohorts ? mockCohorts[currentCohort].students : data;

  // Calculate cohesion when data changes
  useEffect(() => {
    if (compareMode) {
      const cohesionA = calculateCohesion(cohortA);
      const cohesionB = calculateCohesion(cohortB);
      setCohortAData(cohesionA);
      setCohortBData(cohesionB);
    } else {
      const cohesion = calculateCohesion(currentCohortData);
      setCohesionData(cohesion);
    }
  }, [currentCohortData, currentCohort, compareMode, cohortA, cohortB]);

  // Generate comparison insights
  const generateComparisonInsights = (dataA: CohesionData, dataB: CohesionData): string => {
    const scoreDiff = Math.abs(dataA.cohesionScore - dataB.cohesionScore);
    const strongerCohort = dataA.cohesionScore > dataB.cohesionScore ? 'A' : 'B';
    const strongerData = dataA.cohesionScore > dataB.cohesionScore ? dataA : dataB;
    const weakerData = dataA.cohesionScore > dataB.cohesionScore ? dataB : dataA;
    
    const topTopicA = dataA.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim() || 'Unknown';
    const topTopicB = dataB.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim() || 'Unknown';
    
    if (scoreDiff > 0.3) {
      return `🎯 Cohort ${strongerCohort} shows significantly stronger alignment (${(strongerData.cohesionScore * 100).toFixed(0)}% vs ${(weakerData.cohesionScore * 100).toFixed(0)}%) with focused effort on "${strongerData.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim()}". Cohort ${strongerCohort === 'A' ? 'B' : 'A'} has scattered effort across multiple topics, suggesting need for better coordination.`;
    } else if (topTopicA !== topTopicB) {
      return `📚 Different focus areas detected: Cohort A prioritizes "${topTopicA}" while Cohort B focuses on "${topTopicB}". Both show ${dataA.cohesionLevel.toLowerCase()} and ${dataB.cohesionLevel.toLowerCase()} cohesion respectively. Consider cross-cohort knowledge sharing.`;
    } else {
      return `⚖️ Both cohorts show similar alignment patterns with ${dataA.cohesionLevel.toLowerCase()} cohesion levels. They're both focusing on "${topTopicA}" but with different intensity distributions. Good opportunity for inter-cohort collaboration.`;
    }
  };

  if (!compareMode && !cohesionData) {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40">
        <Text className="text-slate-400 text-center">Loading cohesion analysis...</Text>
      </View>
    );
  }

  if (compareMode && (!cohortAData || !cohortBData)) {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40">
        <Text className="text-slate-400 text-center">Loading cohort comparison...</Text>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: cohesionData.cohesionScore >= 0.7 ? '#10b981' : 
                    cohesionData.cohesionScore >= 0.4 ? '#f59e0b' : '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#06b6d4',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Users size={24} color="#ffffff" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              {compareMode ? 'Cohort Comparison Analysis' : 'Topic Cohesion Score'}
            </Text>
            <Text className="text-slate-400 text-base">
              {compareMode 
                ? 'Side-by-side cohort analysis and focus comparison'
                : showMultipleCohorts 
                  ? mockCohorts[currentCohort].name + ' • Study alignment analysis'
                  : 'NEET 2025 Cohort • Study alignment analysis'
              }
            </Text>
          </View>
        </View>

        {/* Multiple Cohorts Toggle */}
        {showMultipleCohorts && (
          <View className="flex-row items-center space-x-3">
            <Pressable
              onPress={() => setCurrentCohort(Math.max(0, currentCohort - 1))}
              disabled={currentCohort === 0}
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                currentCohort === 0 ? 'bg-slate-700/30' : 'bg-slate-700/60'
              }`}
            >
              <Text className={`font-bold ${currentCohort === 0 ? 'text-slate-500' : 'text-slate-300'}`}>
                ←
              </Text>
            </Pressable>
            
            <View className="bg-slate-700/50 rounded-lg px-3 py-2">
              <Text className="text-slate-300 text-sm font-medium">
                {currentCohort + 1} / {mockCohorts.length}
              </Text>
            </View>
            
            <Pressable
              onPress={() => setCurrentCohort(Math.min(mockCohorts.length - 1, currentCohort + 1))}
              disabled={currentCohort === mockCohorts.length - 1}
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                currentCohort === mockCohorts.length - 1 ? 'bg-slate-700/30' : 'bg-slate-700/60'
              }`}
            >
              <Text className={`font-bold ${currentCohort === mockCohorts.length - 1 ? 'text-slate-500' : 'text-slate-300'}`}>
                →
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Compare Mode Layout */}
      {compareMode ? (
        <View className="space-y-8">
          {/* Side-by-Side Donut Meters */}
          <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'}`}>
            {/* Cohort A */}
            <MotiView
              from={{ opacity: 0, translateX: -50, scale: 0.9 }}
              animate={{ opacity: 1, translateX: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 800, delay: 600 }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 shadow-lg"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-300 mb-4">Cohort A</Text>
                <DonutMeter score={cohortAData!.cohesionScore} size={140} strokeWidth={16} />
                <View className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-600/30 w-full">
                  <Text className="text-blue-300 font-bold text-lg text-center mb-2">
                    {cohortAData!.cohesionLevel} Cohesion
                  </Text>
                  <Text className="text-slate-400 text-sm text-center">
                    Top focus: {cohortAData!.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text className="text-blue-400 text-sm text-center font-bold">
                    {cohortAData!.topTopics[0]?.percentage.toFixed(1)}% alignment
                  </Text>
                </View>
              </View>
            </MotiView>

            {/* Cohort B */}
            <MotiView
              from={{ opacity: 0, translateX: 50, scale: 0.9 }}
              animate={{ opacity: 1, translateX: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 800, delay: 700 }}
              className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-6 shadow-lg"
              style={{
                shadowColor: '#8b5cf6',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-300 mb-4">Cohort B</Text>
                <DonutMeter score={cohortBData!.cohesionScore} size={140} strokeWidth={16} />
                <View className="mt-4 bg-slate-800/40 rounded-xl p-4 border border-slate-600/30 w-full">
                  <Text className="text-purple-300 font-bold text-lg text-center mb-2">
                    {cohortBData!.cohesionLevel} Cohesion
                  </Text>
                  <Text className="text-slate-400 text-sm text-center">
                    Top focus: {cohortBData!.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text className="text-purple-400 text-sm text-center font-bold">
                    {cohortBData!.topTopics[0]?.percentage.toFixed(1)}% alignment
                  </Text>
                </View>
              </View>
            </MotiView>
          </View>

          {/* Comparison Bar Chart */}
          <MotiView
            from={{ opacity: 0, translateY: 30, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 800, delay: 800 }}
            className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
            style={{
              shadowColor: '#06b6d4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg items-center justify-center mr-3">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                Cohesion Score Comparison
              </Text>
            </View>

            {/* Comparison Bars */}
            <View className="space-y-6">
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-blue-300 font-bold text-lg">Cohort A</Text>
                  <Text className="text-blue-400 font-bold text-xl">
                    {(cohortAData!.cohesionScore * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="w-full bg-slate-700/60 rounded-full h-4 overflow-hidden">
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${cohortAData!.cohesionScore * 100}%` }}
                    transition={{ type: 'spring', duration: 1500, delay: 1000 }}
                    className="h-4 rounded-full shadow-lg"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  />
                </View>
                <Text className="text-slate-400 text-sm mt-1">
                  {cohortAData!.cohesionLevel} • Top: {cohortAData!.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>

              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-purple-300 font-bold text-lg">Cohort B</Text>
                  <Text className="text-purple-400 font-bold text-xl">
                    {(cohortBData!.cohesionScore * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="w-full bg-slate-700/60 rounded-full h-4 overflow-hidden">
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${cohortBData!.cohesionScore * 100}%` }}
                    transition={{ type: 'spring', duration: 1500, delay: 1200 }}
                    className="h-4 rounded-full shadow-lg"
                    style={{
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
                      shadowColor: '#8b5cf6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  />
                </View>
                <Text className="text-slate-400 text-sm mt-1">
                  {cohortBData!.cohesionLevel} • Top: {cohortBData!.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>
            </View>

            {/* Difference Analysis */}
            <View className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <View className="flex-row items-center mb-3">
                <Target size={16} color="#06b6d4" />
                <Text className="text-slate-100 font-semibold ml-2">Comparison Analysis</Text>
              </View>
              
              <View className="space-y-2">
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-cyan-400">Score Difference:</Text> {
                    Math.abs(cohortAData!.cohesionScore - cohortBData!.cohesionScore) > 0.1 
                      ? `${Math.abs((cohortAData!.cohesionScore - cohortBData!.cohesionScore) * 100).toFixed(1)}% gap`
                      : 'Similar alignment levels'
                  }
                </Text>
                
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-emerald-400">Focus Overlap:</Text> {
                    cohortAData!.topTopics[0]?.topic === cohortBData!.topTopics[0]?.topic 
                      ? 'Both prioritize same top topic'
                      : 'Different primary focus areas'
                  }
                </Text>
                
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-purple-400">Stronger Cohort:</Text> {
                    cohortAData!.cohesionScore > cohortBData!.cohesionScore ? 'Cohort A' : 
                    cohortBData!.cohesionScore > cohortAData!.cohesionScore ? 'Cohort B' : 'Tied'
                  } ({Math.max(cohortAData!.cohesionScore, cohortBData!.cohesionScore) * 100}% alignment)
                </Text>
              </View>
            </View>
          </MotiView>

          {/* Side-by-Side Topic Focus */}
          <View className={`${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-6'}`}>
            {/* Cohort A Topics */}
            <MotiView
              from={{ opacity: 0, translateX: -30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1000 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6"
            >
              <Text className="text-xl font-bold text-blue-300 mb-4">Cohort A - Top Topics</Text>
              <View className="space-y-3">
                {cohortAData!.topTopics.map((topic, index) => (
                  <View key={topic.topic} className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-100 font-medium text-sm flex-1" numberOfLines={2}>
                        #{index + 1} {topic.topic.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Text className="text-blue-400 font-bold text-lg ml-2">
                        {topic.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </MotiView>

            {/* Cohort B Topics */}
            <MotiView
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1100 }}
              className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6"
            >
              <Text className="text-xl font-bold text-purple-300 mb-4">Cohort B - Top Topics</Text>
              <View className="space-y-3">
                {cohortBData!.topTopics.map((topic, index) => (
                  <View key={topic.topic} className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-100 font-medium text-sm flex-1" numberOfLines={2}>
                        #{index + 1} {topic.topic.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Text className="text-purple-400 font-bold text-lg ml-2">
                        {topic.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </MotiView>
          </View>

          {/* AI Comparison Insights */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 1200 }}
            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/20 shadow-xl"
            style={{
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View>
            <View className="flex-row items-center mb-4">
              <MotiView
                from={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1400 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3 shadow-lg"
              >
                <Brain size={20} color="#ffffff" />
              </MotiView>
              <Text className="text-xl font-bold text-indigo-100">
                AI Cohort Comparison Analysis
              </Text>
            </View>
            
            <Text className="text-indigo-200 text-lg leading-8 font-medium">
              {generateComparisonInsights(cohortAData!, cohortBData!)}
            </Text>

            {/* Comparison Metrics */}
            <View className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
                <Text className="text-cyan-400 font-semibold text-sm mb-2">Score Gap</Text>
                <Text className="text-cyan-200 text-2xl font-bold">
                  {Math.abs((cohortAData!.cohesionScore - cohortBData!.cohesionScore) * 100).toFixed(1)}%
                </Text>
                <Text className="text-cyan-300/80 text-xs">
                  difference
                </Text>
              </View>
              
              <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
                <Text className="text-emerald-400 font-semibold text-sm mb-2">Focus Overlap</Text>
                <Text className="text-emerald-200 text-lg font-bold">
                  {cohortAData!.topTopics[0]?.topic === cohortBData!.topTopics[0]?.topic ? 'Same' : 'Different'}
                </Text>
                <Text className="text-emerald-300/80 text-xs">
                  top priority
                </Text>
              </View>
              
              <View className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
                <Text className="text-purple-400 font-semibold text-sm mb-2">Stronger Cohort</Text>
                <Text className="text-purple-200 text-lg font-bold">
                  {cohortAData!.cohesionScore > cohortBData!.cohesionScore ? 'Cohort A' : 
                   cohortBData!.cohesionScore > cohortAData!.cohesionScore ? 'Cohort B' : 'Tied'}
                </Text>
                <Text className="text-purple-300/80 text-xs">
                  alignment leader
                </Text>
              </View>
            </View>
            </View>
          </MotiView>
        </View>
      ) : (
        /* Single Cohort Mode */
        <View>
          {/* Main Content Grid */}
          <View className={`${isMobile ? 'space-y-8' : 'grid grid-cols-2 gap-8'}`}>
            {/* Left Panel - Donut Meter */}
            <View className="items-center">
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 1000, delay: 600 }}
              >
                <DonutMeter score={cohesionData!.cohesionScore} size={160} strokeWidth={20} />
              </MotiView>

              {/* Cohesion Level Label */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1200 }}
                className="mt-6"
              >
                <View 
                  className="px-6 py-3 rounded-2xl border-2 shadow-lg"
                  style={{ 
                    backgroundColor: `${cohesionData!.cohesionScore >= 0.7 ? '#10b981' : 
                                     cohesionData!.cohesionScore >= 0.4 ? '#f59e0b' : '#ef4444'}20`,
                    borderColor: `${cohesionData!.cohesionScore >= 0.7 ? '#10b981' : 
                                  cohesionData!.cohesionScore >= 0.4 ? '#f59e0b' : '#ef4444'}50`
                  }}
                >
                  <Text 
                    className="text-center font-bold text-xl"
                    style={{ 
                      color: cohesionData!.cohesionScore >= 0.7 ? '#10b981' : 
                             cohesionData!.cohesionScore >= 0.4 ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {cohesionData!.cohesionLevel} Cohesion
                  </Text>
                </View>
              </MotiView>

              {/* Score Breakdown */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1400 }}
                className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 w-full"
              >
                <Text className="text-slate-100 font-semibold mb-3 text-center">Score Breakdown</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Top 3 Topics Time</Text>
                    <Text className="text-cyan-400 font-bold text-sm">
                      {(cohesionData!.topTopics.reduce((sum, t) => sum + t.totalTime, 0) / 60).toFixed(1)}h
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Total Cohort Time</Text>
                    <Text className="text-slate-300 font-bold text-sm">
                      {(cohesionData!.totalCohortTime / 60).toFixed(1)}h
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Cohesion Score</Text>
                    <Text 
                      className="font-bold text-sm"
                      style={{ 
                        color: cohesionData!.cohesionScore >= 0.7 ? '#10b981' : 
                               cohesionData!.cohesionScore >= 0.4 ? '#f59e0b' : '#ef4444'
                      }}
                    >
                      {(cohesionData!.cohesionScore * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </MotiView>
            </View>

            {/* Right Panel - Top Topics */}
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: 30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 800 }}
              >
                <Text className="text-xl font-bold text-slate-100 mb-6">
                  Top 3 Focus Areas
                </Text>
                
                <View className="space-y-4">
                  {cohesionData!.topTopics.map((topic, index) => {
                    const rankColors = [
                      { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500' },
                      { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
                      { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500' },
                    ];
                    const colors = rankColors[index];

                    return (
                      <MotiView
                        key={topic.topic}
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', duration: 600, delay: 1000 + index * 200 }}
                        className={`${colors.bg} border ${colors.border} rounded-xl p-4 shadow-lg`}
                        style={{
                          shadowColor: colors.badge.replace('bg-', '#').replace('-500', ''),
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <View className={`w-8 h-8 rounded-full ${colors.badge} items-center justify-center mr-3 shadow-lg`}>
                              <Text className="text-white font-bold text-sm">#{index + 1}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-slate-100 font-semibold text-base">
                                {topic.topic.replace(/([A-Z])/g, ' $1').trim()}
                              </Text>
                              <Text className="text-slate-400 text-sm">
                                {topic.studentsInvolved} of {currentCohortData.length} students involved
                              </Text>
                            </View>
                          </View>
                          
                          {/* Percentage Badge */}
                          <View className={`px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <Text className={`font-bold text-lg ${colors.text}`}>
                              {topic.percentage.toFixed(1)}%
                            </Text>
                            <Text className="text-slate-400 text-xs text-center">
                              of cohort time
                            </Text>
                          </View>
                        </View>

                        {/* Time Investment */}
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Target size={14} color={colors.text.includes('amber') ? '#f59e0b' : 
                                                    colors.text.includes('blue') ? '#3b82f6' : '#8b5cf6'} />
                            <Text className="text-slate-300 text-sm ml-2">
                              Time Investment: <Text className="font-bold">{(topic.totalTime / 60).toFixed(1)}h</Text>
                            </Text>
                          </View>
                          
                          {/* Progress Bar */}
                          <View className="w-20 bg-slate-600 rounded-full h-2">
                            <MotiView
                              from={{ width: '0%' }}
                              animate={{ width: `${topic.percentage}%` }}
                              transition={{ type: 'spring', duration: 1000, delay: 1200 + index * 200 }}
                              className="h-2 rounded-full"
                              style={{ 
                                backgroundColor: colors.text.includes('amber') ? '#f59e0b' : 
                                                colors.text.includes('blue') ? '#3b82f6' : '#8b5cf6'
                              }}
                            />
                          </View>
                        </View>
                      </MotiView>
                    );
                  })}
                </View>
              </MotiView>
            </View>
          </View>

          {/* AI Mentor Introduction */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 1600 }}
            className="mt-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/20 shadow-xl"
            style={{
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-4">
              <MotiView
                from={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1800 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3 shadow-lg"
              >
                <Brain size={20} color="#ffffff" />
              </MotiView>
              <Text className="text-xl font-bold text-indigo-100">
                AI Cohort Analysis
              </Text>
            </View>
            
            <Text className="text-indigo-200 text-lg leading-8 font-medium">
              {cohesionData!.aiInsight}
            </Text>

            {/* Cohesion Metrics */}
            <View className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2000 }}
                className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30"
              >
                <View className="flex-row items-center mb-2">
                  <Target size={16} color="#06b6d4" />
                  <Text className="text-cyan-400 font-semibold text-sm ml-2">Focus Alignment</Text>
                </View>
                <Text className="text-cyan-200 text-2xl font-bold">
                  {(cohesionData!.cohesionScore * 100).toFixed(0)}%
                </Text>
                <Text className="text-cyan-300/80 text-xs">
                  on top 3 topics
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2100 }}
                className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30"
              >
                <View className="flex-row items-center mb-2">
                  <Users size={16} color="#10b981" />
                  <Text className="text-emerald-400 font-semibold text-sm ml-2">Students</Text>
                </View>
                <Text className="text-emerald-200 text-2xl font-bold">
                  {currentCohortData.length}
                </Text>
                <Text className="text-emerald-300/80 text-xs">
                  in cohort
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2200 }}
                className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30"
              >
                <View className="flex-row items-center mb-2">
                  <TrendingUp size={16} color="#8b5cf6" />
                  <Text className="text-purple-400 font-semibold text-sm ml-2">Top Topic</Text>
                </View>
                <Text className="text-purple-200 text-sm font-bold" numberOfLines={2}>
                  {cohesionData!.topTopics[0]?.topic.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
                </Text>
                <Text className="text-purple-300/80 text-xs">
                  {cohesionData!.topTopics[0]?.percentage.toFixed(1)}% focus
                </Text>
              </MotiView>
            </View>
          </MotiView>

          {/* Cohesion Scale Reference */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 2400 }}
            className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
          >
            <Text className="text-slate-100 font-semibold mb-3 text-center">Cohesion Scale</Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-emerald-500 mr-3" />
                <Text className="text-slate-300 text-sm">High Cohesion (&gt;=70%)</Text>
              </View>
              <Text className="text-emerald-400 text-sm">Strong alignment, group study recommended</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-amber-500 mr-3" />
                <Text className="text-slate-300 text-sm">Moderate Cohesion (40-69%)</Text>
              </View>
              <Text className="text-amber-400 text-sm">Mixed patterns, balanced approach needed</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                <Text className="text-slate-300 text-sm">Low Cohesion (&lt;40%)</Text>
              </View>
              <Text className="text-red-400 text-sm">Diverse patterns, individual mentoring needed</Text>
            </View>
          </MotiView>
        </View>
      )}
    </MotiView>
  );
}