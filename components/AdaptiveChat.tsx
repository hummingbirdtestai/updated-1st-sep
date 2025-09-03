// components/AdaptiveChat.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  Pressable,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { supabase } from "@/lib/supabaseClient";
import ConfettiCannon from "react-native-confetti-cannon";
import { useAuth } from "../contexts/AuthContext";

import ChatBubble from "@/components/ChatBubble";
import MCQBubble from "@/components/MCQBubble";
import GlowingChip from "@/components/GlowingChip";
import MediaCard from "@/components/MediaCard";
import LearningGapTree from "@/components/LearningGapTree";
import Summary from "@/components/Summary";
import TypingIndicator from "@/components/TypingIndicator";
import LearningGapTags from "@/components/LearningGapTags";

interface AdaptiveChatProps {
  examId: string;
  subjectId: string;
}

export default function AdaptiveChat({ examId, subjectId }: AdaptiveChatProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState(0);

  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const { user, loading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const confettiRef = useRef<ConfettiCannon>(null);

  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  // ✅ Auto scroll
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping, phase]);

  // ✅ Fetch data when subject changes
  useEffect(() => {
    if (subjectId && user) fetchData();
  }, [examId, subjectId, user]);

  const baseSelect =
    "id, exam_id, subject_id, primary_seq, " +
    "lg_mcqs, lg_buzzwords, lg_final_summary, " +
    "lg_high_yield_images, lg_learning_gap_tags, " +
    "lg_recommended_videos, lg_recursive_learning_gaps";

  const fetchData = async () => {
    if (!user) return;

    // fetch student progress
    const { data: progress } = await supabase
      .from("student_progress")
      .select("last_completed_seq, last_phase, last_mcq_index, is_completed")
      .eq("student_id", user.id)
      .eq("subject_id", subjectId)
      .maybeSingle();

    let query;
    let isNewTopic = false;

    if (progress?.last_completed_seq) {
      if (progress.is_completed) {
        // ✅ completed → go to next topic
        query = supabase
          .from("mcq_bank")
          .select(baseSelect)
          .eq("subject_id", subjectId)
          .gt("primary_seq", progress.last_completed_seq)
          .order("primary_seq", { ascending: true })
          .limit(1);
        isNewTopic = true;
      } else {
        // ✅ unfinished → reload same topic
        query = supabase
          .from("mcq_bank")
          .select(baseSelect)
          .eq("subject_id", subjectId)
          .eq("primary_seq", progress.last_completed_seq)
          .limit(1);
      }
    } else {
      // ✅ no progress → fetch first topic
      query = supabase
        .from("mcq_bank")
        .select(baseSelect)
        .eq("subject_id", subjectId)
        .order("primary_seq", { ascending: true })
        .limit(1);
      isNewTopic = true;
    }

    const { data, error } = await query;
    if (error) {
      console.error("❌ Error fetching mcqs:", error);
      return;
    }

    if (data) {
      setRecords(data);
      setCurrentIdx(0);
      setPhase(isNewTopic ? 0 : progress?.last_phase || 0);
      setIsCompleted(false);

      // ✅ restore MCQ state if mid-way
       if (!isNewTopic && progress?.last_phase === 4) {
      if (progress.last_mcq_index > 0) {
        // restore already answered MCQs
        setShowOptions(true);
        const answeredSoFar = data[0].lg_mcqs.slice(0, progress.last_mcq_index);
        const restoredMsgs = answeredSoFar.map((mcq: any, idx: number) => ({
          id: `restore-${idx}`,
          type: "student",
          content: `Previously answered: ${mcq.correct_answer}: ${mcq.options[mcq.correct_answer]}`
        }));
        setMessages(restoredMsgs);
      } else {
        // first MCQ not yet answered → still show it
        setShowOptions(true);
        setMessages([]);
      }
    } else {
      setShowOptions(false);
      setMessages([]);
    }


      // ✅ load bookmarks
      const { data: bmData, error: bmErr } = await supabase
        .from("student_bookmarks")
        .select("element_id")
        .eq("student_id", user.id);
      if (!bmErr && bmData) {
        setBookmarkedIds(new Set(bmData.map((b) => b.element_id)));
      }
    }
  };

  const current = records[currentIdx];

  // ✅ Toggle bookmark in DB + local state
  const toggleBookmark = async (elementId: string, elementType: string, metadata: any = {}) => {
    if (!user) return;

    const isBookmarked = bookmarkedIds.has(elementId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("student_bookmarks")
        .delete()
        .eq("student_id", user.id)
        .eq("element_id", elementId);
      if (error) console.error("❌ Error removing bookmark:", error);
    } else {
      const { error } = await supabase.from("student_bookmarks").insert([
        {
          student_id: user.id,
          element_id: elementId,
          element_type: elementType,
          metadata,
        },
      ]);
      if (error) console.error("❌ Error adding bookmark:", error);
    }

    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (isBookmarked) newSet.delete(elementId);
      else newSet.add(elementId);
      return newSet;
    });
  };

  // ✅ Save phase progress
  const savePhaseProgress = async (newPhase: number) => {
    if (!user || !current) return;
    await supabase.from("student_progress").upsert(
      {
        student_id: user.id,
        subject_id: subjectId,
        last_completed_seq: current.primary_seq,
        last_phase: newPhase,
        last_mcq_index: 0,
        is_completed: false,
        updated_at: new Date(),
      },
      { onConflict: "student_id,subject_id" }
    );
  };

  // ✅ Handle next topic
  const handleNextTopic = async () => {
    if (!user || !current) return;
    await supabase.from("student_progress").upsert(
      {
        student_id: user.id,
        subject_id: subjectId,
        last_completed_seq: current.primary_seq,
        last_phase: 4,
        last_mcq_index: 0,
        is_completed: true,
        updated_at: new Date(),
      },
      { onConflict: "student_id,subject_id" }
    );
    const { data } = await supabase
      .from("mcq_bank")
      .select(baseSelect)
      .eq("subject_id", subjectId)
      .gt("primary_seq", current.primary_seq)
      .order("primary_seq", { ascending: true })
      .limit(1);
    if (data && data.length > 0) {
      setRecords(data);
      setCurrentIdx(0);
      setPhase(0);
      setMessages([]);
      setShowOptions(false);
      setIsCompleted(false);
    } else {
      setIsCompleted(true);
    }
  };

// ✅ Save student answer & update progress
const saveAnswerAndProgress = async (
  mcqId: string,
  selectedOption: string,
  isCorrect: boolean,
  seq: number,
  mcqIndex: number,
  totalMcqs: number
) => {
  if (!user) return;

  // 1️⃣ Insert answer into student_answers (ALWAYS new row)
  const answerPayload = {
    student_id: user.id,
    subject_id: subjectId,
    mcq_id: mcqId,
    selected_option: selectedOption,
    is_correct: isCorrect,
    mcq_index: mcqIndex,
  };

  console.log("📤 Inserting into student_answers:", answerPayload);

  const { error: ansError } = await supabase
    .from("student_answers_inbox")
    .insert([answerPayload]); // ✅ insert ONLY, no onConflict

  if (ansError) {
    console.error("❌ Error inserting answer:", ansError);
    return;
  }

  // 2️⃣ Upsert student_progress (only 1 row per student+subject)
  const journeyComplete = mcqIndex === totalMcqs;

  const progressPayload = {
    student_id: user.id,
    subject_id: subjectId,
    last_completed_seq: seq,
    last_phase: 4,
    last_mcq_index: mcqIndex,
    is_completed: journeyComplete,
    updated_at: new Date(),
  };

  console.log("📤 Upserting into student_progress:", progressPayload);

  const { error: progError } = await supabase
    .from("student_progress")
    .upsert(progressPayload, {
      onConflict: ["student_id", "subject_id"], // ✅ here it's safe
    });

  if (progError) {
    console.error("❌ Error updating progress:", progError);
  }
};


  const handleOptionSelect = async (selectedOption: string) => {
    if (!current?.lg_mcqs) return;
    const answeredCount = messages.filter((m) => m.type === "student").length;
    const mcq = current.lg_mcqs[answeredCount];
    if (!mcq) return;

    const isCorrect = selectedOption === mcq.correct_answer;
    await saveAnswerAndProgress(
      mcq.id,
      selectedOption,
      isCorrect,
      current.primary_seq || 0,
      answeredCount + 1,
      current.lg_mcqs.length
    );

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: "student",
      content: `I choose ${selectedOption}: ${mcq.options[selectedOption]}`,
      isCorrect,
    }]);
    setShowOptions(false);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const tutorMessage = isCorrect
          ? mcq.feedback.correct
          : `${mcq.feedback.wrong}\n\n💡 **Learning Gap:** ${mcq.learning_gap}\n\n✅ **Correct Answer:** ${mcq.correct_answer}: ${mcq.options[mcq.correct_answer]}`;
        setMessages((prev) => [...prev, { id: Date.now().toString(), type: "tutor", content: tutorMessage }]);
        if (isCorrect) {
  // ✅ Stop MCQ flow immediately when correct
  setIsCompleted(true);
  setShowOptions(false);
} else if (current.lg_mcqs[answeredCount + 1]) {
  // ❌ Wrong → show next MCQ
  setTimeout(() => setShowOptions(true), 1000);
} else {
  // ❌ No more MCQs → mark completed
  setIsCompleted(true);
}

      }, 800);
    }, 500);
  };

  // 🚨 Session checks
  if (loading)
    return <View className="flex-1 items-center justify-center bg-slate-900"><Text className="text-slate-400">Loading session...</Text></View>;
  if (!user)
    return <View className="flex-1 items-center justify-center bg-slate-900"><Text className="text-slate-200 text-lg font-bold">🔒 Please login to access Adaptive MCQs</Text></View>;
  if (!current)
    return <View className="flex-1 items-center justify-center bg-slate-900"><Text className="text-slate-400">Select exam & subject to begin</Text></View>;

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar backgroundColor="#0f172a" barStyle="light-content" />
      {isCompleted && <ConfettiCannon ref={confettiRef} count={200} origin={{ x: width / 2, y: 0 }} autoStart fadeOut />}
      <View className="flex-1 w-full">
        <ScrollView ref={scrollViewRef} className="flex-1 w-full" showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: isMobile ? 16 : 24, paddingVertical: 24, width: "100%" }}>

          {/* Phase 0 - Summary */}
          {/* Phase 0 - Summary */}
          {phase === 0 && (
            <MotiView className="space-y-6 w-full">
              {current.lg_final_summary && (
              <Summary
                content={current.lg_final_summary}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={(id, text) =>
                  toggleBookmark(id, "flashcard", { text })
                }
              />
            )}
              <Pressable
                onPress={async () => {
                  setPhase(1);
                  await savePhaseProgress(1);
                }}
                className="bg-emerald-600 p-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Next → Key Concepts</Text>
              </Pressable>
            </MotiView>
          )}


          {/* Phase 1 - Buzzwords */}
          {phase === 1 && (
            <MotiView className="space-y-6 w-full">
              <Text className="text-2xl font-bold text-slate-100">🔑 Key Concepts</Text>
              <View className="flex-row flex-wrap">
                {current.lg_buzzwords?.map((bw: any, i: number) => (
                  <GlowingChip
                    key={bw.id}
                    item={bw}
                    delay={i}
                    isBookmarked={bookmarkedIds.has(bw.id)}
                    onBookmarkToggle={(id, text) =>
                      toggleBookmark(id, "buzzword", { text })
                    } // ✅ now receives id+text and persists
                    onPress={() => {
                      const query = encodeURIComponent(`${bw.text} summary`);
                      const url = `https://www.google.com/search?q=${query}`;
                      Platform.OS === "web" ? window.open(url, "_blank") : Linking.openURL(url);
                    }}
                  />
                ))}
              </View>
              <Pressable onPress={async () => { setPhase(2); await savePhaseProgress(2); }}
                className="bg-indigo-600 p-3 rounded-xl items-center">
                <Text className="text-white font-bold">Next → Learning Gaps</Text>
              </Pressable>
            </MotiView>
          )}

          {/* Phase 2 - Recursive Learning Gaps + Tags */}
          {phase === 2 && (
            <MotiView className="space-y-6 w-full">
              <LearningGapTree
                learningGaps={current.lg_recursive_learning_gaps || []}
                completedLevels={[]}
                bookmarkedIds={bookmarkedIds} // ✅ global set
                onBookmarkToggle={(gapId, gapText) =>
                  toggleBookmark(gapId, "learning_gap", { gap: gapText })
                }
              />
          
              <LearningGapTags
                tags={current.lg_learning_gap_tags || []}
                bookmarkedTags={bookmarkedIds} // ✅ global set
                onBookmarkToggle={(tagId, tagText) =>
                  toggleBookmark(tagId, "tag", { tag: tagText })
                }
              />
          
              <Pressable
                onPress={async () => {
                  setPhase(3);
                  await savePhaseProgress(3);
                }}
                className="bg-purple-600 p-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Next → Images & Videos</Text>
              </Pressable>
            </MotiView>
          )}


          {/* Phase 3 - Images & Videos */}
          {phase === 3 && (
            <MotiView className="space-y-6 w-full">
              {current.lg_high_yield_images?.map((img: any, i: number) => (
                <MediaCard key={img.id || i} item={img} type="image" delay={i}
                  isBookmarked={bookmarkedIds.has(img.id)}
                  onBookmarkToggle={() => toggleBookmark(img.id, "image", { description: img.description })} />
              ))}
              {current.lg_recommended_videos?.map((vid: any, i: number) => (
                <MediaCard key={vid.id || i} item={vid} type="video" delay={i}
                  isBookmarked={bookmarkedIds.has(vid.id)}
                  onBookmarkToggle={() => toggleBookmark(vid.id, "video", { description: vid.description })} />
              ))}
              <Pressable onPress={async () => { setPhase(4); setShowOptions(true); await savePhaseProgress(4); }}
                className="bg-blue-600 p-3 rounded-xl items-center">
                <Text className="text-white font-bold">Next → Start Questions</Text>
              </Pressable>
            </MotiView>
          )}

          {/* Phase 4 - MCQs */}
          {phase === 4 && (
            <View className="w-full">
              {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
              {showOptions && current.lg_mcqs && (() => {
                  const mcqIndex = messages.filter((m) => m.type === "student").length;
                  const mcq = current.lg_mcqs[mcqIndex];
                
                  if (!mcq) return null;
                
                  return (
                    <ChatBubble
                      message={{
                        id: mcq.id,   // ✅ use UUID from the MCQ
                        type: "tutor",
                        content: mcq.stem,
                      }}
                      isBookmarked={bookmarkedIds.has(mcq.id)}
                      onToggleBookmark={() =>
                        toggleBookmark(mcq.id, "mcq", { stem: mcq.stem })
                      }
                    />
                  );
                })()}

              {isTyping && <TypingIndicator />}
              {showOptions && current.lg_mcqs && (
                <MCQBubble options={current.lg_mcqs[messages.filter((m) => m.type === "student").length]?.options || {}}
                  onSelect={handleOptionSelect} />
              )}
              {isCompleted && (
                <Pressable onPress={handleNextTopic} className="bg-emerald-600 p-3 rounded-xl items-center mt-4">
                  <Text className="text-white font-bold">Next Topic →</Text>
                </Pressable>
              )}
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}