import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { GitBranch, Target, TrendingUp, ListFilter as Filter, ChevronDown, X, CircleCheck as CheckCircle, CircleX as XCircle, Circle, TriangleAlert as AlertTriangle, Award, Clock, ChartBar as BarChart3, Play, BookOpen, Video, RotateCcw, ExternalLink, Lightbulb } from 'lucide-react-native';
import { supabase } from '../lib/supabaseClient';
import Svg, { Circle as SvgCircle, Line, Text as SvgText, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import gapChainsData from '@/data/gap-chains-data.json';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer, // 👈 this was missing
  Cell
} from 'recharts';



interface ChainLink {
  mcq_id: string;
  is_correct: boolean;
}

interface GapChain {
  pyq_id: string;
  subject: string;
  chapter: string;
  topic: string;
  chain: ChainLink[];
  chain_health_score: number;
  time_credit_minutes: number;
}

interface AISuggestion {
  type: 'flashcard' | 'video' | 'mcq_retry';
  title: string;
  link: string;
}

interface AIFixData {
  pyq_id: string;
  broken_link: string;
  suggestions: AISuggestion[];
}

interface ChainTooltipProps {
  chain: GapChain;
  position: { x: number; y: number };
  onClose: () => void;
}

function getAIFixSuggestions(chain: GapChain): AIFixData {
  return {
    pyq_id: chain.pyq_id,
    broken_link: "mcq_1",
    suggestions: [
      { type: "flashcard", title: "Baroreceptor Basics", link: "https://example.com/flashcard1" },
      { type: "video", title: "Thoracic Mediastinum Explained", link: "https://example.com/video1" },
      { type: "mcq_retry", title: "Retry Similar MCQ", link: "https://example.com/mcq1" },
    ],
  };
}


function ChainTooltip({ chain, position, onClose }: ChainTooltipProps) {
  const chainLength = chain.chain.length;
  const correctIndex = chain.chain.findIndex(link => link.is_correct);
  const hasCorrect = correctIndex !== -1;
  
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 400 }}
      className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
      style={{
        left: Math.max(10, Math.min(position.x - 120, Dimensions.get('window').width - 250)),
        top: position.y - 160,
        width: 240,
        shadowColor: chain.chain_health_score >= 85 ? '#10b981' : 
                     chain.chain_health_score >= 70 ? '#f59e0b' : '#ef4444',
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

      {/* Chain Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1">
          {chain.subject}
        </Text>
        <Text className="text-slate-300 text-xs mb-3">
          {chain.chapter} • {chain.topic}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Chain Length</Text>
            <Text className="text-slate-300 text-xs font-semibold">
              {chainLength} MCQ{chainLength !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Health Score</Text>
            <Text className={`text-xs font-semibold ${
              chain.chain_health_score >= 85 ? 'text-emerald-400' : 
              chain.chain_health_score >= 70 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {chain.chain_health_score}/100
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Solved At</Text>
            <Text className={`text-xs font-semibold ${hasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {hasCorrect ? `MCQ ${correctIndex + 1}` : 'Unsolved'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time Credit</Text>
            <Text className="text-slate-300 text-xs">
              {chain.time_credit_minutes}m
            </Text>
          </View>
        </View>

        {/* Chain Visualization */}
        <View className="mt-3 bg-slate-700/40 rounded-lg p-2">
          <Text className="text-slate-400 text-xs mb-2">Chain Progress:</Text>
          <View className="flex-row space-x-1">
            {chain.chain.map((link, index) => (
              <View
                key={link.mcq_id}
                className={`w-4 h-4 rounded-full border-2 ${
                  link.is_correct 
                    ? 'bg-emerald-500 border-emerald-400' 
                    : 'bg-red-500 border-red-400'
                }`}
              />
            ))}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

// Mock data for tabbed charts
/* const mockSubjectChainData = [
  {
    "subject": "Anatomy",
    "chains_mcq1": 20,
    "chains_mcq2": 5,
    "chains_mcq3": 3,
    "chains_mcq4": 2,
    "chains_mcq5": 1,
    "chains_mcq6": 0,
    "avg_chain_length": 1.3
  },
  {
    "subject": "Physiology",
    "chains_mcq1": 15,
    "chains_mcq2": 10,
    "chains_mcq3": 5,
    "chains_mcq4": 3,
    "chains_mcq5": 2,
    "chains_mcq6": 1,
    "avg_chain_length": 2.4
  },
  {
    "subject": "Biochemistry",
    "chains_mcq1": 12,
    "chains_mcq2": 8,
    "chains_mcq3": 6,
    "chains_mcq4": 4,
    "chains_mcq5": 2,
    "chains_mcq6": 1,
    "avg_chain_length": 2.8
  },
  {
    "subject": "Pathology",
    "chains_mcq1": 8,
    "chains_mcq2": 6,
    "chains_mcq3": 6,
    "chains_mcq4": 4,
    "chains_mcq5": 3,
    "chains_mcq6": 2,
    "avg_chain_length": 3.8
  },
  {
    "subject": "Pharmacology",
    "chains_mcq1": 10,
    "chains_mcq2": 7,
    "chains_mcq3": 5,
    "chains_mcq4": 3,
    "chains_mcq5": 2,
    "chains_mcq6": 1,
    "avg_chain_length": 3.1
  }
]; */

type TabKey = 'overview' | 'distribution' | 'length';

interface SubjectChainTabsProps {
  data?:any[];
}

function SubjectChainTabs({ data = [] }: SubjectChainTabsProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [activeTab, setActiveTab] = useState<TabKey>('distribution');

  const tabs = [
    { key: 'distribution' as TabKey, label: 'Chain Distribution', icon: BarChart3 },
    { key: 'length' as TabKey, label: 'Average Length', icon: TrendingUp },
  ];

  // Get subject color
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Anatomy': '#3b82f6',
      'Physiology': '#10b981',
      'Biochemistry': '#8b5cf6',
      'Pharmacology': '#f59e0b',
      'Pathology': '#ef4444',
    };
    return colors[subject] || '#64748b';
  };

  // Get MCQ level color (green to red scale)
  const getMCQColor = (mcqLevel: number) => {
    const colors = ['#10b981', '#22c55e', '#eab308', '#f59e0b', '#ef4444', '#dc2626'];
    return colors[mcqLevel - 1] || '#64748b';
  };

  // Process data for stacked bar chart
  const processStackedData = () => {
    return data.map(subject => ({
      subject: subject.subject,
      mcq1: subject.chains_mcq1,
      mcq2: subject.chains_mcq2,
      mcq3: subject.chains_mcq3,
      mcq4: subject.chains_mcq4,
      mcq5: subject.chains_mcq5,
      mcq6: subject.chains_mcq6,
      total: subject.chains_mcq1 + subject.chains_mcq2 + subject.chains_mcq3 + 
             subject.chains_mcq4 + subject.chains_mcq5 + subject.chains_mcq6,
    }));
  };

  const stackedData = processStackedData();

  // Custom tooltip for stacked chart
  const StackedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <View className="bg-slate-800/95 rounded-lg p-4 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-base mb-3">
            {label}
          </Text>
          <View className="space-y-2">
            {payload.reverse().map((entry: any, index: number) => (
              <View key={entry.dataKey} className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View 
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <Text className="text-slate-300 text-sm">
                    {entry.dataKey.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-slate-100 font-semibold text-sm">
                  {entry.value} chains
                </Text>
              </View>
            ))}
            <View className="pt-2 border-t border-slate-600/30">
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-sm">Total Chains:</Text>
                <Text className="text-slate-200 font-bold text-sm">{total}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  // Custom tooltip for length chart
  const LengthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <View className="bg-slate-800/95 rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            {label}
          </Text>
          <Text className="text-amber-300 text-sm">
            Average Length: {data.avg_chain_length.toFixed(1)} MCQs
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {data.avg_chain_length <= 2 ? 'Strong subject' : 
             data.avg_chain_length <= 3.5 ? 'Moderate difficulty' : 'Needs focus'}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 800 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
      style={{
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Tab Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
            <BarChart3 size={16} color="#ffffff" />
          </View>
          <Text className="text-lg font-bold text-slate-100">
            Subject Analysis
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row justify-center p-4 border-b border-slate-700/30">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center px-6 py-3 mx-2 rounded-xl ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg'
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}
              style={{
                shadowColor: isActive ? '#8b5cf6' : 'transparent',
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
      </View>

      {/* Tab Content */}
      <View className="p-6">
        {/* Chain Distribution Tab */}
        {activeTab === 'distribution' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="space-y-6"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg items-center justify-center mr-3">
                <BarChart3 size={14} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                Subject Chain Distribution
              </Text>
            </View>
            
            <Text className="text-slate-400 text-sm mb-6">
              Stacked bars show where chains end per subject. Green segments (MCQ1) = strong performance, Red segments (MCQ6) = needs focus.
            </Text>

            {/* Stacked Bar Chart */}
            <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
              <View style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stackedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="subject"
                      stroke="#94a3b8"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      label={{ value: 'Number of Chains', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                    />
                    <Tooltip content={<StackedTooltip />} />
                    
                    {/* Stacked bars for each MCQ level */}
                    <Bar dataKey="mcq1" stackId="chains" fill="#10b981" name="MCQ1 (Perfect)" />
                    <Bar dataKey="mcq2" stackId="chains" fill="#22c55e" name="MCQ2 (Excellent)" />
                    <Bar dataKey="mcq3" stackId="chains" fill="#eab308" name="MCQ3 (Good)" />
                    <Bar dataKey="mcq4" stackId="chains" fill="#f59e0b" name="MCQ4 (Fair)" />
                    <Bar dataKey="mcq5" stackId="chains" fill="#ef4444" name="MCQ5 (Poor)" />
                    <Bar dataKey="mcq6" stackId="chains" fill="#dc2626" name="MCQ6 (Critical)" />
                  </BarChart>
                </ResponsiveContainer>
              </View>
            </View>

            {/* Distribution Legend */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Chain Ending Distribution</Text>
              <View className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { mcq: 'MCQ1', color: '#10b981', label: 'Perfect (Solved immediately)' },
                  { mcq: 'MCQ2', color: '#22c55e', label: 'Excellent (1 retry)' },
                  { mcq: 'MCQ3', color: '#eab308', label: 'Good (2 retries)' },
                  { mcq: 'MCQ4', color: '#f59e0b', label: 'Fair (3 retries)' },
                  { mcq: 'MCQ5', color: '#ef4444', label: 'Poor (4 retries)' },
                  { mcq: 'MCQ6', color: '#dc2626', label: 'Critical (5+ retries)' },
                ].map((item) => (
                  <View key={item.mcq} className="flex-row items-center">
                    <View 
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <View className="flex-1">
                      <Text className="text-slate-300 text-sm font-medium">
                        {item.mcq}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {item.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Subject Performance Summary */}
            <View className="space-y-3">
              <Text className="text-lg font-semibold text-slate-100">Subject Performance Summary</Text>
              {data.map((subject, index) => {
                const totalChains = subject.chains_mcq1 + subject.chains_mcq2 + subject.chains_mcq3 + 
                                  subject.chains_mcq4 + subject.chains_mcq5 + subject.chains_mcq6;
                const perfectRate = totalChains > 0 ? (subject.chains_mcq1 / totalChains) * 100 : 0;
                const subjectColor = getSubjectColor(subject.subject);
                
                return (
                  <MotiView
                    key={subject.subject}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: index * 100 + 200 }}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: subjectColor }}
                        />
                        <View>
                          <Text className="text-slate-100 font-semibold text-base">
                            {subject.subject}
                          </Text>
                          <Text className="text-slate-400 text-sm">
                            {totalChains} total chains
                          </Text>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <Text 
                          className="text-lg font-bold"
                          style={{ color: perfectRate >= 60 ? '#10b981' : perfectRate >= 40 ? '#f59e0b' : '#ef4444' }}
                        >
                          {perfectRate.toFixed(0)}%
                        </Text>
                        <Text className="text-slate-400 text-xs">
                          perfect (MCQ1)
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                );
              })}
            </View>
          </MotiView>
        )}

        {/* Average Length Tab */}
        {activeTab === 'length' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="space-y-6"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg items-center justify-center mr-3">
                <TrendingUp size={14} color="#ffffff" />
              </View>
              <Text className="text-xl font-bold text-slate-100">
                Average Chain Length by Subject
              </Text>
            </View>
            
            <Text className="text-slate-400 text-sm mb-6">
              Shorter bars indicate stronger subjects (fewer MCQs needed to solve). Longer bars suggest knowledge gaps requiring more attempts.
            </Text>

            {/* Average Length Bar Chart */}
            <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30">
              <View style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="subject"
                      stroke="#94a3b8"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      fontSize={12}
                      label={{ value: 'Average Chain Length', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                      domain={[0, 'dataMax + 0.5']}
                    />
                    <Tooltip content={<LengthTooltip />} />
                    
                    <Bar dataKey="avg_chain_length" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getSubjectColor(entry.subject)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </View>
            </View>

            {/* Length Analysis */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Chain Length Analysis</Text>
              <View className="space-y-3">
                {data
                  .sort((a, b) => a.avg_chain_length - b.avg_chain_length)
                  .map((subject, index) => {
                    const strengthLevel = subject.avg_chain_length <= 2 ? 'Strong' : 
                                        subject.avg_chain_length <= 3.5 ? 'Moderate' : 'Weak';
                    const strengthColor = subject.avg_chain_length <= 2 ? '#10b981' : 
                                         subject.avg_chain_length <= 3.5 ? '#f59e0b' : '#ef4444';
                    
                    return (
                      <MotiView
                        key={subject.subject}
                        from={{ opacity: 0, translateX: -20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'spring', duration: 600, delay: index * 100 + 200 }}
                        className="flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center">
                          <Text className="text-slate-300 text-sm w-4 text-center">
                            #{index + 1}
                          </Text>
                          <View 
                            className="w-3 h-3 rounded-full mx-3"
                            style={{ backgroundColor: getSubjectColor(subject.subject) }}
                          />
                          <Text className="text-slate-100 font-medium">
                            {subject.subject}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Text className="text-slate-300 text-sm mr-3">
                            {subject.avg_chain_length.toFixed(1)} MCQs
                          </Text>
                          <View 
                            className="px-2 py-1 rounded-full border"
                            style={{ 
                              backgroundColor: `${strengthColor}20`,
                              borderColor: `${strengthColor}50`
                            }}
                          >
                            <Text 
                              className="text-xs font-bold"
                              style={{ color: strengthColor }}
                            >
                              {strengthLevel}
                            </Text>
                          </View>
                        </View>
                      </MotiView>
                    );
                  })}
              </View>
            </View>

            {/* Insights */}
            <View className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={16} color="#fbbf24" />
                <Text className="text-slate-100 font-semibold ml-2">Length Insights</Text>
              </View>
              
              <View className="space-y-2">
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-emerald-400">Strongest Subject:</Text> {
                    data.reduce((min, s) => s.avg_chain_length < min.avg_chain_length ? s : min).subject
                  } (avg {data.reduce((min, s) => s.avg_chain_length < min.avg_chain_length ? s : min).avg_chain_length} MCQs)
                </Text>
                
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-red-400">Needs Most Work:</Text> {
                    data.reduce((max, s) => s.avg_chain_length > max.avg_chain_length ? s : max).subject
                  } (avg {data.reduce((max, s) => s.avg_chain_length > max.avg_chain_length ? s : max).avg_chain_length} MCQs)
                </Text>
                
                <Text className="text-slate-400 text-xs leading-4 mt-3">
                  Shorter chains indicate better conceptual understanding. Focus study time on subjects with longer average chains to improve efficiency.
                </Text>
              </View>
            </View>
          </MotiView>
        )}
      </View>
    </MotiView>
  );
}

export default function GapChains() {
  const { width } = Dimensions.get('window');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedWeakChain, setSelectedWeakChain] = useState<GapChain | null>(null);
  const isMobile = width < 768;
  
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChain, setSelectedChain] = useState<{ chain: GapChain; position: { x: number; y: number } } | null>(null);
  const [sortBy, setSortBy] = useState<'health' | 'length' | 'subject'>('health');
  const [stats, setStats] = useState<{
  perfectChains: number;
  averageHealth: number;
  averageLength: number;
  totalChains: number;
} | null>(null);
  const [subjectChains, setSubjectChains] = useState<any[]>([]);
  const { user } = useAuth();



  // Process and filter data
  const getFilteredData = () => {
    let filtered = gapChainsData as GapChain[];
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(chain => chain.subject === selectedSubject);
    }
    
    // Sort data
    switch (sortBy) {
      case 'health':
        return filtered.sort((a, b) => a.chain_health_score - b.chain_health_score);
      case 'length':
        return filtered.sort((a, b) => b.chain.length - a.chain.length);
      case 'subject':
        return filtered.sort((a, b) => a.subject.localeCompare(b.subject));
      default:
        return filtered;
    }
  };

  const chainData = getFilteredData();
  const subjects = Array.from(new Set(gapChainsData.map(chain => chain.subject)));

useEffect(() => {
  if (!user?.id) return;

  const fetchGapChains = async () => {
    const { data, error } = await supabase
      .from('gap_chains')
      .select('chains_mcq1, avg_score, avg_chain_length, total_chains')
      .eq('student_id', user.id)   // ✅ only this student
      .maybeSingle();              // ✅ single row expected

    if (error) {
      console.error('Error fetching gap_chains:', error);
      return;
    }

    if (data) {
      setStats({
        perfectChains: data.chains_mcq1 || 0,
        averageHealth: Number(data.avg_score) || 0,
        averageLength: Number(data.avg_chain_length) || 0,
        totalChains: data.total_chains || 0,
      });
    }
  };

  fetchGapChains();
  // 🔹 Fetch per-subject chains
const fetchSubjectChains = async () => {
  const { data, error } = await supabase
    .from('gap_chains_persubject')
    .select('subject_name, chains_mcq1, chains_mcq2, chains_mcq3, chains_mcq4, chains_mcq5, chains_mcq6, avg_chain_length')
    .eq('student_id', user.id);

  if (error) {
    console.error('Error fetching gap_chains_persubject:', error);
    return;
  }
  if (data) setSubjectChains(data);
};

fetchSubjectChains();

}, [user?.id]);



  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = 400;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Get position for chain visualization
  const getChainPosition = (chain: GapChain, index: number) => {
    const chainLength = chain.chain.length;
    const healthScore = chain.chain_health_score;
    
    const x = padding.left + (chainLength / 6) * plotWidth; // Max 6 MCQs
    const y = padding.top + plotHeight - (healthScore / 100) * plotHeight;
    
    return { x, y };
  };

  // Get chain color based on health score
  const getChainColor = (healthScore: number) => {
    if (healthScore >= 80) return { color: '#10b981', glow: 'emeraldGlow' }; // Green (80-100)
    if (healthScore >= 60) return { color: '#eab308', glow: 'yellowGlow' }; // Yellow (60-79)
    if (healthScore >= 40) return { color: '#f97316', glow: 'orangeGlow' }; // Orange (40-59)
    if (healthScore > 0) return { color: '#ef4444', glow: 'redGlow' }; // Red (0-39)
    return { color: '#7f1d1d', glow: 'darkRedGlow' }; // Failed
  };

  // Get subject color
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Anatomy': '#3b82f6',
      'Physiology': '#10b981',
      'Biochemistry': '#8b5cf6',
      'Pharmacology': '#f59e0b',
      'Pathology': '#ef4444',
      'Medicine': '#06b6d4',
    };
    return colors[subject] || '#64748b';
  };

  const handleChainPress = (chain: GapChain, x: number, y: number) => {
    setSelectedChain({ chain, position: { x, y } });
  };

  const handleWeakChainPress = (chain: GapChain) => {
    if (chain.chain_health_score < 60) {
      setSelectedWeakChain(chain);
      setShowAISuggestions(true);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return <BookOpen size={16} color="#ffffff" />;
      case 'video': return <Video size={16} color="#ffffff" />;
      case 'mcq_retry': return <RotateCcw size={16} color="#ffffff" />;
      default: return <Play size={16} color="#ffffff" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'flashcard': return 'from-blue-600 to-indigo-600';
      case 'video': return 'from-purple-600 to-violet-600';
      case 'mcq_retry': return 'from-emerald-600 to-teal-600';
      default: return 'from-slate-600 to-slate-700';
    }
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
            <Text className="text-2xl font-bold text-slate-100">Gap Chains</Text>
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
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
        }}
      >
        {/* Filter Controls */}
        {showFilters && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'spring', duration: 400 }}
            className="mb-6"
          >
            {/* Subject Filter */}
            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Filter by Subject:</Text>
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
            </View>

            {/* Sort Options */}
            <View>
              <Text className="text-slate-300 font-semibold mb-2">Sort by:</Text>
              <View className="flex-row space-x-2">
                {[
                  { key: 'health', label: 'Health Score' },
                  { key: 'length', label: 'Chain Length' },
                  { key: 'subject', label: 'Subject' }
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setSortBy(option.key as any)}
                    className={`px-3 py-2 rounded-lg ${
                      sortBy === option.key
                        ? 'bg-indigo-600/30 border border-indigo-500/50'
                        : 'bg-slate-700/40 border border-slate-600/30'
                    }`}
                  >
                    <Text className={`text-sm ${
                      sortBy === option.key ? 'text-indigo-300' : 'text-slate-400'
                    }`}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </MotiView>
        )}

       {/* Summary Metrics */}
<View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', duration: 600, delay: 200 }}
    className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
  >
    <View className="flex-row items-center mb-2">
      <Award size={16} color="#10b981" />
      <Text className="text-emerald-400 font-semibold text-sm ml-2">Perfect Chains</Text>
    </View>
    <Text className="text-emerald-200 text-xl font-bold">
      {stats ? stats.perfectChains : 0}
    </Text>
    <Text className="text-emerald-300/80 text-xs">
      Solved at MCQ 1
    </Text>
  </MotiView>

  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', duration: 600, delay: 300 }}
    className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
  >
    <View className="flex-row items-center mb-2">
      <Target size={16} color="#3b82f6" />
      <Text className="text-blue-400 font-semibold text-sm ml-2">Avg Health</Text>
    </View>
    <Text className="text-blue-200 text-xl font-bold">
      {stats ? stats.averageHealth.toFixed(0) : 0}
    </Text>
    <Text className="text-blue-300/80 text-xs">
      Out of 100
    </Text>
  </MotiView>

  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', duration: 600, delay: 400 }}
    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
  >
    <View className="flex-row items-center mb-2">
      <GitBranch size={16} color="#f59e0b" />
      <Text className="text-amber-400 font-semibold text-sm ml-2">Avg Length</Text>
    </View>
    <Text className="text-amber-200 text-xl font-bold">
      {stats ? stats.averageLength.toFixed(1) : 0}
    </Text>
    <Text className="text-amber-300/80 text-xs">
      MCQs per chain
    </Text>
  </MotiView>

  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', duration: 600, delay: 500 }}
    className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
  >
    <View className="flex-row items-center mb-2">
      <BarChart3 size={16} color="#8b5cf6" />
      <Text className="text-purple-400 font-semibold text-sm ml-2">Total Chains</Text>
    </View>
    <Text className="text-purple-200 text-xl font-bold">
      {stats ? stats.totalChains : 0}
    </Text>
    <Text className="text-purple-300/80 text-xs">
      PYQs analyzed
    </Text>
  </MotiView>
</View>


        {/* Chain Scatter Plot */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 600 }}
          className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
          style={{
            shadowColor: '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <GitBranch size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Chain Health vs Length Analysis
            </Text>
          </View>

          {/* Chart Container */}
          <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              <View style={{ width: Math.max(chartWidth, 500), height: chartHeight }}>
                <Svg width="100%" height={chartHeight}>
                  <Defs>
                    {/* Gradients for different health levels */}
                    <LinearGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="yellowGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#eab308" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="redGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
                    </LinearGradient>
                    <LinearGradient id="darkRedGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.6" />
                      <Stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.1" />
                    </LinearGradient>
                  </Defs>

                  {/* Grid Lines */}
                  {/* Vertical grid lines (chain length) */}
                  {[1, 2, 3, 4, 5, 6].map((length) => {
                    const x = padding.left + (length / 6) * plotWidth;
                    return (
                      <React.Fragment key={`v-grid-${length}`}>
                        <Line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={padding.top + plotHeight}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        <SvgText
                          x={x}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {length}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Horizontal grid lines (health score) */}
                  {[0, 25, 50, 75, 100].map((score) => {
                    const y = padding.top + plotHeight - (score / 100) * plotHeight;
                    return (
                      <React.Fragment key={`h-grid-${score}`}>
                        <Line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + plotWidth}
                          y2={y}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        <SvgText
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {score}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Chain Data Points */}
                  {chainData.map((chain, index) => {
                    const position = getChainPosition(chain, index);
                    const colors = getChainColor(chain.chain_health_score);
                    const subjectColor = getSubjectColor(chain.subject);
                    const bubbleSize = 6 + (chain.chain.length * 2); // Size based on chain length

                    return (
                      <G key={chain.pyq_id}>
                        {/* Glow effect */}
                        <SvgCircle
                          cx={position.x}
                          cy={position.y}
                          r={bubbleSize + 8}
                          fill={`url(#${colors.glow})`}
                          opacity="0.6"
                        />
                        
                        {/* Main bubble */}
                        <Pressable onPress={() => handleChainPress(chain, position.x, position.y)}>
                          <SvgCircle
                            cx={position.x}
                            cy={position.y}
                            r={bubbleSize}
                            fill={colors.color}
                            stroke={subjectColor}
                            strokeWidth="2"
                          />
                        </Pressable>



                        {/* Chain length indicator */}
                        <SvgText
                          x={position.x}
                          y={position.y + 2}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {chain.chain.length}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Axis Labels */}
                  <SvgText
                    x={padding.left + plotWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#94a3b8"
                  >
                    Chain Length (MCQs)
                  </SvgText>
                  <SvgText
                    x={20}
                    y={padding.top + plotHeight / 2}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#94a3b8"
                    transform={`rotate(-90 20 ${padding.top + plotHeight / 2})`}
                  >
                    Health Score
                  </SvgText>
                </Svg>
              </View>
            </ScrollView>
          </View>

          {/* Chart Legend */}
          <View className="flex-row items-center justify-center space-x-4">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
              <Text className="text-slate-300 text-sm">Excellent (80-100)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-yellow-500 mr-2" />
              <Text className="text-slate-300 text-sm">Good (60-79)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-orange-500 mr-2" />
              <Text className="text-slate-300 text-sm">Fair (40-59)</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
              <Text className="text-slate-300 text-sm">Poor (0-39)</Text>
            </View>
          </View>
        </MotiView>

        {/* Chain List View */}

        {/* Health Score Distribution */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg items-center justify-center mr-3">
              <TrendingUp size={16} color="#ffffff" />
            </View>
            <Text className="text-lg font-bold text-slate-100">
              Health Score Distribution
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { range: '80-100', label: 'Excellent', color: '#10b981', count: chainData.filter(c => c.chain_health_score >= 80).length },
              { range: '60-79', label: 'Good', color: '#eab308', count: chainData.filter(c => c.chain_health_score >= 60 && c.chain_health_score < 80).length },
              { range: '40-59', label: 'Fair', color: '#f97316', count: chainData.filter(c => c.chain_health_score >= 40 && c.chain_health_score < 60).length },
              { range: '1-39', label: 'Poor', color: '#ef4444', count: chainData.filter(c => c.chain_health_score > 0 && c.chain_health_score < 40).length },
              { range: '0', label: 'Failed', color: '#7f1d1d', count: chainData.filter(c => c.chain_health_score === 0).length },
            ].map((category, index) => (
              <MotiView
                key={category.range}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 1200 + index * 100 }}
                className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
              >
                <View className="items-center">
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: category.color }}
                  >
                    <Text className="text-white font-bold text-sm">
                      {category.count}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-xs font-semibold text-center">
                    {category.label}
                  </Text>
                  <Text className="text-slate-400 text-xs text-center">
                    {category.range}
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Subject Analysis Tabs */}
        <SubjectChainTabs data={subjectChains} />

        {/* Insights Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1400 }}
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
        >
          <View className="flex-row items-center mb-3">
            <AlertTriangle size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Chain Analysis Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Best Performance:</Text> {
                chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
              } - {
                chainData.reduce((best, c) => c.chain_health_score > best.chain_health_score ? c : best, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
              }
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">Needs Focus:</Text> {
                chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).subject
              } - {
                chainData.reduce((worst, c) => c.chain_health_score < worst.chain_health_score ? c : worst, chainData[0] || { subject: 'N/A', topic: 'N/A' }).topic
              }
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              {stats && stats.perfectChains > 0 
  ? `Great job! ${stats.perfectChains} chains solved perfectly at MCQ 1. Focus on improving longer chains to boost overall efficiency.`
  : stats && stats.averageHealth >= 70
  ? "Good progress! Most chains are resolved efficiently. Work on solving more at MCQ 1 for perfect scores."
  : "Consider reviewing fundamental concepts. Longer chains indicate knowledge gaps that need reinforcement."
}

            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* AI Reroute Fix Suggestions Side Panel */}
      {showAISuggestions && selectedWeakChain && (
        <MotiView
          from={{ opacity: 0, translateX: 300 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'spring', duration: 600 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-slate-800/95 border-l border-slate-700/50 p-6 shadow-2xl z-50"
          style={{
            shadowColor: '#f59e0b',
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Panel Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100 mb-1">
                AI Reroute Fixes
              </Text>
              <Text className="text-sm text-amber-400">
                {selectedWeakChain.subject} • {selectedWeakChain.topic}
              </Text>
              <Text className="text-xs text-slate-500 mt-1">
                Health Score: {selectedWeakChain.chain_health_score}/100
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setShowAISuggestions(false);
                setSelectedWeakChain(null);
              }}
              className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Problem Analysis */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={16} color="#ef4444" />
                <Text className="text-slate-100 font-semibold ml-2">Problem Analysis</Text>
              </View>
              <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <Text className="text-red-200 text-sm">
                  Chain failed at <Text className="font-bold">
                    {(() => {
                      const firstWrong = selectedWeakChain.chain.findIndex(link => !link.is_correct);
                      return firstWrong >= 0 ? `MCQ ${firstWrong + 1}` : 'MCQ 1';
                    })()}
                  </Text>. This indicates a fundamental knowledge gap that needs targeted intervention.
                </Text>
              </View>
            </View>

            {/* AI Suggestions */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={16} color="#fbbf24" />
                <Text className="text-slate-100 font-semibold ml-2">Recommended Fixes</Text>
              </View>
              
              <View className="space-y-3">
                {(() => {
                  const aiData = getAIFixSuggestions(selectedWeakChain);
                  return aiData.suggestions.map((suggestion, index) => (
                    <MotiView
                      key={`${suggestion.type}-${index}`}
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'spring', duration: 400, delay: index * 100 + 200 }}
                    >
                      <Pressable
                        onPress={() => {
                          // Handle suggestion action
                          console.log(`Opening ${suggestion.type}:`, suggestion.link);
                        }}
                        className={`bg-gradient-to-r ${getSuggestionColor(suggestion.type)} rounded-xl p-4 shadow-lg active:scale-95 border border-white/10`}
                        style={{
                          shadowColor: suggestion.type === 'flashcard' ? '#3b82f6' : 
                                     suggestion.type === 'video' ? '#8b5cf6' : '#10b981',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                            {getSuggestionIcon(suggestion.type)}
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-semibold text-base mb-1">
                              {suggestion.title}
                            </Text>
                            <Text className="text-white/80 text-sm">
                              {suggestion.type === 'flashcard' && 'Review key concepts with spaced repetition'}
                              {suggestion.type === 'video' && 'Watch visual explanation and examples'}
                              {suggestion.type === 'mcq_retry' && 'Practice similar questions to reinforce learning'}
                            </Text>
                          </View>
                          <ExternalLink size={14} color="#ffffff" style={{ opacity: 0.7 }} />
                        </View>
                      </Pressable>
                    </MotiView>
                  ));
                })()}
              </View>
            </View>

            {/* Chain Breakdown */}
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <GitBranch size={16} color="#06b6d4" />
                <Text className="text-slate-100 font-semibold ml-2">Chain Breakdown</Text>
              </View>
              <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                <View className="space-y-2">
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-bold text-cyan-400">Chain Length:</Text> {selectedWeakChain.chain.length} MCQs
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-bold text-cyan-400">First Failure:</Text> {(() => {
                      const firstWrong = selectedWeakChain.chain.findIndex(link => !link.is_correct);
                      return firstWrong >= 0 ? `MCQ ${firstWrong + 1}` : 'None';
                    })()}
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-bold text-cyan-400">Solved At:</Text> {(() => {
                      const correctIndex = selectedWeakChain.chain.findIndex(link => link.is_correct);
                      return correctIndex >= 0 ? `MCQ ${correctIndex + 1}` : 'Unsolved';
                    })()}
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-bold text-cyan-400">Time Credit:</Text> {selectedWeakChain.time_credit_minutes} minutes
                  </Text>
                </View>
              </View>
            </View>

            {/* Study Plan */}
            <View>
              <View className="flex-row items-center mb-3">
                <Target size={16} color="#10b981" />
                <Text className="text-slate-100 font-semibold ml-2">Suggested Study Plan</Text>
              </View>
              <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <View className="space-y-2">
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">1.</Text> Start with the flashcard to review fundamentals
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">2.</Text> Watch the video for visual reinforcement
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">3.</Text> Retry similar MCQs to test understanding
                  </Text>
                  <Text className="text-emerald-200 text-sm">
                    <Text className="font-bold">4.</Text> Return to original PYQ when confident
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </MotiView>
      )}

      {/* Overlay for AI Suggestions Panel */}
      {showAISuggestions && (
        <Pressable
          onPress={() => {
            setShowAISuggestions(false);
            setSelectedWeakChain(null);
          }}
          className="absolute inset-0 bg-black/30 z-40"
        />
      )}

      {/* Chain Tooltip */}
      {selectedChain && (
        <ChainTooltip
          chain={selectedChain.chain}
          position={selectedChain.position}
          onClose={() => setSelectedChain(null)}
        />
      )}
    </View>
  );
}