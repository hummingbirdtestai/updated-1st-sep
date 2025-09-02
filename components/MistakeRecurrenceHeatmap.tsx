import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { TrendingUp, ArrowLeft, X, Clock, RotateCcw, ChevronRight } from 'lucide-react-native';

interface Topic {
  topic: string;
  recurrence_count: number;
  time_wasted_minutes: number;
}

interface Chapter {
  chapter: string;
  topics: Topic[];
}

interface Subject {
  subject: string;
  chapters: Chapter[];
}

interface TooltipData {
  item: Subject | Chapter | Topic;
  type: 'subject' | 'chapter' | 'topic';
  position: { x: number; y: number };
}

type ViewLevel = 'subjects' | 'chapters' | 'topics';

const mockData: Subject[] = [
  {
    "subject": "Physiology",
    "chapters": [
      {
        "chapter": "Cardiac Physiology",
        "topics": [
          { "topic": "SA Node Pacemaker", "recurrence_count": 11, "time_wasted_minutes": 49.5 },
          { "topic": "AV Node Delay", "recurrence_count": 6, "time_wasted_minutes": 27 },
          { "topic": "Cardiac Output", "recurrence_count": 8, "time_wasted_minutes": 36 },
          { "topic": "Frank-Starling Mechanism", "recurrence_count": 4, "time_wasted_minutes": 18 }
        ]
      },
      {
        "chapter": "Respiratory Physiology",
        "topics": [
          { "topic": "Oxygen Dissociation Curve", "recurrence_count": 9, "time_wasted_minutes": 40.5 },
          { "topic": "Ventilation-Perfusion", "recurrence_count": 7, "time_wasted_minutes": 31.5 },
          { "topic": "Gas Exchange", "recurrence_count": 5, "time_wasted_minutes": 22.5 }
        ]
      },
      {
        "chapter": "Renal Physiology",
        "topics": [
          { "topic": "Glomerular Filtration", "recurrence_count": 12, "time_wasted_minutes": 54 },
          { "topic": "Tubular Reabsorption", "recurrence_count": 8, "time_wasted_minutes": 36 },
          { "topic": "Clearance Calculations", "recurrence_count": 10, "time_wasted_minutes": 45 }
        ]
      }
    ]
  },
  {
    "subject": "Biochemistry",
    "chapters": [
      {
        "chapter": "Enzymes",
        "topics": [
          { "topic": "Michaelis-Menten", "recurrence_count": 15, "time_wasted_minutes": 67.5 },
          { "topic": "Competitive Inhibition", "recurrence_count": 9, "time_wasted_minutes": 40.5 },
          { "topic": "Allosteric Regulation", "recurrence_count": 6, "time_wasted_minutes": 27 }
        ]
      },
      {
        "chapter": "Metabolism",
        "topics": [
          { "topic": "Glycolysis Regulation", "recurrence_count": 7, "time_wasted_minutes": 31.5 },
          { "topic": "Krebs Cycle", "recurrence_count": 5, "time_wasted_minutes": 22.5 },
          { "topic": "Electron Transport", "recurrence_count": 8, "time_wasted_minutes": 36 }
        ]
      },
      {
        "chapter": "Protein Synthesis",
        "topics": [
          { "topic": "Translation Initiation", "recurrence_count": 4, "time_wasted_minutes": 18 },
          { "topic": "Post-translational Modifications", "recurrence_count": 6, "time_wasted_minutes": 27 }
        ]
      }
    ]
  },
  {
    "subject": "Pharmacology",
    "chapters": [
      {
        "chapter": "Autonomic Drugs",
        "topics": [
          { "topic": "Adrenergic Receptors", "recurrence_count": 13, "time_wasted_minutes": 58.5 },
          { "topic": "Cholinergic Agonists", "recurrence_count": 7, "time_wasted_minutes": 31.5 },
          { "topic": "Beta Blockers", "recurrence_count": 9, "time_wasted_minutes": 40.5 }
        ]
      },
      {
        "chapter": "CNS Drugs",
        "topics": [
          { "topic": "Antidepressants", "recurrence_count": 11, "time_wasted_minutes": 49.5 },
          { "topic": "Antipsychotics", "recurrence_count": 8, "time_wasted_minutes": 36 },
          { "topic": "Anxiolytics", "recurrence_count": 5, "time_wasted_minutes": 22.5 }
        ]
      }
    ]
  },
  {
    "subject": "Pathology",
    "chapters": [
      {
        "chapter": "General Pathology",
        "topics": [
          { "topic": "Inflammation", "recurrence_count": 14, "time_wasted_minutes": 63 },
          { "topic": "Neoplasia", "recurrence_count": 10, "time_wasted_minutes": 45 },
          { "topic": "Cell Death", "recurrence_count": 7, "time_wasted_minutes": 31.5 }
        ]
      },
      {
        "chapter": "Systemic Pathology",
        "topics": [
          { "topic": "Cardiovascular Pathology", "recurrence_count": 12, "time_wasted_minutes": 54 },
          { "topic": "Respiratory Pathology", "recurrence_count": 9, "time_wasted_minutes": 40.5 }
        ]
      }
    ]
  }
];

interface HeatmapCellProps {
  item: Subject | Chapter | Topic;
  type: 'subject' | 'chapter' | 'topic';
  onPress: () => void;
  onTooltip: (item: any, type: string, position: { x: number; y: number }) => void;
  maxRecurrence: number;
  maxTimeWasted: number;
  index: number;
}

function HeatmapCell({ 
  item, 
  type, 
  onPress, 
  onTooltip, 
  maxRecurrence, 
  maxTimeWasted, 
  index 
}: HeatmapCellProps) {
  // Calculate aggregated values for subjects and chapters
  const getAggregatedValues = (item: any, type: string) => {
    if (type === 'topic') {
      return {
        recurrence_count: item.recurrence_count,
        time_wasted_minutes: item.time_wasted_minutes
      };
    } else if (type === 'chapter') {
      return {
        recurrence_count: item.topics.reduce((sum: number, topic: Topic) => sum + topic.recurrence_count, 0),
        time_wasted_minutes: item.topics.reduce((sum: number, topic: Topic) => sum + topic.time_wasted_minutes, 0)
      };
    } else { // subject
      return {
        recurrence_count: item.chapters.reduce((sum: number, chapter: Chapter) => 
          sum + chapter.topics.reduce((topicSum: number, topic: Topic) => topicSum + topic.recurrence_count, 0), 0),
        time_wasted_minutes: item.chapters.reduce((sum: number, chapter: Chapter) => 
          sum + chapter.topics.reduce((topicSum: number, topic: Topic) => topicSum + topic.time_wasted_minutes, 0), 0)
      };
    }
  };

  const values = getAggregatedValues(item, type);
  const colorIntensity = values.recurrence_count / maxRecurrence;
  const opacity = Math.max(0.3, values.time_wasted_minutes / maxTimeWasted);

  // Get color based on recurrence count
  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return '#dc2626'; // Dark red
    if (intensity >= 0.6) return '#ef4444'; // Red
    if (intensity >= 0.4) return '#f59e0b'; // Amber
    if (intensity >= 0.2) return '#eab308'; // Yellow
    return '#10b981'; // Green (low recurrence)
  };

  const backgroundColor = getHeatmapColor(colorIntensity);
  const name = type === 'subject' ? item.subject : 
               type === 'chapter' ? item.chapter : 
               item.topic;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 50 }}
      className="m-1"
    >
      <Pressable
        onPress={onPress}
        onLongPress={(event) => {
          const { pageX, pageY } = event.nativeEvent;
          onTooltip(item, type, { x: pageX, y: pageY });
        }}
        className="rounded-xl border-2 border-slate-600/30 overflow-hidden shadow-lg active:scale-95"
        style={{
          backgroundColor,
          opacity,
          minWidth: type === 'topic' ? 120 : type === 'chapter' ? 140 : 160,
          minHeight: type === 'topic' ? 80 : type === 'chapter' ? 100 : 120,
          shadowColor: backgroundColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <MotiView
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 p-4 items-center justify-center"
        >
          <Text className="text-white font-bold text-center text-sm mb-2" numberOfLines={2}>
            {name}
          </Text>
          <View className="items-center">
            <Text className="text-white/90 text-xs font-semibold">
              {values.recurrence_count}x
            </Text>
            <Text className="text-white/70 text-xs">
              {values.time_wasted_minutes.toFixed(1)}m
            </Text>
          </View>
          
          {/* Drill-down indicator */}
          {(type === 'subject' || type === 'chapter') && (
            <View className="absolute bottom-2 right-2">
              <ChevronRight size={12} color="#ffffff" style={{ opacity: 0.7 }} />
            </View>
          )}
        </MotiView>
      </Pressable>
    </MotiView>
  );
}

interface TooltipProps {
  data: TooltipData;
  onClose: () => void;
}

function Tooltip({ data, onClose }: TooltipProps) {
  const { item, type, position } = data;
  
  // Calculate aggregated values
  const getValues = () => {
    if (type === 'topic') {
      return {
        recurrence_count: (item as Topic).recurrence_count,
        time_wasted_minutes: (item as Topic).time_wasted_minutes
      };
    } else if (type === 'chapter') {
      const chapter = item as Chapter;
      return {
        recurrence_count: chapter.topics.reduce((sum, topic) => sum + topic.recurrence_count, 0),
        time_wasted_minutes: chapter.topics.reduce((sum, topic) => sum + topic.time_wasted_minutes, 0)
      };
    } else {
      const subject = item as Subject;
      return {
        recurrence_count: subject.chapters.reduce((sum, chapter) => 
          sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0),
        time_wasted_minutes: subject.chapters.reduce((sum, chapter) => 
          sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.time_wasted_minutes, 0), 0)
      };
    }
  };

  const values = getValues();
  const name = type === 'subject' ? (item as Subject).subject : 
               type === 'chapter' ? (item as Chapter).chapter : 
               (item as Topic).topic;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 120,
        width: 240,
        shadowColor: '#ef4444',
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

      {/* Tooltip Content */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1 capitalize">
          {type}: {name}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Recurrence Count</Text>
            <Text className="text-red-400 text-xs font-semibold">
              {values.recurrence_count}x
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Wasted</Text>
            <Text className="text-amber-400 text-xs font-semibold">
              {values.time_wasted_minutes.toFixed(1)}m
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Avg per Mistake</Text>
            <Text className="text-slate-300 text-xs">
              {(values.time_wasted_minutes / Math.max(values.recurrence_count, 1)).toFixed(1)}m
            </Text>
          </View>
        </View>

        {(type === 'subject' || type === 'chapter') && (
          <View className="mt-3 pt-3 border-t border-slate-600/30">
            <Text className="text-slate-300 text-xs">
              Click to drill down to {type === 'subject' ? 'chapters' : 'topics'}
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}

export default function MistakeRecurrenceHeatmap() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [viewLevel, setViewLevel] = useState<ViewLevel>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);

  // Get current data based on view level
  const getCurrentData = () => {
    switch (viewLevel) {
      case 'subjects':
        return mockData;
      case 'chapters':
        return selectedSubject?.chapters || [];
      case 'topics':
        return selectedChapter?.topics || [];
      default:
        return mockData;
    }
  };

  const currentData = getCurrentData();

  // Calculate max values for normalization
  const getMaxValues = () => {
    let maxRecurrence = 0;
    let maxTimeWasted = 0;

    const processItem = (item: any, type: string) => {
      if (type === 'topic') {
        maxRecurrence = Math.max(maxRecurrence, item.recurrence_count);
        maxTimeWasted = Math.max(maxTimeWasted, item.time_wasted_minutes);
      } else if (type === 'chapter') {
        const chapterRecurrence = item.topics.reduce((sum: number, topic: Topic) => sum + topic.recurrence_count, 0);
        const chapterTimeWasted = item.topics.reduce((sum: number, topic: Topic) => sum + topic.time_wasted_minutes, 0);
        maxRecurrence = Math.max(maxRecurrence, chapterRecurrence);
        maxTimeWasted = Math.max(maxTimeWasted, chapterTimeWasted);
      } else { // subject
        const subjectRecurrence = item.chapters.reduce((sum: number, chapter: Chapter) => 
          sum + chapter.topics.reduce((topicSum: number, topic: Topic) => topicSum + topic.recurrence_count, 0), 0);
        const subjectTimeWasted = item.chapters.reduce((sum: number, chapter: Chapter) => 
          sum + chapter.topics.reduce((topicSum: number, topic: Topic) => topicSum + topic.time_wasted_minutes, 0), 0);
        maxRecurrence = Math.max(maxRecurrence, subjectRecurrence);
        maxTimeWasted = Math.max(maxTimeWasted, subjectTimeWasted);
      }
    };

    if (viewLevel === 'subjects') {
      mockData.forEach(subject => processItem(subject, 'subject'));
    } else if (viewLevel === 'chapters') {
      selectedSubject?.chapters.forEach(chapter => processItem(chapter, 'chapter'));
    } else {
      selectedChapter?.topics.forEach(topic => processItem(topic, 'topic'));
    }

    return { maxRecurrence, maxTimeWasted };
  };

  const { maxRecurrence, maxTimeWasted } = getMaxValues();

  // Handle navigation
  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setViewLevel('chapters');
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setViewLevel('topics');
  };

  const handleBackClick = () => {
    if (viewLevel === 'topics') {
      setViewLevel('chapters');
      setSelectedChapter(null);
    } else if (viewLevel === 'chapters') {
      setViewLevel('subjects');
      setSelectedSubject(null);
    }
  };

  const handleTooltip = (item: any, type: string, position: { x: number; y: number }) => {
    setSelectedTooltip({ item, type: type as any, position });
  };

  const getViewTitle = () => {
    switch (viewLevel) {
      case 'subjects':
        return 'Subject Overview';
      case 'chapters':
        return `${selectedSubject?.subject} - Chapters`;
      case 'topics':
        return `${selectedChapter?.chapter} - Topics`;
      default:
        return 'Mistake Recurrence Heatmap';
    }
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (viewLevel === 'chapters' || viewLevel === 'topics') {
      parts.push(selectedSubject?.subject);
    }
    if (viewLevel === 'topics') {
      parts.push(selectedChapter?.chapter);
    }
    return parts.join(' → ');
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
          {viewLevel !== 'subjects' && (
            <Pressable
              onPress={handleBackClick}
              className="w-10 h-10 rounded-xl bg-slate-700/50 items-center justify-center mr-3 active:scale-95"
            >
              <ArrowLeft size={18} color="#94a3b8" />
            </Pressable>
          )}
          <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <TrendingUp size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Mistake Recurrence Heatmap
            </Text>
            <Text className="text-sm text-slate-400">
              {getViewTitle()}
              {getBreadcrumb() && (
                <Text className="text-teal-400"> • {getBreadcrumb()}</Text>
              )}
            </Text>
          </View>
        </View>

        {/* View Level Indicator */}
        <View className="bg-slate-700/50 rounded-lg px-3 py-2">
          <Text className="text-slate-300 text-sm font-medium capitalize">
            {viewLevel.replace('s', '')} View
          </Text>
        </View>
      </MotiView>

      {/* Main Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Summary Stats */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 200 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <RotateCcw size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Total Mistakes</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {(() => {
                if (viewLevel === 'subjects') {
                  return mockData.reduce((sum, subject) => 
                    sum + subject.chapters.reduce((chapterSum, chapter) => 
                      chapterSum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0), 0);
                } else if (viewLevel === 'chapters') {
                  return selectedSubject?.chapters.reduce((sum, chapter) => 
                    sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0) || 0;
                } else {
                  return selectedChapter?.topics.reduce((sum, topic) => sum + topic.recurrence_count, 0) || 0;
                }
              })()}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Time Wasted</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {(() => {
                let totalTime = 0;
                if (viewLevel === 'subjects') {
                  totalTime = mockData.reduce((sum, subject) => 
                    sum + subject.chapters.reduce((chapterSum, chapter) => 
                      chapterSum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.time_wasted_minutes, 0), 0), 0);
                } else if (viewLevel === 'chapters') {
                  totalTime = selectedSubject?.chapters.reduce((sum, chapter) => 
                    sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.time_wasted_minutes, 0), 0) || 0;
                } else {
                  totalTime = selectedChapter?.topics.reduce((sum, topic) => sum + topic.time_wasted_minutes, 0) || 0;
                }
                return (totalTime / 60).toFixed(1);
              })()}h
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Worst Area</Text>
            </View>
            <Text className="text-blue-200 text-sm font-bold" numberOfLines={2}>
              {(() => {
                if (viewLevel === 'subjects') {
                  return mockData.reduce((max, subject) => {
                    const subjectTotal = subject.chapters.reduce((sum, chapter) => 
                      sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0);
                    const maxTotal = max.chapters.reduce((sum, chapter) => 
                      sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0);
                    return subjectTotal > maxTotal ? subject : max;
                  }).subject;
                } else if (viewLevel === 'chapters') {
                  return selectedSubject?.chapters.reduce((max, chapter) => {
                    const chapterTotal = chapter.topics.reduce((sum, topic) => sum + topic.recurrence_count, 0);
                    const maxTotal = max.topics.reduce((sum, topic) => sum + topic.recurrence_count, 0);
                    return chapterTotal > maxTotal ? chapter : max;
                  }).chapter || 'N/A';
                } else {
                  return selectedChapter?.topics.reduce((max, topic) => 
                    topic.recurrence_count > max.recurrence_count ? topic : max
                  ).topic || 'N/A';
                }
              })()}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <RotateCcw size={16} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Items</Text>
            </View>
            <Text className="text-emerald-200 text-xl font-bold">
              {currentData.length}
            </Text>
          </MotiView>
        </View>

        {/* Heatmap Grid */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-6"
          style={{
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              {getViewTitle()} Heatmap
            </Text>
          </View>

          {/* Grid Container */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
            <View className={`flex-row flex-wrap ${isMobile ? 'justify-center' : 'justify-start'}`}>
              {currentData.map((item, index) => (
                <HeatmapCell
                  key={viewLevel === 'subjects' ? (item as Subject).subject : 
                       viewLevel === 'chapters' ? (item as Chapter).chapter : 
                       (item as Topic).topic}
                  item={item}
                  type={viewLevel === 'subjects' ? 'subject' : 
                        viewLevel === 'chapters' ? 'chapter' : 'topic'}
                  onPress={() => {
                    if (viewLevel === 'subjects') {
                      handleSubjectClick(item as Subject);
                    } else if (viewLevel === 'chapters') {
                      handleChapterClick(item as Chapter);
                    }
                    // Topics are leaf nodes, no further drill-down
                  }}
                  onTooltip={handleTooltip}
                  maxRecurrence={maxRecurrence}
                  maxTimeWasted={maxTimeWasted}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Legend */}
          <View className="mt-6 bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
            <Text className="text-slate-100 font-semibold mb-3">Heatmap Legend</Text>
            <View className="space-y-3">
              <View>
                <Text className="text-slate-300 text-sm font-medium mb-2">Color Intensity (Recurrence Count)</Text>
                <View className="flex-row items-center space-x-3">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded bg-red-600 mr-2" />
                    <Text className="text-slate-400 text-xs">High (10+)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded bg-amber-500 mr-2" />
                    <Text className="text-slate-400 text-xs">Medium (5-9)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded bg-emerald-500 mr-2" />
                    <Text className="text-slate-400 text-xs">Low (1-4)</Text>
                  </View>
                </View>
              </View>
              
              <View>
                <Text className="text-slate-300 text-sm font-medium mb-2">Opacity (Time Wasted)</Text>
                <Text className="text-slate-400 text-xs">
                  Higher opacity = more time wasted • Long press cells for details
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Navigation Breadcrumb */}
        {(viewLevel === 'chapters' || viewLevel === 'topics') && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 800 }}
            className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-6"
          >
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-sm">Navigation: </Text>
              <Pressable
                onPress={() => {
                  setViewLevel('subjects');
                  setSelectedSubject(null);
                  setSelectedChapter(null);
                }}
                className="px-2 py-1 rounded bg-slate-600/50"
              >
                <Text className="text-teal-400 text-sm">Subjects</Text>
              </Pressable>
              
              {selectedSubject && (
                <>
                  <Text className="text-slate-500 mx-2">→</Text>
                  <Pressable
                    onPress={() => {
                      setViewLevel('chapters');
                      setSelectedChapter(null);
                    }}
                    className="px-2 py-1 rounded bg-slate-600/50"
                  >
                    <Text className="text-teal-400 text-sm">{selectedSubject.subject}</Text>
                  </Pressable>
                </>
              )}
              
              {selectedChapter && (
                <>
                  <Text className="text-slate-500 mx-2">→</Text>
                  <View className="px-2 py-1 rounded bg-teal-600/30">
                    <Text className="text-teal-300 text-sm">{selectedChapter.chapter}</Text>
                  </View>
                </>
              )}
            </View>
          </MotiView>
        )}

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <TrendingUp size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Mistake Pattern Insights</Text>
          </View>
          
          <Text className="text-slate-300 text-sm leading-5">
            {viewLevel === 'subjects' && 
              `Across all subjects, you've made ${mockData.reduce((sum, subject) => 
                sum + subject.chapters.reduce((chapterSum, chapter) => 
                  chapterSum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0), 0)} recurring mistakes. 
              Focus on the red-colored areas for maximum impact.`
            }
            {viewLevel === 'chapters' && selectedSubject &&
              `In ${selectedSubject.subject}, ${selectedSubject.chapters.reduce((sum, chapter) => 
                sum + chapter.topics.reduce((topicSum, topic) => topicSum + topic.recurrence_count, 0), 0)} mistakes occurred. 
              The darkest chapters need immediate attention.`
            }
            {viewLevel === 'topics' && selectedChapter &&
              `${selectedChapter.chapter} has ${selectedChapter.topics.reduce((sum, topic) => sum + topic.recurrence_count, 0)} total mistakes. 
              Target the highest recurrence topics first for efficient improvement.`
            }
          </Text>
        </MotiView>
      </ScrollView>

      {/* Tooltip */}
      {selectedTooltip && (
        <Tooltip
          data={selectedTooltip}
          onClose={() => setSelectedTooltip(null)}
        />
      )}
    </View>
  );
}