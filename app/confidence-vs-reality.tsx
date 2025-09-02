import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Gauge, Calendar, BookOpen, TrendingUp, Target, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import CalibrationCurve from '@/components/Confidence/CalibrationCurve';
import ConfidenceDriftTracker from '@/components/Confidence/ConfidenceDriftTracker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import confidenceData from '@/data/confidence-data.json';

type TabKey = 'daily' | 'subject' | 'overall';

interface SubjectCalibration {
  subject: string;
  avgConfidenceGap: number;
  totalAttempts: number;
  avgConfidence: number;
  avgAccuracy: number;
  isWellCalibrated: boolean;
}

interface WeeklyData {
  week: string;
  weekNumber: number;
  avgConfidenceGap: number;
  avgConfidence: number;
  avgAccuracy: number;
  totalAttempts: number;
}

export default function ConfidenceVsRealityPage() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [subjectCalibrations, setSubjectCalibrations] = useState<SubjectCalibration[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [todayData, setTodayData] = useState<any[]>([]);

  const tabs = [
    { key: 'daily' as TabKey, label: 'Daily', icon: Calendar },
    { key: 'subject' as TabKey, label: 'Subject', icon: BookOpen },
    { key: 'overall' as TabKey, label: 'Overall', icon: TrendingUp },
  ];

  // Process data on component mount
  useEffect(() => {
    processTodayData();
    processSubjectData();
    processWeeklyData();
  }, []);

  const processTodayData = () => {
    const today = new Date().toISOString().split('T')[0];
    const filtered = confidenceData.filter(entry => 
      entry.mcq_key === 'mcq_1' && entry.date === today
    );
    setTodayData(filtered);
  };

  const processSubjectData = () => {
    const pyqData = confidenceData.filter(entry => entry.mcq_key === 'mcq_1');
    const subjectMap = new Map<string, { 
      confidenceSum: number; 
      correctSum: number; 
      count: number; 
    }>();

    pyqData.forEach(entry => {
      const existing = subjectMap.get(entry.subject) || { 
        confidenceSum: 0, 
        correctSum: 0, 
        count: 0 
      };
      
      existing.confidenceSum += entry.predicted_confidence;
      existing.correctSum += entry.actual_correct;
      existing.count += 1;
      
      subjectMap.set(entry.subject, existing);
    });

    const calibrations: SubjectCalibration[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
      const avgConfidence = data.confidenceSum / data.count;
      const avgAccuracy = (data.correctSum / data.count) * 100;
      const avgConfidenceGap = avgConfidence - avgAccuracy;
      const isWellCalibrated = Math.abs(avgConfidenceGap) <= 15;

      return {
        subject,
        avgConfidenceGap,
        totalAttempts: data.count,
        avgConfidence,
        avgAccuracy,
        isWellCalibrated,
      };
    });

    setSubjectCalibrations(calibrations.sort((a, b) => Math.abs(b.avgConfidenceGap) - Math.abs(a.avgConfidenceGap)));
  };

  const processWeeklyData = () => {
    const pyqData = confidenceData.filter(entry => entry.mcq_key === 'mcq_1');
    const weekMap = new Map<string, { 
      confidenceSum: number; 
      correctSum: number; 
      count: number; 
      weekNumber: number;
    }>();

    pyqData.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      // Calculate week number of the year
      const yearStart = new Date(date.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);

      const existing = weekMap.get(weekKey) || { 
        confidenceSum: 0, 
        correctSum: 0, 
        count: 0,
        weekNumber 
      };
      
      existing.confidenceSum += entry.predicted_confidence;
      existing.correctSum += entry.actual_correct;
      existing.count += 1;
      
      weekMap.set(weekKey, existing);
    });

    const weekly: WeeklyData[] = Array.from(weekMap.entries()).map(([week, data]) => {
      const avgConfidence = data.confidenceSum / data.count;
      const avgAccuracy = (data.correctSum / data.count) * 100;
      const avgConfidenceGap = avgConfidence - avgAccuracy;

      return {
        week: `Week ${data.weekNumber}`,
        weekNumber: data.weekNumber,
        avgConfidenceGap,
        avgConfidence,
        avgAccuracy,
        totalAttempts: data.count,
      };
    });

    setWeeklyData(weekly.sort((a, b) => a.weekNumber - b.weekNumber));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {data.subject || data.week || label}
          </Text>
          <Text className="text-blue-300 text-sm">
            Avg Confidence: {data.avgConfidence?.toFixed(1) || 'N/A'}%
          </Text>
          <Text className="text-emerald-300 text-sm">
            Avg Accuracy: {data.avgAccuracy?.toFixed(1) || 'N/A'}%
          </Text>
          <Text className={`text-sm font-semibold ${
            (data.avgConfidenceGap || 0) > 0 ? 'text-red-400' : 'text-cyan-400'
          }`}>
            Gap: {data.avgConfidenceGap > 0 ? '+' : ''}{data.avgConfidenceGap?.toFixed(1) || 'N/A'}%
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {data.totalAttempts} attempts
          </Text>
        </View>
      );
    }
    return null;
  };

  const getInsights = (tab: TabKey) => {
    switch (tab) {
      case 'daily':
        if (todayData.length === 0) {
          return "No data available for today. Complete some PYQs to see your confidence calibration.";
        }
        const todayAvgConfidence = todayData.reduce((sum, d) => sum + d.predicted_confidence, 0) / todayData.length;
        const todayAvgAccuracy = (todayData.reduce((sum, d) => sum + d.actual_correct, 0) / todayData.length) * 100;
        const todayGap = todayAvgConfidence - todayAvgAccuracy;
        
        if (todayGap > 15) return "You're overconfident today. Consider being more conservative in your predictions.";
        if (todayGap < -15) return "You're underestimating yourself today. Trust your preparation more!";
        return "Good calibration today! Your confidence predictions match your actual performance.";

      case 'subject':
        const mostOverconfident = subjectCalibrations.find(s => s.avgConfidenceGap > 15);
        const mostUnderconfident = subjectCalibrations.find(s => s.avgConfidenceGap < -15);
        
        if (mostOverconfident) {
          return `You are overconfident in ${mostOverconfident.subject}. Review your knowledge gaps in this subject.`;
        }
        if (mostUnderconfident) {
          return `You know more than you think in ${mostUnderconfident.subject}. Trust your preparation!`;
        }
        return "Good calibration across subjects! Your confidence predictions are generally accurate.";

      case 'overall':
        const overallGap = weeklyData.reduce((sum, w) => sum + Math.abs(w.avgConfidenceGap), 0) / Math.max(weeklyData.length, 1);
        
        if (overallGap > 20) return "High calibration drift detected. Work on better self-assessment of your knowledge.";
        if (overallGap > 10) return "Moderate calibration issues. Monitor your confidence patterns more carefully.";
        return "Excellent calibration stability! You have good self-awareness of your knowledge level.";

      default:
        return "";
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600 }}
        className="flex-row items-center justify-between p-6 pt-12 border-b border-slate-700/50"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-lg">
            <Gauge size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Confidence vs Reality
            </Text>
            <Text className="text-sm text-slate-400 mt-1">
              Calibration between certainty and correctness
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Tab Navigation */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 200 }}
        className="flex-row justify-center p-4 border-b border-slate-700/30"
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center px-6 py-3 mx-2 rounded-xl ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}
              style={{
                shadowColor: isActive ? '#3b82f6' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: isActive ? 4 : 0,
              }}
            >
              <IconComponent size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
              <Text className={`ml-2 font-semibold ${
                isActive ? 'text-white' : 'text-slate-400'
              }`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </MotiView>

      {/* Tab Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Daily Tab */}
        {activeTab === 'daily' && (
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="space-y-6"
          >
            <CalibrationCurve />
            <ConfidenceDriftTracker />
          </MotiView>
        )}

        {/* Subject Tab */}
        {activeTab === 'subject' && (
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="space-y-6"
          >
            {/* Subject Calibration Overview */}
            <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                  <BookOpen size={16} color="#ffffff" />
                </View>
                <Text className="text-lg font-bold text-slate-100">
                  Subject-Level Calibration
                </Text>
              </View>

              <View className="space-y-3">
                {subjectCalibrations.map((subject, index) => (
                  <MotiView
                    key={subject.subject}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: index * 100 }}
                    className={`p-4 rounded-xl border ${
                      subject.isWellCalibrated
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : Math.abs(subject.avgConfidenceGap) > 20
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-slate-100 font-semibold mb-1">
                          {subject.subject}
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          {subject.totalAttempts} PYQs • 
                          Confidence: {subject.avgConfidence.toFixed(1)}% • 
                          Accuracy: {subject.avgAccuracy.toFixed(1)}%
                        </Text>
                      </View>
                      
                      <View className="items-center">
                        {subject.isWellCalibrated ? (
                          <CheckCircle size={20} color="#10b981" />
                        ) : (
                          <AlertTriangle size={20} color={subject.avgConfidenceGap > 0 ? '#ef4444' : '#f59e0b'} />
                        )}
                        <Text className={`text-sm font-bold mt-1 ${
                          subject.isWellCalibrated ? 'text-emerald-400' : 
                          subject.avgConfidenceGap > 0 ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {subject.avgConfidenceGap > 0 ? '+' : ''}{subject.avgConfidenceGap.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                ))}
              </View>
            </View>

            {/* Subject Calibration Bar Chart */}
            <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg">
              <Text className="text-lg font-semibold text-slate-100 mb-4 text-center">
                Confidence Gap by Subject
              </Text>
              
              <View style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectCalibrations}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="subject"
                      stroke="#94a3b8"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="avgConfidenceGap" 
                      fill={(entry: any) => entry.avgConfidenceGap > 0 ? '#ef4444' : '#06b6d4'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </View>
            </View>
          </MotiView>
        )}

        {/* Overall Tab */}
        {activeTab === 'overall' && (
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="space-y-6"
          >
            {/* Weekly Confidence Gap Trend */}
            <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg items-center justify-center mr-3">
                  <TrendingUp size={16} color="#ffffff" />
                </View>
                <Text className="text-lg font-bold text-slate-100">
                  Weekly Confidence Gap Trend
                </Text>
              </View>

              <View style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="week"
                      stroke="#94a3b8"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone"
                      dataKey="avgConfidenceGap" 
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                      name="Confidence Gap"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </View>
            </View>

            {/* Overall Calibration Curve */}
            <CalibrationCurve />
          </MotiView>
        )}

        {/* Insights Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">
              {activeTab === 'daily' ? 'Daily' : activeTab === 'subject' ? 'Subject' : 'Overall'} Insights
            </Text>
          </View>
          
          <Text className="text-slate-300 text-sm leading-5">
            {getInsights(activeTab)}
          </Text>
        </MotiView>
      </ScrollView>
    </View>
  );
}