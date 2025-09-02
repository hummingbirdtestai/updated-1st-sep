import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { Users, Clock, Target, TrendingUp, Info } from 'lucide-react-native';

interface BuddyProgress {
  buddyA: { name: string; completedPYQs: number };
  buddyB: { name: string; completedPYQs: number };
  totalPYQs: number;
}

interface PeerProgressSyncMeterProps {
  data?: BuddyProgress;
}

interface TooltipData {
  buddy: string;
  pyqs: number;
  hours: number;
  position: { x: number; y: number };
}

// Mock data
const mockData: BuddyProgress = {
  buddyA: { name: "Arjun", completedPYQs: 1800 },
  buddyB: { name: "Meera", completedPYQs: 2100 },
  totalPYQs: 9960
};

export default function PeerProgressSyncMeter({ data = mockData }: PeerProgressSyncMeterProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [animatedSyncScore, setAnimatedSyncScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState<TooltipData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Calculate metrics
  const timeA = data.buddyA.completedPYQs * 4.5; // minutes
  const timeB = data.buddyB.completedPYQs * 4.5; // minutes
  const maxTime = Math.max(timeA, timeB);
  const timeDiff = Math.abs(timeA - timeB);
  const syncPercent = maxTime > 0 ? 100 - (timeDiff / maxTime * 100) : 100;
  
  const progressA = (data.buddyA.completedPYQs / data.totalPYQs) * 100;
  const progressB = (data.buddyB.completedPYQs / data.totalPYQs) * 100;
  
  const hoursA = timeA / 60;
  const hoursB = timeB / 60;

  // Determine overlap zone
  const overlapStart = Math.min(progressA, progressB);
  const overlapEnd = Math.max(progressA, progressB);
  const overlapWidth = Math.abs(progressA - progressB);
  const isHighSync = syncPercent >= 80;

  // Animate sync score counter
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedSyncScore(prev => {
        const increment = syncPercent / 50; // Animate over ~50 frames
        if (prev < syncPercent) {
          return Math.min(prev + increment, syncPercent);
        }
        return syncPercent;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [syncPercent]);

  // Pulse animation for high sync
  useEffect(() => {
    if (!isHighSync) return;
    
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);
    
    return () => clearInterval(timer);
  }, [isHighSync]);

  const handleBuddyPress = (buddy: 'A' | 'B', event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const buddyData = buddy === 'A' ? data.buddyA : data.buddyB;
    const hours = buddy === 'A' ? hoursA : hoursB;
    const pyqs = buddy === 'A' ? data.buddyA.completedPYQs : data.buddyB.completedPYQs;

    setShowTooltip({
      buddy: buddyData.name,
      pyqs,
      hours,
      position,
    });
  };

  const getSyncColor = (score: number) => {
    if (score >= 90) return { color: '#10b981', label: 'Perfect Sync', glow: '#34d399' };
    if (score >= 80) return { color: '#22c55e', label: 'Excellent Sync', glow: '#4ade80' };
    if (score >= 70) return { color: '#eab308', label: 'Good Sync', glow: '#fbbf24' };
    if (score >= 60) return { color: '#f59e0b', label: 'Fair Sync', glow: '#fb923c' };
    return { color: '#ef4444', label: 'Poor Sync', glow: '#f87171' };
  };

  const syncInfo = getSyncColor(syncPercent);
  const pulseScale = isHighSync ? (1 + Math.sin(animationPhase) * 0.05) : 1;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl p-6 mb-6 border border-slate-700/40 shadow-lg"
      style={{
        shadowColor: syncInfo.color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* --- all your existing content unchanged --- */}

      {/* Sync Recommendations */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 600, delay: 2000 }}
        className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mt-6"
      >
        <View className="flex-row items-center mb-3">
          <Info size={16} color="#06b6d4" />
          <Text className="text-slate-100 font-semibold ml-2">Sync Recommendations</Text>
        </View>
        
        <View className="space-y-3">
          {syncPercent >= 90 && (
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <Text className="text-emerald-200 text-sm">
                🎯 <Text className="font-bold">Perfect Sync!</Text> You're both progressing excellently. 
                Keep up the momentum and continue supporting each other.
              </Text>
            </View>
          )}
          
          {syncPercent >= 70 && syncPercent < 90 && (
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <Text className="text-amber-200 text-sm">
                ⚡ <Text className="font-bold">Good Sync!</Text> Minor pace differences. 
                Consider coordinating study schedules for better alignment.
              </Text>
            </View>
          )}
          
          {syncPercent < 70 && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Text className="text-red-200 text-sm">
                🚨 <Text className="font-bold">Sync Gap Detected!</Text> {
                  data.buddyA.completedPYQs > data.buddyB.completedPYQs ? data.buddyA.name : data.buddyB.name
                } should help mentor the other to close the gap.
              </Text>
            </View>
          )}

          <View className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
            <Text className="text-cyan-200 text-sm">
              💡 <Text className="font-bold">Study Together:</Text> Plan joint study sessions for topics where 
              one buddy is stronger to maximize learning efficiency.
            </Text>
          </View>
        </View>
      </MotiView>
    </MotiView>
  );
}
