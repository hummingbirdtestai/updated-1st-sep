import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Bell, Zap, Target, X, Users, Flame, Trophy, Heart } from 'lucide-react-native';

interface Nudge {
  id: number;
  type: 'catchup' | 'challenge' | 'motivation' | 'reminder';
  message: string;
  buddyFrom: string;
  buddyTo: string;
  timestamp?: string;
}

interface AccountabilityNudgesProps {
  nudges?: Nudge[];
  onNudgeDismiss?: (nudgeId: number) => void;
  onNudgeAction?: (nudge: Nudge) => void;
}

interface NudgeCardProps {
  nudge: Nudge;
  index: number;
  onDismiss: (nudgeId: number) => void;
  onAction: (nudge: Nudge) => void;
}

function NudgeCard({ nudge, index, onDismiss, onAction }: NudgeCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [shakePhase, setShakePhase] = useState(0);

  // Pulse animation for high priority nudges
  useEffect(() => {
    if (nudge.type !== 'catchup') return;
    
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 4);
    }, 600);
    
    return () => clearInterval(interval);
  }, [nudge.type]);

  // Shake animation for challenges
  useEffect(() => {
    if (nudge.type !== 'challenge') return;
    
    const interval = setInterval(() => {
      setShakePhase(prev => (prev + 1) % 8);
    }, 200);
    
    return () => clearInterval(interval);
  }, [nudge.type]);

  const getNudgeTheme = (type: string) => {
    switch (type) {
      case 'catchup':
        return {
          gradient: 'from-red-500/20 via-orange-500/15 to-yellow-500/10',
          border: 'border-red-500/30',
          iconBg: 'from-red-500 to-orange-600',
          textAccent: 'text-red-300',
          shadowColor: '#ef4444',
          icon: Zap,
          emoji: '⚡',
          label: 'Catch Up'
        };
      case 'challenge':
        return {
          gradient: 'from-purple-500/20 via-indigo-500/15 to-blue-500/10',
          border: 'border-purple-500/30',
          iconBg: 'from-purple-500 to-indigo-600',
          textAccent: 'text-purple-300',
          shadowColor: '#8b5cf6',
          icon: Target,
          emoji: '🎯',
          label: 'Challenge'
        };
      case 'motivation':
        return {
          gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10',
          border: 'border-emerald-500/30',
          iconBg: 'from-emerald-500 to-teal-600',
          textAccent: 'text-emerald-300',
          shadowColor: '#10b981',
          icon: Flame,
          emoji: '🔥',
          label: 'Motivation'
        };
      case 'reminder':
        return {
          gradient: 'from-amber-500/20 via-yellow-500/15 to-orange-500/10',
          border: 'border-amber-500/30',
          iconBg: 'from-amber-500 to-orange-600',
          textAccent: 'text-amber-300',
          shadowColor: '#f59e0b',
          icon: Bell,
          emoji: '🔔',
          label: 'Reminder'
        };
      default:
        return {
          gradient: 'from-slate-500/20 via-slate-400/15 to-slate-300/10',
          border: 'border-slate-500/30',
          iconBg: 'from-slate-500 to-slate-600',
          textAccent: 'text-slate-300',
          shadowColor: '#64748b',
          icon: Bell,
          emoji: '📢',
          label: 'Nudge'
        };
    }
  };

  const theme = getNudgeTheme(nudge.type);
  const IconComponent = theme.icon;

  // Get buddy avatar color
  const getBuddyColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'arjun': return { bg: 'bg-blue-500', initial: 'A' };
      case 'meera': return { bg: 'bg-purple-500', initial: 'M' };
      default: return { bg: 'bg-slate-500', initial: name.charAt(0).toUpperCase() };
    }
  };

  const fromBuddy = getBuddyColor(nudge.buddyFrom);
  const toBuddy = getBuddyColor(nudge.buddyTo);

  const handleSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX, velocityX } = nativeEvent;
      if (Math.abs(velocityX) > 500 || Math.abs(translationX) > 150) {
        setIsVisible(false);
        setTimeout(() => onDismiss(nudge.id), 300);
      }
    }
  };

  const pulseScale = nudge.type === 'catchup' ? (1 + Math.sin(pulsePhase) * 0.03) : 1;
  const shakeOffset = nudge.type === 'challenge' ? Math.sin(shakePhase) * 2 : 0;

  if (!isVisible) return null;

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipe}>
      <MotiView
        from={{ 
          opacity: 0, 
          translateY: 50, 
          scale: 0.9,
          rotateX: '15deg'
        }}
        animate={{ 
          opacity: 1, 
          translateY: 0, 
          scale: pulseScale,
          rotateX: '0deg',
          translateX: shakeOffset
        }}
        transition={{ 
          type: 'spring', 
          duration: 800, 
          delay: index * 200 + 300,
          damping: 15,
          stiffness: 200
        }}
        className={`bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-3xl p-6 mb-4 shadow-2xl`}
        style={{
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Animated Background Glow */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 3000,
            delay: index * 500,
          }}
          className="absolute inset-0 rounded-3xl"
          style={{ backgroundColor: theme.shadowColor }}
        />

        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-6">
          {/* From Buddy Avatar */}
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              duration: 800, 
              delay: index * 200 + 500,
              damping: 12,
              stiffness: 300
            }}
            className={`w-16 h-16 ${fromBuddy.bg} rounded-2xl items-center justify-center mr-4 shadow-xl`}
            style={{
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Rotating background glow */}
            <MotiView
              from={{ rotate: '0deg', scale: 1 }}
              animate={{ rotate: '360deg', scale: 1.2 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 8000,
              }}
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{ backgroundColor: theme.shadowColor }}
            />
            
            <Text className="text-white font-bold text-2xl">{fromBuddy.initial}</Text>
            
            {/* Emoji overlay */}
            <View className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-lg">
              <Text className="text-lg">{theme.emoji}</Text>
            </View>
          </MotiView>

          {/* Arrow and To Buddy */}
          <View className="flex-row items-center flex-1">
            {/* Animated Arrow */}
            <MotiView
              from={{ translateX: -20, opacity: 0 }}
              animate={{ translateX: 0, opacity: 1 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2000,
                delay: index * 200 + 700,
              }}
              className="mx-4"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
                <Text className="text-slate-400 text-xl mx-2">→</Text>
                <View className="w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
              </View>
            </MotiView>

            {/* To Buddy Avatar */}
            <MotiView
              from={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                duration: 800, 
                delay: index * 200 + 600,
                damping: 12,
                stiffness: 300
              }}
              className={`w-12 h-12 ${toBuddy.bg} rounded-xl items-center justify-center shadow-lg`}
              style={{
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-white font-bold text-lg">{toBuddy.initial}</Text>
            </MotiView>
          </View>

          {/* Nudge Type Badge */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              duration: 400, 
              delay: index * 200 + 800 
            }}
            className={`bg-gradient-to-r ${theme.iconBg} rounded-full px-3 py-1 shadow-lg`}
            style={{
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white text-xs font-bold uppercase tracking-wide">
              {theme.label}
            </Text>
          </MotiView>

          {/* Dismiss Button */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              duration: 400, 
              delay: index * 200 + 900 
            }}
          >
            <Pressable
              onPress={() => {
                setIsVisible(false);
                setTimeout(() => onDismiss(nudge.id), 300);
              }}
              className="w-8 h-8 rounded-full bg-slate-700/60 items-center justify-center ml-3 active:scale-90 shadow-lg"
              style={{
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <X size={14} color="#94a3b8" />
            </Pressable>
          </MotiView>
        </View>

        {/* Main Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            type: 'spring', 
            duration: 600, 
            delay: index * 200 + 800 
          }}
          className="bg-slate-800/40 rounded-2xl p-5 border border-slate-600/30 mb-6 shadow-inner"
        >
          <Text className="text-slate-100 text-lg leading-7 font-medium text-center">
            {nudge.message}
          </Text>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring', 
            duration: 600, 
            delay: index * 200 + 1000 
          }}
          className="flex-row items-center justify-between"
        >
          {/* Timestamp */}
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-slate-500 rounded-full mr-2" />
            <Text className="text-slate-400 text-sm">
              {nudge.timestamp || 'Just now'}
            </Text>
          </View>

          {/* Action Button */}
          <Pressable
            onPress={() => onAction(nudge)}
            className={`bg-gradient-to-r ${theme.iconBg} rounded-xl px-6 py-3 flex-row items-center shadow-lg active:scale-95`}
            style={{
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <IconComponent size={16} color="#ffffff" />
            <Text className="text-white font-bold text-base ml-2">
              {nudge.type === 'catchup' ? 'Catch Up' :
               nudge.type === 'challenge' ? 'Accept' :
               nudge.type === 'motivation' ? 'Let\'s Go' : 'Remind Me'}
            </Text>
          </Pressable>
        </MotiView>

        {/* Floating particles effect for motivation nudges */}
        {nudge.type === 'motivation' && (
          <View className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <MotiView
                key={i}
                from={{ 
                  opacity: 0, 
                  translateY: 20,
                  translateX: Math.random() * 200 - 100,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  translateY: -40,
                  translateX: Math.random() * 100 - 50,
                  scale: [0, 1, 0]
                }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 3000,
                  delay: i * 500 + index * 1000,
                }}
                className="absolute"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
              >
                <View className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg" />
              </MotiView>
            ))}
          </View>
        )}

        {/* Fire particles effect for catchup nudges */}
        {nudge.type === 'catchup' && (
          <View className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <MotiView
                key={i}
                from={{ 
                  opacity: 0, 
                  translateY: 10,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  translateY: -30,
                  scale: [0, 1.2, 0]
                }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 2000,
                  delay: i * 400 + index * 800,
                }}
                className="absolute"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
              >
                <View className="w-1.5 h-1.5 bg-orange-400 rounded-full shadow-lg" />
              </MotiView>
            ))}
          </View>
        )}

        {/* Swipe Indicator */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2000,
            delay: index * 200 + 1200,
          }}
          className="absolute bottom-2 right-4"
        >
          <Text className="text-slate-500 text-xs">← Swipe to dismiss</Text>
        </MotiView>
      </MotiView>
    </PanGestureHandler>
  );
}

export default function AccountabilityNudges({ 
  nudges = [],
  onNudgeDismiss,
  onNudgeAction
}: AccountabilityNudgesProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Mock data if none provided
  const mockNudges: Nudge[] = [
    {
      id: 1,
      type: "catchup",
      message: "⚡ Meera is 250 PYQs ahead. Time to close the gap!",
      buddyFrom: "Meera",
      buddyTo: "Arjun",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "challenge",
      message: "🎯 Arjun mastered DNA today. Can you match it?",
      buddyFrom: "Arjun",
      buddyTo: "Meera",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "motivation",
      message: "🔥 You both are crushing it! Keep the momentum going!",
      buddyFrom: "System",
      buddyTo: "Both",
      timestamp: "6 hours ago"
    },
    {
      id: 4,
      type: "reminder",
      message: "🔔 Don't forget your daily Biochemistry session!",
      buddyFrom: "System",
      buddyTo: "Arjun",
      timestamp: "1 day ago"
    }
  ];

  const displayNudges = nudges.length > 0 ? nudges : mockNudges;
  const [visibleNudges, setVisibleNudges] = useState(displayNudges);

  const handleNudgeDismiss = (nudgeId: number) => {
    setVisibleNudges(prev => prev.filter(n => n.id !== nudgeId));
    onNudgeDismiss?.(nudgeId);
  };

  const handleNudgeAction = (nudge: Nudge) => {
    onNudgeAction?.(nudge);
    // Could also dismiss after action
    // handleNudgeDismiss(nudge.id);
  };

  // Calculate nudge stats
  const catchupNudges = visibleNudges.filter(n => n.type === 'catchup').length;
  const challengeNudges = visibleNudges.filter(n => n.type === 'challenge').length;
  const motivationNudges = visibleNudges.filter(n => n.type === 'motivation').length;
  const reminderNudges = visibleNudges.filter(n => n.type === 'reminder').length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
      style={{
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
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
            <Bell size={24} color="#ffffff" />
            
            {/* Pulsing notification dot */}
            <MotiView
              from={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2000,
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
            />
          </MotiView>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">
              Accountability Nudges 📢
            </Text>
            <Text className="text-slate-400 text-base">
              Smart notifications to keep you both motivated
            </Text>
          </View>
        </View>

        {/* Active Nudges Count */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View className="bg-amber-500/20 rounded-full px-4 py-3 border border-amber-500/30 shadow-lg">
            <Text className="text-amber-400 font-bold text-2xl">
              {visibleNudges.length}
            </Text>
            <Text className="text-amber-300/80 text-xs text-center font-medium">
              active nudges
            </Text>
          </View>
        </MotiView>
      </View>

      {/* Summary Stats */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 border-b border-slate-700/30">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Zap size={14} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Catch Up</Text>
          </View>
          <Text className="text-red-200 text-xl font-bold">
            {catchupNudges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Target size={14} color="#8b5cf6" />
            <Text className="text-purple-400 font-semibold text-sm ml-2">Challenge</Text>
          </View>
          <Text className="text-purple-200 text-xl font-bold">
            {challengeNudges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Flame size={14} color="#10b981" />
            <Text className="text-emerald-400 font-semibold text-sm ml-2">Motivation</Text>
          </View>
          <Text className="text-emerald-200 text-xl font-bold">
            {motivationNudges}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
        >
          <View className="flex-row items-center mb-2">
            <Bell size={14} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Reminder</Text>
          </View>
          <Text className="text-amber-200 text-xl font-bold">
            {reminderNudges}
          </Text>
        </MotiView>
      </View>

      {/* Nudges List */}
      <ScrollView 
        className="p-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {visibleNudges.length > 0 ? (
          <View className="space-y-4">
            {visibleNudges.map((nudge, index) => (
              <NudgeCard
                key={nudge.id}
                nudge={nudge}
                index={index}
                onDismiss={handleNudgeDismiss}
                onAction={handleNudgeAction}
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
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Heart size={32} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-slate-100 mb-2 text-center">
              All Caught Up! 🎉
            </Text>
            <Text className="text-slate-300 text-base text-center max-w-md">
              No pending nudges. You and your buddy are perfectly synchronized in your study journey!
            </Text>
          </MotiView>
        )}
      </ScrollView>

      {/* Footer */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 1200 }}
        className="p-6 border-t border-slate-700/30 bg-slate-900/20"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-slate-100 font-semibold text-base">
              Smart Nudge System
            </Text>
            <Text className="text-slate-400 text-sm">
              AI-powered accountability to keep you both on track
            </Text>
          </View>
          <Pressable className="bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600/50">
            <Text className="text-slate-300 text-sm font-medium">Settings</Text>
          </Pressable>
        </View>
      </MotiView>
    </MotiView>
  );
}