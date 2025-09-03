import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { TrendingUp, Clock, Target, Zap, TriangleAlert as AlertTriangle, ListFilter as Filter, ChevronDown, X, BookOpen } from 'lucide-react-native';
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

interface MCQModalData {
  mcq_id: string;
  stem: string;
  learning_gap: string;
  subject: string;
  chapter: string;
  topic: string;
  is_correct: boolean;
  response_time_sec: number;
  attempt_time: string;
  difficulty: string;
}

type TimeRange = 'today' | 'week' | 'month';

export default function AdaptiveDifficultyResponse() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [processedData, setProcessedData] = useState<DifficultyData[]>([]);
  const [difficultyMetrics, setDifficultyMetrics] = useState<DifficultyMetrics | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMCQ, setSelectedMCQ] = useState<MCQModalData | null>(null);

  // Process mock attempts data
  const processAttempts = () => {
    // Apply filters
    let filteredAttempts = [...mockAttempts];
    
    if (selectedSubject !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.subject === selectedSubject);
    }
    if (selectedChapter !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.chapter === selectedChapter);
    }
    if (selectedTopic !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.topic === selectedTopic);
    }
    
    // Apply time range filter
    const now = new Date();
    const timeThreshold = new Date();
    switch (timeRange) {
      case 'today':
        timeThreshold.setHours(0, 0, 0, 0);
        break;
      case 'week':
        timeThreshold.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeThreshold.setDate(now.getDate() - 30);
        break;
    }
    
    filteredAttempts = filteredAttempts.filter(attempt => 
      new Date(attempt.attempt_time) >= timeThreshold
    );

    // Bucket attempts by difficulty
    const buckets = {
      Easy: filteredAttempts.filter(attempt => attempt.mcq_key === 'mcq_1'),
      Moderate: filteredAttempts.filter(attempt => ['mcq_2', 'mcq_3'].includes(attempt.mcq_key)),
      Hard: filteredAttempts.filter(attempt => ['mcq_4', 'mcq_5', 'mcq_6'].includes(attempt.mcq_key))
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
      const accuracy = attempts.length > 0 ? (correctAttempts / attempts.length) * 100 : 0;
      const avgTime = attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.response_time_sec, 0) / attempts.length : 0;

      difficultyData.push({
        difficulty,
        accuracy: Number.isFinite(accuracy) ? accuracy : 0,
        avgTime: Number.isFinite(avgTime) ? avgTime : 0,
        totalAttempts: attempts.length,
        correctAttempts,
      });
    });

    return difficultyData;
  };

  // Get unique filter options
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

  // Generate mock MCQ modal data
  const generateMockMCQData = (difficulty: string): MCQModalData => {
    const mockMCQs = {
      Easy: [
        {
          stem: "What is the normal resting heart rate range for adults?",
          learning_gap: "Basic cardiovascular physiology fundamentals"
        },
        {
          stem: "Which enzyme initiates glycolysis?",
          learning_gap: "Confusion about metabolic pathway entry points"
        }
      ],
      Moderate: [
        {
          stem: "How does the Frank-Starling mechanism affect cardiac output during exercise?",
          learning_gap: "Difficulty connecting preload changes to stroke volume regulation"
        },
        {
          stem: "What is the rate-limiting enzyme in gluconeogenesis?",
          learning_gap: "Mixing up regulatory steps in opposing metabolic pathways"
        }
      ],
      Hard: [
        {
          stem: "Explain the molecular mechanism of excitation-contraction coupling in cardiac muscle during ischemia.",
          learning_gap: "Complex integration of calcium handling, energetics, and pathophysiology"
        },
        {
          stem: "How do allosteric effectors modulate phosphofructokinase activity in different metabolic states?",
          learning_gap: "Advanced enzyme regulation and metabolic integration concepts"
        }
      ]
    };
    
    const difficultyMCQs = mockMCQs[difficulty as keyof typeof mockMCQs] || mockMCQs.Easy;
    const randomMCQ = difficultyMCQs[Math.floor(Math.random() * difficultyMCQs.length)];
    const randomAttempt = mockAttempts[Math.floor(Math.random() * mockAttempts.length)];
    
    return {
      mcq_id: `mcq_${Math.random().toString(36).substr(2, 9)}`,
      stem: randomMCQ.stem,
      learning_gap: randomMCQ.learning_gap,
      subject: randomAttempt.subject,
      chapter: randomAttempt.chapter,
      topic: randomAttempt.topic,
      is_correct: Math.random() > 0.5,
      response_time_sec: Math.floor(Math.random() * 70) + 20,
      attempt_time: new Date().toISOString(),
      difficulty,
    };
  };

  // Handle bubble click
  const handleBubbleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const dataPoint = data.activePayload[0].payload;
      const mockData = generateMockMCQData(dataPoint.difficulty);
      setSelectedMCQ(mockData);
    }
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
  }, [selectedSubject, selectedChapter, selectedTopic, timeRange]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Pressable 
          onPress={() => handleBubbleClick({ activePayload: payload })}
          className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl active:scale-95"
        >
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
          <Text className="text-slate-400 text-xs mt-2">
            💡 Tap to see sample MCQ
          </Text>
        </Pressable>
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
              Performance across difficulty levels • Bubble size = response time • Click bubbles for details
            </Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          <Filter size={16} color="#94a3b8" />
          <Text className="text-slate-300 text-sm ml-2">{selectedSubject}</Text>
          <ChevronDown 
            size={16} 
            color="#94a3b8" 
            style={{ 
              transform: [{ rotate: showFilters ? '180deg' : '0deg' }] 
            }} 
          />
        </Pressable>
      </View>

      {/* Filter Controls */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', duration: 400 }}
          className="mb-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          {/* Time Range Filter */}
          <View className="mb-4">
            <Text className="text-slate-300 font-semibold mb-2">Time Range:</Text>
            <View className="flex-row space-x-2">
              {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
                <Pressable
                  key={range}
                  onPress={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg ${
                    timeRange === range
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium capitalize ${
                    timeRange === range ? 'text-blue-300' : 'text-slate-400'
                  }`}>
                    {range}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Subject Filter */}
          <View className="mb-4">
            <Text className="text-slate-300 font-semibold mb-2">Subject:</Text>
            <View className="flex-row flex-wrap space-x-2">
              <Pressable
                onPress={() => {
                  setSelectedSubject('all');
                  setSelectedChapter('all');
                  setSelectedTopic('all');
                }}
                className={`px-4 py-2 rounded-lg mb-2 ${
                  selectedSubject === 'all'
                    ? 'bg-blue-600/30 border border-blue-500/50'
                    : 'bg-slate-700/40 border border-slate-600/30'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedSubject === 'all' ? 'text-blue-300' : 'text-slate-400'
                }`}>
                  All Subjects
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
                  className={`px-4 py-2 rounded-lg mb-2 ${
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
          {selectedSubject !== 'all' && (
            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Chapter:</Text>
              <View className="flex-row flex-wrap space-x-2">
                <Pressable
                  onPress={() => {
                    setSelectedChapter('all');
                    setSelectedTopic('all');
                  }}
                  className={`px-3 py-1 rounded-lg mb-2 ${
                    selectedChapter === 'all'
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-xs ${
                    selectedChapter === 'all' ? 'text-blue-300' : 'text-slate-400'
                  }`}>
                    All Chapters
                  </Text>
                </Pressable>
                {chapters.map((chapter) => (
                  <Pressable
                    key={chapter}
                    onPress={() => {
                      setSelectedChapter(chapter);
                      setSelectedTopic('all');
                    }}
                    className={`px-3 py-1 rounded-lg mb-2 ${
                      selectedChapter === chapter
                        ? 'bg-blue-600/30 border border-blue-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-xs ${
                      selectedChapter === chapter ? 'text-blue-300' : 'text-slate-400'
                    }`}>
                      {chapter}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Topic Filter */}
          {selectedChapter !== 'all' && (
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Topic:</Text>
              <View className="flex-row flex-wrap space-x-2">
                <Pressable
                  onPress={() => setSelectedTopic('all')}
                  className={`px-3 py-1 rounded-lg mb-2 ${
                    selectedTopic === 'all'
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-xs ${
                    selectedTopic === 'all' ? 'text-blue-300' : 'text-slate-400'
                  }`}>
                    All Topics
                  </Text>
                </Pressable>
                {topics.map((topic) => (
                  <Pressable
                    key={topic}
                    onPress={() => setSelectedTopic(topic)}
                    className={`px-3 py-1 rounded-lg mb-2 ${
                      selectedTopic === topic
                        ? 'bg-blue-600/30 border border-blue-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-xs ${
                      selectedTopic === topic ? 'text-blue-300' : 'text-slate-400'
                    }`}>
                      {topic}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </MotiView>
      )}

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
          {processedData.length > 0 && processedData.every(d => Number.isFinite(d.accuracy) && Number.isFinite(d.avgTime)) ? (
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
                      r={Math.max(8, Math.min(25, Number.isFinite(entry.avgTime) ? entry.avgTime / 3 : 8))} // Scale bubble size based on avgTime
                      onClick={() => {
                        const mockData = generateMockMCQData(entry.difficulty);
                        setSelectedMCQ(mockData);
                      }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <View className="bg-slate-700/40 rounded-lg p-8 items-center justify-center">
              <Text className="text-slate-400 text-sm">No valid chart data available</Text>
            </View>
          )}
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

      {/* MCQ Details Modal */}
      {selectedMCQ && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute inset-4 bg-slate-800/95 rounded-xl p-6 border border-slate-600/50 shadow-xl z-50"
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <BookOpen size={16} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                {selectedMCQ.difficulty} MCQ Analysis
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedMCQ(null)}
              className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          {/* MCQ Details */}
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="space-y-4">
              {/* Difficulty Badge */}
              <View className="flex-row items-center justify-between">
                <View className="bg-slate-700/40 rounded-lg p-3">
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-bold text-blue-400">{selectedMCQ.subject}</Text> • {selectedMCQ.chapter} • {selectedMCQ.topic}
                  </Text>
                </View>
                <View 
                  className="px-3 py-1 rounded-full border"
                  style={{ 
                    backgroundColor: `${getBubbleColor(selectedMCQ.difficulty)}20`,
                    borderColor: `${getBubbleColor(selectedMCQ.difficulty)}50`
                  }}
                >
                  <Text 
                    className="font-bold text-sm"
                    style={{ color: getBubbleColor(selectedMCQ.difficulty) }}
                  >
                    {selectedMCQ.difficulty} Level
                  </Text>
                </View>
              </View>

              {/* MCQ Stem */}
              <View>
                <Text className="text-slate-100 font-semibold mb-2">Question:</Text>
                <View className="bg-slate-700/40 rounded-lg p-4">
                  <Text className="text-slate-200 text-base leading-6">
                    {selectedMCQ.stem}
                  </Text>
                </View>
              </View>

              {/* Learning Gap */}
              <View>
                <Text className="text-slate-100 font-semibold mb-2">Learning Gap Identified:</Text>
                <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <Text className="text-amber-200 text-sm leading-5">
                    💡 {selectedMCQ.learning_gap}
                  </Text>
                </View>
              </View>

              {/* Performance Data */}
              <View>
                <Text className="text-slate-100 font-semibold mb-2">Performance Data:</Text>
                <View className="bg-slate-700/40 rounded-lg p-3 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Difficulty Level:</Text>
                    <Text 
                      className="text-sm font-semibold"
                      style={{ color: getBubbleColor(selectedMCQ.difficulty) }}
                    >
                      {selectedMCQ.difficulty}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Result:</Text>
                    <Text className={`text-sm font-semibold ${
                      selectedMCQ.is_correct ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedMCQ.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Response Time:</Text>
                    <Text className="text-slate-300 text-sm">
                      {selectedMCQ.response_time_sec}s
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-400 text-sm">Attempted:</Text>
                    <Text className="text-slate-300 text-sm">
                      {new Date(selectedMCQ.attempt_time).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Difficulty-Specific Insights */}
              <View>
                <Text className="text-slate-100 font-semibold mb-2">Difficulty Analysis:</Text>
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <Text className="text-emerald-200 text-sm leading-5">
                    {selectedMCQ.difficulty === 'Easy' && 
                      "Easy questions test fundamental knowledge. Focus on building strong conceptual foundations."
                    }
                    {selectedMCQ.difficulty === 'Moderate' && 
                      "Moderate questions require application of concepts. Practice connecting ideas across topics."
                    }
                    {selectedMCQ.difficulty === 'Hard' && 
                      "Hard questions test deep understanding and integration. Focus on complex problem-solving strategies."
                    }
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-6">
            <Pressable
              onPress={() => setSelectedMCQ(null)}
              className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4"
            >
              <Text className="text-slate-300 text-center font-semibold">Close</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                // Handle practice similar questions action
                setSelectedMCQ(null);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-3 px-4"
            >
              <Text className="text-white text-center font-semibold">Practice Similar</Text>
            </Pressable>
          </View>
        </MotiView>
      )}

      {/* Modal Overlay */}
      {selectedMCQ && (
        <Pressable
          onPress={() => setSelectedMCQ(null)}
          className="absolute inset-0 bg-black/50 z-40"
        />
      )}
    </MotiView>
  );
}