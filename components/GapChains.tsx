import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { GitBranch, Target, Clock, TrendingUp, Trophy, Medal, Award, User, Filter, ChevronDown } from 'lucide-react-native';
import gapChainsData from '@/data/gap-chains-data.json';

interface ChainData {
  pyq_id: string;
  subject: string;
  chapter: string;
  topic: string;
  chain: Array<{ mcq_id: string; is_correct: boolean }>;
  chain_health_score: number;
  time_credit_minutes: number;
}

interface Student {
  student_id: string;
  student_name: string;
  avg_score: number;
  total_chains: number;
}

interface MyScore extends Student {
  rank: number;
}

interface LeaderboardRowProps {
  student: Student;
  rank: number;
  isMyScore?: boolean;
  onPress?: () => void;
}

interface LeaderboardProps {
  physiologyData?: Student[];
  biochemistryData?: Student[];
  anatomyData?: Student[];
  myScore?: MyScore;
  onStudentPress?: (student: Student) => void;
}

// Mock leaderboard data
const mockPhysiologyData: Student[] = [
  { student_id: "s1", student_name: "Arjun Sharma", avg_score: 95, total_chains: 300 },
  { student_id: "s2", student_name: "Meera Patel", avg_score: 92, total_chains: 285 },
  { student_id: "s3", student_name: "Rahul Kumar", avg_score: 89, total_chains: 270 },
  { student_id: "s4", student_name: "Priya Singh", avg_score: 86, total_chains: 255 },
  { student_id: "s5", student_name: "Vikram Reddy", avg_score: 83, total_chains: 240 },
  { student_id: "s6", student_name: "Ananya Gupta", avg_score: 80, total_chains: 225 },
  { student_id: "s7", student_name: "Karthik Iyer", avg_score: 77, total_chains: 210 },
  { student_id: "s8", student_name: "Sneha Joshi", avg_score: 74, total_chains: 195 },
  { student_id: "s9", student_name: "Rohan Mehta", avg_score: 71, total_chains: 180 },
  { student_id: "s10", student_name: "Kavya Nair", avg_score: 68, total_chains: 165 },
];

const mockBiochemistryData: Student[] = [
  { student_id: "s2", student_name: "Meera Patel", avg_score: 88, total_chains: 280 },
  { student_id: "s1", student_name: "Arjun Sharma", avg_score: 85, total_chains: 265 },
  { student_id: "s4", student_name: "Priya Singh", avg_score: 82, total_chains: 250 },
  { student_id: "s3", student_name: "Rahul Kumar", avg_score: 79, total_chains: 235 },
  { student_id: "s6", student_name: "Ananya Gupta", avg_score: 76, total_chains: 220 },
  { student_id: "s5", student_name: "Vikram Reddy", avg_score: 73, total_chains: 205 },
  { student_id: "s7", student_name: "Karthik Iyer", avg_score: 70, total_chains: 190 },
  { student_id: "s8", student_name: "Sneha Joshi", avg_score: 67, total_chains: 175 },
  { student_id: "s10", student_name: "Kavya Nair", avg_score: 64, total_chains: 160 },
  { student_id: "s9", student_name: "Rohan Mehta", avg_score: 61, total_chains: 145 },
];

const mockAnatomyData: Student[] = [
  { student_id: "s3", student_name: "Rahul Kumar", avg_score: 91, total_chains: 295 },
  { student_id: "s1", student_name: "Arjun Sharma", avg_score: 88, total_chains: 280 },
  { student_id: "s4", student_name: "Priya Singh", avg_score: 85, total_chains: 265 },
  { student_id: "s2", student_name: "Meera Patel", avg_score: 82, total_chains: 250 },
  { student_id: "s6", student_name: "Ananya Gupta", avg_score: 79, total_chains: 235 },
  { student_id: "s7", student_name: "Karthik Iyer", avg_score: 76, total_chains: 220 },
  { student_id: "s5", student_name: "Vikram Reddy", avg_score: 73, total_chains: 205 },
  { student_id: "s8", student_name: "Sneha Joshi", avg_score: 70, total_chains: 190 },
  { student_id: "s9", student_name: "Rohan Mehta", avg_score: 67, total_chains: 175 },
  { student_id: "s10", student_name: "Kavya Nair", avg_score: 64, total_chains: 160 },
];

const mockMyScore: MyScore = {
  student_id: "me",
  student_name: "You",
  avg_score: 70,
  total_chains: 200,
  rank: 12
};

type SubjectTab = 'Physiology' | 'Biochemistry' | 'Anatomy';

function LeaderboardRow({ student, rank, isMyScore = false, onPress }: LeaderboardRowProps) {
  // Get score band color and label
  const getScoreBand = (score: number) => {
    if (score >= 90) return { 
      color: '#10b981', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30', 
      text: 'text-emerald-400',
      label: 'Excellent' 
    };
    if (score >= 80) return { 
      color: '#3b82f6', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/30', 
      text: 'text-blue-400',
      label: 'Good' 
    };
    if (score >= 70) return { 
      color: '#f59e0b', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      text: 'text-amber-400',
      label: 'Fair' 
    };
    if (score >= 60) return { 
      color: '#f97316', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/30', 
      text: 'text-orange-400',
      label: 'Poor' 
    };
    return { 
      color: '#ef4444', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30', 
      text: 'text-red-400',
      label: 'Failed' 
    };
  };

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Text className="text-2xl">🥇</Text>;
      case 2: return <Text className="text-2xl">🥈</Text>;
      case 3: return <Text className="text-2xl">🥉</Text>;
      default: return (
        <View className="w-8 h-8 bg-slate-600/50 rounded-full items-center justify-center">
          <Text className="text-slate-300 font-bold text-sm">#{rank}</Text>
        </View>
      );
    }
  };

  const scoreBand = getScoreBand(student.avg_score);

  return (
    <MotiView
      from={{ opacity: 0, translateX: isMyScore ? 0 : -20, scale: 0.95 }}
      animate={{ opacity: 1, translateX: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        duration: 600, 
        delay: isMyScore ? 0 : rank * 50 + 200 
      }}
      className={`${scoreBand.bg} border ${scoreBand.border} rounded-xl p-4 mb-3 shadow-lg ${
        isMyScore ? 'border-2' : ''
      }`}
      style={{
        shadowColor: scoreBand.color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isMyScore ? 0.2 : 0.1,
        shadowRadius: isMyScore ? 12 : 8,
        elevation: isMyScore ? 8 : 4,
      }}
    >
      <Pressable
        onPress={onPress}
        className={`flex-row items-center ${isMyScore ? 'active:scale-95' : ''}`}
      >
        {/* Rank Icon */}
        <View className="w-12 items-center mr-4">
          {getRankIcon(rank)}
        </View>

        {/* Student Info */}
        <View className="flex-1">
          <Text className={`text-lg font-bold ${
            isMyScore ? 'text-cyan-300' : 'text-slate-100'
          }`}>
            {student.student_name}
            {isMyScore && ' (You)'}
          </Text>
          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-1 rounded-full ${scoreBand.bg} border ${scoreBand.border}`}>
              <Text className={`text-xs font-bold ${scoreBand.text} uppercase`}>
                {scoreBand.label}
              </Text>
            </View>
            <Text className="text-slate-400 text-sm ml-2">
              {student.total_chains} chains
            </Text>
          </View>
        </View>

        {/* Score */}
        <View className="items-end">
          <Text className={`text-2xl font-bold ${scoreBand.text}`}>
            {student.avg_score}
          </Text>
          <Text className="text-slate-400 text-xs">
            avg score
          </Text>
        </View>

        {/* My Score Indicator */}
        {isMyScore && (
          <View className="ml-4">
            <View className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full items-center justify-center shadow-lg">
              <User size={20} color="#ffffff" />
            </View>
          </View>
        )}
      </Pressable>

      {/* Glow effect for my score */}
      {isMyScore && (
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
          }}
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: '#06b6d4', opacity: 0.1 }}
        />
      )}
    </MotiView>
  );
}

function Leaderboard({
  physiologyData = mockPhysiologyData,
  biochemistryData = mockBiochemistryData,
  anatomyData = mockAnatomyData,
  myScore = mockMyScore,
  onStudentPress,
}: LeaderboardProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [activeTab, setActiveTab] = useState<SubjectTab>('Physiology');

  const subjects: { key: SubjectTab; data: Student[] }[] = [
    { key: 'Physiology', data: physiologyData },
    { key: 'Biochemistry', data: biochemistryData },
    { key: 'Anatomy', data: anatomyData },
  ];

  const currentData = subjects.find(s => s.key === activeTab)?.data || [];
  const top10Students = currentData.slice(0, 10);

  // Calculate my rank in current subject
  const getMyRankInSubject = (data: Student[], myScore: MyScore): number => {
    const allStudents = [...data, myScore].sort((a, b) => b.avg_score - a.avg_score);
    return allStudents.findIndex(s => s.student_id === myScore.student_id) + 1;
  };

  const myRankInSubject = getMyRankInSubject(currentData, myScore);

  // Get subject icon
  const getSubjectIcon = (subject: SubjectTab) => {
    switch (subject) {
      case 'Physiology': return <TrendingUp size={18} color="#ffffff" />;
      case 'Biochemistry': return <Target size={18} color="#ffffff" />;
      case 'Anatomy': return <Award size={18} color="#ffffff" />;
      default: return <Trophy size={18} color="#ffffff" />;
    }
  };

  // Get subject color
  const getSubjectColor = (subject: SubjectTab) => {
    switch (subject) {
      case 'Physiology': return 'from-emerald-500 to-teal-600';
      case 'Biochemistry': return 'from-purple-500 to-indigo-600';
      case 'Anatomy': return 'from-blue-500 to-cyan-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-2xl"
      style={{
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Trophy size={24} color="#ffffff" />
            
            {/* Rotating glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.3 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 6000,
              }}
              className="absolute inset-0 rounded-xl bg-amber-400/20"
            />
          </MotiView>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Gap Chains Leaderboard 🏆
            </Text>
            <Text className="text-slate-400 text-base">
              Top 10 performers • {activeTab} rankings
            </Text>
          </View>
        </View>

        {/* Total Students Badge */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View className="bg-amber-500/20 rounded-xl px-4 py-3 border border-amber-500/30 shadow-lg">
            <Text className="text-amber-400 font-bold text-xl">
              {currentData.length}
            </Text>
            <Text className="text-amber-300/80 text-xs text-center font-medium">
              students
            </Text>
          </View>
        </MotiView>
      </View>

      {/* Subject Tabs */}
      <View className="flex-row justify-center p-4 border-b border-slate-700/30">
        {subjects.map((subject, index) => {
          const isActive = activeTab === subject.key;
          const subjectColor = getSubjectColor(subject.key);
          
          return (
            <MotiView
              key={subject.key}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
            >
              <Pressable
                onPress={() => setActiveTab(subject.key)}
                className={`flex-row items-center px-6 py-3 mx-2 rounded-xl ${
                  isActive
                    ? `bg-gradient-to-r ${subjectColor} shadow-lg`
                    : 'bg-slate-700/50 border border-slate-600/50'
                }`}
                style={{
                  shadowColor: isActive ? (
                    subject.key === 'Physiology' ? '#10b981' :
                    subject.key === 'Biochemistry' ? '#8b5cf6' : '#3b82f6'
                  ) : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: isActive ? 4 : 0,
                }}
              >
                <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
                  isActive ? 'bg-white/20' : 'bg-slate-600/50'
                }`}>
                  {getSubjectIcon(subject.key)}
                </View>
                <Text className={`font-semibold ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}>
                  {subject.key}
                </Text>
              </Pressable>
            </MotiView>
          );
        })}
      </View>

      {/* Leaderboard List */}
      <ScrollView 
        className="p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ maxHeight: 600 }}
      >
        {top10Students.length > 0 ? (
          <View className="space-y-2">
            {top10Students.map((student, index) => (
              <LeaderboardRow
                key={student.student_id}
                student={student}
                rank={index + 1}
                onPress={() => onStudentPress?.(student)}
              />
            ))}
          </View>
        ) : (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="items-center py-12"
          >
            <View className="w-20 h-20 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Trophy size={32} color="#64748b" />
            </View>
            <Text className="text-2xl font-bold text-slate-100 mb-2 text-center">
              No Data Available
            </Text>
            <Text className="text-slate-300 text-base text-center max-w-md">
              Complete some {activeTab.toLowerCase()} assessments to see the leaderboard rankings.
            </Text>
          </MotiView>
        )}
      </ScrollView>

      {/* My Score & Rank Section */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800, delay: 1200 }}
        className="p-6 border-t border-slate-700/30 bg-slate-900/20"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg items-center justify-center mr-3 shadow-lg">
            <User size={16} color="#ffffff" />
          </View>
          <Text className="text-xl font-bold text-slate-100">
            My Score & Rank
          </Text>
        </View>

        <LeaderboardRow
          student={myScore}
          rank={myRankInSubject}
          isMyScore={true}
          onPress={() => onStudentPress?.(myScore)}
        />

        {/* Performance Summary */}
        <View className="mt-4 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
          <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <View className="text-center">
              <Text className="text-slate-400 text-sm">Current Rank</Text>
              <Text className="text-cyan-400 font-bold text-xl">
                #{myRankInSubject}
              </Text>
              <Text className="text-slate-500 text-xs">
                of {currentData.length + 1}
              </Text>
            </View>
            
            <View className="text-center">
              <Text className="text-slate-400 text-sm">Score Gap to #1</Text>
              <Text className="text-amber-400 font-bold text-xl">
                {currentData.length > 0 ? (currentData[0].avg_score - myScore.avg_score).toFixed(0) : 0}
              </Text>
              <Text className="text-slate-500 text-xs">
                points behind
              </Text>
            </View>
            
            <View className="text-center">
              <Text className="text-slate-400 text-sm">Percentile</Text>
              <Text className="text-emerald-400 font-bold text-xl">
                {(((currentData.length + 1 - myRankInSubject) / (currentData.length + 1)) * 100).toFixed(0)}th
              </Text>
              <Text className="text-slate-500 text-xs">
                percentile
              </Text>
            </View>
          </View>
        </View>
      </MotiView>

      {/* Floating Achievement Particles */}
      <View className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <MotiView
            key={i}
            from={{ 
              opacity: 0, 
              translateY: Math.random() * 100,
              translateX: Math.random() * 100,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 0.4, 0],
              translateY: Math.random() * -200,
              translateX: Math.random() * 50 - 25,
              scale: [0, 1, 0]
            }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 6000,
              delay: i * 800,
            }}
            className="absolute"
            style={{
              left: Math.random() * 100,
              top: Math.random() * 200,
            }}
          >
            <View className="w-2 h-2 bg-amber-400 rounded-full shadow-lg" />
          </MotiView>
        ))}
      </View>
    </MotiView>
  );
}

export default function GapChains() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Process gap chains data
  const processedData = gapChainsData as ChainData[];

  // Get unique subjects for filter
  const subjects = Array.from(new Set(processedData.map(item => item.subject)));

  // Filter data based on selected subject
  const filteredData = selectedSubject === 'all' 
    ? processedData 
    : processedData.filter(item => item.subject === selectedSubject);

  // Calculate summary metrics
  const totalChains = filteredData.length;
  const healthyChains = filteredData.filter(item => item.chain_health_score >= 70).length;
  const unhealthyChains = filteredData.filter(item => item.chain_health_score < 50).length;
  const averageHealth = filteredData.reduce((sum, item) => sum + item.chain_health_score, 0) / Math.max(totalChains, 1);
  const totalTimeCredit = filteredData.reduce((sum, item) => sum + item.time_credit_minutes, 0);

  const getHealthColor = (score: number) => {
    if (score >= 85) return { color: '#10b981', label: 'Excellent', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 70) return { color: '#22c55e', label: 'Good', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    if (score >= 50) return { color: '#f59e0b', label: 'Fair', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (score >= 30) return { color: '#f97316', label: 'Poor', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { color: '#ef4444', label: 'Critical', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  };

  const handleStudentPress = (student: Student) => {
    console.log('Selected student:', student);
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
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ type: 'spring', duration: 400 }}
          className="bg-slate-800/60 border-b border-slate-700/50 p-6"
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
              ≥70% health
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Unhealthy</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {unhealthyChains}
            </Text>
            <Text className="text-red-300/80 text-xs">
              &lt;50% health
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Time Credit</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {(totalTimeCredit / 60).toFixed(1)}h
            </Text>
            <Text className="text-purple-300/80 text-xs">
              {totalTimeCredit.toFixed(0)} minutes
            </Text>
          </MotiView>
        </View>

        {/* Gap Chains List */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-8 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <GitBranch size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Chain Health Analysis
            </Text>
          </View>

          <View className="space-y-4">
            {filteredData.map((item, index) => {
              const healthInfo = getHealthColor(item.chain_health_score);
              const chainLength = item.chain.length;
              const correctCount = item.chain.filter(mcq => mcq.is_correct).length;

              return (
                <MotiView
                  key={item.pyq_id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 800 + index * 100 }}
                  className={`${healthInfo.bg} border ${healthInfo.border} rounded-xl p-4`}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold text-base mb-1">
                        {item.subject} • {item.chapter}
                      </Text>
                      <Text className="text-slate-300 text-sm">
                        {item.topic}
                      </Text>
                    </View>
                    
                    {/* Health Score Badge */}
                    <View className="items-center">
                      <View 
                        className="w-16 h-16 rounded-full border-4 items-center justify-center"
                        style={{ borderColor: healthInfo.color }}
                      >
                        <Text className="text-lg font-bold" style={{ color: healthInfo.color }}>
                          {item.chain_health_score}
                        </Text>
                        <Text className="text-slate-500 text-xs">%</Text>
                      </View>
                      <Text className="text-xs text-slate-400 mt-1">
                        {healthInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* Chain Details */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-slate-400 text-sm">
                        Chain: <Text className="text-slate-300 font-semibold">
                          {correctCount}/{chainLength} correct
                        </Text>
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        Time: <Text className="text-slate-300 font-semibold">
                          {item.time_credit_minutes.toFixed(1)}m
                        </Text>
                      </Text>
                    </View>

                    {/* Chain Visualization */}
                    <View className="flex-row space-x-1">
                      {item.chain.map((mcq, mcqIndex) => (
                        <View
                          key={mcq.mcq_id}
                          className={`w-3 h-3 rounded-full ${
                            mcq.is_correct ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* Leaderboard Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
        >
          <Leaderboard onStudentPress={handleStudentPress} />
        </MotiView>

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1200 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <GitBranch size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Chain Health Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Average Health Score:</Text> {averageHealth.toFixed(1)}%
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-blue-400">Healthy Chains:</Text> {healthyChains} of {totalChains} ({((healthyChains / Math.max(totalChains, 1)) * 100).toFixed(0)}%)
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Need Attention:</Text> {unhealthyChains} chains with &lt;50% health
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-purple-400">Total Time Investment:</Text> {(totalTimeCredit / 60).toFixed(1)} hours
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {averageHealth >= 70 
                ? "Excellent chain health! Your recursive learning approach is working well across topics."
                : averageHealth >= 50
                ? "Moderate chain health. Focus on strengthening the weaker chains for better knowledge retention."
                : "Low chain health detected. Consider reviewing your approach to recursive MCQs and gap resolution."
              }
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}