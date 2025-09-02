import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Trophy, Medal, Award, User, TrendingUp, Target } from 'lucide-react-native';

interface Student {
  student_id: string;
  student_name: string;
  avg_score: number;
  total_chains: number;
}

interface MyScore extends Student {
  rank: number;
}

interface LeaderboardProps {
  physiologyData?: Student[];
  biochemistryData?: Student[];
  anatomyData?: Student[];
  myScore?: MyScore;
  onStudentPress?: (student: Student) => void;
}

interface LeaderboardRowProps {
  student: Student;
  rank: number;
  isMyScore?: boolean;
  onPress?: () => void;
}

// Mock data
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

export default function Leaderboard({
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
              Leaderboard 🏆
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