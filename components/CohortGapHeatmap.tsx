import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Grid3x3, ToggleLeft, ToggleRight, X, Clock, Target, TrendingUp, User } from 'lucide-react-native';
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

interface TopicGap {
  topic: string;
  students: Array<{
    student_id: string;
    name: string;
    gap_intensity: number;
    minutes_spent: number;
  }>;
}

interface TooltipData {
  student: string;
  topic: string;
  gap_intensity: number;
  minutes_spent: number;
  position: { x: number; y: number };
}

interface StudentAvatarProps {
  student: Student;
  index: number;
}

function StudentAvatar({ student, index }: StudentAvatarProps) {
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-indigo-600', 
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-pink-500 to-rose-600'
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 800, delay: index * 100 + 600 }}
      className="items-center"
    >
      <View className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(student.name)} rounded-2xl items-center justify-center shadow-xl mb-2`}
        style={{
          shadowColor: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#10b981' : index === 3 ? '#f59e0b' : '#ec4899',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-white font-bold text-lg">
          {getInitials(student.name)}
        </Text>
        
        {/* Floating particles around avatar */}
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2500,
            delay: index * 500,
          }}
          className="absolute inset-0 rounded-2xl"
          style={{ 
            backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#10b981' : index === 3 ? '#f59e0b' : '#ec4899',
            opacity: 0.2 
          }}
        />
      </View>
      
      <View className="bg-slate-700/60 rounded-xl px-3 py-2 border border-slate-600/40 shadow-lg min-w-[120px]">
        <Text className="text-slate-100 font-bold text-sm text-center">
          {student.name}
        </Text>
        <Text className="text-slate-400 text-xs text-center mt-1">
          {student.pyqs_attempted} PYQs
        </Text>
        <Text className="text-slate-500 text-xs text-center">
          {(student.total_minutes_spent / 60).toFixed(0)}h studied
        </Text>
      </View>
    </MotiView>
  );
}

interface HeatmapCellProps {
  student: Student;
  topic: string;
  intensity: number;
  estimatedMinutes: number;
  onPress: (event: any) => void;
  shouldPulse: boolean;
  delay: number;
}

function HeatmapCell({ 
  student, 
  topic, 
  intensity, 
  estimatedMinutes, 
  onPress, 
  shouldPulse, 
  delay 
}: HeatmapCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for critical gaps
  useEffect(() => {
    if (!shouldPulse) return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 600);
    
    return () => clearInterval(interval);
  }, [shouldPulse]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return { bg: '#dc2626', opacity: 0.95, label: 'Critical', glow: '#ef4444' };
    if (intensity >= 0.6) return { bg: '#ef4444', opacity: 0.85, label: 'High', glow: '#f87171' };
    if (intensity >= 0.4) return { bg: '#f59e0b', opacity: 0.75, label: 'Medium', glow: '#fbbf24' };
    if (intensity >= 0.2) return { bg: '#eab308', opacity: 0.65, label: 'Low', glow: '#facc15' };
    return { bg: '#10b981', opacity: 0.55, label: 'Minimal', glow: '#34d399' };
  };

  const colors = getIntensityColor(intensity);
  const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.15) : 1;
  const hoverScale = isHovered ? 1.1 : 1;
  const finalScale = pulseScale * hoverScale;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, rotateY: '45deg' }}
      animate={{ 
        opacity: intensity > 0 ? colors.opacity : 0.3, 
        scale: finalScale,
        rotateY: '0deg'
      }}
      transition={{ 
        type: 'spring', 
        duration: 600, 
        delay,
        damping: 15,
        stiffness: 200
      }}
      className="m-1"
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Pressable
        onPress={onPress}
        className="w-24 h-20 rounded-2xl border-2 border-slate-600/30 overflow-hidden shadow-xl active:scale-95 relative"
        style={{
          backgroundColor: intensity > 0 ? colors.bg : '#374151',
          shadowColor: intensity >= 0.6 ? colors.glow : '#64748b',
          shadowOffset: { width: 0, height: isHovered ? 8 : 4 },
          shadowOpacity: isHovered ? 0.4 : 0.2,
          shadowRadius: isHovered ? 16 : 8,
          elevation: isHovered ? 8 : 4,
        }}
      >
        {/* Animated background glow for high intensity */}
        {intensity >= 0.6 && (
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.3 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 2000,
              delay: delay * 2,
            }}
            className="absolute inset-0 rounded-2xl"
            style={{ backgroundColor: colors.glow }}
          />
        )}

        {/* Cell Content */}
        <MotiView
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ type: 'spring', duration: 300 }}
          className="flex-1 items-center justify-center p-3"
        >
          {intensity > 0 ? (
            <>
              <Text className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                {(intensity * 100).toFixed(0)}%
              </Text>
              <Text className="text-white/90 text-xs font-medium text-center">
                {colors.label}
              </Text>
              <Text className="text-white/70 text-xs text-center mt-1">
                {estimatedMinutes.toFixed(0)}m
              </Text>
            </>
          ) : (
            <Text className="text-slate-500 text-sm">—</Text>
          )}
        </MotiView>

        {/* Critical gap indicator */}
        {intensity >= 0.8 && (
          <View className="absolute top-1 right-1 w-4 h-4 bg-white/90 rounded-full items-center justify-center shadow-lg">
            <Text className="text-red-600 text-xs font-bold">!</Text>
          </View>
        )}

        {/* Hover glow effect */}
        {isHovered && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1.2 }}
            transition={{ type: 'spring', duration: 300 }}
            className="absolute inset-0 rounded-2xl border-2 border-white/50"
          />
        )}
      </Pressable>
    </MotiView>
  );
}

interface Cluster {
  id: string;
  students: string[];
  commonGaps: string[];
  avgIntensity: number;
}

interface CohortGapHeatmapProps {
  data?: Student[];
}

export default function CohortGapHeatmap({ data = cohortData }: CohortGapHeatmapProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [showClusters, setShowClusters] = useState(false);
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);

  // Animation effect for pulsing high-intensity gaps
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  // Process data to get all unique topics and create topic-student matrix
  const processHeatmapData = (): TopicGap[] => {
    const topicMap = new Map<string, Array<{ student_id: string; name: string; gap_intensity: number; minutes_spent: number }>>();
    
    data.forEach(student => {
      student.topic_gap_sentences.forEach(gap => {
        if (!topicMap.has(gap.topic)) {
          topicMap.set(gap.topic, []);
        }
        
        // Estimate minutes spent on this topic based on gap intensity and total time
        const estimatedMinutes = (student.total_minutes_spent * gap.gap_intensity * 0.1);
        
        topicMap.get(gap.topic)!.push({
          student_id: student.student_id,
          name: student.name,
          gap_intensity: gap.gap_intensity,
          minutes_spent: estimatedMinutes,
        });
      });
    });

    return Array.from(topicMap.entries()).map(([topic, students]) => ({
      topic,
      students,
    }));
  };

  // Generate clusters based on similar gap patterns
  const generateClusters = (): Cluster[] => {
    const clusters: Cluster[] = [];
    const processedStudents = new Set<string>();

    data.forEach(student => {
      if (processedStudents.has(student.student_id)) return;

      const cluster: Cluster = {
        id: `cluster_${clusters.length + 1}`,
        students: [student.name],
        commonGaps: [],
        avgIntensity: 0,
      };

      // Find students with similar gap patterns
      const studentGaps = student.topic_gap_sentences.map(g => g.topic);
      
      data.forEach(otherStudent => {
        if (otherStudent.student_id === student.student_id || processedStudents.has(otherStudent.student_id)) return;
        
        const otherGaps = otherStudent.topic_gap_sentences.map(g => g.topic);
        const commonTopics = studentGaps.filter(topic => otherGaps.includes(topic));
        
        // If they share 3+ common gaps, group them
        if (commonTopics.length >= 3) {
          cluster.students.push(otherStudent.name);
          processedStudents.add(otherStudent.student_id);
        }
      });

      // Calculate common gaps and average intensity
      if (cluster.students.length > 1) {
        const allGaps = cluster.students.flatMap(studentName => {
          const studentData = data.find(s => s.name === studentName);
          return studentData?.topic_gap_sentences || [];
        });
        
        const gapCounts = new Map<string, number>();
        allGaps.forEach(gap => {
          gapCounts.set(gap.topic, (gapCounts.get(gap.topic) || 0) + 1);
        });
        
        cluster.commonGaps = Array.from(gapCounts.entries())
          .filter(([_, count]) => count >= 2)
          .map(([topic, _]) => topic);
        
        cluster.avgIntensity = allGaps.reduce((sum, gap) => sum + gap.gap_intensity, 0) / allGaps.length;
      }

      processedStudents.add(student.student_id);
      if (cluster.students.length > 1) {
        clusters.push(cluster);
      }
    });

    return clusters;
  };

  const heatmapData = processHeatmapData();
  const allTopics = heatmapData.map(item => item.topic);

  // Generate clusters when component mounts
  useEffect(() => {
    setClusters(generateClusters());
  }, []);

  // Get color based on gap intensity
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return { bg: '#dc2626', opacity: 0.9, label: 'Critical', glow: '#ef4444' };
    if (intensity >= 0.6) return { bg: '#ef4444', opacity: 0.8, label: 'High', glow: '#f87171' };
    if (intensity >= 0.4) return { bg: '#f59e0b', opacity: 0.7, label: 'Medium', glow: '#fbbf24' };
    if (intensity >= 0.2) return { bg: '#eab308', opacity: 0.6, label: 'Low', glow: '#facc15' };
    return { bg: '#10b981', opacity: 0.5, label: 'Minimal', glow: '#34d399' };
  };

  // Handle cell press
  const handleCellPress = (student: Student, topic: string, gap_intensity: number, minutes_spent: number, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setSelectedTooltip({
      student: student.name,
      topic,
      gap_intensity,
      minutes_spent,
      position,
    });
  };

  const handleToggleClusters = () => {
    setIsExpanding(true);
    setTimeout(() => {
      setShowClusters(!showClusters);
      setIsExpanding(false);
    }, 300);
  };

  // Calculate summary metrics
  const totalStudents = data.length;
  const totalTopics = allTopics.length;
  const criticalGaps = heatmapData.reduce((count, topic) => 
    count + topic.students.filter(s => s.gap_intensity >= 0.8).length, 0
  );
  const averageIntensity = heatmapData.reduce((sum, topic) => 
    sum + topic.students.reduce((topicSum, student) => topicSum + student.gap_intensity, 0) / topic.students.length, 0
  ) / heatmapData.length;

  // Calculate cohort progress metrics
  const totalPYQsAttempted = data.reduce((sum, student) => sum + student.pyqs_attempted, 0);
  const totalMinutesSpent = totalPYQsAttempted * 4.5;
  const totalPossibleMinutes = 9960 * 4.5; // Total NEET prep time
  const cohortProgressPercent = (totalMinutesSpent / totalPossibleMinutes) * 100;
  const remainingPYQs = 9960 - totalPYQsAttempted;
  const remainingHours = (remainingPYQs * 4.5) / 60;

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
            <Users size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Cohort Gap Heatmap</Text>
            <Text className="text-sm text-slate-400">
              Learning gap intensity across {totalStudents} students • {totalTopics} topics
            </Text>
          </View>
        </View>

        {/* View Toggle */}
        <Pressable
          onPress={handleToggleClusters}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          <MotiView
            animate={{
              rotate: showClusters ? '180deg' : '0deg',
              scale: isExpanding ? 1.2 : 1,
            }}
            transition={{ type: 'spring', duration: 400 }}
          >
            {showClusters ? (
              <ToggleRight size={20} color="#10b981" />
            ) : (
              <ToggleLeft size={20} color="#94a3b8" />
            )}
          </MotiView>
          <Text className={`text-sm ml-2 font-medium ${
            showClusters ? 'text-emerald-300' : 'text-slate-400'
          }`}>
            {showClusters ? 'Clusters' : 'Individual'}
          </Text>
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
        {/* Summary Metrics */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Users size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Students</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {totalStudents}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Grid3x3 size={16} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Topics</Text>
            </View>
            <Text className="text-purple-200 text-xl font-bold">
              {totalTopics}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Target size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Critical Gaps</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {criticalGaps}
            </Text>
            <Text className="text-red-300/80 text-xs">
              ≥0.8 intensity
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Intensity</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {(averageIntensity * 100).toFixed(0)}%
            </Text>
          </MotiView>
        </View>

        {/* Heatmap Container */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-8"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Heatmap Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <Grid3x3 size={16} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                {showClusters ? 'Clustered View' : 'Individual View'}
              </Text>
            </View>
            <Text className="text-slate-400 text-sm">
              Tap cells for details
            </Text>
          </View>

          {/* Individual Student View */}
          {!showClusters && (
            <View className="p-6">
              {/* Sticky Topic Headers */}
              <View className="mb-4">
                <View className="flex-row">
                  <View className="w-40" /> {/* Space for student avatars */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                  >
                    <View className="flex-row space-x-2">
                      {allTopics.map((topic, index) => (
                        <MotiView
                          key={topic}
                          from={{ opacity: 0, translateY: -20, rotateX: '45deg' }}
                          animate={{ opacity: 1, translateY: 0, rotateX: '0deg' }}
                          transition={{ type: 'spring', duration: 600, delay: 800 + index * 50 }}
                          className="w-24 items-center bg-slate-800/40 rounded-xl p-3 border border-slate-600/30 shadow-lg"
                          style={{
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 4,
                          }}
                        >
                          <Text className="text-slate-100 font-bold text-xs text-center" numberOfLines={2}>
                            {topic.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                        </MotiView>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Heatmap Rows */}
              <View className="space-y-3">
                {data.map((student, studentIndex) => (
                  <MotiView
                    key={student.student_id}
                    from={{ opacity: 0, translateX: -40, scale: 0.9 }}
                    animate={{ opacity: 1, translateX: 0, scale: 1 }}
                    transition={{ type: 'spring', duration: 800, delay: 1000 + studentIndex * 150 }}
                    className="flex-row items-center"
                  >
                    {/* Student Avatar */}
                    <View className="w-40 mr-4">
                      <StudentAvatar student={student} index={studentIndex} />
                    </View>

                    {/* Topic Cells */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 8 }}
                    >
                      <View className="flex-row space-x-2">
                        {allTopics.map((topic) => {
                          const studentGap = student.topic_gap_sentences.find(g => g.topic === topic);
                          const intensity = studentGap?.gap_intensity || 0;
                          const shouldPulse = intensity >= 0.8;
                          const estimatedMinutes = student.total_minutes_spent * intensity * 0.1;

                          return (
                            <HeatmapCell
                              key={`${student.student_id}-${topic}`}
                              student={student}
                              topic={topic}
                              intensity={intensity}
                              estimatedMinutes={estimatedMinutes}
                              onPress={(event) => handleCellPress(
                                student, 
                                topic, 
                                intensity, 
                                estimatedMinutes, 
                                event
                              )}
                              shouldPulse={shouldPulse}
                              delay={1200 + studentIndex * 100 + allTopics.indexOf(topic) * 20}
                            />
                          );
                        })}
                      </View>
                    </ScrollView>
                  </MotiView>
                ))}
              </View>
            </View>
          )}

          {/* Clustered View */}
          {showClusters && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', duration: 500 }}
              className="p-6"
            >
              <Text className="text-lg font-semibold text-slate-100 mb-4">
                Student Clusters by Similar Gap Patterns
              </Text>
              
              {clusters.length > 0 ? (
                <View className="space-y-6">
                  {clusters.map((cluster, index) => (
                    <MotiView
                      key={cluster.id}
                      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                      animate={{ opacity: 1, translateY: 0, scale: 1 }}
                      transition={{ type: 'spring', duration: 800, delay: 200 + index * 200 }}
                      className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-2xl p-6 border border-slate-600/40 shadow-2xl"
                      style={{
                        shadowColor: '#8b5cf6',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                              <Users size={20} color="#ffffff" />
                            </View>
                            <Text className="text-slate-100 font-bold text-xl">
                              Study Group {index + 1}
                            </Text>
                          </View>
                          
                          {/* Student Avatars */}
                          <View className="flex-row flex-wrap space-x-2">
                            {cluster.students.map((studentName, studentIndex) => {
                              const studentData = data.find(s => s.name === studentName);
                              const studentDataIndex = data.findIndex(s => s.name === studentName);
                              const avatarColors = [
                                'from-blue-500 to-cyan-600',
                                'from-purple-500 to-indigo-600', 
                                'from-emerald-500 to-teal-600',
                                'from-amber-500 to-orange-600',
                                'from-pink-500 to-rose-600'
                              ];
                              
                              return (
                                <MotiView
                                  key={studentName}
                                  from={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ 
                                    type: 'spring', 
                                    duration: 400, 
                                    delay: 400 + index * 200 + studentIndex * 100 
                                  }}
                                  className="mb-2"
                                >
                                  <View className={`bg-gradient-to-br ${avatarColors[studentDataIndex % avatarColors.length]} rounded-2xl px-4 py-2 border border-white/20 shadow-lg`}>
                                    <Text className="text-white text-sm font-bold">
                                      {studentName}
                                    </Text>
                                    <Text className="text-white/80 text-xs">
                                      {studentData?.pyqs_attempted || 0} PYQs
                                    </Text>
                                  </View>
                                </MotiView>
                              );
                            })}
                          </View>
                        </View>
                        
                        {/* Cluster Intensity Donut */}
                        <View className="items-center">
                          <View className="relative w-20 h-20">
                            <View className="absolute inset-0 rounded-full border-4 border-slate-600/60" />
                            <MotiView
                              from={{ rotate: '0deg' }}
                              animate={{ rotate: `${cluster.avgIntensity * 360}deg` }}
                              transition={{ type: 'spring', duration: 1200, delay: 600 + index * 200 }}
                              className="absolute inset-0 rounded-full border-4 border-transparent"
                              style={{
                                borderTopColor: getIntensityColor(cluster.avgIntensity).bg,
                                borderRightColor: cluster.avgIntensity > 0.25 ? getIntensityColor(cluster.avgIntensity).bg : 'transparent',
                                borderBottomColor: cluster.avgIntensity > 0.5 ? getIntensityColor(cluster.avgIntensity).bg : 'transparent',
                                borderLeftColor: cluster.avgIntensity > 0.75 ? getIntensityColor(cluster.avgIntensity).bg : 'transparent',
                              }}
                            />
                            <View className="absolute inset-0 items-center justify-center">
                              <Text 
                                className="text-lg font-bold"
                                style={{ color: getIntensityColor(cluster.avgIntensity).bg }}
                              >
                                {(cluster.avgIntensity * 100).toFixed(0)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-slate-400 text-xs mt-2 text-center">
                            avg intensity
                          </Text>
                        </View>
                      </View>

                      {/* Common Gaps with Enhanced Styling */}
                      <View>
                        <Text className="text-slate-100 font-bold text-lg mb-4">
                          Shared Learning Gaps ({cluster.commonGaps.length})
                        </Text>
                        <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {cluster.commonGaps.map((gap, gapIndex) => (
                            <MotiView
                              key={gap}
                              from={{ opacity: 0, scale: 0.8, rotateY: '45deg' }}
                              animate={{ opacity: 1, scale: 1, rotateY: '0deg' }}
                              transition={{ 
                                type: 'spring', 
                                duration: 600, 
                                delay: 800 + index * 200 + gapIndex * 100 
                              }}
                              className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-4 border border-slate-600/40 shadow-lg"
                              style={{
                                shadowColor: '#6366f1',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                              }}
                            >
                              <View className="flex-row items-center mb-2">
                                <View className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-2">
                                  <Text className="text-white font-bold text-xs">
                                    {gapIndex + 1}
                                  </Text>
                                </View>
                                <Text className="text-slate-100 font-semibold text-sm flex-1">
                                  {gap.replace(/([A-Z])/g, ' $1').trim()}
                                </Text>
                              </View>
                              
                              {/* Gap intensity indicator */}
                              <View className="w-full bg-slate-600/60 rounded-full h-2">
                                <MotiView
                                  from={{ width: '0%' }}
                                  animate={{ width: `${cluster.avgIntensity * 100}%` }}
                                  transition={{ 
                                    type: 'spring', 
                                    duration: 1000, 
                                    delay: 1000 + index * 200 + gapIndex * 100 
                                  }}
                                  className="h-2 rounded-full"
                                  style={{ backgroundColor: getIntensityColor(cluster.avgIntensity).bg }}
                                />
                              </View>
                            </MotiView>
                          ))}
                        </View>
                      </View>

                      {/* Enhanced Cluster Insights */}
                      <View className="mt-6 pt-4 border-t border-slate-600/30">
                        <View className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-4 border border-cyan-500/20">
                          <View className="flex-row items-center mb-2">
                            <View className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full items-center justify-center mr-2">
                              <Text className="text-white text-xs">💡</Text>
                            </View>
                            <Text className="text-cyan-300 font-bold text-base">
                              AI Study Group Recommendation
                            </Text>
                          </View>
                          <Text className="text-cyan-200 text-sm leading-6">
                            These {cluster.students.length} students share {cluster.commonGaps.length} critical learning gaps 
                            with {(cluster.avgIntensity * 100).toFixed(0)}% average intensity. 
                            <Text className="font-bold text-cyan-100"> Recommended: Form a focused study group</Text> to 
                            tackle these challenges collaboratively and accelerate learning through peer support.
                          </Text>
                        </View>
                      </View>
                    </MotiView>
                  ))}
                </View>
              ) : (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 600, delay: 400 }}
                  className="items-center py-16"
                >
                  <View className="w-20 h-20 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-3xl items-center justify-center mb-6 shadow-xl">
                    <Users size={40} color="#64748b" />
                  </View>
                  <Text className="text-2xl font-bold text-slate-100 mb-3 text-center">
                    No Clear Clusters Detected
                  </Text>
                  <Text className="text-slate-300 text-lg text-center max-w-md leading-7">
                    Students have diverse gap patterns with minimal overlap. 
                    <Text className="font-bold text-purple-400"> Individual mentoring</Text> may be more effective 
                    than group study for this cohort.
                  </Text>
                </MotiView>
              )}
            </MotiView>
          )}

          {/* Legend */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="p-6 border-t border-slate-700/30 bg-gradient-to-br from-slate-900/40 to-slate-800/40"
          >
            <Text className="text-slate-100 font-bold text-lg mb-6 text-center">Gap Intensity Legend</Text>
            <View className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <View className="flex-row items-center justify-center">
                <View className="w-6 h-6 rounded-xl bg-red-600 mr-3 shadow-lg" />
                <View>
                  <Text className="text-red-300 text-sm font-semibold">Critical</Text>
                  <Text className="text-red-400/80 text-xs">80-100%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-6 h-6 rounded-xl bg-red-500 mr-3 shadow-lg" />
                <View>
                  <Text className="text-red-300 text-sm font-semibold">High</Text>
                  <Text className="text-red-400/80 text-xs">60-79%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-6 h-6 rounded-xl bg-amber-500 mr-3 shadow-lg" />
                <View>
                  <Text className="text-amber-300 text-sm font-semibold">Medium</Text>
                  <Text className="text-amber-400/80 text-xs">40-59%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-6 h-6 rounded-xl bg-yellow-500 mr-3 shadow-lg" />
                <View>
                  <Text className="text-yellow-300 text-sm font-semibold">Low</Text>
                  <Text className="text-yellow-400/80 text-xs">20-39%</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-center">
                <View className="w-6 h-6 rounded-xl bg-emerald-500 mr-3 shadow-lg" />
                <View>
                  <Text className="text-emerald-300 text-sm font-semibold">Minimal</Text>
                  <Text className="text-emerald-400/80 text-xs">0-19%</Text>
                </View>
              </View>
            </View>
            
            {/* Interactive Guide */}
            <View className="mt-6 bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-300 text-sm text-center leading-6">
                💡 <Text className="font-bold text-cyan-400">Interactive Features:</Text> Hover cells for details • 
                Pulsing indicates critical gaps • Toggle between individual and cluster views • 
                Tap student avatars for profile details
              </Text>
            </View>
          </MotiView>
        </MotiView>

        {/* Cohort Progress Bar */}
        <MotiView
          from={{ opacity: 0, translateY: 40, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1800 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-8 border border-slate-700/50 shadow-2xl mb-8"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <MotiView
                from={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 2000 }}
                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
                style={{
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <TrendingUp size={24} color="#ffffff" />
                
                {/* Rotating glow */}
                <MotiView
                  from={{ rotate: '0deg', scale: 1 }}
                  animate={{ rotate: '360deg', scale: 1.3 }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 8000,
                  }}
                  className="absolute inset-0 rounded-2xl bg-emerald-400/20"
                />
              </MotiView>
              
              <View className="flex-1">
                <Text className="text-3xl font-bold text-slate-100 mb-1">
                  Cohort Progress Tracker
                </Text>
                <Text className="text-slate-400 text-lg">
                  Collective journey towards NEET prep mastery
                </Text>
              </View>
            </View>

            {/* Progress Percentage Badge */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 800, delay: 2200 }}
              className="items-center"
            >
              <View className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-2xl px-6 py-4 border-2 border-emerald-500/50 shadow-2xl">
                <Text className="text-emerald-400 font-bold text-2xl">
                  {cohortProgressPercent.toFixed(1)}%
                </Text>
                <Text className="text-emerald-300 text-sm text-center font-bold">
                  complete
                </Text>
              </View>
              
              {/* Pulsing ring for progress */}
              <MotiView
                from={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 2500,
                }}
                className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50"
              />
            </MotiView>
          </View>

          {/* Progress Bar Container */}
          <View className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 rounded-2xl p-8 border border-slate-600/40 shadow-inner">
            {/* Progress Bar */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-100 font-bold text-xl">Collective Achievement</Text>
                <Text className="text-emerald-400 font-bold text-xl">
                  {totalPYQsAttempted.toLocaleString()} / {(9960).toLocaleString()} PYQs
                </Text>
              </View>
              
              {/* Main Progress Bar */}
              <View className="w-full bg-slate-700/80 rounded-2xl h-8 overflow-hidden shadow-2xl border border-slate-600/50">
                <MotiView
                  from={{ width: '0%' }}
                  animate={{ width: `${cohortProgressPercent}%` }}
                  transition={{ 
                    type: 'spring', 
                    duration: 2500, 
                    delay: 2400,
                    damping: 15,
                    stiffness: 100
                  }}
                  className="h-8 rounded-2xl shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #059669 0%, #10b981 30%, #34d399 70%, #6ee7b7 100%)',
                    shadowColor: '#10b981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {/* Shimmer effect */}
                  <MotiView
                    from={{ translateX: '-100%' }}
                    animate={{ translateX: '400%' }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 3000,
                      delay: 3000,
                    }}
                    className="absolute inset-0 w-1/3"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      transform: [{ skewX: '-20deg' }],
                    }}
                  />
                  
                  {/* Progress glow */}
                  <MotiView
                    from={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 2000,
                    }}
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
                    }}
                  />
                </MotiView>
                
                {/* Progress milestone markers */}
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'spring',
                    duration: 600,
                    delay: 3500,
                  }}
                  className="absolute inset-0 flex-row items-center justify-between px-2"
                >
                  {[25, 50, 75].map((milestone) => (
                    <View 
                      key={milestone}
                      className={`w-2 h-2 rounded-full ${
                        cohortProgressPercent >= milestone ? 'bg-white shadow-lg' : 'bg-slate-500/50'
                      }`}
                      style={{
                        shadowColor: '#ffffff',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: cohortProgressPercent >= milestone ? 0.8 : 0,
                        shadowRadius: 4,
                        elevation: cohortProgressPercent >= milestone ? 4 : 0,
                      }}
                    />
                  ))}
                </MotiView>
              </View>
              
              {/* Progress Labels */}
              <View className="flex-row justify-between mt-4">
                <Text className="text-slate-500 text-sm">0 PYQs</Text>
                <Text className="text-emerald-400 text-sm font-bold">
                  {cohortProgressPercent.toFixed(1)}% Complete
                </Text>
                <Text className="text-slate-500 text-sm">9,960 PYQs</Text>
              </View>
            </View>

            {/* Detailed Metrics Grid */}
            <View className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2600 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5 shadow-lg"
                style={{
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl items-center justify-center mr-2 shadow-lg">
                    <Target size={16} color="#ffffff" />
                  </View>
                  <Text className="text-blue-300 font-bold text-base">Total PYQs</Text>
                </View>
                <Text className="text-blue-200 text-2xl font-bold mb-1">
                  {totalPYQsAttempted.toLocaleString()}
                </Text>
                <Text className="text-blue-400/80 text-sm">
                  attempted
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2700 }}
                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5 shadow-lg"
                style={{
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl items-center justify-center mr-2 shadow-lg">
                    <Clock size={16} color="#ffffff" />
                  </View>
                  <Text className="text-emerald-300 font-bold text-base">Time Spent</Text>
                </View>
                <Text className="text-emerald-200 text-2xl font-bold mb-1">
                  {(totalMinutesSpent / 60).toFixed(0)}h
                </Text>
                <Text className="text-emerald-400/80 text-sm">
                  {totalMinutesSpent.toLocaleString()} min
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2800 }}
                className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-lg"
                style={{
                  shadowColor: '#f59e0b',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl items-center justify-center mr-2 shadow-lg">
                    <Target size={16} color="#ffffff" />
                  </View>
                  <Text className="text-amber-300 font-bold text-base">Remaining</Text>
                </View>
                <Text className="text-amber-200 text-2xl font-bold mb-1">
                  {(remainingPYQs / 1000).toFixed(1)}k
                </Text>
                <Text className="text-amber-400/80 text-sm">
                  PYQs left
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 2900 }}
                className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-5 shadow-lg"
                style={{
                  shadowColor: '#8b5cf6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-2 shadow-lg">
                    <Clock size={16} color="#ffffff" />
                  </View>
                  <Text className="text-purple-300 font-bold text-base">ETA</Text>
                </View>
                <Text className="text-purple-200 text-2xl font-bold mb-1">
                  {(remainingHours / 24).toFixed(0)}d
                </Text>
                <Text className="text-purple-400/80 text-sm">
                  {remainingHours.toFixed(0)}h left
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Progress Insights */}
          <View className="mt-6 bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-2xl p-6 border border-slate-600/40 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <Text className="text-slate-100 font-bold text-lg">Cohort Progress Insights</Text>
            </View>
            
            <View className="space-y-3">
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <Text className="text-emerald-200 text-base leading-7">
                  <Text className="font-bold text-emerald-300">Collective Achievement:</Text> {cohortProgressPercent.toFixed(1)}% of total NEET prep completed
                </Text>
              </View>
              
              <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <Text className="text-blue-200 text-base leading-7">
                  <Text className="font-bold text-blue-300">Study Time Invested:</Text> {(totalMinutesSpent / 60).toFixed(0)} hours across {totalStudents} students
                </Text>
              </View>
              
              <View className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <Text className="text-amber-200 text-base leading-7">
                  <Text className="font-bold text-amber-300">Remaining Effort:</Text> {(remainingHours / 24).toFixed(0)} days worth of study time left
                </Text>
              </View>
              
              <View className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <Text className="text-purple-200 text-base leading-7">
                  <Text className="font-bold text-purple-300">Momentum Analysis:</Text> {
                    cohortProgressPercent >= 20 
                      ? "Strong cohort momentum! The group is making excellent progress towards NEET prep completion."
                      : cohortProgressPercent >= 10
                      ? "Good progress with room for acceleration. Consider group study sessions for challenging topics."
                      : "Early stage preparation. Focus on building consistent study habits and addressing critical gaps."
                  }
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Cohort Analysis Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1200 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Cohort Gap Analysis
            </Text>
          </View>

          <View className="space-y-4">
            {heatmapData
              .sort((a, b) => {
                const avgIntensityA = a.students.reduce((sum, s) => sum + s.gap_intensity, 0) / a.students.length;
                const avgIntensityB = b.students.reduce((sum, s) => sum + s.gap_intensity, 0) / b.students.length;
                return avgIntensityB - avgIntensityA;
              })
              .slice(0, 5) // Top 5 most challenging topics
              .map((topicData, index) => {
                const avgIntensity = topicData.students.reduce((sum, s) => sum + s.gap_intensity, 0) / topicData.students.length;
                const studentsAffected = topicData.students.length;
                const colors = getIntensityColor(avgIntensity);

                return (
                  <MotiView
                    key={topicData.topic}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 1400 + index * 150 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        <Text className="text-slate-100 font-semibold text-base mb-1">
                          {topicData.topic.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          {studentsAffected} of {totalStudents} students affected
                        </Text>
                      </View>
                      
                      {/* Intensity Badge */}
                      <View 
                        className="px-3 py-2 rounded-lg border"
                        style={{ 
                          backgroundColor: `${colors.bg}20`,
                          borderColor: `${colors.bg}50`
                        }}
                      >
                        <Text 
                          className="font-bold text-lg"
                          style={{ color: colors.bg }}
                        >
                          {(avgIntensity * 100).toFixed(0)}%
                        </Text>
                        <Text className="text-slate-400 text-xs text-center">
                          avg intensity
                        </Text>
                      </View>
                    </View>

                    {/* Student Distribution */}
                    <View className="mt-3 flex-row flex-wrap">
                      {topicData.students.map((student) => {
                        const studentColors = getIntensityColor(student.gap_intensity);
                        return (
                          <View 
                            key={student.student_id}
                            className="mr-2 mb-2 px-2 py-1 rounded-full border"
                            style={{ 
                              backgroundColor: `${studentColors.bg}20`,
                              borderColor: `${studentColors.bg}50`
                            }}
                          >
                            <Text 
                              className="text-xs font-medium"
                              style={{ color: studentColors.bg }}
                            >
                              {student.name}: {(student.gap_intensity * 100).toFixed(0)}%
                            </Text>
                          </View>
                        );
                      })}
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
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <Target size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Cohort Insights</Text>
          </View>
          
          <View className="space-y-3">
            <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Text className="text-red-300 font-semibold mb-2">
                🚨 Most Critical Topic
              </Text>
              <Text className="text-red-200 text-sm">
                <Text className="font-bold">
                  {heatmapData.reduce((max, topic) => {
                    const avgIntensity = topic.students.reduce((sum, s) => sum + s.gap_intensity, 0) / topic.students.length;
                    const maxAvgIntensity = max.students.reduce((sum, s) => sum + s.gap_intensity, 0) / max.students.length;
                    return avgIntensity > maxAvgIntensity ? topic : max;
                  }).topic.replace(/([A-Z])/g, ' $1').trim()}
                </Text> affects {
                  heatmapData.reduce((max, topic) => {
                    const avgIntensity = topic.students.reduce((sum, s) => sum + s.gap_intensity, 0) / topic.students.length;
                    const maxAvgIntensity = max.students.reduce((sum, s) => sum + s.gap_intensity, 0) / max.students.length;
                    return avgIntensity > maxAvgIntensity ? topic : max;
                  }).students.length
                } students with high intensity.
              </Text>
            </View>

            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Text className="text-emerald-300 font-semibold mb-2">
                🎯 Study Group Opportunities
              </Text>
              <Text className="text-emerald-200 text-sm">
                {clusters.length > 0 
                  ? `${clusters.length} potential study groups identified based on shared learning gaps.`
                  : 'Students have diverse gap patterns - consider individual mentoring approaches.'
                }
              </Text>
            </View>

            <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Text className="text-blue-300 font-semibold mb-2">
                📊 Cohort Performance
              </Text>
              <Text className="text-blue-200 text-sm">
                Average gap intensity: <Text className="font-bold">{(averageIntensity * 100).toFixed(1)}%</Text> • 
                Critical gaps: <Text className="font-bold">{criticalGaps}</Text> across all students
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>

      {/* Enhanced Tooltip */}
      {selectedTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/98 rounded-2xl p-6 border border-slate-600/60 shadow-2xl z-50 backdrop-blur-sm"
          style={{
            left: Math.max(10, Math.min(selectedTooltip.position.x - 140, width - 290)),
            top: selectedTooltip.position.y - 180,
            width: 280,
            shadowColor: getIntensityColor(selectedTooltip.gap_intensity).glow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setSelectedTooltip(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/60 items-center justify-center active:scale-90 shadow-lg"
          >
            <X size={14} color="#94a3b8" />
          </Pressable>

          {/* Enhanced Tooltip Content */}
          <View className="pr-8">
            <View className="flex-row items-center mb-4">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-lg"
                style={{ backgroundColor: getIntensityColor(selectedTooltip.gap_intensity).bg }}
              >
                <Text className="text-white font-bold text-lg">
                  {(selectedTooltip.gap_intensity * 100).toFixed(0)}%
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-100 font-bold text-lg">
                  {selectedTooltip.student}
                </Text>
                <Text className="text-slate-400 text-sm">
                  Learning Gap Analysis
                </Text>
              </View>
            </View>
            
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                {selectedTooltip.topic.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Text className="text-slate-300 text-sm">
                Gap Sentence: Understanding and application challenges in this topic area
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-400 text-sm">Gap Intensity</Text>
                <View className="flex-row items-center">
                  <View 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: getIntensityColor(selectedTooltip.gap_intensity).bg }}
                  />
                  <Text 
                    className="text-sm font-bold"
                    style={{ color: getIntensityColor(selectedTooltip.gap_intensity).bg }}
                  >
                    {(selectedTooltip.gap_intensity * 100).toFixed(0)}% ({getIntensityColor(selectedTooltip.gap_intensity).label})
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-400 text-sm">Est. Time Spent</Text>
                <Text className="text-slate-300 text-sm font-semibold">
                  {selectedTooltip.minutes_spent.toFixed(1)} minutes
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-400 text-sm">Priority Level</Text>
                <Text className={`text-sm font-bold ${
                  selectedTooltip.gap_intensity >= 0.8 ? 'text-red-400' :
                  selectedTooltip.gap_intensity >= 0.6 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedTooltip.gap_intensity >= 0.8 ? 'Critical' :
                   selectedTooltip.gap_intensity >= 0.6 ? 'High' : 'Moderate'}
                </Text>
              </View>
            </View>
            
            {/* Action Recommendation */}
            <View className="mt-4 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-4 border border-cyan-500/20">
              <Text className="text-cyan-300 font-semibold text-sm mb-2">
                💡 Recommendation
              </Text>
              <Text className="text-cyan-200 text-sm leading-5">
                {selectedTooltip.gap_intensity >= 0.8 
                  ? "Critical gap requiring immediate attention. Consider intensive review and practice sessions."
                  : selectedTooltip.gap_intensity >= 0.6
                  ? "High priority gap. Schedule focused study time and seek additional resources."
                  : "Moderate gap. Include in regular review schedule and monitor progress."
                }
              </Text>
            </View>
          </View>
        </MotiView>
      )}
    </View>
  );
}