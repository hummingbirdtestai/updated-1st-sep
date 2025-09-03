import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { TrendingDown, Clock, Target, Brain, TriangleAlert as AlertTriangle, ListFilter as Filter, ChevronDown, X, Calendar, BookOpen } from 'lucide-react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockAttempts } from '@/data/mockAttempts';

interface ProcessedDataPoint {
  elapsedMin: number;
  pyqAccuracy: number | null;
  recursiveAccuracy: number | null;
  pyqCount: number;
  recursiveCount: number;
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
}

interface FatigueMetrics {
  initialPyqAccuracy: number;
  finalPyqAccuracy: number;
  pyqDecline: number;
  initialRecursiveAccuracy: number;
  finalRecursiveAccuracy: number;
  recursiveDecline: number;
  totalStudyTime: number;
  fatigueOnsetTime: number;
}

type TimeRange = 'today' | 'week' | 'month';

export default function FatigueImpactCurve() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [processedData, setProcessedData] = useState<ProcessedDataPoint[]>([]);
  const [fatigueMetrics, setFatigueMetrics] = useState<FatigueMetrics | null>(null);
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

    // Sort attempts by time
    const sortedAttempts = filteredAttempts.sort((a, b) => 
      new Date(a.attempt_time).getTime() - new Date(b.attempt_time).getTime()
    );

    // Filter PYQs and recursive MCQs
    const pyqAttempts = sortedAttempts.filter(attempt => attempt.mcq_key === 'mcq_1');
    const recursiveAttempts = sortedAttempts.filter(attempt => attempt.mcq_key !== 'mcq_1');

    const dataPoints: ProcessedDataPoint[] = [];
    let pyqIndex = 0;
    let recursiveIndex = 0;

    // Process in 4.5 minute intervals based on PYQ attempts
    pyqAttempts.forEach((pyq, index) => {
      const elapsedMin = index * 4.5;
      
      // Calculate rolling PYQ accuracy up to this point
      const pyqsUpToNow = pyqAttempts.slice(0, index + 1);
      const pyqCorrect = pyqsUpToNow.filter(attempt => attempt.is_correct).length;
      const pyqAccuracy = (pyqCorrect / pyqsUpToNow.length) * 100;

      // Find recursive attempts that occurred around this time
      const pyqTime = new Date(pyq.attempt_time).getTime();
      const timeWindow = 15 * 60 * 1000; // 15 minutes window
      
      const recursivesInWindow = recursiveAttempts.filter(attempt => {
        const attemptTime = new Date(attempt.attempt_time).getTime();
        return Math.abs(attemptTime - pyqTime) <= timeWindow;
      });

      // Calculate recursive accuracy if we have data
      let recursiveAccuracy = null;
      if (recursivesInWindow.length > 0) {
        const recursiveCorrect = recursivesInWindow.filter(attempt => attempt.is_correct).length;
        recursiveAccuracy = (recursiveCorrect / recursivesInWindow.length) * 100;
      }

      dataPoints.push({
        elapsedMin,
        pyqAccuracy,
        recursiveAccuracy,
        pyqCount: pyqsUpToNow.length,
        recursiveCount: recursivesInWindow.length,
      });
    });

    return dataPoints;
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
  const generateMockMCQData = (dataPoint: ProcessedDataPoint, isRecursive: boolean): MCQModalData => {
    const mockMCQs = [
      {
        stem: "What happens to the oxygen dissociation curve during exercise at high altitude?",
        learning_gap: "Confusion between Bohr effect and altitude physiology adaptations"
      },
      {
        stem: "Which enzyme is the rate-limiting step in glycolysis?",
        learning_gap: "Mixing up regulatory enzymes in different metabolic pathways"
      },
      {
        stem: "How does cardiac output change during the transition from rest to exercise?",
        learning_gap: "Not understanding the relationship between stroke volume and heart rate"
      },
      {
        stem: "What is the primary mechanism of action for ACE inhibitors?",
        learning_gap: "Confusing renin-angiotensin system components and their interactions"
      },
      {
        stem: "Which neurotransmitter is primarily involved in synaptic transmission at the NMJ?",
        learning_gap: "Mixing up cholinergic and adrenergic neurotransmitter systems"
      }
    ];
    
    const randomMCQ = mockMCQs[Math.floor(Math.random() * mockMCQs.length)];
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
    };
  };

  // Handle data point click
  const handleDataPointClick = (data: any, dataKey: string) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const dataPoint = data.activePayload[0].payload;
      const isRecursive = dataKey === 'recursiveAccuracy';
      const mockData = generateMockMCQData(dataPoint, isRecursive);
      setSelectedMCQ(mockData);
    }
  };

  // Calculate fatigue metrics
  const calculateFatigueMetrics = (data: ProcessedDataPoint[]): FatigueMetrics => {
    if (data.length === 0) {
      return {
        initialPyqAccuracy: 0,
        finalPyqAccuracy: 0,
        pyqDecline: 0,
        initialRecursiveAccuracy: 0,
        finalRecursiveAccuracy: 0,
        recursiveDecline: 0,
        totalStudyTime: 0,
        fatigueOnsetTime: 0,
      };
    }

    const initialPyqAccuracy = data[0]?.pyqAccuracy || 0;
    const finalPyqAccuracy = data[data.length - 1]?.pyqAccuracy || 0;
    const pyqDecline = initialPyqAccuracy - finalPyqAccuracy;

    // Find first and last recursive accuracy points
    const recursiveData = data.filter(d => d.recursiveAccuracy !== null);
    const initialRecursiveAccuracy = recursiveData[0]?.recursiveAccuracy || 0;
    const finalRecursiveAccuracy = recursiveData[recursiveData.length - 1]?.recursiveAccuracy || 0;
    const recursiveDecline = initialRecursiveAccuracy - finalRecursiveAccuracy;

    const totalStudyTime = data[data.length - 1]?.elapsedMin || 0;
    
    // Find fatigue onset (when accuracy drops below 80% of initial)
    const fatigueThreshold = initialPyqAccuracy * 0.8;
    const fatigueOnset = data.find(d => d.pyqAccuracy < fatigueThreshold);
    const fatigueOnsetTime = fatigueOnset?.elapsedMin || totalStudyTime;

    return {
      initialPyqAccuracy,
      finalPyqAccuracy,
      pyqDecline,
      initialRecursiveAccuracy,
      finalRecursiveAccuracy,
      recursiveDecline,
      totalStudyTime,
      fatigueOnsetTime,
    };
  };

  // Process data on component mount
  useEffect(() => {
    const data = processAttempts();
    setProcessedData(data);
    setFatigueMetrics(calculateFatigueMetrics(data));
  }, [selectedSubject, selectedChapter, selectedTopic, timeRange]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Pressable 
          onPress={() => handleDataPointClick({ activePayload: payload }, payload[0].dataKey)}
          className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl active:scale-95"
        >
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {label} minutes
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}%
              {entry.dataKey === 'pyqAccuracy' && ` (${data.pyqCount} PYQs)`}
              {entry.dataKey === 'recursiveAccuracy' && data.recursiveCount > 0 && ` (${data.recursiveCount} MCQs)`}
            </Text>
          ))}
          <Text className="text-slate-400 text-xs mt-2">
            💡 Tap to see sample MCQ
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  const getFatigueColor = (decline: number) => {
    if (decline >= 20) return { color: '#ef4444', label: 'Severe Fatigue' };
    if (decline >= 10) return { color: '#f59e0b', label: 'Moderate Fatigue' };
    if (decline >= 5) return { color: '#eab308', label: 'Mild Fatigue' };
    return { color: '#10b981', label: 'Minimal Fatigue' };
  };

  const pyqFatigueInfo = getFatigueColor(fatigueMetrics?.pyqDecline || 0);
  const recursiveFatigueInfo = getFatigueColor(fatigueMetrics?.recursiveDecline || 0);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <TrendingDown size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Fatigue Impact Curve</Text>
            <Text className="text-slate-400 text-sm">
              Accuracy decline over study time • {processedData.length} data points • Click chart for details
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
                      ? 'bg-red-600/30 border border-red-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium capitalize ${
                    timeRange === range ? 'text-red-300' : 'text-slate-400'
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
                    ? 'bg-red-600/30 border border-red-500/50'
                    : 'bg-slate-700/40 border border-slate-600/30'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedSubject === 'all' ? 'text-red-300' : 'text-slate-400'
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
                      ? 'bg-red-600/30 border border-red-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedSubject === subject ? 'text-red-300' : 'text-slate-400'
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
                      ? 'bg-red-600/30 border border-red-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-xs ${
                    selectedChapter === 'all' ? 'text-red-300' : 'text-slate-400'
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
                        ? 'bg-red-600/30 border border-red-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-xs ${
                      selectedChapter === chapter ? 'text-red-300' : 'text-slate-400'
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
                      ? 'bg-red-600/30 border border-red-500/50'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }`}
                >
                  <Text className={`text-xs ${
                    selectedTopic === 'all' ? 'text-red-300' : 'text-slate-400'
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
                        ? 'bg-red-600/30 border border-red-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-xs ${
                      selectedTopic === topic ? 'text-red-300' : 'text-slate-400'
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

        {/* Fatigue Severity Badge */}
        <View className="items-center">
          <View 
            className="px-3 py-1 rounded-full border"
            style={{ 
              backgroundColor: `${pyqFatigueInfo.color}20`,
              borderColor: `${pyqFatigueInfo.color}50`
            }}
          >
            <Text 
              className="font-bold text-sm"
              style={{ color: pyqFatigueInfo.color }}
            >
              {pyqFatigueInfo.label}
            </Text>
          </View>
          <Text className="text-slate-400 text-xs mt-1">
            PYQ Performance
          </Text>
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-6">
        <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Accuracy vs Study Time
        </Text>
        
        <View style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="elapsedMin"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* PYQ Accuracy Line */}
              <Line 
                type="monotone"
                dataKey="pyqAccuracy" 
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="PYQ Accuracy"
                connectNulls={false}
                onClick={(data) => handleDataPointClick(data, 'pyqAccuracy')}
              />
              
              {/* Recursive Accuracy Line */}
              <Line 
                type="monotone"
                dataKey="recursiveAccuracy" 
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5,5"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Recursive MCQ Accuracy"
                connectNulls={false}
                onClick={(data) => handleDataPointClick(data, 'recursiveAccuracy')}
              />
            </LineChart>
          </ResponsiveContainer>
        </View>
      </View>

      {/* Fatigue Analysis Metrics */}
      <View className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">PYQ Decline</Text>
          </View>
          <Text className="text-blue-200 text-xl font-bold">
            {fatigueMetrics?.pyqDecline.toFixed(1)}%
          </Text>
          <Text className="text-blue-300/80 text-xs">
            {fatigueMetrics?.initialPyqAccuracy.toFixed(0)}% → {fatigueMetrics?.finalPyqAccuracy.toFixed(0)}%
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Recursive Decline</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {fatigueMetrics?.recursiveDecline.toFixed(1)}%
          </Text>
          <Text className="text-red-300/80 text-xs">
            {fatigueMetrics?.initialRecursiveAccuracy.toFixed(0)}% → {fatigueMetrics?.finalRecursiveAccuracy.toFixed(0)}%
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Fatigue Onset</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {fatigueMetrics?.fatigueOnsetTime.toFixed(0)}m
          </Text>
          <Text className="text-amber-300/80 text-xs">
            20% accuracy drop
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
        >
          <View className="flex-row items-center mb-2">
            <Brain size={16} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Study Duration</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {(fatigueMetrics?.totalStudyTime || 0).toFixed(0)}m
          </Text>
          <Text className="text-purple-300/80 text-xs">
            {((fatigueMetrics?.totalStudyTime || 0) / 60).toFixed(1)} hours
          </Text>
        </MotiView>
      </View>

      {/* Fatigue Analysis Insights */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
      >
        <View className="flex-row items-center mb-3">
          <Brain size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Fatigue Impact Analysis</Text>
        </View>
        
        <View className="space-y-2">
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-blue-400">PYQ Performance:</Text> Started at {fatigueMetrics?.initialPyqAccuracy.toFixed(0)}%, 
            ended at {fatigueMetrics?.finalPyqAccuracy.toFixed(0)}% ({fatigueMetrics?.pyqDecline.toFixed(1)}% decline)
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-red-400">Recursive Performance:</Text> Started at {fatigueMetrics?.initialRecursiveAccuracy.toFixed(0)}%, 
            ended at {fatigueMetrics?.finalRecursiveAccuracy.toFixed(0)}% ({fatigueMetrics?.recursiveDecline.toFixed(1)}% decline)
          </Text>
          
          <Text className="text-slate-300 text-sm">
            <Text className="font-bold text-amber-400">Fatigue Onset:</Text> Significant accuracy drop detected at {fatigueMetrics?.fatigueOnsetTime.toFixed(0)} minutes
          </Text>
          
          <Text className="text-slate-400 text-xs leading-4 mt-3">
            {(fatigueMetrics?.pyqDecline || 0) >= 15 
              ? "High fatigue impact detected! Consider shorter study sessions with breaks to maintain performance."
              : (fatigueMetrics?.pyqDecline || 0) >= 8
              ? "Moderate fatigue observed. Your accuracy drops as study time increases - plan strategic breaks."
              : "Good fatigue resistance! Your performance remains relatively stable throughout the session."
            }
          </Text>
        </View>
      </MotiView>

      {/* Performance Comparison */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1400 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-4"
      >
        <View className="flex-row items-center mb-3">
          <TrendingDown size={16} color="#f59e0b" />
          <Text className="text-slate-100 font-semibold ml-2">Performance Insights</Text>
        </View>

        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">PYQ vs Recursive Gap</Text>
            <Text className="text-slate-400 text-xs">
              The gap between PYQ and recursive accuracy shows concept mastery depth. 
              Larger gaps indicate surface-level understanding.
            </Text>
            <Text className="text-cyan-400 text-sm font-bold mt-1">
              Average Gap: {processedData.length > 0 
                ? (processedData
                    .filter(d => d.recursiveAccuracy !== null)
                    .reduce((sum, d) => sum + (d.pyqAccuracy - (d.recursiveAccuracy || 0)), 0) / 
                   processedData.filter(d => d.recursiveAccuracy !== null).length
                  ).toFixed(1)
                : '0'}%
            </Text>
          </View>

          <View>
            <Text className="text-slate-300 text-sm font-medium mb-2">Optimal Study Duration</Text>
            <Text className="text-slate-400 text-xs">
              Based on fatigue onset patterns, consider breaking sessions at the {fatigueMetrics?.fatigueOnsetTime.toFixed(0)}-minute mark.
            </Text>
            <Text className="text-emerald-400 text-sm font-bold mt-1">
              Recommended: {Math.min(fatigueMetrics?.fatigueOnsetTime || 60, 60)} min sessions
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
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
                <BookOpen size={16} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">MCQ Analysis</Text>
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
              {/* Subject/Chapter/Topic */}
              <View className="bg-slate-700/40 rounded-lg p-3">
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-red-400">{selectedMCQ.subject}</Text> • {selectedMCQ.chapter} • {selectedMCQ.topic}
                </Text>
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

              {/* Recommendations */}
              <View>
                <Text className="text-slate-100 font-semibold mb-2">AI Recommendations:</Text>
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <Text className="text-emerald-200 text-sm leading-5">
                    {selectedMCQ.is_correct 
                      ? "Great job! Consider reviewing related concepts to strengthen understanding."
                      : "Focus on the identified learning gap. Review fundamental concepts and practice similar questions."
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
                // Handle study this gap action
                setSelectedMCQ(null);
              }}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl py-3 px-4"
            >
              <Text className="text-white text-center font-semibold">Study This Gap</Text>
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