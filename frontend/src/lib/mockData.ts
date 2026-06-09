import { Experience, AIInsight, SearchResult, PrivacyLevel } from "@/types";

// Seed data representing human experiences
export const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: "exp-1",
    title: "My startup failed after 2 years of building",
    content: "We raised $150k, built a product for 18 months, and launched to crickets. We spent too much time perfecting code and not enough time talking to users. The day we shut down, I sat in my car and cried for an hour. It felt like my identity was completely erased. But looking back, I learned more about sales, distribution, and resilience in those 2 years than in my entire 10-year engineering career.",
    emotion_tags: ["failure", "lost", "startup", "grief", "lessons"],
    privacy: "Public",
    user_id: "user-alpha",
    author_name: "Marc Andreessen Clone",
    created_at: "2026-04-10T12:00:00Z",
    updated_at: "2026-04-10T12:00:00Z"
  },
  {
    id: "exp-2",
    title: "I failed my university exams and thought my life was over",
    content: "I failed my second-year algorithms and systems exams. I was placed on academic probation. I saw my friends moving forward, getting internships, while I felt like the ultimate disappointment. I was terrified of telling my parents. When I finally did, they weren't angry—just worried. I took a gap semester, worked at a local bookstore, learned how to study with ADHD, and passed the next year. Academics are important, but they do not define your human value.",
    emotion_tags: ["failure", "lost", "anxiety", "academic"],
    privacy: "Public",
    user_id: "user-beta",
    author_name: "A. Student",
    created_at: "2026-05-15T09:30:00Z",
    updated_at: "2026-05-15T09:30:00Z"
  },
  {
    id: "exp-3",
    title: "Left a high-paying FAANG job because I hated coding",
    content: "On paper, I had it all. $250k salary, great perks, working on a famous team. But every single morning, I woke up with dread. I hated sitting in front of JIRA tickets all day. I felt guilty because others would kill for my job. I finally quit to become a product designer. My income halved initially, but my sleep, digestion, and creativity returned. Don't trap yourself in a golden cage just because of society's definitions of success.",
    emotion_tags: ["career mistake", "lost", "burnout", "growth"],
    privacy: "Public",
    user_id: "user-gamma",
    author_name: "Sarah Chen",
    created_at: "2026-03-20T14:45:00Z",
    updated_at: "2026-03-20T14:45:00Z"
  },
  {
    id: "exp-4",
    title: "Grieving a relationship that just drifted away",
    content: "We didn't have a giant fight. There was no cheating or drama. We just slowly drifted into roommates, then strangers. Deciding to separate was harder than if someone had made a mistake, because there was no villain. I still love her as a person, but we are different people now. Heartbreak isn't always sharp; sometimes it's a slow, quiet ache of letting go of the future you planned.",
    emotion_tags: ["heartbreak", "grief", "sadness", "relationships"],
    privacy: "Anonymous",
    user_id: "user-delta",
    author_name: null,
    created_at: "2026-06-01T18:20:00Z",
    updated_at: "2026-06-01T18:20:00Z"
  },
  {
    id: "exp-5",
    title: "Overcoming imposter syndrome in my first Tech Lead role",
    content: "When they promoted me, I was sure they made a mistake. During meetings, I sat in silence, terrified that asking a question would expose me. I worked 70-hour weeks trying to code everything myself to prove I deserved the title, which led to severe burnout. I had to learn that leading isn't about being the smartest coder in the room—it's about enabling others to do their best work. My role is to unblock, not build it all.",
    emotion_tags: ["anxiety", "burnout", "career", "growth"],
    privacy: "Public",
    user_id: "user-alpha",
    author_name: "Marc Andreessen Clone",
    created_at: "2026-05-30T10:15:00Z",
    updated_at: "2026-05-30T10:15:00Z"
  },
  {
    id: "exp-6",
    title: "Private journal: Reflection on my anger issues",
    content: "I snapped at my brother today over something completely trivial. I realize I have a pattern of bottling up work stress and releasing it on the people who love me most. I need to start therapy and find healthy emotional outlets. Keeping this here just to track my progress and keep myself accountable.",
    emotion_tags: ["lessons", "anxiety", "growth", "private-reflection"],
    privacy: "Private",
    user_id: "user-alpha",
    author_name: "Marc Andreessen Clone",
    created_at: "2026-06-05T21:00:00Z",
    updated_at: "2026-06-05T21:00:00Z"
  }
];

// Seed category emotions for visual selectors
export const TRENDING_EMOTIONS = [
  { tag: "lost", count: 42, color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400" },
  { tag: "failure", count: 31, color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400" },
  { tag: "heartbreak", count: 28, color: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400" },
  { tag: "burnout", count: 25, color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400" },
  { tag: "anxiety", count: 19, color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400" },
  { tag: "grief", count: 14, color: "from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 text-violet-400" }
];

// Simulated Semantic AI Engine
export function simulateSearch(query: string, experiences: Experience[]): {
  insight: AIInsight;
  results: SearchResult[];
} {
  const lowercaseQuery = query.toLowerCase();
  
  // Calculate a mock semantic score based on matches
  const scoredResults: SearchResult[] = experiences
    .filter(exp => exp.privacy !== "Private") // Filter out private experiences
    .map(exp => {
      let score = 0.2; // Base score
      
      // Look for tag matches
      exp.emotion_tags.forEach(tag => {
        if (lowercaseQuery.includes(tag)) score += 0.25;
      });

      // Text keywords
      if (lowercaseQuery.includes("startup") && exp.content.includes("startup")) score += 0.3;
      if (lowercaseQuery.includes("fail") && (exp.content.includes("failed") || exp.title.includes("failed"))) score += 0.25;
      if (lowercaseQuery.includes("code") && exp.content.includes("coding")) score += 0.35;
      if (lowercaseQuery.includes("job") && exp.content.includes("job")) score += 0.2;
      if (lowercaseQuery.includes("love") || lowercaseQuery.includes("heartbreak") || lowercaseQuery.includes("relationship")) {
        if (exp.content.includes("relationship") || exp.content.includes("heartbreak") || exp.content.includes("separate")) score += 0.35;
      }
      if (lowercaseQuery.includes("exam") || lowercaseQuery.includes("college") || lowercaseQuery.includes("school")) {
        if (exp.content.includes("exam") || exp.content.includes("academic") || exp.content.includes("university")) score += 0.4;
      }

      // Add a bit of randomness to look organic, capped at 0.98
      score = Math.min(0.98, score + Math.random() * 0.1);

      return { experience: exp, score };
    })
    // Filter out low scores if we have a search query, otherwise show all public
    .filter(res => lowercaseQuery ? res.score > 0.3 : true)
    .sort((a, b) => b.score - a.score);

  // Generate an AI Insight based on top matching categories
  let insight: AIInsight = {
    summary: "Reflecting on your search, there is a recurring theme of transition and realignment.",
    themes: ["Transition", "Self-Worth", "Growth"],
    reframing: "Temporary setbacks are pivots, not final outcomes. Separation of identity from output is key.",
    growth_steps: [
      "Acknowledge the emotional weight of this transition.",
      "Identify the core learning independent of external validation.",
      "Take one micro-action that aligns with your revised values."
    ]
  };

  if (lowercaseQuery.includes("startup") || lowercaseQuery.includes("business") || lowercaseQuery.includes("founder")) {
    insight = {
      summary: "Founder failure is rarely a failure of capability; it is a mismatch of timing, distribution, or feedback loops. The collective experiences suggest that building in public and detaching personal identity from venture outcomes are vital for survival.",
      themes: ["Identity Detachment", "Customer Discovery", "Resilience"],
      reframing: "Your startup didn't fail you; it was a high-intensity apprenticeship that graduated you into a more capable operator.",
      growth_steps: [
        "Write a post-mortem to document exact learning nodes (technical, operational, market).",
        "Take a minimum 2-week cognitive break before starting any new venture.",
        "Talk to three previous founders about their post-failure pivot strategies."
      ]
    };
  } else if (lowercaseQuery.includes("lost") || lowercaseQuery.includes("career") || lowercaseQuery.includes("code") || lowercaseQuery.includes("coding")) {
    insight = {
      summary: "Career displacement and burnout usually manifest when there is a mismatch between values and daily activity. FAANG and high-prestige roles often act as golden cages that delay necessary alignment pivots.",
      themes: ["Values Alignment", "Burnout Recovery", "Sunk Cost Fallacy"],
      reframing: "Feeling lost is not a sign of weakness—it is your emotional processing system signaling that your current environment lacks meaningful nutrients.",
      growth_steps: [
        "Audit your daily activities: separate what drains you from what energizes you.",
        "Interview someone in a target adjacent field (e.g., product design, management).",
        "Set strict work boundary caps: block screen time after 6:00 PM."
      ]
    };
  } else if (lowercaseQuery.includes("relationship") || lowercaseQuery.includes("heartbreak") || lowercaseQuery.includes("lost someone") || lowercaseQuery.includes("love")) {
    insight = {
      summary: "Relational drifting can be more challenging than abrupt endings due to the lack of clear closure. The wisdom of similar experiences stresses that letting go of the projected future is the most critical hurdle in healing.",
      themes: ["Ambiguous Loss", "Identity Re-establishment", "Emotional Grace"],
      reframing: "Drifting apart is not a failure of love, but a reflection of divergent growth vectors that require releasing with gratitude.",
      growth_steps: [
        "Allow yourself to grieve the future you planned, not just the person you lost.",
        "Remove digital triggers or social media checks to allow neurons to reset.",
        "Reconnect with solo hobbies that pre-date the relationship."
      ]
    };
  } else if (lowercaseQuery.includes("exam") || lowercaseQuery.includes("fail") || lowercaseQuery.includes("study") || lowercaseQuery.includes("school")) {
    insight = {
      summary: "Academic setbacks trigger deep shame due to immediate comparison with peers. Similar student stories show that academic setbacks are often the first time individuals are forced to build systems for neurodivergence or anxiety.",
      themes: ["Academic Shame", "Systemic Learning", "Self-Compassion"],
      reframing: "Failing an exam is a localized metric of study strategy, not a global metric of intellectual capacity or future potential.",
      growth_steps: [
        "Disclose the situation to trusted allies to diffuse the burden of isolation.",
        "Redesign study environments (e.g., pomodoro timers, whiteboards, group accountability).",
        "Consult academic counselors for systems adjustments (e.g., ADHD accommodations)."
      ]
    };
  }

  return { insight, results: scoredResults };
}
