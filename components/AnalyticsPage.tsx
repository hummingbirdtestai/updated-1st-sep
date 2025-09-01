import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Chrome as Home, Map, GitBranch, CircleAlert as AlertCircle, Radar, Clock, Navigation, ChartBar as BarChart3, Zap, Target, RotateCcw, BookMarked, Award, Users, UserCheck, UsersRound, Heart, TrendingUp } from 'lucide-react-native';
import PrepOverviewPage from './PrepOverviewPage';
import NeuralRadar from './NeuralRadar';

interface AnalyticsPageProps {
  route: string;
}

const routeConfig: Record<string, { title: string; icon: any; description: string }> = {
  '/analytics/prep-overview': {
    title: 'Prep Overview',
    icon: Home,
    description: 'Readiness score, time to mastery, daily mentor briefing'
  },
  '/analytics/mastery-map': {
    title: 'Mastery Map',
    icon: Map,
    description: 'Subject/topic checkpoints and recursive depth analysis'
  },
  '/analytics/gap-chains': {
    title: 'Gap Chains',
    icon: GitBranch,
    description: 'Recursive gap tree per PYQ/MCQ analysis'
  },
  '/analytics/root-causes': {
    title: 'Root Causes',
    icon: AlertCircle,
    description: 'Why errors happen - concept linkages analysis'
  },
  '/analytics/neural-radar': {
    title: 'Neural Radar',
    icon: Radar,
    description: 'Radar/heatmap of subjects (weak ↔ strong)'
  },
  '/analytics/time-to-mastery': {
    title: 'Time-to-Mastery Clock',
    icon: Clock,
    description: 'Countdown projection at current speed'
  },
  '/analytics/mentor-flight-path': {
    title: 'Mentor Flight Path',
    icon: Navigation,
    description: 'AI daily guidance, nudges, motivational notes'
  },
  '/analytics/study-sessions': {
    title: 'Study Sessions',
    icon: BarChart3,
    description: 'Time logs, consistency, streaks analysis'
  },
  '/analytics/speed-accuracy': {
    title: 'Speed & Accuracy',
    icon: Zap,
    description: 'Efficiency meter, attempts vs correct ratio'
  },
  '/analytics/confidence-reality': {
    title: 'Confidence vs Reality',
    icon: Target,
    description: 'Calibration between certainty and correctness'
  },
  '/analytics/smart-revision': {
    title: 'Smart Revision',
    icon: RotateCcw,
    description: 'Spaced repetition engine for MCQs + flashcards'
  },
  '/analytics/quick-fix-lessons': {
    title: 'Quick Fix Lessons',
    icon: Zap,
    description: 'Micro-remediation content (AI or curated)'
  },
  '/analytics/mistakes-correct': {
    title: 'Mistakes to Correct',
    icon: AlertCircle,
    description: 'Personalized error bank to reattempt'
  },
  '/analytics/flashcards-bookmarks': {
    title: 'Flashcards & Bookmarks',
    icon: BookMarked,
    description: 'Track, review, revisit trends'
  },
  '/analytics/achievements-rewards': {
    title: 'Achievements & Rewards',
    icon: Award,
    description: 'XP, streak badges, milestone celebrations'
  },
  '/analytics/peer-comparison': {
    title: 'Peer Comparison',
    icon: Users,
    description: 'Safe benchmarks, not shaming'
  },
  '/analytics/buddy-mode': {
    title: 'Buddy Mode',
    icon: UserCheck,
    description: '1-to-1 peer accountability'
  },
  '/analytics/dynamic-cohorts': {
    title: 'Dynamic Cohorts',
    icon: UsersRound,
    description: 'Auto-generated topic groups based on bookmarks, gaps, weak areas'
  },
  '/analytics/wellness-balance': {
    title: 'Wellness & Balance',
    icon: Heart,
    description: 'Mood, stress, study/sleep correlation'
  },
  '/analytics/rank-score-simulator': {
    title: 'Rank & Score Simulator',
    icon: TrendingUp,
    description: 'Projected exam rank range based on current trajectory'
  },
};

export default function AnalyticsPage({ route }: AnalyticsPageProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  // Special case for Prep Overview - render the full dashboard
  if (route === '/analytics/prep-overview') {
    return <PrepOverviewPage />;
  }
  
  // Special case for Neural Radar - render the radar component
  if (route === '/analytics/neural-radar') {
    // Mock data for demonstration
    const mockSubjects = [
      { id: '1', name: 'Anatomy', momentumScore: 0.85, gapDensity: 0.2 },
      { id: '2', name: 'Biochemistry', momentumScore: 0.72, gapDensity: 0.4 },
      { id: '3', name: 'Pharmacology', momentumScore: 0.45, gapDensity: 0.8 },
      { id: '4', name: 'Pathology', momentumScore: 0.68, gapDensity: 0.5 },
      { id: '5', name: 'Medicine', momentumScore: 0.35, gapDensity: 0.9 },
      { id: '6', name: 'Surgery', momentumScore: 0.55, gapDensity: 0.6 },
      { id: '7', name: 'Pediatrics', momentumScore: 0.78, gapDensity: 0.3 },
      { id: '8', name: 'Gynecology', momentumScore: 0.42, gapDensity: 0.7 },
    ];

    return (
      <View className="flex-1 bg-slate-900">
        {/* Sticky Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600 }}
          className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
              <Radar size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-100">
                Neural Radar
              </Text>
              <Text className="text-sm text-slate-400 mt-1">
                Radar/heatmap of subjects (weak ↔ strong)
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Content Area */}
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isMobile ? 16 : 24,
            paddingVertical: 24,
            alignItems: 'center',
          }}
        >
          <MotiView
            from={{ opacity: 0, translateY: 30, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 800, delay: 200 }}
            className="w-full max-w-2xl"
          >
            {/* Description */}
            <View className="bg-slate-800/60 rounded-xl p-6 mb-6 border border-slate-700/40">
              <Text className="text-slate-100 text-lg font-semibold mb-2">
                Subject Strength Visualization
              </Text>
              <Text className="text-slate-300 text-base leading-6">
                Each subject appears as a blip on the radar. Distance from center indicates momentum score, 
                while color represents gap density. Larger blips show higher learning velocity.
              </Text>
            </View>

            {/* Neural Radar Component */}
            <View className="items-center">
              <NeuralRadar subjects={mockSubjects} size={isMobile ? 280 : 350} />
            </View>

            {/* Subject Details */}
            <View className="mt-6 space-y-3">
              <Text className="text-slate-100 text-lg font-semibold mb-4">Subject Analysis</Text>
              {mockSubjects.map((subject, index) => (
                <MotiView
                  key={subject.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 600 + index * 100 }}
                  className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-slate-100 font-semibold">{subject.name}</Text>
                      <View className="flex-row space-x-4 mt-1">
                        <Text className="text-slate-400 text-sm">
                          Momentum: {(subject.momentumScore * 100).toFixed(0)}%
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          Gap Density: {(subject.gapDensity * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <View 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getBlipColor(subject.gapDensity) }}
                    />
                  </View>
                </MotiView>
              ))}
            </View>
          </MotiView>
        </ScrollView>
      </View>
    );
  }
  
  const config = routeConfig[route] || {
    title: 'Analytics',
    icon: BarChart3,
    description: 'Analytics dashboard'
  };
  
  const IconComponent = config.icon;

  return (
    <View className="flex-1 bg-slate-900">
      {/* Sticky Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <IconComponent size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              {config.title}
            </Text>
            <Text className="text-sm text-slate-400 mt-1">
              {config.description}
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Content Area */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 200 }}
          className="space-y-6"
        >
          {/* Coming Soon Card */}
          <View className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-8 shadow-xl">
            <View className="items-center text-center">
              <View className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-2xl items-center justify-center mb-4">
                <IconComponent size={32} color="#5eead4" />
              </View>
              
              <Text className="text-3xl font-bold text-slate-100 mb-2">
                {config.title}
              </Text>
              
              <Text className="text-slate-300 text-lg mb-6 text-center max-w-md">
                {config.description}
              </Text>
              
              <View className="bg-slate-700/50 rounded-xl px-6 py-3 border border-slate-600/50">
                <Text className="text-teal-400 font-semibold">
                  🚀 Coming Soon
                </Text>
              </View>
            </View>
          </View>

          {/* Feature Preview Cards */}
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 400 }}
              className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-blue-500/20 rounded-lg items-center justify-center mr-3">
                  <BarChart3 size={16} color="#60a5fa" />
                </View>
                <Text className="text-slate-100 font-semibold">Data Insights</Text>
              </View>
              <Text className="text-slate-400 text-sm">
                Advanced analytics and performance metrics will be displayed here with interactive charts and visualizations.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 500 }}
              className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-purple-500/20 rounded-lg items-center justify-center mr-3">
                  <Target size={16} color="#a78bfa" />
                </View>
                <Text className="text-slate-100 font-semibold">Smart Recommendations</Text>
              </View>
              <Text className="text-slate-400 text-sm">
                AI-powered suggestions and personalized learning paths based on your performance patterns.
              </Text>
            </MotiView>
          </View>

          {/* Progress Placeholder */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 600 }}
            className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/40"
          >
            <Text className="text-slate-100 font-semibold mb-4">Development Progress</Text>
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 text-sm">UI Framework</Text>
                <Text className="text-emerald-400 text-sm font-medium">✓ Complete</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 text-sm">Navigation System</Text>
                <Text className="text-emerald-400 text-sm font-medium">✓ Complete</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 text-sm">Data Integration</Text>
                <Text className="text-amber-400 text-sm font-medium">⏳ In Progress</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-300 text-sm">Analytics Engine</Text>
                <Text className="text-slate-500 text-sm font-medium">⏸ Planned</Text>
              </View>
            </View>
          </MotiView>
        </MotiView>
      </ScrollView>
    </View>
  );
}