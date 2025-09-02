import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { GitBranch, Target, Users, X, Info, Zap, Clock } from 'lucide-react-native';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import * as d3 from 'd3';

interface GapNode {
  id: string;
  avg_time_lost_hr: number;
  is_student_gap: boolean;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GapEdge {
  source: string;
  target: string;
  overlap_strength: number;
}

interface NetworkData {
  nodes: GapNode[];
  edges: GapEdge[];
}

interface TooltipData {
  node: GapNode;
  position: { x: number; y: number };
}

interface GapNetworkGraphProps {
  data?: NetworkData;
}

// Mock data
const mockData: NetworkData = {
  "nodes": [
    { "id": "Action Potential", "avg_time_lost_hr": 7.5, "is_student_gap": true },
    { "id": "Long Tracts", "avg_time_lost_hr": 11, "is_student_gap": true },
    { "id": "Oxygen Dissociation Curve", "avg_time_lost_hr": 4, "is_student_gap": false },
    { "id": "Enzyme Kinetics", "avg_time_lost_hr": 8.2, "is_student_gap": true },
    { "id": "Cardiac Cycle", "avg_time_lost_hr": 6.1, "is_student_gap": false },
    { "id": "Renal Clearance", "avg_time_lost_hr": 9.3, "is_student_gap": true },
    { "id": "Starling Forces", "avg_time_lost_hr": 5.7, "is_student_gap": false }
  ],
  "edges": [
    { "source": "Action Potential", "target": "Long Tracts", "overlap_strength": 60 },
    { "source": "Long Tracts", "target": "Oxygen Dissociation Curve", "overlap_strength": 40 },
    { "source": "Action Potential", "target": "Enzyme Kinetics", "overlap_strength": 35 },
    { "source": "Enzyme Kinetics", "target": "Cardiac Cycle", "overlap_strength": 55 },
    { "source": "Cardiac Cycle", "target": "Renal Clearance", "overlap_strength": 45 },
    { "source": "Renal Clearance", "target": "Starling Forces", "overlap_strength": 70 },
    { "source": "Action Potential", "target": "Cardiac Cycle", "overlap_strength": 25 },
    { "source": "Long Tracts", "target": "Renal Clearance", "overlap_strength": 30 }
  ]
};

export default function GapNetworkGraph({ data = mockData }: GapNetworkGraphProps) {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const simulationRef = useRef<d3.Simulation<GapNode, GapEdge> | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData>(data);
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = Math.min(height * 0.7, 600);
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Animation effect for pulsing student gaps
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Initialize D3 force simulation
  useEffect(() => {
    if (networkData.nodes.length === 0) return;

    // Clean up previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create a copy of nodes and edges for D3
    const nodes = networkData.nodes.map(node => ({ ...node }));
    const edges = networkData.edges.map(edge => ({ ...edge }));

    const simulation = d3.forceSimulation<GapNode>(nodes)
      .force('link', d3.forceLink<GapNode, GapEdge>(edges)
        .id(d => d.id)
        .distance(d => 150 - (d.overlap_strength * 0.5)) // Closer nodes for higher overlap
        .strength(d => d.overlap_strength / 100)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d.avg_time_lost_hr) + 15));

    simulationRef.current = simulation;

    // Update positions on tick
    simulation.on('tick', () => {
      setNetworkData(prevData => ({
        ...prevData,
        nodes: [...simulation.nodes()],
      }));
    });

    return () => {
      simulation.stop();
    };
  }, [data, chartWidth, chartHeight]);

  // Get node size based on time lost
  const getNodeSize = (timeLost: number) => {
    const minSize = 20;
    const maxSize = 50;
    const maxTime = Math.max(...networkData.nodes.map(n => n.avg_time_lost_hr));
    const normalized = timeLost / maxTime;
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get node color based on whether it's a student gap
  const getNodeColor = (isStudentGap: boolean) => {
    if (isStudentGap) {
      return {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        glow: 'blueGlow',
        label: 'Your Gap'
      };
    } else {
      return {
        fill: '#64748b',
        stroke: '#475569',
        glow: 'grayGlow',
        label: 'Peer Gap'
      };
    }
  };

  // Get edge thickness based on overlap strength
  const getEdgeThickness = (overlapStrength: number) => {
    const minThickness = 1;
    const maxThickness = 8;
    const normalized = overlapStrength / 100;
    return minThickness + (normalized * (maxThickness - minThickness));
  };

  // Get edge color based on overlap strength
  const getEdgeColor = (overlapStrength: number) => {
    if (overlapStrength >= 60) return '#ef4444'; // Red for high overlap
    if (overlapStrength >= 40) return '#f59e0b'; // Amber for medium overlap
    return '#10b981'; // Green for low overlap
  };

  // Handle node press
  const handleNodePress = (node: GapNode, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setSelectedTooltip({ node, position });
  };

  // Calculate summary metrics
  const studentGaps = networkData.nodes.filter(n => n.is_student_gap);
  const peerGaps = networkData.nodes.filter(n => !n.is_student_gap);
  const totalTimeLost = studentGaps.reduce((sum, n) => sum + n.avg_time_lost_hr, 0);
  const averageOverlap = networkData.edges.reduce((sum, e) => sum + e.overlap_strength, 0) / Math.max(networkData.edges.length, 1);
  const strongConnections = networkData.edges.filter(e => e.overlap_strength >= 60).length;

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
            <Text className="text-2xl font-bold text-slate-100">Gap Network Graph</Text>
            <Text className="text-sm text-slate-400">
              Learning gap connections • Peer overlap visualization
            </Text>
          </View>
        </View>

        {/* Network Stats Badge */}
        <View className="items-center">
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30">
            <Text className="text-purple-400 font-bold text-xl">
              {averageOverlap.toFixed(0)}%
            </Text>
            <Text className="text-purple-300/80 text-xs text-center">
              Avg Overlap
            </Text>
          </View>
        </View>
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
              <Target size={16} color="#3b82f6" />
              <Text className="text-blue-400 font-semibold text-sm ml-2">Your Gaps</Text>
            </View>
            <Text className="text-blue-200 text-xl font-bold">
              {studentGaps.length}
            </Text>
            <Text className="text-blue-300/80 text-xs">
              learning gaps
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 300 }}
            className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Users size={16} color="#64748b" />
              <Text className="text-slate-400 font-semibold text-sm ml-2">Peer Gaps</Text>
            </View>
            <Text className="text-slate-200 text-xl font-bold">
              {peerGaps.length}
            </Text>
            <Text className="text-slate-300/80 text-xs">
              common gaps
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 400 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Zap size={16} color="#ef4444" />
              <Text className="text-red-400 font-semibold text-sm ml-2">Strong Links</Text>
            </View>
            <Text className="text-red-200 text-xl font-bold">
              {strongConnections}
            </Text>
            <Text className="text-red-300/80 text-xs">
              ≥60% overlap
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: 500 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">Time Impact</Text>
            </View>
            <Text className="text-amber-200 text-xl font-bold">
              {totalTimeLost.toFixed(1)}h
            </Text>
            <Text className="text-amber-300/80 text-xs">
              your gaps
            </Text>
          </MotiView>
        </View>

        {/* Network Graph */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
          {/* Graph Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-700/30">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
                <GitBranch size={16} color="#ffffff" />
              </View>
              <Text className="text-lg font-bold text-slate-100">
                Gap Connection Network
              </Text>
            </View>
            <Text className="text-slate-400 text-sm">
              {networkData.nodes.length} gaps • {networkData.edges.length} connections
            </Text>
          </View>

          {/* Graph Container */}
          <View className="p-4">
            <View 
              className="bg-slate-900/40 rounded-xl border border-slate-600/30 overflow-hidden"
              style={{ width: chartWidth, height: chartHeight }}
            >
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  {/* Glow gradients */}
                  <RadialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="grayGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#64748b" stopOpacity="0.6" />
                    <Stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Render Edges */}
                {networkData.edges.map((edge, index) => {
                  const sourceNode = networkData.nodes.find(n => n.id === edge.source);
                  const targetNode = networkData.nodes.find(n => n.id === edge.target);
                  
                  if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
                    return null;
                  }

                  const thickness = getEdgeThickness(edge.overlap_strength);
                  const color = getEdgeColor(edge.overlap_strength);

                  return (
                    <Line
                      key={`edge-${index}`}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={color}
                      strokeWidth={thickness}
                      strokeOpacity="0.7"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Render Nodes */}
                {networkData.nodes.map((node, index) => {
                  if (!node.x || !node.y) return null;

                  const nodeSize = getNodeSize(node.avg_time_lost_hr);
                  const colors = getNodeColor(node.is_student_gap);
                  const shouldPulse = node.is_student_gap;
                  const pulseScale = shouldPulse ? (1 + Math.sin(animationPhase) * 0.1) : 1;

                  return (
                    <G key={node.id}>
                      {/* Glow effect */}
                      <Circle
                        cx={node.x}
                        cy={node.y}
                        r={(nodeSize * pulseScale) + 15}
                        fill={`url(#${colors.glow})`}
                        opacity={shouldPulse ? 0.8 : 0.4}
                      />
                      
                      {/* Main node */}
                      <Circle
                        cx={node.x}
                        cy={node.y}
                        r={nodeSize * pulseScale}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth="3"
                        onPress={(event) => handleNodePress(node, event)}
                      />

                      {/* Node label */}
                      <SvgText
                        x={node.x}
                        y={node.y + nodeSize + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={colors.stroke}
                      >
                        {node.id.length > 15 ? `${node.id.substring(0, 15)}...` : node.id}
                      </SvgText>

                      {/* Time lost indicator */}
                      <SvgText
                        x={node.x}
                        y={node.y + 2}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        {node.avg_time_lost_hr.toFixed(1)}h
                      </SvgText>

                      {/* Student gap indicator */}
                      {node.is_student_gap && (
                        <Circle
                          cx={node.x + nodeSize - 5}
                          cy={node.y - nodeSize + 5}
                          r="6"
                          fill="#fbbf24"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                    </G>
                  );
                })}
              </Svg>
            </View>
          </View>

          {/* Graph Legend */}
          <View className="p-4 border-t border-slate-700/30">
            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Node Legend */}
              <View>
                <Text className="text-slate-300 font-semibold mb-3">Nodes</Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-blue-500 border-2 border-blue-400 mr-3 relative">
                      <View className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white" />
                    </View>
                    <Text className="text-slate-300 text-sm">Your Learning Gaps (pulsing)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-400 mr-3" />
                    <Text className="text-slate-300 text-sm">Common Peer Gaps</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">
                    Node size = Average time lost per student
                  </Text>
                </View>
              </View>

              {/* Edge Legend */}
              <View>
                <Text className="text-slate-300 font-semibold mb-3">Connections</Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <View className="w-6 h-1 bg-red-500 rounded mr-3" />
                    <Text className="text-slate-300 text-sm">High Overlap (≥60%)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-1 bg-amber-500 rounded mr-3" />
                    <Text className="text-slate-300 text-sm">Medium Overlap (40-59%)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-1 bg-emerald-500 rounded mr-3" />
                    <Text className="text-slate-300 text-sm">Low Overlap (&lt;40%)</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">
                    Line thickness = Overlap strength
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Network Analysis */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 800 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg mb-6"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
              <Users size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Network Analysis
            </Text>
          </View>

          <View className="space-y-4">
            {/* Your Gaps Analysis */}
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <Text className="text-blue-300 font-semibold mb-3">Your Learning Gaps</Text>
              <View className="space-y-2">
                {studentGaps
                  .sort((a, b) => b.avg_time_lost_hr - a.avg_time_lost_hr)
                  .map((gap, index) => (
                    <View key={gap.id} className="flex-row items-center justify-between">
                      <Text className="text-blue-200 text-sm flex-1">
                        {gap.id}
                      </Text>
                      <Text className="text-blue-400 font-bold text-sm">
                        {gap.avg_time_lost_hr.toFixed(1)}h
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* Connection Strength Analysis */}
            <View className="bg-slate-700/40 rounded-lg p-4 border border-slate-600/30">
              <Text className="text-slate-100 font-semibold mb-3">Connection Insights</Text>
              <View className="space-y-2">
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-red-400">Strongest Connection:</Text> {
                    networkData.edges.reduce((max, e) => e.overlap_strength > max.overlap_strength ? e : max).source
                  } ↔ {
                    networkData.edges.reduce((max, e) => e.overlap_strength > max.overlap_strength ? e : max).target
                  } ({networkData.edges.reduce((max, e) => e.overlap_strength > max.overlap_strength ? e : max).overlap_strength}% overlap)
                </Text>
                
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-emerald-400">Average Overlap:</Text> {averageOverlap.toFixed(1)}% across all connections
                </Text>
                
                <Text className="text-slate-300 text-sm">
                  <Text className="font-bold text-amber-400">High Overlap Connections:</Text> {strongConnections} of {networkData.edges.length} total
                </Text>
              </View>
            </View>

            {/* Recommendations */}
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <Text className="text-emerald-300 font-semibold mb-3">Study Recommendations</Text>
              <View className="space-y-2">
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">Group Study:</Text> Focus on gaps with high peer overlap (thick red connections) for collaborative learning
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">Individual Focus:</Text> Address isolated gaps (thin or no connections) with personalized study plans
                </Text>
                <Text className="text-emerald-200 text-sm">
                  <Text className="font-bold">Priority Order:</Text> Start with your largest gaps (bigger blue nodes) that have strong peer connections
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Detailed Gap List */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: 1000 }}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
        >
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg items-center justify-center mr-3">
              <Target size={16} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-slate-100">
              Gap Details & Connections
            </Text>
          </View>

          <View className="space-y-4">
            {networkData.nodes.map((node, index) => {
              const colors = getNodeColor(node.is_student_gap);
              const connections = networkData.edges.filter(e => e.source === node.id || e.target === node.id);
              const avgConnectionStrength = connections.length > 0 
                ? connections.reduce((sum, e) => sum + e.overlap_strength, 0) / connections.length 
                : 0;

              return (
                <MotiView
                  key={node.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1200 + index * 100 }}
                  className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center mb-2">
                        <View 
                          className="w-4 h-4 rounded-full mr-3 border-2"
                          style={{ 
                            backgroundColor: colors.fill,
                            borderColor: colors.stroke
                          }}
                        />
                        <Text className="text-slate-100 font-semibold text-base">
                          {node.id}
                        </Text>
                        {node.is_student_gap && (
                          <View className="ml-2 bg-blue-500/20 rounded-full px-2 py-1">
                            <Text className="text-blue-400 text-xs font-bold">YOUR GAP</Text>
                          </View>
                        )}
                      </View>
                      
                      <View className="flex-row items-center space-x-4">
                        <Text className="text-slate-400 text-sm">
                          Time Lost: <Text className="text-amber-400 font-semibold">
                            {node.avg_time_lost_hr.toFixed(1)}h
                          </Text>
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          Connections: <Text className="text-slate-300 font-semibold">
                            {connections.length}
                          </Text>
                        </Text>
                        <Text className="text-slate-400 text-sm">
                          Avg Overlap: <Text className="text-slate-300 font-semibold">
                            {avgConnectionStrength.toFixed(0)}%
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Connection Strength Indicator */}
                    <View className="items-center">
                      <View className="relative w-12 h-12">
                        <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
                        <MotiView
                          from={{ rotate: '0deg' }}
                          animate={{ rotate: `${(avgConnectionStrength / 100) * 360}deg` }}
                          transition={{ type: 'spring', duration: 1000, delay: 1400 + index * 100 }}
                          className="absolute inset-0 rounded-full border-4 border-transparent"
                          style={{
                            borderTopColor: getEdgeColor(avgConnectionStrength),
                            borderRightColor: avgConnectionStrength > 25 ? getEdgeColor(avgConnectionStrength) : 'transparent',
                            borderBottomColor: avgConnectionStrength > 50 ? getEdgeColor(avgConnectionStrength) : 'transparent',
                            borderLeftColor: avgConnectionStrength > 75 ? getEdgeColor(avgConnectionStrength) : 'transparent',
                          }}
                        />
                        <View className="absolute inset-0 items-center justify-center">
                          <Text 
                            className="text-xs font-bold"
                            style={{ color: getEdgeColor(avgConnectionStrength) }}
                          >
                            {avgConnectionStrength.toFixed(0)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-slate-400 mt-1 text-center">
                        overlap
                      </Text>
                    </View>
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
          className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30"
        >
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#06b6d4" />
            <Text className="text-slate-100 font-semibold ml-2">Network Insights</Text>
          </View>
          
          <View className="space-y-2">
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-blue-400">Your Gap Profile:</Text> {studentGaps.length} personal gaps 
              with {totalTimeLost.toFixed(1)} hours total impact
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-red-400">High Overlap Areas:</Text> {strongConnections} strong connections 
              indicate common struggle points across peer groups
            </Text>
            
            <Text className="text-slate-300 text-sm">
              <Text className="font-bold text-emerald-400">Study Strategy:</Text> Focus on highly connected gaps first - 
              peer resources and group study will be most effective
            </Text>
            
            <Text className="text-slate-400 text-xs leading-4 mt-3">
              The network shows how your learning gaps relate to common peer struggles. 
              Thick connections indicate high overlap where collaborative learning strategies work best. 
              Isolated gaps need individual attention.
            </Text>
          </View>
        </MotiView>
      </ScrollView>

      {/* Node Tooltip */}
      {selectedTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/95 rounded-xl p-4 border border-slate-600/50 shadow-xl z-50"
          style={{
            left: Math.max(10, Math.min(selectedTooltip.position.x - 120, width - 250)),
            top: Math.max(10, selectedTooltip.position.y - 100),
            width: 240,
            shadowColor: getNodeColor(selectedTooltip.node.is_student_gap).stroke,
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
              {selectedTooltip.node.id}
            </Text>
            <Text className={`text-xs mb-3 font-medium ${
              selectedTooltip.node.is_student_gap ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {getNodeColor(selectedTooltip.node.is_student_gap).label}
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Time Lost</Text>
                <Text className="text-amber-400 text-xs font-semibold">
                  {selectedTooltip.node.avg_time_lost_hr.toFixed(1)} hours
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Connections</Text>
                <Text className="text-slate-300 text-xs">
                  {networkData.edges.filter(e => 
                    e.source === selectedTooltip.node.id || e.target === selectedTooltip.node.id
                  ).length}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Type</Text>
                <Text className={`text-xs font-semibold ${
                  selectedTooltip.node.is_student_gap ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  {selectedTooltip.node.is_student_gap ? 'Personal' : 'Peer Common'}
                </Text>
              </View>
            </View>

            {selectedTooltip.node.is_student_gap && (
              <View className="mt-3 pt-3 border-t border-slate-600/30">
                <Text className="text-blue-300 text-xs">
                  💡 This is one of your learning gaps. Focus here for personal improvement.
                </Text>
              </View>
            )}
          </View>
        </MotiView>
      )}
    </View>
  );
}