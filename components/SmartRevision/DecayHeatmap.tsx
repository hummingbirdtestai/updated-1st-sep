import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Calendar, TrendingDown, Info } from 'lucide-react-native';

interface DayData {
  day: string;
  retention: number;
}

interface SubjectData {
  subject: string;
  days: DayData[];
}

interface DecayHeatmapProps {
  data: SubjectData[];
  onCellSelect?: (subject: string, day: string, retention: number) => void;
}

interface CellProps {
  subject: string;
  dayData: DayData;
  onPress: () => void;
  shouldPulse: boolean;
}

function HeatmapCell({ subject, dayData, onPress, shouldPulse }: CellProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Pulse animation for low retention cells
  useEffect(() => {
    if (!shouldPulse) return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 500);
    
    return () => clearInterval(interval);
  }, [shouldPulse]);

  // Get color based on retention score
  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return { bg: '#10b981', border: '#059669', label: 'High' }; // Green
    if (retention >= 60) return { bg: '#f59e0b', border: '#d97706', label: 'Medium' }; // Yellow/Amber
    return { bg: '#ef4444', border: '#dc2626', label: 'Low' }; // Red
  };

  const colors = getRetentionColor(dayData.retention);
  const pulseScale = shouldPulse ? (1 + Math.sin(pulsePhase) * 0.1) : 1;
  const pulseOpacity = shouldPulse ? (0.8 + Math.sin(pulsePhase) * 0.2) : 1;

  return (
    <MotiView
      animate={{
        scale: pulseScale,
        opacity: pulseOpacity,
      }}
      transition={{
        type: 'timing',
        duration: 500,
      }}
    >
      <Pressable
        onPress={onPress}
        className="w-16 h-12 rounded-lg border-2 items-center justify-center active:scale-95"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: pulseOpacity,
        }}
      >
        <Text className="text-white font-bold text-xs">
          {dayData.retention}%
        </Text>
        <Text className="text-white/80 text-xs">
          {dayData.day.replace('Day ', 'D')}
        </Text>
      </Pressable>
    </MotiView>
  );
}

export default function DecayHeatmap({ data = [], onCellSelect }: DecayHeatmapProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Get all unique days from the data
  const getAllDays = () => {
    const daySet = new Set<string>();
    data.forEach(subject => {
      subject.days.forEach(day => daySet.add(day.day));
    });
    return Array.from(daySet).sort();
  };

  const allDays = getAllDays();

  const handleCellPress = (subject: string, dayData: DayData) => {
    onCellSelect?.(subject, dayData.day, dayData.retention);
  };

  if (data.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 600 }}
        className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/40 shadow-lg"
      >
        <View className="items-center">
          <View className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl items-center justify-center mb-4">
            <Calendar size={32} color="#f97316" />
          </View>
          <Text className="text-xl font-bold text-slate-100 mb-2 text-center">
            No Decay Data Available
          </Text>
          <Text className="text-slate-300 text-base text-center">
            Complete some study sessions to see your memory decay patterns
          </Text>
        </View>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg items-center justify-center mr-3">
            <TrendingDown size={16} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-100">
              Memory Decay Heatmap
            </Text>
            <Text className="text-slate-400 text-sm">
              Knowledge retention over time • {data.length} subjects tracked
            </Text>
          </View>
        </View>

        {/* Info Icon */}
        <View className="w-8 h-8 bg-slate-700/50 rounded-full items-center justify-center">
          <Info size={16} color="#94a3b8" />
        </View>
      </View>

      {/* Heatmap Grid */}
      <ScrollView 
        className="p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Column Headers (Days) */}
        <View className="flex-row mb-4">
          <View className="w-24" /> {/* Space for subject labels */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <View className="flex-row space-x-2">
              {allDays.map((day, index) => (
                <MotiView
                  key={day}
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'spring', duration: 400, delay: index * 50 }}
                  className="w-16 items-center"
                >
                  <Text className="text-slate-300 font-semibold text-xs text-center">
                    {day}
                  </Text>
                </MotiView>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Heatmap Rows */}
        <View className="space-y-3">
          {data.map((subjectData, subjectIndex) => (
            <MotiView
              key={subjectData.subject}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: subjectIndex * 100 + 300 }}
              className="flex-row items-center"
            >
              {/* Subject Label */}
              <View className="w-24 mr-4">
                <Text className="text-slate-100 font-semibold text-sm text-right">
                  {subjectData.subject}
                </Text>
              </View>

              {/* Day Cells */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                <View className="flex-row space-x-2">
                  {allDays.map((day) => {
                    const dayData = subjectData.days.find(d => d.day === day);
                    
                    if (!dayData) {
                      // Empty cell for missing data
                      return (
                        <View
                          key={`${subjectData.subject}-${day}`}
                          className="w-16 h-12 rounded-lg border-2 border-slate-600/30 bg-slate-700/20 items-center justify-center"
                        >
                          <Text className="text-slate-500 text-xs">-</Text>
                        </View>
                      );
                    }

                    return (
                      <HeatmapCell
                        key={`${subjectData.subject}-${day}`}
                        subject={subjectData.subject}
                        dayData={dayData}
                        onPress={() => handleCellPress(subjectData.subject, dayData)}
                        shouldPulse={dayData.retention < 60}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </MotiView>
          ))}
        </View>

        {/* Legend */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <Text className="text-slate-100 font-semibold mb-3">Retention Legend</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-emerald-500 rounded mr-2" />
              <Text className="text-slate-300 text-sm">High (80-100%)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-amber-500 rounded mr-2" />
              <Text className="text-slate-300 text-sm">Medium (60-79%)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 bg-red-500 rounded mr-2" />
              <Text className="text-slate-300 text-sm">Low (<60%)</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-xs mt-2 text-center">
            💡 Pulsing cells indicate critical review needed
          </Text>
        </MotiView>
      </ScrollView>
    </MotiView>
  );
}