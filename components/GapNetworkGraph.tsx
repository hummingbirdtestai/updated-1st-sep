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
  connectedEdges: GapEdge[];
}

interface GapNetworkGraphProps {
  data?: NetworkData;
}

// Enhanced mock data
const mockData: NetworkData = {
  "nodes": [
    { "id": "Action Potential", "avg_time_lost_hr": 7.5, "is_student_gap": true },
    { "id": "Long Tracts", "avg_time_lost_hr": 11, "is_student_gap": true },
    { "id": "Oxygen Dissociation Curve", "avg_time_lost_hr": 4, "is_student_gap": false },
    { "id": "Enzyme Kinetics", "avg_time_lost_hr": 8.2, "is_student_gap": true },
    { "id": "Cardiac Cycle", "avg_time_lost_hr": 6.1, "is_student_gap": false },
    { "id": "Renal Clearance", "avg_time_lost_hr": 9.3, "is_student_gap": true },
    { "id": "Starling Forces", "avg_time_lost_hr": 5.7, "is_student_gap": false },
    { "id": "Hemoglobin Binding", "avg_time_lost_hr": 3.8, "is_student_gap": false },
    { "id": "Neurotransmitters", "avg_time_lost_hr": 6.9, "is_student_gap": true }
  ],
  "edges": [
    { "source": "Action Potential", "target": "Long Tracts", "overlap_strength": 60 },
    { "source": "Long Tracts", "target": "Oxygen Dissociation Curve", "overlap_strength": 40 },
    { "source": "Action Potential", "target": "Enzyme Kinetics", "overlap_strength": 35 },
    { "source": "Enzyme Kinetics", "target": "Cardiac Cycle", "overlap_strength": 55 },
    { "source": "Cardiac Cycle", "target": "Renal Clearance", "overlap_strength": 45 },
    { "source": "Renal Clearance", "target": "Starling Forces", "overlap_strength": 70 },
    { "source": "Action Potential", "target": "Cardiac Cycle", "overlap_strength": 25 },
    { "source": "Long Tracts", "target": "Renal Clearance", "overlap_strength": 30 },
    { "source": "Oxygen Dissociation Curve", "target": "Hemoglobin Binding", "overlap_strength": 85 },
    { "source": "Neurotransmitters", "target": "Action Potential", "overlap_strength": 50 },
    { "source": "Enzyme Kinetics", "target": "Starling Forces", "overlap_strength": 38 }
  ]
};

export default function GapNetworkGraph({ data = mockData }: GapNetworkGraphProps) {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const simulationRef = useRef<d3.Simulation<GapNode, GapEdge> | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData>(data);
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = Math.min(height * 0.7, 600);
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Animation effect for pulsing student gaps
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  // Initialize D3 force simulation with spring animations
  useEffect(() => {
    if (networkData.nodes.length === 0) return;

    setIsLoading(true);

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
        .distance(d => 120 - (d.overlap_strength * 0.8)) // Closer nodes for higher overlap
        .strength(d => (d.overlap_strength / 100) * 0.8)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => d.is_student_gap ? -600 : -300) // Student gaps repel more
      )
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide()
        .radius(d => getNodeSize(d.avg_time_lost_hr) + 20)
        .strength(0.8)
      )
      .force('x', d3.forceX(centerX).strength(0.1))
      .force('y', d3.forceY(centerY).strength(0.1));

    simulationRef.current = simulation;

    // Update positions on tick with spring animation
    simulation.on('tick', () => {
      setNetworkData(prevData => ({
        ...prevData,
        nodes: [...simulation.nodes()],
      }));
    });

    // Mark as loaded after initial settling
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      simulation.stop();
    };
  }, [data, chartWidth, chartHeight]);

  // Get node size based on time lost (proportional)
  const getNodeSize = (timeLost: number) => {
    const minSize = 15;
    const maxSize = 45;
    const maxTime = Math.max(...networkData.nodes.map(n => n.avg_time_lost_hr));
    const minTime = Math.min(...networkData.nodes.map(n => n.avg_time_lost_hr));
    const normalized = (timeLost - minTime) / Math.max(maxTime - minTime, 1);
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get node color and glow based on whether it's a student gap
  const getNodeColor = (isStudentGap: boolean) => {
    if (isStudentGap) {
      return {
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        glow: 'studentGlow',
        label: 'Your Gap',
        glowColor: '#3b82f6'
      };
    } else {
      return {
        fill: '#64748b',
        stroke: '#475569',
        glow: 'peerGlow',
        label: 'Peer Gap',
        glowColor: '#64748b'
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
    if (overlapStrength >= 70) return '#dc2626'; // Dark red for very high overlap
    if (overlapStrength >= 50) return '#ef4444'; // Red for high overlap
    if (overlapStrength >= 30) return '#f59e0b'; // Amber for medium overlap
    return '#10b981'; // Green for low overlap
  };

  // Handle node press
  const handleNodePress = (node: GapNode, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // Find connected edges
    const connectedEdges = networkData.edges.filter(edge => 
      edge.source === node.id || edge.target === node.id
    );

    setSelectedTooltip({ node, position, connectedEdges });
  };

  // Calculate summary metrics
  const studentGaps = networkData.nodes.filter(n => n.is_student_gap);
  const peerGaps = networkData.nodes.filter(n => !n.is_student_gap);
  const totalTimeLost = studentGaps.reduce((sum, n) => sum + n.avg_time_lost_hr, 0);
  const averageOverlap = networkData.edges.reduce((sum, e) => sum + e.overlap_strength, 0) / Math.max(networkData.edges.length, 1);
  const strongConnections = networkData.edges.filter(e => e.overlap_strength >= 60).length;
  const maxTimeLost = Math.max(...networkData.nodes.map(n => n.avg_time_lost_hr));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-2xl"
      style={{
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <MotiView
            from={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 800, delay: 400 }}
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl items-center justify-center mr-4 shadow-xl"
            style={{
              shadowColor: '#8b5cf6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <GitBranch size={20} color="#ffffff" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-100">Gap Network Graph</Text>
            <Text className="text-slate-400 text-base">
              Interactive learning gap connections • Tap nodes for details
            </Text>
          </View>
        </View>

        {/* Network Stats Badge */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: 600 }}
          className="items-center"
        >
          <View className="bg-purple-500/20 rounded-xl px-4 py-3 border border-purple-500/30 shadow-lg">
            <Text className="text-purple-400 font-bold text-xl">
              {averageOverlap.toFixed(0)}%
            </Text>
            <Text className="text-purple-300/80 text-xs text-center">
              Avg Overlap
            </Text>
          </View>
        </MotiView>
      </View>

      {/* Summary Metrics */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-700/30">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 800 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Target size={16} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold text-sm ml-2">Your Gaps</Text>
          </View>
          <Text className="text-blue-200 text-2xl font-bold">
            {studentGaps.length}
          </Text>
          <Text className="text-blue-300/80 text-xs">
            learning gaps
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 900 }}
          className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Users size={16} color="#64748b" />
            <Text className="text-slate-400 font-semibold text-sm ml-2">Peer Gaps</Text>
          </View>
          <Text className="text-slate-200 text-2xl font-bold">
            {peerGaps.length}
          </Text>
          <Text className="text-slate-300/80 text-xs">
            common gaps
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1000 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Zap size={16} color="#ef4444" />
            <Text className="text-red-400 font-semibold text-sm ml-2">Strong Links</Text>
          </View>
          <Text className="text-red-200 text-2xl font-bold">
            {strongConnections}
          </Text>
          <Text className="text-red-300/80 text-xs">
            ≥60% overlap
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1100 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={16} color="#f59e0b" />
            <Text className="text-amber-400 font-semibold text-sm ml-2">Time Impact</Text>
          </View>
          <Text className="text-amber-200 text-2xl font-bold">
            {totalTimeLost.toFixed(1)}h
          </Text>
          <Text className="text-amber-300/80 text-xs">
            your gaps
          </Text>
        </MotiView>
      </View>

      {/* Network Graph Container */}
      <View className="p-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 1200 }}
          className="bg-slate-900/60 rounded-2xl border border-slate-600/30 overflow-hidden shadow-inner"
          style={{ width: chartWidth, height: chartHeight }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <MotiView
              from={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 1800 }}
              className="absolute inset-0 bg-slate-900/80 items-center justify-center z-10"
            >
              <View className="items-center">
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: '360deg' }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 2000,
                  }}
                  className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-3"
                />
                <Text className="text-slate-300 text-sm">Building network...</Text>
              </View>
            </MotiView>
          )}

          {/* SVG Network Visualization */}
          <Svg width={chartWidth} height={chartHeight} className="absolute inset-0">
            <Defs>
              {/* Glow gradients for nodes */}
              <RadialGradient id="studentGlow" cx="50%" cy="50%" r="80%">
                <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <Stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="peerGlow" cx="50%" cy="50%" r="80%">
                <Stop offset="0%" stopColor="#64748b" stopOpacity="0.6" />
                <Stop offset="50%" stopColor="#64748b" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#64748b" stopOpacity="0" />
              </RadialGradient>

              {/* Pulse glow for student gaps */}
              <RadialGradient id="studentPulseGlow" cx="50%" cy="50%" r="100%">
                <Stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                <Stop offset="70%" stopColor="#3b82f6" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </RadialGradient>

              {/* Edge gradients */}
              <RadialGradient id="strongEdgeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </RadialGradient>
            </Defs>

            {/* Render Edges with animated appearance */}
            {networkData.edges.map((edge, index) => {
              const sourceNode = networkData.nodes.find(n => n.id === edge.source);
              const targetNode = networkData.edges.find(e => e.source === edge.target || e.target === edge.target) 
                ? networkData.nodes.find(n => n.id === edge.target) 
                : networkData.nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
                return null;
              }

              const thickness = getEdgeThickness(edge.overlap_strength);
              const color = getEdgeColor(edge.overlap_strength);
              const isStrongConnection = edge.overlap_strength >= 60;

              return (
                <MotiView
                  key={`edge-${index}`}
                  from={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ 
                    type: 'spring', 
                    duration: 800, 
                    delay: 1400 + index * 100 
                  }}
                >
                  {/* Glow effect for strong connections */}
                  {isStrongConnection && (
                    <Line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={color}
                      strokeWidth={thickness + 6}
                      strokeOpacity="0.3"
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Main edge */}
                  <Line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={color}
                    strokeWidth={thickness}
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                    strokeDasharray={isStrongConnection ? "none" : "4,4"}
                  />

                  {/* Overlap strength label on strong connections */}
                  {isStrongConnection && (
                    <SvgText
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="0.5"
                    >
                      {edge.overlap_strength}%
                    </SvgText>
                  )}
                </MotiView>
              );
            })}

            {/* Render Nodes with glowing bubbles */}
            {networkData.nodes.map((node, index) => {
              if (!node.x || !node.y) return null;

              const nodeSize = getNodeSize(node.avg_time_lost_hr);
              const colors = getNodeColor(node.is_student_gap);
              const shouldPulse = node.is_student_gap;
              const pulseScale = shouldPulse ? (1 + Math.sin(animationPhase) * 0.15) : 1;
              const pulseOpacity = shouldPulse ? (0.8 + Math.sin(animationPhase) * 0.2) : 0.6;

              return (
                <G key={node.id}>
                  {/* Outer glow effect */}
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={(nodeSize * pulseScale) + 25}
                    fill={`url(#${colors.glow})`}
                    opacity={pulseOpacity}
                  />

                  {/* Pulse glow for student gaps */}
                  {shouldPulse && (
                    <MotiView
                      from={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{
                        loop: true,
                        type: 'timing',
                        duration: 2000,
                        delay: index * 300,
                      }}
                    >
                      <Circle
                        cx={node.x}
                        cy={node.y}
                        r={nodeSize + 15}
                        fill="url(#studentPulseGlow)"
                      />
                    </MotiView>
                  )}
                  
                  {/* Main node bubble */}
                  <G onPress={(event) => handleNodePress(node, event)}>
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeSize * pulseScale}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth="3"
                    />
                  </G>


                  {/* Inner highlight */}
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize * pulseScale * 0.6}
                    fill="#ffffff"
                    opacity="0.2"
                  />

                  {/* Time lost indicator */}
                  <SvgText
                    x={node.x}
                    y={node.y + 2}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="0.5"
                  >
                    {node.avg_time_lost_hr.toFixed(1)}h
                  </SvgText>

                  {/* Student gap indicator */}
                  {node.is_student_gap && (
                    <Circle
                      cx={node.x + nodeSize - 8}
                      cy={node.y - nodeSize + 8}
                      r="8"
                      fill="#fbbf24"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}

                  {/* Node label */}
                  <SvgText
                    x={node.x}
                    y={node.y + nodeSize + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.stroke}
                  >
                    {node.id.length > 12 ? `${node.id.substring(0, 12)}...` : node.id}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Graph Instructions Overlay */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 2000 }}
            className="absolute bottom-4 left-4 bg-slate-800/90 rounded-xl p-3 border border-slate-600/50 shadow-lg"
          >
            <Text className="text-slate-300 text-xs font-medium mb-1">
              🎯 Interactive Network
            </Text>
            <Text className="text-slate-400 text-xs">
              • Tap bubbles for details{'\n'}
              • Blue = Your gaps{'\n'}
              • Gray = Peer gaps{'\n'}
              • Line thickness = Overlap
            </Text>
          </MotiView>
        </MotiView>

        {/* Legend */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="mt-6 bg-slate-700/40 rounded-2xl p-6 border border-slate-600/30"
        >
          <Text className="text-slate-100 font-bold text-lg mb-4 text-center">
            Network Legend
          </Text>
          
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Node Legend */}
            <View>
              <Text className="text-slate-300 font-semibold mb-3">Nodes (Learning Gaps)</Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <View className="relative mr-4">
                    <View className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-400 shadow-lg" />
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white" />
                    <MotiView
                      from={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{
                        loop: true,
                        type: 'timing',
                        duration: 2000,
                      }}
                      className="absolute inset-0 rounded-full bg-blue-500/30"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-300 font-semibold text-base">Your Learning Gaps</Text>
                    <Text className="text-blue-200/80 text-sm">Pulsing blue bubbles with golden indicator</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-400 mr-4 opacity-70" />
                  <View className="flex-1">
                    <Text className="text-slate-300 font-semibold text-base">Common Peer Gaps</Text>
                    <Text className="text-slate-400/80 text-sm">Static gray bubbles</Text>
                  </View>
                </View>
                
                <Text className="text-slate-400 text-xs mt-2">
                  💡 Bubble size = Average time lost per student
                </Text>
              </View>
            </View>

            {/* Edge Legend */}
            <View>
              <Text className="text-slate-300 font-semibold mb-3">Connections (Overlap Strength)</Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-2 bg-red-600 rounded-full mr-4 shadow-lg" />
                  <Text className="text-slate-300 text-sm">Very High Overlap (≥70%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-1 bg-red-500 rounded-full mr-4" />
                  <Text className="text-slate-300 text-sm">High Overlap (50-69%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-1 bg-amber-500 rounded-full mr-4 opacity-80" />
                  <Text className="text-slate-300 text-sm">Medium Overlap (30-49%)</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-px bg-emerald-500 rounded-full mr-4 opacity-60" />
                  <Text className="text-slate-300 text-sm">Low Overlap (&lt;30%)</Text>
                </View>
                
                <Text className="text-slate-400 text-xs mt-2">
                  💡 Thicker lines = Higher peer overlap • Dashed = Weak connection
                </Text>
              </View>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Node Tooltip */}
      {selectedTooltip && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 400 }}
          className="absolute bg-slate-800/95 rounded-2xl p-6 border border-slate-600/50 shadow-2xl z-50"
          style={{
            left: Math.max(10, Math.min(selectedTooltip.position.x - 160, width - 330)),
            top: Math.max(10, selectedTooltip.position.y - 200),
            width: 320,
            shadowColor: getNodeColor(selectedTooltip.node.is_student_gap).glowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setSelectedTooltip(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center active:scale-95"
          >
            <X size={16} color="#94a3b8" />
          </Pressable>

          {/* Tooltip Header */}
          <View className="flex-row items-center mb-4 pr-8">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-4 shadow-lg"
              style={{ backgroundColor: getNodeColor(selectedTooltip.node.is_student_gap).fill }}
            >
              <GitBranch size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-100 mb-1">
                {selectedTooltip.node.id}
              </Text>
              <Text 
                className="text-sm font-medium"
                style={{ color: getNodeColor(selectedTooltip.node.is_student_gap).glowColor }}
              >
                {getNodeColor(selectedTooltip.node.is_student_gap).label}
              </Text>
            </View>
          </View>

          {/* Node Details */}
          <View className="space-y-4">
            {/* Time Impact */}
            <View className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Clock size={16} color="#f59e0b" />
                  <Text className="text-amber-300 font-semibold ml-2">Time Impact</Text>
                </View>
                <Text className="text-amber-400 font-bold text-xl">
                  {selectedTooltip.node.avg_time_lost_hr.toFixed(1)}h
                </Text>
              </View>
              <Text className="text-amber-200/80 text-sm">
                Average time lost per student struggling with this gap
              </Text>
            </View>

            {/* Connection Analysis */}
            <View className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <Zap size={16} color="#06b6d4" />
                <Text className="text-slate-100 font-semibold ml-2">
                  Network Connections ({selectedTooltip.connectedEdges.length})
                </Text>
              </View>
              
              {selectedTooltip.connectedEdges.length > 0 ? (
                <View className="space-y-2">
                  {selectedTooltip.connectedEdges
                    .sort((a, b) => b.overlap_strength - a.overlap_strength)
                    .slice(0, 3) // Show top 3 connections
                    .map((edge, index) => {
                      const connectedGap = edge.source === selectedTooltip.node.id ? edge.target : edge.source;
                      const strengthColor = getEdgeColor(edge.overlap_strength);
                      
                      return (
                        <View key={connectedGap} className="flex-row items-center justify-between">
                          <Text className="text-slate-300 text-sm flex-1" numberOfLines={1}>
                            {connectedGap}
                          </Text>
                          <View className="flex-row items-center ml-2">
                            <View 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: strengthColor }}
                            />
                            <Text 
                              className="text-sm font-bold"
                              style={{ color: strengthColor }}
                            >
                              {edge.overlap_strength}%
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  
                  {selectedTooltip.connectedEdges.length > 3 && (
                    <Text className="text-slate-400 text-xs text-center mt-2">
                      +{selectedTooltip.connectedEdges.length - 3} more connections
                    </Text>
                  )}
                </View>
              ) : (
                <Text className="text-slate-400 text-sm">
                  No connections to other gaps
                </Text>
              )}
            </View>

            {/* Gap Type Insight */}
            <View 
              className="rounded-xl p-4 border-2"
              style={{ 
                backgroundColor: `${getNodeColor(selectedTooltip.node.is_student_gap).glowColor}10`,
                borderColor: `${getNodeColor(selectedTooltip.node.is_student_gap).glowColor}30`
              }}
            >
              <Text 
                className="text-base font-semibold mb-2"
                style={{ color: getNodeColor(selectedTooltip.node.is_student_gap).glowColor }}
              >
                {selectedTooltip.node.is_student_gap ? '🎯 Your Learning Gap' : '👥 Common Peer Gap'}
              </Text>
              <Text className="text-slate-300 text-sm leading-5">
                {selectedTooltip.node.is_student_gap 
                  ? "This is one of your personal learning gaps. Focus here for direct improvement in your weak areas."
                  : "This gap is common among your peers but not one of your current challenges. Monitor for potential future issues."
                }
              </Text>
            </View>
          </View>
        </MotiView>
      )}
    </MotiView>
  );
}