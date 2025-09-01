import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Clock, Calendar, Target, Focus, TriangleAlert as AlertTriangle, X, Play, Pause } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import sessionTimelineData from '@/data/session-timeline-data.json';

interface Session {
  id: string;
  start_time: string;
  end_time: string;
  pyqs_completed: number;
  distraction_events: number;
  subject: string;
  topics: string[];
}

interface SessionTooltipProps {
  session: Session;
  position: { x: number; y: number };
  onClose: () => void;
}

function SessionTooltip({ session, position, onClose }: SessionTooltipProps) {
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes
  const expectedTime = session.pyqs_completed * 4.5;
  const isDeepWork = session.distraction_events <= 1;
  const efficiency = expectedTime > 0 ? (duration / expectedTime) : 1;

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
        shadowColor: isDeepWork ? '#10b981' : '#ef4444',
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

      {/* Session Info */}
      <View className="pr-6">
        <Text className="text-slate-100 font-bold text-sm mb-1">
          {session.subject}
        </Text>
        <Text className="text-slate-300 text-xs mb-3">
          {session.topics.join(' • ')}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Time</Text>
            <Text className="text-slate-300 text-xs">
              {startTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })} - {endTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Duration</Text>
            <Text className="text-slate-300 text-xs">
              {duration.toFixed(0)}m
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">PYQs</Text>
            <Text className="text-slate-300 text-xs">
              {session.pyqs_completed}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Distractions</Text>
            <Text className={`text-xs font-semibold ${
              session.distraction_events === 0 ? 'text-emerald-400' : 
              session.distraction_events <= 2 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {session.distraction_events}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Focus Quality</Text>
            <Text className={`text-xs font-semibold ${isDeepWork ? 'text-emerald-400' : 'text-red-400'}`}>
              {isDeepWork ? 'Deep Work' : 'Distracted'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-slate-400 text-xs">Efficiency</Text>
            <Text className={`text-xs font-semibold ${
              efficiency <= 1.1 ? 'text-emerald-400' : 
              efficiency <= 1.3 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {efficiency <= 1.1 ? 'Efficient' : 
               efficiency <= 1.3 ? 'On Track' : 'Slow'}
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function SessionTimelineView() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [selectedSession, setSelectedSession] = useState<{ session: Session; position: { x: number; y: number } } | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Group sessions by day
  const groupSessionsByDay = () => {
    const grouped = new Map<string, Session[]>();
    
    sessionTimelineData.sessions.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(session);
    });

    return Array.from(grouped.entries()).map(([date, sessions]) => ({
      date,
      sessions: sessions.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    }));
  };

  const dayGroups = groupSessionsByDay();
  const currentDayData = dayGroups[currentDay];

  // Animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(timer);
  }, []);

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

  const getSessionType = (session: Session) => {
    return session.distraction_events <= 1 ? 'deep' : 'distracted';
  };

  const handleSessionPress = (session: Session, x: number, y: number) => {
    setSelectedSession({ session, position: { x, y } });
  };

  // Calculate timeline dimensions
  const timelineHeight = 120;
  const hourWidth = 60; // pixels per hour
  const timelineWidth = 24 * hourWidth; // 24 hours
  const sessionHeight = 40;

  const getSessionPosition = (session: Session) => {
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
    
    return {
      x: startHour * hourWidth,
      width: Math.max(duration * hourWidth, 40), // minimum 40px width
      y: 40,
    };
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center mr-3 shadow-lg">
            <Calendar size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100">Session Timeline</Text>
            <Text className="text-slate-400 text-sm">
              {currentDayData ? new Date(currentDayData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              }) : 'No data'}
            </Text>
          </View>
        </View>

        {/* Day Navigation */}
        <View className="flex-row space-x-2">
          <Pressable
            onPress={() => setCurrentDay(Math.max(0, currentDay - 1))}
            disabled={currentDay === 0}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              currentDay === 0 ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <Text className={`font-bold ${currentDay === 0 ? 'text-slate-500' : 'text-slate-300'}`}>
              ←
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentDay(Math.min(dayGroups.length - 1, currentDay + 1))}
            disabled={currentDay === dayGroups.length - 1}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              currentDay === dayGroups.length - 1 ? 'bg-slate-700/30' : 'bg-slate-700/60'
            }`}
          >
            <Text className={`font-bold ${currentDay === dayGroups.length - 1 ? 'text-slate-500' : 'text-slate-300'}`}>
              →
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Timeline Container */}
      <View className="bg-slate-900/40 rounded-xl p-4 border border-slate-600/30 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
        >
          <View style={{ width: timelineWidth, height: timelineHeight }}>
            <Svg width={timelineWidth} height={timelineHeight}>
              <Defs>
                {/* Gradients for different session types */}
                <LinearGradient id="deepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="distractedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#f87171" stopOpacity="1" />
                </LinearGradient>
                
                {/* Animated timeline gradient */}
                <LinearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset={`${(animationProgress * 100) - 10}%`} stopColor="transparent" stopOpacity="0" />
                  <Stop offset={`${animationProgress * 100}%`} stopColor="#06b6d4" stopOpacity="1" />
                  <Stop offset={`${(animationProgress * 100) + 10}%`} stopColor="transparent" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Hour Grid Lines */}
              {Array.from({ length: 25 }, (_, i) => (
                <Line
                  key={`hour-${i}`}
                  x1={i * hourWidth}
                  y1="0"
                  x2={i * hourWidth}
                  y2={timelineHeight}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray={i % 6 === 0 ? "none" : "2,2"}
                />
              ))}

              {/* Hour Labels */}
              {Array.from({ length: 25 }, (_, i) => (
                <SvgText
                  key={`label-${i}`}
                  x={i * hourWidth}
                  y="15"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {i.toString().padStart(2, '0')}:00
                </SvgText>
              ))}

              {/* Animated Timeline */}
              <Line
                x1="0"
                y1="25"
                x2={timelineWidth}
                y2="25"
                stroke="url(#timelineGradient)"
                strokeWidth="3"
              />

              {/* Session Blocks */}
              {currentDayData?.sessions.map((session, index) => {
                const position = getSessionPosition(session);
                const isDeepWork = getSessionType(session) === 'deep';
                const subjectColor = getSubjectColor(session.subject);

                return (
                  <React.Fragment key={session.id}>
                    {/* Session Block */}
                    <Rect
                      x={position.x}
                      y={position.y}
                      width={position.width}
                      height={sessionHeight}
                      fill={isDeepWork ? "url(#deepGradient)" : "url(#distractedGradient)"}
                      stroke={subjectColor}
                      strokeWidth="2"
                      rx="8"
                      ry="8"
                      onPress={() => handleSessionPress(session, position.x + position.width / 2, position.y)}
                    />

                    {/* Session Label */}
                    <SvgText
                      x={position.x + position.width / 2}
                      y={position.y + sessionHeight / 2 - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#ffffff"
                    >
                      {session.subject}
                    </SvgText>
                    <SvgText
                      x={position.x + position.width / 2}
                      y={position.y + sessionHeight / 2 + 8}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#ffffff"
                      opacity="0.8"
                    >
                      {session.pyqs_completed} PYQs
                    </SvgText>

                    {/* Distraction Indicator */}
                    {session.distraction_events > 1 && (
                      <SvgText
                        x={position.x + position.width - 8}
                        y={position.y + 12}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#ef4444"
                      >
                        ⚠️
                      </SvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </ScrollView>
      </View>

      {/* Day Summary */}
      {currentDayData && (
        <View className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 800 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Focus size={14} color="#10b981" />
              <Text className="text-emerald-400 font-semibold text-sm ml-2">Deep Sessions</Text>
            </View>
            <Text className="text-emerald-200 text-lg font-bold">
              {currentDayData.sessions.filter(s => getSessionType(s) === 'deep').length}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 900 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={14} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Distracted</Text>
            </View>
            <Text className="text-red-200 text-lg font-bold">
              {currentDayData.sessions.filter(s => getSessionType(s) === 'distracted').length}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1000 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Target size={14} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Total PYQs</Text>
            </View>
            <Text className="text-blue-200 text-lg font-bold">
              {currentDayData.sessions.reduce((sum, s) => sum + s.pyqs_completed, 0)}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 1100 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={14} color="#8b5cf6" />
              <Text className="text-purple-400 font-semibold text-sm ml-2">Study Time</Text>
            </View>
            <Text className="text-purple-200 text-lg font-bold">
              {(currentDayData.sessions.reduce((sum, s) => {
                const start = new Date(s.start_time);
                const end = new Date(s.end_time);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60);
              }, 0) / 60).toFixed(1)}h
            </Text>
          </MotiView>
        </View>
      )}

      {/* Legend */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="flex-row items-center justify-center mt-4 space-x-6 pt-4 border-t border-slate-600/30"
      >
        <View className="flex-row items-center">
          <View className="w-4 h-3 bg-emerald-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">Deep Work</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-3 bg-red-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">Distracted</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-cyan-500 rounded mr-2" />
          <Text className="text-slate-300 text-sm">Timeline</Text>
        </View>
      </MotiView>

      {/* Session Tooltip */}
      {selectedSession && (
        <SessionTooltip
          session={selectedSession.session}
          position={selectedSession.position}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </MotiView>
  );
}