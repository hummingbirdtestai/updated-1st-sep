import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { GitBranch, Target, Clock, X, Info, Lightbulb, TriangleAlert as AlertTriangle, ChevronRight, Zap } from 'lucide-react-native';
import * as d3 from 'd3';
import mockRootCausesData from '@/data/mockRootCausesData.json';

interface ConceptNode {
  id: string;
  name: string;
  type: 'concept' | 'dependent';
  pyqs_blocked: number;
  time_blocked_min: number;
  strength: number; // 0-1 scale for color
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface ConceptLink {
  source: string;
  target: string;
  strength: number;
}

interface GraphData {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

interface TooltipData {
  node: ConceptNode;
  position: { x: number; y: number };
}

interface SidePanelData {
  concept: string;
  dependentTopics: string[];
  pyqsBlocked: number;
  timeBlocked: number;
}

interface ConceptPrerequisiteMapProps {
  onConceptClick?: (concept: any) => void;
}

export default function ConceptPrerequisiteMap({ onConceptClick }: ConceptPrerequisiteMapProps) {
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const svgRef = useRef<any>(null);
  const simulationRef = useRef<d3.Simulation<ConceptNode, ConceptLink> | null>(null);
  
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedTooltip, setSelectedTooltip] = useState<TooltipData | null>(null);
  const [sidePanelData, setSidePanelData] = useState<SidePanelData | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());
  const [animationPhase, setAnimationPhase] = useState(0);

  // Chart dimensions
  const chartWidth = Math.min(width - 64, 800);
  const chartHeight = Math.min(height * 0.6, 500);

  // Process data into graph format
  const processGraphData = (): GraphData => {
    const nodes: ConceptNode[] = [];
    const links: ConceptLink[] = [];
    
    // Calculate strength based on time blocked (inverse - less time = stronger concept)
    const maxTimeBlocked = Math.max(...mockRootCausesData.concept_prerequisites.map(c => c.time_blocked_min));
    
    // Add concept nodes
    mockRootCausesData.concept_prerequisites.forEach(concept => {
      const strength = 1 - (concept.time_blocked_min / maxTimeBlocked); // Inverse relationship
      
      nodes.push({
        id: concept.concept,
        name: concept.concept,
        type: 'concept',
        pyqs_blocked: concept.pyqs_blocked,
        time_blocked_min: concept.time_blocked_min,
        strength,
      });

      // Add dependent topic nodes if concept is expanded
      if (expandedConcepts.has(concept.concept)) {
        concept.dependent_topics.forEach(topic => {
          const dependentId = `${concept.concept}::${topic}`;
          
          nodes.push({
            id: dependentId,
            name: topic,
            type: 'dependent',
            pyqs_blocked: Math.floor(concept.pyqs_blocked / concept.dependent_topics.length),
            time_blocked_min: concept.time_blocked_min / concept.dependent_topics.length,
            strength: strength * 0.8, // Slightly weaker than parent
          });

          // Add link from concept to dependent topic
          links.push({
            source: concept.concept,
            target: dependentId,
            strength: strength,
          });
        });
      }
    });

    return { nodes, links };
  };

  // Update graph data when expanded concepts change
  useEffect(() => {
    const newGraphData = processGraphData();
    setGraphData(newGraphData);
  }, [expandedConcepts]);

  // Initialize D3 force simulation
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    // Clean up previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = d3.forceSimulation<ConceptNode>(graphData.nodes)
      .force('link', d3.forceLink<ConceptNode, ConceptLink>(graphData.links)
        .id(d => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(chartWidth / 2, chartHeight / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d.time_blocked_min) + 10));

    simulationRef.current = simulation;

    // Update positions on tick
    simulation.on('tick', () => {
      setGraphData(prevData => ({
        ...prevData,
        nodes: [...simulation.nodes()],
      }));
    });

    return () => {
      simulation.stop();
    };
  }, [graphData.links, chartWidth, chartHeight]);

  // Animation effect for pulsing
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Get node size based on time blocked
  const getNodeSize = (timeBlocked: number) => {
    const minSize = 20;
    const maxSize = 50;
    const maxTime = Math.max(...mockRootCausesData.concept_prerequisites.map(c => c.time_blocked_min));
    const normalized = timeBlocked / maxTime;
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get node color based on strength
  const getNodeColor = (strength: number, type: 'concept' | 'dependent') => {
    if (type === 'dependent') {
      return {
        fill: `rgba(59, 130, 246, ${0.6 + strength * 0.4})`, // Blue for dependents
        stroke: '#3b82f6',
        glow: 'blueGlow'
      };
    }
    
    // Concept nodes: red (weak) to green (strong)
    if (strength >= 0.7) {
      return { fill: '#10b981', stroke: '#059669', glow: 'emeraldGlow' }; // Strong - green
    } else if (strength >= 0.4) {
      return { fill: '#f59e0b', stroke: '#d97706', glow: 'amberGlow' }; // Medium - amber
    } else {
      return { fill: '#ef4444', stroke: '#dc2626', glow: 'redGlow' }; // Weak - red
    }
  };

  // Handle node click
  const handleNodeClick = (node: ConceptNode, event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    if (node.type === 'concept') {
      // Toggle expansion
      const newExpanded = new Set(expandedConcepts);
      if (newExpanded.has(node.id)) {
        newExpanded.delete(node.id);
      } else {
        newExpanded.add(node.id);
      }
      setExpandedConcepts(newExpanded);

      // Call parent callback for concept clicks
      if (onConceptClick) {
        const matchingConcept = mockRootCausesData.concept_prerequisites.find(c => c.concept === node.id);
        if (matchingConcept) {
          onConceptClick(matchingConcept);
        }
      }

      // Show side panel
      const conceptData = mockRootCausesData.concept_prerequisites.find(c => c.concept === node.id);
      if (conceptData) {
        setSidePanelData({
          concept: conceptData.concept,
          dependentTopics: conceptData.dependent_topics,
          pyqsBlocked: conceptData.pyqs_blocked,
          timeBlocked: conceptData.time_blocked_min,
        });
      }
    }

    // Show tooltip
    setSelectedTooltip({ node, position });
  };

  // Get link color based on strength
  const getLinkColor = (strength: number) => {
    return `rgba(100, 116, 139, ${0.3 + strength * 0.4})`;
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
            <Text className="text-2xl font-bold text-slate-100">Concept Prerequisite Map</Text>
            <Text className="text-sm text-slate-400">
              Interactive dependency visualization • Click concepts to expand
            </Text>
          </View>
        </View>

        {/* Legend Toggle */}
        <Pressable className="bg-slate-700/50 rounded-lg px-3 py-2">
          <View className="flex-row items-center">
            <Info size={16} color="#94a3b8" />
            <Text className="text-slate-300 text-sm ml-2">Legend</Text>
          </View>
        </Pressable>
      </MotiView>

      <View className="flex-1 flex-row">
        {/* Main Graph Container */}
        <View className="flex-1">
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: isMobile ? 16 : 24,
              paddingVertical: 24,
            }}
          >
            {/* Summary Metrics */}
            <View className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 200 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
              >
                <View className="flex-row items-center mb-2">
                  <Target size={16} color="#3b82f6" />
                  <Text className="text-blue-400 font-semibold text-sm ml-2">Total Concepts</Text>
                </View>
                <Text className="text-blue-200 text-xl font-bold">
                  {mockRootCausesData.concept_prerequisites.length}
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 300 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
              >
                <View className="flex-row items-center mb-2">
                  <AlertTriangle size={16} color="#ef4444" />
                  <Text className="text-red-400 font-semibold text-sm ml-2">PYQs Blocked</Text>
                </View>
                <Text className="text-red-200 text-xl font-bold">
                  {mockRootCausesData.concept_prerequisites.reduce((sum, c) => sum + c.pyqs_blocked, 0)}
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 400 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
              >
                <View className="flex-row items-center mb-2">
                  <Clock size={16} color="#f59e0b" />
                  <Text className="text-amber-400 font-semibold text-sm ml-2">Time Blocked</Text>
                </View>
                <Text className="text-amber-200 text-xl font-bold">
                  {(mockRootCausesData.concept_prerequisites.reduce((sum, c) => sum + c.time_blocked_min, 0) / 60).toFixed(1)}h
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', duration: 600, delay: 500 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
              >
                <View className="flex-row items-center mb-2">
                  <Zap size={16} color="#10b981" />
                  <Text className="text-emerald-400 font-semibold text-sm ml-2">Most Critical</Text>
                </View>
                <Text className="text-emerald-200 text-sm font-bold">
                  {mockRootCausesData.analysis_metadata.most_blocking_concept.split(' ')[0]}
                </Text>
                <Text className="text-emerald-300/80 text-xs">
                  {mockRootCausesData.concept_prerequisites.find(c => 
                    c.concept === mockRootCausesData.analysis_metadata.most_blocking_concept
                  )?.pyqs_blocked || 0} PYQs
                </Text>
              </MotiView>
            </View>

            {/* Interactive Graph */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 800, delay: 600 }}
              className="bg-slate-800/60 rounded-2xl border border-slate-700/40 shadow-lg mb-6"
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
                    Prerequisite Dependency Graph
                  </Text>
                </View>
                <Text className="text-slate-400 text-sm">
                  {expandedConcepts.size} expanded
                </Text>
              </View>

              {/* Graph Container */}
              <View className="p-4">
                <View 
                  className="bg-slate-900/40 rounded-xl border border-slate-600/30 overflow-hidden"
                  style={{ width: chartWidth, height: chartHeight }}
                >
                  {/* Custom D3 Graph Implementation */}
                  <View className="relative w-full h-full">
                    {/* Render nodes as React Native components */}
                    {graphData.nodes.map((node, index) => {
                      const nodeSize = getNodeSize(node.time_blocked_min);
                      const colors = getNodeColor(node.strength, node.type);
                      const isExpanded = expandedConcepts.has(node.id);
                      
                      // Use simulation positions or fallback to grid
                      const x = node.x || (index % 4) * (chartWidth / 4) + chartWidth / 8;
                      const y = node.y || Math.floor(index / 4) * (chartHeight / 3) + chartHeight / 6;

                      return (
                        <MotiView
                          key={node.id}
                          from={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            type: 'spring', 
                            duration: 600, 
                            delay: index * 100 + 800 
                          }}
                          className="absolute"
                          style={{
                            left: x - nodeSize / 2,
                            top: y - nodeSize / 2,
                            width: nodeSize,
                            height: nodeSize,
                          }}
                        >
                          <Pressable
                            onPress={(event) => handleNodeClick(node, event)}
                            className="w-full h-full rounded-full items-center justify-center shadow-lg"
                            style={{
                              backgroundColor: colors.fill,
                              borderWidth: 3,
                              borderColor: colors.stroke,
                              shadowColor: colors.fill,
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: 6,
                            }}
                          >
                            {/* Node Content */}
                            <View className="items-center justify-center">
                              {node.type === 'concept' ? (
                                <GitBranch size={nodeSize * 0.3} color="#ffffff" />
                              ) : (
                                <Target size={nodeSize * 0.25} color="#ffffff" />
                              )}
                            </View>

                            {/* Expansion Indicator */}
                            {node.type === 'concept' && isExpanded && (
                              <MotiView
                                from={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 1.3, opacity: 0 }}
                                transition={{
                                  loop: true,
                                  type: 'timing',
                                  duration: 1500,
                                }}
                                className="absolute inset-0 rounded-full border-2 border-white/50"
                              />
                            )}

                            {/* High Impact Pulse */}
                            {node.time_blocked_min > 120 && (
                              <MotiView
                                from={{ scale: 1, opacity: 0.6 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{
                                  loop: true,
                                  type: 'timing',
                                  duration: 2000,
                                  delay: animationPhase * 500,
                                }}
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: colors.fill, opacity: 0.3 }}
                              />
                            )}
                          </Pressable>

                          {/* Node Label */}
                          <View 
                            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                            style={{ width: nodeSize * 2 }}
                          >
                            <Text 
                              className="text-xs font-semibold text-center"
                              style={{ color: colors.stroke }}
                              numberOfLines={2}
                            >
                              {node.name.length > 15 ? `${node.name.substring(0, 15)}...` : node.name}
                            </Text>
                          </View>
                        </MotiView>
                      );
                    })}

                    {/* Connection Lines */}
                    {graphData.links.map((link, index) => {
                      const sourceNode = graphData.nodes.find(n => n.id === link.source);
                      const targetNode = graphData.nodes.find(n => n.id === link.target);
                      
                      if (!sourceNode || !targetNode) return null;

                      const x1 = sourceNode.x || 0;
                      const y1 = sourceNode.y || 0;
                      const x2 = targetNode.x || 0;
                      const y2 = targetNode.y || 0;

                      return (
                        <MotiView
                          key={`link-${index}`}
                          from={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          transition={{ 
                            type: 'timing', 
                            duration: 800, 
                            delay: index * 50 + 1200 
                          }}
                          className="absolute"
                          style={{
                            left: Math.min(x1, x2),
                            top: Math.min(y1, y2),
                            width: Math.abs(x2 - x1),
                            height: Math.abs(y2 - y1),
                          }}
                        >
                          <View
                            className="absolute"
                            style={{
                              width: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                              height: 2,
                              backgroundColor: getLinkColor(link.strength),
                              transform: [
                                { rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }
                              ],
                              transformOrigin: '0 50%',
                            }}
                          />
                        </MotiView>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Graph Controls */}
              <View className="p-4 border-t border-slate-700/30">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-400 text-sm">
                    Click concepts to expand dependencies • Larger nodes = more time blocked
                  </Text>
                  <Pressable
                    onPress={() => setExpandedConcepts(new Set())}
                    className="bg-slate-700/50 rounded-lg px-3 py-2"
                  >
                    <Text className="text-slate-300 text-sm">Collapse All</Text>
                  </Pressable>
                </View>
              </View>
            </MotiView>

            {/* Legend */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 1000 }}
              className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40 mb-6"
            >
              <Text className="text-lg font-bold text-slate-100 mb-4">Legend</Text>
              
              <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Node Types */}
                <View>
                  <Text className="text-slate-300 font-semibold mb-3">Node Types</Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mr-3 items-center justify-center">
                        <GitBranch size={12} color="#ffffff" />
                      </View>
                      <Text className="text-slate-300 text-sm">Core Concepts</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 rounded-full bg-blue-500/80 mr-3 items-center justify-center">
                        <Target size={12} color="#ffffff" />
                      </View>
                      <Text className="text-slate-300 text-sm">Dependent Topics</Text>
                    </View>
                  </View>
                </View>

                {/* Strength Colors */}
                <View>
                  <Text className="text-slate-300 font-semibold mb-3">Concept Strength</Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-emerald-500 mr-3" />
                      <Text className="text-slate-300 text-sm">Strong (Low time blocked)</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-amber-500 mr-3" />
                      <Text className="text-slate-300 text-sm">Medium</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                      <Text className="text-slate-300 text-sm">Weak (High time blocked)</Text>
                    </View>
                  </View>
                </View>
              </View>
            </MotiView>

            {/* Concept List View */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1200 }}
              className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40 shadow-lg"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
                  <Target size={16} color="#ffffff" />
                </View>
                <Text className="text-lg font-bold text-slate-100">
                  Prerequisite Concepts
                </Text>
              </View>

              <View className="space-y-3">
                {mockRootCausesData.concept_prerequisites
                  .sort((a, b) => b.time_blocked_min - a.time_blocked_min)
                  .map((concept, index) => {
                    const strength = 1 - (concept.time_blocked_min / Math.max(...mockRootCausesData.concept_prerequisites.map(c => c.time_blocked_min)));
                    const colors = getNodeColor(strength, 'concept');
                    const isExpanded = expandedConcepts.has(concept.concept);

                    return (
                      <MotiView
                        key={concept.concept}
                        from={{ opacity: 0, translateX: -20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'spring', duration: 600, delay: 1400 + index * 100 }}
                        className="bg-slate-700/40 rounded-xl border border-slate-600/30 overflow-hidden"
                      >
                        {/* Concept Header */}
                        <Pressable
                          onPress={() => {
                            const newExpanded = new Set(expandedConcepts);
                            if (newExpanded.has(concept.concept)) {
                              newExpanded.delete(concept.concept);
                            } else {
                              newExpanded.add(concept.concept);
                            }
                            setExpandedConcepts(newExpanded);

                            setSidePanelData({
                              concept: concept.concept,
                              dependentTopics: concept.dependent_topics,
                              pyqsBlocked: concept.pyqs_blocked,
                              timeBlocked: concept.time_blocked_min,
                            });
                          }}
                          className="p-4 active:bg-slate-600/30"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-3">
                              <Text className="text-slate-100 font-semibold text-base mb-2">
                                {concept.concept}
                              </Text>
                              <View className="flex-row items-center space-x-4">
                                <Text className="text-slate-400 text-sm">
                                  PYQs Blocked: <Text className="font-bold text-red-400">
                                    {concept.pyqs_blocked}
                                  </Text>
                                </Text>
                                <Text className="text-slate-400 text-sm">
                                  Time: <Text className="font-bold text-amber-400">
                                    {(concept.time_blocked_min / 60).toFixed(1)}h
                                  </Text>
                                </Text>
                              </View>
                            </View>

                            {/* Strength Indicator */}
                            <View className="items-center mr-3">
                              <View className="relative w-12 h-12">
                                <View className="absolute inset-0 rounded-full border-4 border-slate-600" />
                                <MotiView
                                  from={{ rotate: '0deg' }}
                                  animate={{ rotate: `${strength * 360}deg` }}
                                  transition={{ type: 'spring', duration: 1000, delay: index * 100 + 1600 }}
                                  className="absolute inset-0 rounded-full border-4 border-transparent"
                                  style={{
                                    borderTopColor: colors.stroke,
                                    borderRightColor: strength > 0.25 ? colors.stroke : 'transparent',
                                    borderBottomColor: strength > 0.5 ? colors.stroke : 'transparent',
                                    borderLeftColor: strength > 0.75 ? colors.stroke : 'transparent',
                                  }}
                                />
                                <View className="absolute inset-0 items-center justify-center">
                                  <Text className="text-xs font-bold" style={{ color: colors.stroke }}>
                                    {(strength * 100).toFixed(0)}
                                  </Text>
                                </View>
                              </View>
                              <Text className="text-xs text-slate-400 mt-1">strength</Text>
                            </View>

                            {/* Expand Arrow */}
                            <MotiView
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ type: 'spring', duration: 300 }}
                            >
                              <ChevronRight size={20} color="#94a3b8" />
                            </MotiView>
                          </View>
                        </Pressable>

                        {/* Expanded Dependencies */}
                        <AnimatePresence>
                          {isExpanded && (
                            <MotiView
                              from={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ type: 'spring', duration: 400 }}
                              className="border-t border-slate-600/30"
                            >
                              <View className="p-4 bg-slate-900/20">
                                <Text className="text-slate-300 font-semibold mb-3">
                                  Dependent Topics ({concept.dependent_topics.length})
                                </Text>
                                <View className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {concept.dependent_topics.map((topic, topicIndex) => (
                                    <MotiView
                                      key={topic}
                                      from={{ opacity: 0, translateY: 10 }}
                                      animate={{ opacity: 1, translateY: 0 }}
                                      transition={{ 
                                        type: 'spring', 
                                        duration: 400, 
                                        delay: topicIndex * 50 
                                      }}
                                      className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30"
                                    >
                                      <View className="flex-row items-center">
                                        <View className="w-4 h-4 rounded-full bg-blue-500/60 mr-2" />
                                        <Text className="text-slate-200 text-sm flex-1">
                                          {topic}
                                        </Text>
                                      </View>
                                    </MotiView>
                                  ))}
                                </View>
                              </View>
                            </MotiView>
                          )}
                        </AnimatePresence>
                      </MotiView>
                    );
                  })}
              </View>
            </MotiView>
          </ScrollView>
        </View>

        {/* Side Panel */}
        {sidePanelData && (
          <MotiView
            from={{ opacity: 0, translateX: 300 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', duration: 600 }}
            className="w-80 bg-slate-800/90 border-l border-slate-700/50 p-6 shadow-2xl"
            style={{
              shadowColor: '#8b5cf6',
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
                  Concept Analysis
                </Text>
                <Text className="text-sm text-purple-400">
                  {sidePanelData.concept}
                </Text>
              </View>
              <Pressable
                onPress={() => setSidePanelData(null)}
                className="w-8 h-8 rounded-full bg-slate-700/50 items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Impact Metrics */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <AlertTriangle size={16} color="#ef4444" />
                  <Text className="text-slate-100 font-semibold ml-2">Impact Analysis</Text>
                </View>
                <View className="space-y-3">
                  <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <Text className="text-red-200 text-sm">
                      <Text className="font-bold">{sidePanelData.pyqsBlocked} PYQs blocked</Text> by this prerequisite gap
                    </Text>
                  </View>
                  <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <Text className="text-amber-200 text-sm">
                      <Text className="font-bold">{(sidePanelData.timeBlocked / 60).toFixed(1)} hours</Text> of study time blocked
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dependent Topics */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Target size={16} color="#3b82f6" />
                  <Text className="text-slate-100 font-semibold ml-2">
                    Dependent Topics ({sidePanelData.dependentTopics.length})
                  </Text>
                </View>
                <View className="space-y-2">
                  {sidePanelData.dependentTopics.map((topic, index) => (
                    <MotiView
                      key={topic}
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'spring', duration: 400, delay: index * 100 }}
                      className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
                    >
                      <Text className="text-blue-200 text-sm">{topic}</Text>
                    </MotiView>
                  ))}
                </View>
              </View>

              {/* AI Recommendations */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Lightbulb size={16} color="#fbbf24" />
                  <Text className="text-slate-100 font-semibold ml-2">AI Recommendations</Text>
                </View>
                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <Text className="text-emerald-200 text-sm leading-6">
                    Focus on mastering <Text className="font-bold">{sidePanelData.concept}</Text> first. 
                    This will unlock {sidePanelData.dependentTopics.length} related topics and 
                    save approximately {(sidePanelData.timeBlocked / 60).toFixed(1)} hours of study time.
                  </Text>
                </View>
              </View>

              {/* Study Plan */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Target size={16} color="#10b981" />
                  <Text className="text-slate-100 font-semibold ml-2">Suggested Study Plan</Text>
                </View>
                <View className="space-y-2">
                  <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                    <Text className="text-slate-200 text-sm">
                      <Text className="font-bold">1.</Text> Review fundamental concepts
                    </Text>
                  </View>
                  <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                    <Text className="text-slate-200 text-sm">
                      <Text className="font-bold">2.</Text> Practice related MCQs
                    </Text>
                  </View>
                  <View className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/30">
                    <Text className="text-slate-200 text-sm">
                      <Text className="font-bold">3.</Text> Connect to dependent topics
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </MotiView>
        )}
      </View>

      {/* Tooltip */}
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
            shadowColor: getNodeColor(selectedTooltip.node.strength, selectedTooltip.node.type).stroke,
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
              {selectedTooltip.node.name}
            </Text>
            <Text className="text-slate-400 text-xs mb-3 capitalize">
              {selectedTooltip.node.type} Node
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">PYQs Blocked</Text>
                <Text className="text-red-400 text-xs font-semibold">
                  {selectedTooltip.node.pyqs_blocked}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Time Blocked</Text>
                <Text className="text-amber-400 text-xs font-semibold">
                  {(selectedTooltip.node.time_blocked_min / 60).toFixed(1)}h
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Strength</Text>
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: getNodeColor(selectedTooltip.node.strength, selectedTooltip.node.type).stroke }}
                >
                  {(selectedTooltip.node.strength * 100).toFixed(0)}%
                </Text>
              </View>
            </View>

            {selectedTooltip.node.type === 'concept' && (
              <View className="mt-3 pt-3 border-t border-slate-600/30">
                <Text className="text-slate-300 text-xs">
                  Click to {expandedConcepts.has(selectedTooltip.node.id) ? 'collapse' : 'expand'} dependencies
                </Text>
              </View>
            )}
          </View>
        </MotiView>
      )}

      {/* Overlay for Side Panel */}
      {sidePanelData && (
        <Pressable
          onPress={() => setSidePanelData(null)}
          className="absolute inset-0 bg-black/20 z-40"
        />
      )}
    </View>
  );
}