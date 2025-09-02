import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Grid3x3, ToggleLeft, ToggleRight, X, Clock, Target, TrendingUp } from 'lucide-react-native';
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
    if (intensity >= 0.8) return { bg: '#dc2626', opacity: 0.9, label: 'Critical' }; // Dark red
    if (intensity >= 0.6) return { bg: '#ef4444', opacity: 0.8, label: 'High' }; // Red
    if (intensity >= 0.4) return { bg: '#f59e0b', opacity: 0.7, label: 'Medium' }; // Amber
    if (intensity >= 0.2) return { bg: '#eab308', opacity: 0.6, label: 'Low' }; // Yellow
    return { bg: '#10b981', opacity: 0.5, label: 'Minimal' }; // Green
  };

  // Handle cell press
  const handleCellPress = (student: string, topic: string, gap_intensity: number, minutes_spent: number, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setSelectedTooltip({
      student,
      topic,
      gap_intensity,
      minutes_spent,
      position,
    });
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
          onPress={() => setShowClusters(!showClusters)}
          className="flex-row items-center bg-slate-700/50 rounded-lg px-3 py-2 active:scale-95"
        >
          {showClusters ? (
            <ToggleRight size={20} color="#10b981" />
          ) : (
            <ToggleLeft size={20} color="#94a3b8" />
          )}
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
                  <View className="w-32" /> {/* Space for student names */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                  >
                    <View className="flex-row space-x-2">
                      {allTopics.map((topic, index) => (
                        <MotiView
                          key={topic}
                          from={{ opacity: 0, translateY: -10 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{ type: 'spring', duration: 400, delay: 800 + index * 50 }}
                          className="w-24 items-center"
                        >
                          <Text className="text-slate-300 font-semibold text-xs text-center" numberOfLines={2}>
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
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 1000 + studentIndex * 100 }}
                    className="flex-row items-center"
                  >
                    {/* Student Name */}
                    <View className="w-32 mr-4">
                      <View className="bg-slate-700/60 rounded-lg p-3 border border-slate-600/40">
                        <Text className="text-slate-100 font-semibold text-sm text-center">
                          {student.name}
                        </Text>
                        <Text className="text-slate-400 text-xs text-center mt-1">
                          {student.pyqs_attempted} PYQs
                        </Text>
                      </View>
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
                          const colors = getIntensityColor(intensity);
                          const shouldPulse = intensity >= 0.8;
                          const pulseScale = shouldPulse ? (1 + Math.sin(animationPhase) * 0.1) : 1;
                          const estimatedMinutes = student.total_minutes_spent * intensity * 0.1;

                          return (
                            <MotiView
                              key={`${student.student_id}-${topic}`}
                              from={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: colors.opacity, 
                                scale: pulseScale 
                              }}
                              transition={{ 
                                type: 'spring', 
                                duration: 600, 
                                delay: 1200 + studentIndex * 100 + allTopics.indexOf(topic) * 20 
                              }}
                            >
                              <Pressable
                                onPress={(event) => handleCellPress(
                                  student.name, 
                                  topic, 
                                  intensity, 
                                  estimatedMinutes, 
                                  event
                                )}
                                className="w-24 h-16 rounded-lg border-2 border-slate-600/30 items-center justify-center active:scale-95"
                                style={{
                                  backgroundColor: intensity > 0 ? colors.bg : '#374151',
                                  opacity: intensity > 0 ? colors.opacity : 0.3,
                                  shadowColor: intensity >= 0.8 ? colors.bg : 'transparent',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 4,
                                  elevation: intensity >= 0.8 ? 4 : 0,
                                }}
                              >
                                {intensity > 0 ? (
                                  <>
                                    <Text className="text-white font-bold text-sm">
                                      {(intensity * 100).toFixed(0)}%
                                    </Text>
                                    <Text className="text-white/80 text-xs">
                                      {colors.label}
                                    </Text>
                                  </>
                                ) : (
                                  <Text className="text-slate-500 text-xs">-</Text>
                                )}
                              </Pressable>
                            </MotiView>
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
            <View className="p-6">
              <Text className="text-lg font-semibold text-slate-100 mb-4">
                Student Clusters by Similar Gap Patterns
              </Text>
              
              {clusters.length > 0 ? (
                <View className="space-y-6">
                  {clusters.map((cluster, index) => (
                    <MotiView
                      key={cluster.id}
                      from={{ opacity: 0, translateY: 30 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', duration: 600, delay: 800 + index * 200 }}
                      className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30"
                    >
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1">
                          <Text className="text-slate-100 font-bold text-lg mb-2">
                            Cluster {index + 1}
                          </Text>
                          <View className="flex-row flex-wrap space-x-2">
                            {cluster.students.map((studentName, studentIndex) => (
                              <View 
                                key={studentName}
                                className="bg-purple-500/20 rounded-full px-3 py-1 border border-purple-500/30 mb-2"
                              >
                                <Text className="text-purple-300 text-sm font-medium">
                                  {studentName}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        
                        {/* Cluster Intensity */}
                        <View className="items-center">
                          <View 
                            className="w-16 h-16 rounded-full border-4 items-center justify-center"
                            style={{ 
                              borderColor: getIntensityColor(cluster.avgIntensity).bg,
                              backgroundColor: `${getIntensityColor(cluster.avgIntensity).bg}20`
                            }}
                          >
                            <Text 
                              className="text-lg font-bold"
                              style={{ color: getIntensityColor(cluster.avgIntensity).bg }}
                            >
                              {(cluster.avgIntensity * 100).toFixed(0)}
                            </Text>
                          </View>
                          <Text className="text-slate-400 text-xs mt-1">
                            avg intensity
                          </Text>
                        </View>
                      </View>

                      {/* Common Gaps */}
                      <View>
                        <Text className="text-slate-300 font-semibold mb-3">
                          Common Learning Gaps ({cluster.commonGaps.length})
                        </Text>
                        <View className="flex-row flex-wrap">
                          {cluster.commonGaps.map((gap, gapIndex) => (
                            <MotiView
                              key={gap}
                              from={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ 
                                type: 'spring', 
                                duration: 400, 
                                delay: 1000 + index * 200 + gapIndex * 100 
                              }}
                              className="bg-slate-800/40 rounded-lg px-3 py-2 mr-2 mb-2 border border-slate-600/30"
                            >
                              <Text className="text-slate-200 text-sm">
                                {gap.replace(/([A-Z])/g, ' $1').trim()}
                              </Text>
                            </MotiView>
                          ))}
                        </View>
                      </View>

                      {/* Cluster Insights */}
                      <View className="mt-4 pt-4 border-t border-slate-600/30">
                        <Text className="text-slate-400 text-sm">
                          💡 <Text className="font-semibold text-cyan-400">Study Group Opportunity:</Text> These students 
                          share {cluster.commonGaps.length} common learning gaps. Consider forming a study group 
                          to tackle these challenges together.
                        </Text>
                      </View>
                    </MotiView>
                  ))}
                </View>
              ) : (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 600, delay: 800 }}
                  className="items-center py-12"
                >
                  <View className="w-16 h-16 bg-slate-700/50 rounded-2xl items-center justify-center mb-4">
                    <Users size={32} color="#64748b" />
                  </View>
                  <Text className="text-xl font-bold text-slate-100 mb-2 text-center">
                    No Clear Clusters Found
                  </Text>
                  <Text className="text-slate-300 text-base text-center max-w-md">
                    Students have diverse gap patterns. Switch to individual view to see detailed breakdown.
                  </Text>
                </MotiView>
              )}
            </View>
          )}

          {/* Legend */}
          <View className="p-6 border-t border-slate-700/30 bg-slate-900/20">
            <Text className="text-slate-100 font-semibold mb-4 text-center">Intensity Legend</Text>
            <View className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-red-600 mr-2" />
                <Text className="text-slate-300 text-sm">Critical (80%+)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-red-500 mr-2" />
                <Text className="text-slate-300 text-sm">High (60-79%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-amber-500 mr-2" />
                <Text className="text-slate-300 text-sm">Medium (40-59%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-yellow-500 mr-2" />
                <Text className="text-slate-300 text-sm">Low (20-39%)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-emerald-500 mr-2" />
                <Text className="text-slate-300 text-sm">Minimal (0-19%)</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs mt-3 text-center">
              💡 Pulsing cells indicate critical gaps (≥80%) • Tap cells for detailed analysis
            </Text>
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

      {/* Tooltip */}
      {selectedTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
          style={{
            left: Math.max(10, Math.min(selectedTooltip.position.x - 120, width - 250)),
            top: selectedTooltip.position.y - 140,
            width: 240,
            shadowColor: getIntensityColor(selectedTooltip.gap_intensity).bg,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setSelectedTooltip(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700/50 items-center justify-center"
          >
            <X size={12} color="#94a3b8" />
          </Pressable>

          {/* Tooltip Content */}
          <View className="pr-6">
            <Text className="text-slate-100 font-bold text-sm mb-1">
              {selectedTooltip.student}
            </Text>
            <Text className="text-slate-300 text-xs mb-3">
              {selectedTooltip.topic.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Gap Intensity</Text>
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: getIntensityColor(selectedTooltip.gap_intensity).bg }}
                >
                  {(selectedTooltip.gap_intensity * 100).toFixed(0)}%
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Est. Time Spent</Text>
                <Text className="text-slate-300 text-xs">
                  {selectedTooltip.minutes_spent.toFixed(1)}m
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Severity</Text>
                <Text className="text-slate-300 text-xs">
                  {getIntensityColor(selectedTooltip.gap_intensity).label}
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      )}
    </View>
  );
}