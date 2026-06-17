"""
seed_experiences.py — Database Seeder Script
===========================================
Populates the database with 112 unique, high-quality human experiences
across 16 emotional and life categories (7 stories per category).
Runs each experience through the local AI services to generate
emotions, themes, reflections, and ChromaDB vector index entries.
"""

import os
import sys
import logging
from datetime import datetime, timedelta, timezone
import random

# Add parent directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, Base, engine
from app.db.models import Experience, User, PrivacyLevel
from app.services.ai.emotion_service import emotion_service
from app.services.ai.wisdom_service import wisdom_service
from app.services.ai.vector_service import vector_service

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(message)s")
logger = logging.getLogger(__name__)

RAW_DATA = [
    # ─── 1. EXAM FAILURE ────────────────────────────────────────────────
    {
        "category": "Exam Failure",
        "title": "Failing my board exams was a blessing in disguise",
        "content": "I spent two years studying day and night for the medical entrance boards. When the results arrived, my score was far below average. I felt crushed and useless. But during that gap year, I volunteered in public health policy and discovered I loved managing healthcare systems much more than performing clinical procedures. I switched tracks and found my true calling.",
        "emotion_tags": ["failure", "exam", "setback", "growth"]
    },
    {
        "category": "Exam Failure",
        "title": "Failed my final university programming exam and repeated a semester",
        "content": "I was a computer science student who spent too much time on side projects and not enough time studying academic algorithms. I failed the final exam in advanced data structures. Having to watch my classmates graduate while I sat in a lecture hall for another semester was devastating. I learned to balance my practical coding with theoretical foundations, which ultimately helped me pass my tech interviews later.",
        "emotion_tags": ["exam", "failure", "self doubt", "anxiety"]
    },
    {
        "category": "Exam Failure",
        "title": "The shame of failing the bar exam on my first try",
        "content": "All my peers at law school cleared the bar exam on the first try. I didn't. The letters 'FAIL' on the results page felt like a permanent mark on my forehead. I had to face my family, colleagues, and my firm. I realized that my study habits were inefficient and that I suffered from severe exam anxiety. I spent the next six months building cognitive reframing strategies and passed with a high score on the second try.",
        "emotion_tags": ["exam", "failure", "shame", "resilience"]
    },
    {
        "category": "Exam Failure",
        "title": "Failing my driver's exam three times taught me self-control",
        "content": "It sounds trivial, but failing my driving exam multiple times made me feel incredibly incompetent. Everyone else seemed to get it instantly. Each failure chipped away at my self-confidence. I had to learn to manage my panic when parallel parking under the examiner's gaze. On the fourth try, I kept my breathing steady and cleared it. It taught me that persistence in small details matters.",
        "emotion_tags": ["exam", "failure", "anxiety", "resilience"]
    },
    {
        "category": "Exam Failure",
        "title": "Failing my college calculus final and shifting my career path",
        "content": "My parents are both doctors, and I was expected to ace my pre-med chemistry and math final exams. Instead, I got a D in calculus. The disappointment in their eyes hurt more than the grade itself. I realized I was pursuing medicine for their approval, not my own desire. This failure forced an honest conversation. I changed my major to graphic design, and for the first time, I am excited about my exams.",
        "emotion_tags": ["exam", "failure", "disappointment", "growth"]
    },
    {
        "category": "Exam Failure",
        "title": "Failed the CFA Level 1 exam after months of isolation",
        "content": "I sacrificed my weekends, social life, and sleep for six months to study for the CFA Level 1. Seeing the 'fail' result made me feel like those 300 hours were completely wasted. I wanted to quit finance altogether. After a week of grieving, I realized my study methods lacked active recall. I retook the exam six months later and passed, learning that effort is only as good as the strategy behind it.",
        "emotion_tags": ["exam", "failure", "burnout", "resilience"]
    },
    {
        "category": "Exam Failure",
        "title": "Failing my high school placement exam and losing touch with friends",
        "content": "I was the only one in my middle school friend group who failed to get into the prestigious local academy. They all went to the same school while I ended up at a standard public high school. I felt left out and inferior. However, this separation forced me to step out of my comfort zone and make new friends who appreciated me for who I was, not what school banner I wore.",
        "emotion_tags": ["exam", "failure", "friendship", "growth"]
    },

    # ─── 2. PLACEMENT REJECTION ──────────────────────────────────────────
    {
        "category": "Placement Rejection",
        "title": "Rejected from 15 campus placement drives in a row",
        "content": "I was a computer science graduate who felt completely prepared. However, I got rejected from 15 campus placement drives in a row. It was humiliating watching my peers secure jobs while I got rejected at coding rounds. Instead of giving up, I spent the summer building real-world open source projects. A small startup saw my GitHub and hired me directly, proving that campus grades aren't the only gateway.",
        "emotion_tags": ["rejection", "placement", "failure", "career"]
    },
    {
        "category": "Placement Rejection",
        "title": "Failed the final round interview at my dream investment bank",
        "content": "I made it through four rounds of interviews for an investment banking analyst placement. I was at the final superday, but I stumbled on a valuation question. Getting the rejection email the next day felt like my career was over before it started. I spent a month reflecting on my preparation, improved my macro models, and landed a better analyst position at a private equity firm that had a much healthier culture.",
        "emotion_tags": ["rejection", "interview", "failure", "resilience"]
    },
    {
        "category": "Placement Rejection",
        "title": "The crushing silence of campus placements",
        "content": "I submitted seventeen applications to different placement partners during the university job week. Day after day, my inbox was completely silent. The lack of response was more painful than a direct rejection. It made me feel invisible. I reached out to alumni for resume audits, removed template summaries, and focused on tailored pitches. Within a month, I got three off-campus interviews and landed a role.",
        "emotion_tags": ["placement", "rejection", "self doubt", "growth"]
    },
    {
        "category": "Placement Rejection",
        "title": "Rejected by a company I interned at for six months",
        "content": "I spent six months working as an intern at a mid-sized tech firm, putting in extra hours and expecting a return placement offer. Instead, the team leader told me they didn't have the budget to convert my role. I felt betrayed and discarded. It taught me to detach my self-worth from corporate entities and focus on building portable skills that belong to me, not my employer.",
        "emotion_tags": ["rejection", "placement", "betrayal", "career"]
    },
    {
        "category": "Placement Rejection",
        "title": "Rejection at the coding round of campus placements",
        "content": "During the main placement week, I froze on a binary tree coding question and failed to advance past the initial round. The embarrassment was intense. I decided to change my approach to learning algorithms. I stopped trying to memorize solutions and focused on understanding the underlying patterns. By the next placement drive, I cleared the coding round with ease.",
        "emotion_tags": ["placement", "failure", "anxiety", "resilience"]
    },
    {
        "category": "Placement Rejection",
        "title": "Passed all technical rounds only to fail the HR placement round",
        "content": "I cleared three technical rounds, writing optimized code and answering all architecture questions correctly. I thought the job was mine. But I was rejected after the HR round because they felt I wasn't a 'cultural fit.' I was devastated. Later, I realized that their culture was highly rigid, and my collaborative nature would have clashed. I joined a startup that values my personality.",
        "emotion_tags": ["rejection", "interview", "disappointment", "growth"]
    },
    {
        "category": "Placement Rejection",
        "title": "Rejected by a mid-tier placement agency",
        "content": "A local placement agency rejected me, telling me my skills were inadequate for the current market. It was a severe blow to my confidence. I spent the next six months building a portfolio of freelance projects and learning cloud deployments. I bypassed agencies entirely and pitched directly to clients on LinkedIn, landing my first full-time client within weeks.",
        "emotion_tags": ["rejection", "self doubt", "motivation", "growth"]
    },

    # ─── 3. CAREER CONFUSION ──────────────────────────────────────────────
    {
        "category": "Career Confusion",
        "title": "Hating my high-paying consulting role but scared to quit",
        "content": "I had a prestigious consulting job with a great salary, but every morning I felt a deep dread. I spent my days building PowerPoint decks that no one read. I was terrified of quitting because of my family's expectations. Eventually, I started writing online and discovered a passion for content strategy. I took a salary cut to transition into marketing, and my mental health returned immediately.",
        "emotion_tags": ["confusion", "career", "burnout", "growth"]
    },
    {
        "category": "Career Confusion",
        "title": "Unemployed at 26 with a degree I don't want to use",
        "content": "I graduated with a master's in history, only to realize I didn't want to work in academia or teach. I spent a year unemployed, feeling lost and directionless. The gap on my resume felt like a mountain. I began taking online courses in data analysis, working on SQL projects at night. It was a complete shift, but it helped me land an analyst role and rebuild my confidence.",
        "emotion_tags": ["confusion", "unemployment", "lost", "growth"]
    },
    {
        "category": "Career Confusion",
        "title": "Mid-career pivot from mechanical engineering to software development",
        "content": "After eight years in manufacturing, I felt my skills becoming obsolete and my industry stagnating. I was terrified of starting over as a junior developer. I enrolled in a boot camp, spent weekends coding, and dealt with intense imposter syndrome. Landing my first developer job at 33 was incredibly difficult, but it showed me that age is not a barrier to redirection.",
        "emotion_tags": ["confusion", "pivot", "career", "resilience"]
    },
    {
        "category": "Career Confusion",
        "title": "Transitioning from corporate marketing to non-profit work",
        "content": "I spent years hitting sales targets and optimizing conversion rates for consumer brands, but I felt empty. I wanted my work to have social utility. I transitioned to managing marketing for a local non-profit. Although my income dropped, the feeling of contribution and community alignment completely replaced the daily stress of corporate metrics.",
        "emotion_tags": ["career", "confusion", "values", "growth"]
    },
    {
        "category": "Career Confusion",
        "title": "Feeling stuck in the golden cage of FAANG software engineering",
        "content": "Working at a top-tier tech firm gave me high status and great compensation, but my daily tasks were highly repetitive. I felt like a small cog in a giant machine. I spent months in career confusion, debating whether to leave. I finally quit to join a series-A startup. The transition was intense, but building things from scratch restored my creative spark.",
        "emotion_tags": ["career", "confusion", "motivation", "growth"]
    },
    {
        "category": "Career Confusion",
        "title": "Should I go to grad school or continue working?",
        "content": "I spent a year in deep confusion, debating whether to take out a massive loan for graduate school or stay in my comfortable but boring analyst job. I spoke to mentors and decided to stay in the industry while shifting to a product management role. I realized that practical experience often compounds faster than academic theory without the burden of debt.",
        "emotion_tags": ["career", "confusion", "education", "life lessons"]
    },
    {
        "category": "Career Confusion",
        "title": "The panic of graduating with a liberal arts degree and no career goals",
        "content": "I graduated with a degree in literature, and the constant question 'what will you do with that?' caused me severe anxiety. I didn't have a structured path like my friends in engineering. I started doing freelance writing, copywriting, and social media coordination. Slowly, these small projects coalesced into a successful marketing career, showing that paths can be built organically.",
        "emotion_tags": ["confusion", "career", "anxiety", "growth"]
    },

    # ─── 4. STARTUP FAILURE ───────────────────────────────────────────────
    {
        "category": "Startup Failure",
        "title": "We raised $500k and shut down after 18 months",
        "content": "We built a beautiful mobile platform for EdTech, raised venture capital, and hired a team. But we failed to find product-market fit. We spent too much time coding features and not enough time talking to educators. Shutting down the company and telling our investors was the hardest thing I've ever done. I learned that an MVP should be simple and driven by direct customer feedback.",
        "emotion_tags": ["failure", "startup", "career", "lessons"]
    },
    {
        "category": "Startup Failure",
        "title": "My solo SaaS project made $0 and crashed",
        "content": "I spent nine months working in absolute isolation, building a scheduling app for gym owners. I launched it on Product Hunt and got zero sign-ups. I was devastated and felt like a incompetent developer. I realized my mistake was building in public isolation. My next project started with landing page sign-ups before I wrote a single line of code.",
        "emotion_tags": ["startup", "failure", "development", "lessons"]
    },
    {
        "category": "Startup Failure",
        "title": "Shutting down our family-owned retail business",
        "content": "Our family retail business had been running for a decade, but e-commerce competition and rising rents made it unsustainable. The decision to close was filled with grief and family tension. We had to liquidate our inventory and let go of staff who felt like family. This failure taught me to pivot early and adapt to digital landscapes, rather than holding on to legacy models.",
        "emotion_tags": ["startup", "failure", "family", "setback"]
    },
    {
        "category": "Startup Failure",
        "title": "The co-founder split that killed our software agency",
        "content": "We had a growing agency with ten developers, but disputes over equity splits and company direction created a toxic environment. We couldn't align and decided to dissolve the company. Losing my business and my co-founder friend was incredibly painful. I learned that clear legal contracts and shared value alignment are essential before starting any venture.",
        "emotion_tags": ["startup", "failure", "friendship", "conflict"]
    },
    {
        "category": "Startup Failure",
        "title": "Our hardware startup burned through our savings",
        "content": "We tried to build a custom IoT device, but manufacturing delays, supplier issues, and testing compliance blew through our capital. We went bankrupt. It was a crushing blow, but the technical challenges we solved made me a far better hardware engineer. I pivoted to consulting and paid off my debts, finding value in the expertise I gained.",
        "emotion_tags": ["startup", "failure", "finance", "resilience"]
    },
    {
        "category": "Startup Failure",
        "title": "Building a mobile app for 12 months only to get rejected by app stores",
        "content": "We built a niche social app, but right before launch, app store policy changes resulted in a permanent rejection. We couldn't bypass it. Our startup died that day. It taught me to never build on top of a single, closed ecosystem. I transitioned to developing open web apps, ensuring that our access to customers is never controlled by gatekeepers.",
        "emotion_tags": ["startup", "failure", "rejection", "lessons"]
    },
    {
        "category": "Startup Failure",
        "title": "Failed to secure Series A and laid off 15 people",
        "content": "We were growing but ran out of runway during a tech downturn. When our Series A term sheet fell through, I had to lay off our entire team of 15. The guilt and stress were overwhelming. I closed operations and spent six months resting. It taught me that failure is a part of the entrepreneurial cycle, and my identity is distinct from my company's valuation.",
        "emotion_tags": ["startup", "failure", "layoffs", "resilience"]
    },

    # ─── 5. BURNOUT ───────────────────────────────────────────────────────
    {
        "category": "Burnout",
        "title": "The morning my body physically refused to get out of bed",
        "content": "I spent a year working 70-hour weeks in investment banking to secure a promotion. One morning, I woke up and my body physically refused to move. I had a massive panic attack and was hospitalized. This physical collapse forced me to resign. I took a three-month sabbatical, reconnected with nature, and learned that health is the ultimate currency.",
        "emotion_tags": ["burnout", "exhaustion", "anxiety", "health"]
    },
    {
        "category": "Burnout",
        "title": "Losing my passion for coding because of toxic sprint cycles",
        "content": "I used to love programming, but toxic sprint planning, constant overtime, and unrealistic deadlines turned my passion into dread. I started writing sloppy code just to close tickets. I realized I was burned out. I quit and took a month off before joining a company that values sustainable pacing, proving that work culture shapes engineering quality.",
        "emotion_tags": ["burnout", "workplace", "exhaustion", "career"]
    },
    {
        "category": "Burnout",
        "title": "Student burnout during the final year of engineering",
        "content": "Managing a final year project, preparing for exams, and applying to placements all at once led me to extreme exhaustion. I couldn't sleep, had chronic stomach pain, and couldn't focus. I had to seek counseling. I learned to drop non-essential activities, set strict boundaries around study times, and prioritize sleep, which restored my health.",
        "emotion_tags": ["burnout", "academic", "exhaustion", "anxiety"]
    },
    {
        "category": "Burnout",
        "title": "Creative burnout as a freelance designer",
        "content": "To build my business, I accepted every client request and agreed to endless revisions. I was working 14-hour days for low rates. I ended up hating my design work. I realized I had creative burnout. I restructured my business model: raised my rates, limited client slots, and set firm boundaries on communication. My creativity returned, and my business grew.",
        "emotion_tags": ["burnout", "freelance", "creativity", "lessons"]
    },
    {
        "category": "Burnout",
        "title": "Academic burnout in grad school",
        "content": "The pressure to publish and constant competition in my lab led me to severe academic burnout. I felt like a robot writing papers. I spent weekends in isolation. I decided to leave academia and transition into industry. The relief was immediate. I regained my mental sanity and realized my intellect could be applied in less toxic environments.",
        "emotion_tags": ["burnout", "academic", "lost", "growth"]
    },
    {
        "category": "Burnout",
        "title": "Burnout in a remote role after losing boundaries",
        "content": "During remote work, I worked from my bed, answered Slack messages at 10 PM, and never took breaks. My home became my office, and my sleep suffered. I felt constantly exhausted. I resolved this by setting up a dedicated desk, closing my laptop at 6 PM, and taking walks during lunch. Separating space restored my energy levels.",
        "emotion_tags": ["burnout", "remote", "boundaries", "health"]
    },
    {
        "category": "Burnout",
        "title": "Medical worker exhaustion after the pandemic",
        "content": "Double shifts and constant exposure to trauma left me emotionally detached and exhausted. I was suffering from clinical burnout. I transitioned to an outpatient administrative role with structured hours. It was a step down in adrenaline, but it allowed my nervous system to heal and saved my career in healthcare.",
        "emotion_tags": ["burnout", "medical", "exhaustion", "resilience"]
    },

    # ─── 6. HEARTBREAK ────────────────────────────────────────────────────
    {
        "category": "Heartbreak",
        "title": "Getting ghosted after a three-year relationship",
        "content": "One day, my partner of three years packed their bags and left, blocking me on all social media with zero explanation. The lack of closure was torturous. I spent months questioning my self-worth. Through therapy, I realized that ghosting is a reflection of the other person's inability to communicate, not my value. I rebuilt my life and found peace.",
        "emotion_tags": ["heartbreak", "ghosting", "sadness", "healing"]
    },
    {
        "category": "Heartbreak",
        "title": "The divorce that forced me to rebuild my life at 35",
        "content": "My marriage ended amicably, but the separation was incredibly painful. I had to sell our house, split our assets, and move to a new city alone. Rebuilding my identity at 35 was terrifying. I focused on my health, started hiking, and made new friends. I discovered a deep strength in my own company, finding happiness in my independence.",
        "emotion_tags": ["heartbreak", "divorce", "loneliness", "growth"]
    },
    {
        "category": "Heartbreak",
        "title": "Breaking up with my college sweetheart after graduation",
        "content": "We had different career goals: I got a placement in New York, and they got a job in San Francisco. We tried long distance, but the strain was too much. The breakup was slow and painful. It taught me that sometimes love is not enough when life directions diverge. Prioritizing my career was difficult, but it was the right choice.",
        "emotion_tags": ["heartbreak", "breakup", "career", "life lessons"]
    },
    {
        "category": "Heartbreak",
        "title": "Loving someone who didn't want the same future",
        "content": "We were together for four years, but we split because we couldn't align on wanting children. It was a mutual breakup, which made the grief even harder because there was no anger to hide behind. I spent months processing the loss. It taught me that boundary alignment is crucial, and ending a relationship with respect is a form of love.",
        "emotion_tags": ["heartbreak", "breakup", "values", "healing"]
    },
    {
        "category": "Heartbreak",
        "title": "Healing from a toxic relationship that eroded my identity",
        "content": "I was with a partner who constantly manipulated and criticized me. I lost my confidence and drifted away from my friends. Leaving them was terrifying, but it was the catalyst for my recovery. I reconnected with my family, started coding again, and realized that my independence is non-negotiable.",
        "emotion_tags": ["heartbreak", "relationship", "growth", "resilience"]
    },
    {
        "category": "Heartbreak",
        "title": "The breakup text that ended my engagement",
        "content": "Six months before our wedding, my fiance sent a text saying they couldn't go through with it. The shock and public embarrassment were intense. I had to call off the venue and face my guests. Rebuilding my life from that floor was slow, but it taught me to identify emotional unavailability early and value absolute honesty over social appearances.",
        "emotion_tags": ["heartbreak", "rejection", "sadness", "healing"]
    },
    {
        "category": "Heartbreak",
        "title": "Long distance relationship failure after a year apart",
        "content": "We thought our relationship was strong enough to survive a year of study abroad, but time zone gaps and lack of physical presence led to a slow drift. The eventual breakup was painful but inevitable. It taught me the importance of shared daily presence and communication, helping me set healthier expectations for future relationships.",
        "emotion_tags": ["heartbreak", "distance", "sadness", "lessons"]
    },

    # ─── 7. FRIENDSHIP LOSS ───────────────────────────────────────────────
    {
        "category": "Friendship Loss",
        "title": "Drifting apart from my childhood best friend after college",
        "content": "We had been inseparable since we were seven, but after college, our lives diverged. They stayed in our hometown and I moved away for work. Our phone calls became shorter, and eventually, they stopped. It was a quiet, painful loss. I learned that friendships have seasons, and drifting apart doesn't erase the value of the memories we shared.",
        "emotion_tags": ["friendship", "loss", "drift", "sadness"]
    },
    {
        "category": "Friendship Loss",
        "title": "Cutting off a toxic friend who competed with my success",
        "content": "I had a close friend who constantly made passive-aggressive comments whenever I succeeded. When I got my dream job, their jealousy became obvious. I decided to distance myself and cut off contact. It was difficult, but the relief was immediate. Surrounding myself with supportive people taught me what real friendship looks like.",
        "emotion_tags": ["friendship", "loss", "toxic", "growth"]
    },
    {
        "category": "Friendship Loss",
        "title": "The business partnership that ruined a 10-year friendship",
        "content": "We decided to start a design agency together, but arguments over workload division and profit splits ruined our communication. We had to close the agency, and we stopped speaking entirely. Losing a decade-long friendship was a major regret. I learned to never combine friendship with business without setting highly strict professional boundaries.",
        "emotion_tags": ["friendship", "loss", "startup", "lessons"]
    },
    {
        "category": "Friendship Loss",
        "title": "Losing my friend group after sharing a controversial opinion",
        "content": "I expressed a view that conflicted with my friend group's consensus, and they decided to exclude me. I was ghosted from group chats and gatherings. The isolation was painful. It forced me to reflect on my values and build a new, diverse circle of friends who welcome disagreement, proving that group conformity is a weak foundation.",
        "emotion_tags": ["friendship", "loss", "isolation", "resilience"]
    },
    {
        "category": "Friendship Loss",
        "title": "Drifting from friends after getting sober",
        "content": "When I decided to stop drinking, I realized my friend group was held together solely by alcohol. When I stopped going to bars, they stopped inviting me. I felt incredibly lonely at first. I joined a running club and found a sober community that shares my values, showing that life transitions require changes in social circles.",
        "emotion_tags": ["friendship", "loss", "addiction", "growth"]
    },
    {
        "category": "Friendship Loss",
        "title": "When a friend ghosted me with no explanation",
        "content": "My closest friend suddenly stopped replying to my messages and calls. I spent months worrying and wondering if I had done something wrong. I had to learn to accept the silence as their choice. It taught me that some relationships end without closure, and I must find peace within myself rather than demanding explanations.",
        "emotion_tags": ["friendship", "loss", "ghosting", "healing"]
    },
    {
        "category": "Friendship Loss",
        "title": "Losing contact with college friends after moving abroad",
        "content": "Moving to Europe created a nine-hour time zone gap with my college group. Group chats dried up, and we stopped scheduling calls. The silence was painful. It taught me to focus my energy on building local relationships in my new home while accepting that distant friendships require structure to survive.",
        "emotion_tags": ["friendship", "loss", "distance", "lessons"]
    },

    # ─── 8. FINANCIAL STRUGGLES ──────────────────────────────────────────
    {
        "category": "Financial Struggles",
        "title": "Living on instant noodles while paying off student debt",
        "content": "I graduated with $50k in student loans and a low-paying entry-level job. My bank balance was constantly near zero. I had to budget every dollar, skip social events, and live in a tiny shared room. The financial stress was constant. Clearing that debt took four years of discipline, but it built a strong financial ethic and taught me to value simplicity.",
        "emotion_tags": ["finance", "struggle", "debt", "lessons"]
    },
    {
        "category": "Financial Struggles",
        "title": "How maxing out my credit cards taught me financial discipline",
        "content": "In my early twenties, I used credit cards to fund a lifestyle I couldn't afford. I woke up one day to find myself $15k in high-interest debt, facing panic attacks. I worked a second job, cut all unnecessary spending, and paid it off. That panic was the catalyst for me to build a healthy relationship with money.",
        "emotion_tags": ["finance", "debt", "panic", "resilience"]
    },
    {
        "category": "Financial Struggles",
        "title": "Our family went bankrupt during my college years",
        "content": "My father's manufacturing business went bankrupt, and we lost our home. I had to take out emergency loans and work part-time shifts at a warehouse while managing my engineering classes. The instability was exhausting. It built an intense work ethic and made me highly resilient to career setbacks, showing that struggle is a fast teacher.",
        "emotion_tags": ["finance", "bankruptcy", "family", "resilience"]
    },
    {
        "category": "Financial Struggles",
        "title": "The stress of being laid off with only two weeks of savings",
        "content": "When my company closed down, I had almost no emergency fund. I faced the immediate threat of eviction. The terror of not being able to afford rent was intense. I cut all spending, did freelance tasks, and secured a new role just in time. It was a wake-up call to prioritize building a six-month emergency fund.",
        "emotion_tags": ["finance", "layoffs", "anxiety", "lessons"]
    },
    {
        "category": "Financial Struggles",
        "title": "Losing my savings to a bad investment scheme",
        "content": "I fell for the hype of high-risk crypto trading and lost $10k of my savings. I felt incredibly stupid. It was a severe financial setback. After a week of self-blame, I accepted the loss as a costly lesson in market realities. I committed to a disciplined index fund strategy, learning to avoid speculative shortcuts.",
        "emotion_tags": ["finance", "loss", "mistake", "lessons"]
    },
    {
        "category": "Financial Struggles",
        "title": "Struggling to pay medical bills after an uninsured accident",
        "content": "I had a minor medical emergency while between jobs and uninsured, resulting in a $8k bill. The debt collector calls caused me constant anxiety. I negotiated a monthly payment plan and worked extra hours. It taught me that health insurance is a non-negotiable safety net, and financial stability requires preparing for health crises.",
        "emotion_tags": ["finance", "medical", "anxiety", "struggle"]
    },
    {
        "category": "Financial Struggles",
        "title": "Living paycheck to paycheck in an expensive city",
        "content": "I moved to an expensive tech hub for my career, but high rent and living costs left me with zero savings at the end of every month. I felt stuck on a treadmill. I made the choice to move to a lower-cost area and work remotely. The reduction in expenses allowed me to save, showing that geographic relocation is a powerful tool.",
        "emotion_tags": ["finance", "rent", "career", "choices"]
    },

    # ─── 9. IMPOSTER SYNDROME ─────────────────────────────────────────────
    {
        "category": "Imposter Syndrome",
        "title": "Feeling like a fraud during my first week at FAANG",
        "content": "I landed a software engineering role at a top tech company, but I was surrounded by PhDs and competitive coders. I felt like the interview loop was a mistake and I would be exposed as a fraud. It took me six months to realize that everyone is asking questions and figuring things out, and my contribution is valid.",
        "emotion_tags": ["imposter", "anxiety", "workplace", "confidence"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "Imposter syndrome as a first-generation college student",
        "content": "I was the first in my family to attend university, and I felt out of place among students from wealthy backgrounds. I feared speaking in class. I found a supportive mentor who helped me realize that my unique perspective was an asset, not a deficiency, helping me build academic confidence and complete my degree.",
        "emotion_tags": ["imposter", "academic", "self doubt", "growth"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "The fear of being exposed after my promotion to Lead Engineer",
        "content": "When I was promoted to lead a team of senior developers, I felt unqualified to direct people who had more experience than me. I was working extra hours to check every detail. I realized that leadership is not about having all the answers, but about unblocking others and facilitating collaboration.",
        "emotion_tags": ["imposter", "promotion", "leadership", "lessons"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "Imposter syndrome in a graduate research lab",
        "content": "My advisor asked deep questions during lab reviews, and I constantly felt unintelligent. I felt like my admission was an oversight. I realized that research is about working at the boundaries of what is known, and not knowing is the starting point of discovery, helping me separate my intelligence from my mistakes.",
        "emotion_tags": ["imposter", "research", "self doubt", "lessons"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "Feeling unqualified for a coding bootcamp teaching role",
        "content": "When I started teaching web development, I was terrified that students would ask questions I couldn't answer. I felt like a fraud. I learned to say, 'I don't know the answer to that, let's look at the documentation and find out together.' This transparency built trust and made me a better instructor.",
        "emotion_tags": ["imposter", "teaching", "anxiety", "growth"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "The anxiety of public speaking as a tech conference speaker",
        "content": "I was invited to speak at a conference, but looking at the other speakers' profiles made me feel unqualified. I wanted to cancel my slot. I decided to focus my presentation on my actual project failures and lessons. The audience appreciated the authenticity, teaching me that vulnerability is more valuable than perfection.",
        "emotion_tags": ["imposter", "speaking", "anxiety", "confidence"]
    },
    {
        "category": "Imposter Syndrome",
        "title": "Imposter syndrome as a self-taught software developer",
        "content": "Having no computer science degree, I always feared whiteboard interviews and felt inferior to university graduates. I spent years overcompensating by reading textbooks. Eventually, I realized that my practical code output and system design capacity mattered more than academic credentials, helping me overcome my imposter feelings.",
        "emotion_tags": ["imposter", "development", "self doubt", "confidence"]
    },

    # ─── 10. PERSONAL GROWTH ──────────────────────────────────────────────
    {
        "category": "Personal Growth",
        "title": "Learning to say no to my boss changed my life",
        "content": "I was a chronic people-pleaser who accepted every task, resulting in 12-hour workdays. I was exhausted and resentful. I finally set a boundary and told my manager I couldn't accept a new project without dropping an existing one. To my surprise, they agreed immediately. Setting limits earned me respect and restored my work-life balance.",
        "emotion_tags": ["growth", "boundaries", "workplace", "lessons"]
    },
    {
        "category": "Personal Growth",
        "title": "Spending a year traveling solo in a foreign country",
        "content": "I left my comfortable hometown to travel alone in Asia for a year. Being in places where I didn't speak the language forced me to develop self-reliance and navigate unexpected challenges. I returned with a global perspective, a calm demeanor, and the knowledge that I can handle unfamiliar situations.",
        "emotion_tags": ["growth", "travel", "independence", "lessons"]
    },
    {
        "category": "Personal Growth",
        "title": "Rebuilding my physical health after years of neglect",
        "content": "I was overweight, inactive, and constantly tired due to corporate desk habits. I committed to a small daily habit: walking 15 minutes every morning. Slowly, I improved my nutrition and started strength training. Losing 40 pounds was a benefit, but the true growth was building discipline and showing up for myself daily.",
        "emotion_tags": ["growth", "health", "discipline", "habits"]
    },
    {
        "category": "Personal Growth",
        "title": "Learning mindfulness to control my reactive temper",
        "content": "I used to react with anger whenever projects went wrong or people disagreed with me, which strained my team dynamics. I started practicing daily meditation and learning to pause before speaking. This practice changed my interactions, allowing me to lead with calm and empathy rather than emotional reactivity.",
        "emotion_tags": ["growth", "mindfulness", "empathy", "lessons"]
    },
    {
        "category": "Personal Growth",
        "title": "Admitting I was wrong and apologizing to my sibling",
        "content": "After a major argument, my sibling and I didn't speak for two years. I held onto my pride. I realized that keeping the grudge was hurting me. I reached out, admitted my mistake, and apologized. Making peace helped me realize that relationships are far more important than winning arguments, facilitating personal maturity.",
        "emotion_tags": ["growth", "family", "conflict", "healing"]
    },
    {
        "category": "Personal Growth",
        "title": "Failing a major project but taking full responsibility",
        "content": "When a deployment I managed caused an outage, my instinct was to blame a third-party API. Instead, I wrote a post-mortem taking full ownership of the lack of fail-safes. My manager appreciated the honesty, and we built better redundancy. Taking responsibility was key to my professional growth.",
        "emotion_tags": ["growth", "responsibility", "failure", "lessons"]
    },
    {
        "category": "Personal Growth",
        "title": "Learning a new language at 30 broadened my empathy",
        "content": "Struggling to speak a new language made me feel incompetent and self-conscious about my accent. It taught me patience and deep empathy for non-native speakers in my country. Connecting with people in their native tongue changed my worldview, proving that learning is a lifelong path.",
        "emotion_tags": ["growth", "language", "empathy", "lessons"]
    },

    # ─── 11. SELF CONFIDENCE ──────────────────────────────────────────────
    {
        "category": "Self Confidence",
        "title": "How public speaking training cured my severe stutter",
        "content": "I had a severe stutter that made me avoid speaking in group settings, which limited my career. I joined a public speaking club. The initial meetings were terrifying, but practicing in a supportive environment helped me manage my speech anxiety. Gaining my voice transformed my career and self-belief.",
        "emotion_tags": ["confidence", "speaking", "anxiety", "resilience"]
    },
    {
        "category": "Self Confidence",
        "title": "Standing up to a workplace bully who stole my credit",
        "content": "A senior colleague was consistently presenting my analysis slides as their own. I felt intimidated because of their status. I decided to present my work directly to our director during a review. The colleague backed down, and I was recognized. It taught me that standing up for my work is essential for professional respect.",
        "emotion_tags": ["confidence", "bullying", "workplace", "growth"]
    },
    {
        "category": "Self Confidence",
        "title": "Accepting my physical appearance after years of body dysmorphia",
        "content": "I spent years avoiding photos and feeling highly self-conscious about my appearance. I shifted my focus from aesthetics to physical capability by taking up weightlifting. Feeling my body grow stronger helped me build a healthy self-image, showing that confidence comes from action and strength, not validation.",
        "emotion_tags": ["confidence", "body image", "health", "growth"]
    },
    {
        "category": "Self Confidence",
        "title": "Rebuilding confidence after a performance review failure",
        "content": "I received a 'needs improvement' review that left me feeling incompetent and wanting to resign. I resolved to work on the feedback methodically. I set weekly goals with my manager, addressed my technical gaps, and was promoted the next cycle. This turnaround showed me that feedback is a guide, not a final judgment.",
        "emotion_tags": ["confidence", "failure", "career", "resilience"]
    },
    {
        "category": "Self Confidence",
        "title": "Asking for a 30% raise based on my market value",
        "content": "I felt underpaid but was terrified of asking for a raise, fearing I would appear greedy. I spent weeks preparing data on my contributions and market rates. I presented it to my manager, and the raise was approved. This success helped me realize my value and advocate for myself.",
        "emotion_tags": ["confidence", "finance", "negotiation", "lessons"]
    },
    {
        "category": "Self Confidence",
        "title": "Leaving my comfortable hometown to start fresh in New York",
        "content": "Moving to a city where I had no network was a major risk. The initial weeks were filled with loneliness and doubt. I stepped out of my comfort zone, attended local meetups, and built a new life. Conquering that transition gave me a deep confidence that I can adapt anywhere.",
        "emotion_tags": ["confidence", "relocation", "loneliness", "growth"]
    },
    {
        "category": "Self Confidence",
        "title": "Learning to pitch my startup idea to skeptical investors",
        "content": "My initial pitches were rejected by investors, which left me feeling unqualified. I refined my presentation, focused on our unit economics, and practiced my delivery. We secured funding on our tenth try. This process taught me to handle rejection with poise, which is essential for leadership.",
        "emotion_tags": ["confidence", "pitching", "startup", "resilience"]
    },

    # ─── 12. ANXIETY ──────────────────────────────────────────────────────
    {
        "category": "Anxiety",
        "title": "Managing chronic social anxiety at networking events",
        "content": "Attending industry events used to cause me intense physical anxiety, including sweating and panic. I would stand in the corner and leave early. I started using a grounding technique: focusing on three things I could see, hear, and touch. Making just one meaningful connection per event helped me manage my anxiety.",
        "emotion_tags": ["anxiety", "social", "panic", "lessons"]
    },
    {
        "category": "Anxiety",
        "title": "Having a panic attack during a critical code presentation",
        "content": "During a review with our engineering director, I had a sudden panic attack and couldn't breathe. I had to excuse myself and step out. It was highly embarrassing. I returned, finished the presentation, and began working on breathing techniques. I learned that showing vulnerability is acceptable, and pacing my breathing is essential.",
        "emotion_tags": ["anxiety", "presentation", "panic", "health"]
    },
    {
        "category": "Anxiety",
        "title": "The constant dread of layoffs making me paranoid",
        "content": "When our company announced restructuring, I spent weeks in constant anxiety, expecting a layoff email every morning. It ruined my focus. I resolved this by updating my resume, polishing my portfolio, and realizing that I could handle a transition. Pushing through the worry helped me focus on what I could control.",
        "emotion_tags": ["anxiety", "layoffs", "mindfulness", "career"]
    },
    {
        "category": "Anxiety",
        "title": "Anxiety about my health after a minor symptom google search",
        "content": "Searching a minor symptom online led me to a spiral of health anxiety and panic. I was convinced I was seriously ill. I visited a doctor, who confirmed I was healthy and advised me to stop self-diagnosing. I learned to manage my digital habits and seek professional care rather than searching online.",
        "emotion_tags": ["anxiety", "health", "panic", "habits"]
    },
    {
        "category": "Anxiety",
        "title": "Overcoming severe flight anxiety to visit my family",
        "content": "Severe flight anxiety kept me from traveling for years. To visit my family, I had to confront it. I used breathing exercises, listened to calming audio, and focused on the destination during turbulence. Arriving safely helped me realize that fear is a feeling, not a fact.",
        "emotion_tags": ["anxiety", "phobia", "travel", "resilience"]
    },
    {
        "category": "Anxiety",
        "title": "Anxiety of returning to office after two years remote",
        "content": "Transitioning back to the office caused me severe social and environmental anxiety after two years of isolation. I worked with my manager on a hybrid schedule. Taking it step-by-step allowed me to adapt to the office environment without feeling overwhelmed, restoring my routine.",
        "emotion_tags": ["anxiety", "office", "social", "growth"]
    },
    {
        "category": "Anxiety",
        "title": "Performance anxiety before a major piano recital",
        "content": "Before my performance, my hands were shaking and I feared I would forget the notes. I focused my mind on the phrasing of the music rather than the presence of the audience. Playing through the initial nerves was difficult, but finishing the piece taught me that action overrides anxiety.",
        "emotion_tags": ["anxiety", "performance", "music", "resilience"]
    },

    # ─── 13. RESILIENCE ───────────────────────────────────────────────────
    {
        "category": "Resilience",
        "title": "Rebuilding my house and life after a devastating fire",
        "content": "A house fire destroyed all my material possessions, leaving me with only a backpack. The loss was overwhelming. With community support, I started over. This crisis helped me realize that material things are replaceable, and my emotional strength and relationships are my true foundation.",
        "emotion_tags": ["resilience", "crisis", "loss", "growth"]
    },
    {
        "category": "Resilience",
        "title": "Running my first marathon after knee reconstructive surgery",
        "content": "After a major injury, doctors told me I might not run again. I spent two years in physical therapy, dealing with pain and setbacks. Crossing the finish line of my first marathon was an emotional victory. It showed me that physical recovery requires intense mental resilience.",
        "emotion_tags": ["resilience", "recovery", "injury", "motivation"]
    },
    {
        "category": "Resilience",
        "title": "Keeping my startup alive during a market recession",
        "content": "When clients cut their budgets, our revenue dropped by 50%. We had to reduce our salaries and pivot to consulting. It was an exhausting period of survival. We managed to keep the company afloat, and the lean operations we built helped us double our profits when the market recovered.",
        "emotion_tags": ["resilience", "recession", "startup", "career"]
    },
    {
        "category": "Resilience",
        "title": "Rebounding after my academic paper was rejected four times",
        "content": "I spent a year on research, only to have my paper rejected by multiple journals. I wanted to abandon the project. I chose to address the reviewer feedback methodically, ran new tests, and resubmitted. The paper was accepted by a top journal, showing that persistence is essential for academic progress.",
        "emotion_tags": ["resilience", "rejection", "academic", "lessons"]
    },
    {
        "category": "Resilience",
        "title": "Caring for a sick parent while working full-time",
        "content": "Managing my corporate job while helping my father through cancer treatment was exhausting. I was constantly tired and emotionally drained. I learned to ask for help, delegate tasks, and prioritize self-care. My father recovered, and the experience built a deep emotional resilience in me.",
        "emotion_tags": ["resilience", "family", "illness", "lessons"]
    },
    {
        "category": "Resilience",
        "title": "Continuing my job search after 200 consecutive rejections",
        "content": "I spent six months applying to software roles, facing constant rejections. I felt like my skills were worthless. I decided to build a unique side project and share it on LinkedIn. An engineering manager saw it, bypassed the recruiters, and hired me. Persistence in building proved to be the key.",
        "emotion_tags": ["resilience", "rejection", "job search", "career"]
    },
    {
        "category": "Resilience",
        "title": "Recovering my life after a major depression diagnosis",
        "content": "A depression diagnosis left me feeling hopeless and unable to work. I had to step away from my career. Through therapy, medication, and building small daily routines, I slowly recovered. Returning to work was difficult, but the journey showed me the strength of my mental health management.",
        "emotion_tags": ["resilience", "depression", "health", "healing"]
    },

    # ─── 14. MOTIVATION ───────────────────────────────────────────────────
    {
        "category": "Motivation",
        "title": "Finding the drive to write my novel after 10 years of procrastination",
        "content": "I wanted to write a book for a decade but never got past the first chapter, blaming a lack of time. I decided to write 500 words every morning before checking my phone. This consistency helped me complete my first draft in six months, showing that daily discipline overrides creative inspiration.",
        "emotion_tags": ["motivation", "writing", "discipline", "habits"]
    },
    {
        "category": "Motivation",
        "title": "My post-breakup workout journey that changed my lifestyle",
        "content": "After a painful breakup, I felt lost and inactive. I decided to channel my sadness into physical training, starting a structured gym routine. Tracking my strength gains gave me a new focus. Gaining physical fitness helped me rebuild my mental clarity and confidence, changing my lifestyle.",
        "emotion_tags": ["motivation", "fitness", "heartbreak", "discipline"]
    },
    {
        "category": "Motivation",
        "title": "Leaving a comfortable job to build my own consulting agency",
        "content": "I spent five years in a stable role, but I felt stagnant. I wanted independence. I resigned and worked 12-hour days to secure my first three clients. The initial risk was terrifying, but the growth of my agency has been incredibly rewarding, showing that security can delay necessary expansion.",
        "emotion_tags": ["motivation", "startup", "career", "independence"]
    },
    {
        "category": "Motivation",
        "title": "Going back to college at 45 to get my degree",
        "content": "I was self-conscious about being the oldest student in my classes, fearing I wouldn't adapt to academic requirements. I built study groups and committed to my schedule. Graduating with honors was an emotional milestone, showing that education is accessible at any stage of life.",
        "emotion_tags": ["motivation", "education", "age", "growth"]
    },
    {
        "category": "Motivation",
        "title": "Learning to play the violin in my late twenties",
        "content": "Starting a difficult instrument as an adult was humbling, including weeks of squeaky sounds. I practiced 20 minutes daily. Playing my first clean melody was incredibly satisfying. It taught me that adult learning requires embracing the beginner phase with patience, helping me apply the same mindset to my career.",
        "emotion_tags": ["motivation", "music", "hobbies", "lessons"]
    },
    {
        "category": "Motivation",
        "title": "Studying for a cloud certification while working night shifts",
        "content": "Managing my IT helpdesk night shifts while studying for a cloud certification was exhausting. I read documentation during my breaks. Clearing the exam allowed me to pivot into a cloud engineering role, showing that focused study is a direct path to career acceleration.",
        "emotion_tags": ["motivation", "study", "career", "growth"]
    },
    {
        "category": "Motivation",
        "title": "Designing a fitness app to help people build daily habits",
        "content": "I wanted to build a tool that makes habit tracking simple and accessible. I spent months coding the MVP and launched it on the App Store. Hearing from users who achieved their health goals kept me motivated, showing that building value for others is the ultimate driver.",
        "emotion_tags": ["motivation", "development", "habits", "lessons"]
    },

    # ─── 15. LIFE LESSONS ─────────────────────────────────────────────────
    {
        "category": "Life Lessons",
        "title": "The day I realized my career is not my identity",
        "content": "When I was laid off from a senior role, I felt like my identity had been erased. I was lost without my title. This empty feeling forced me to reevaluate my life. I reconnected with family, took up hobbies, and realized that work is what I do, not who I am, leading to a balanced life.",
        "emotion_tags": ["lessons", "identity", "layoffs", "growth"]
    },
    {
        "category": "Life Lessons",
        "title": "What working in a hospice taught me about regret",
        "content": "As a volunteer, I sat with patients during their final weeks. None of them talked about their corporate titles or bank balances; they talked about relationships and missed opportunities with family. This experience changed my priorities. I reduced my work hours to prioritize presence with the people I love.",
        "emotion_tags": ["lessons", "values", "relationships", "choices"]
    },
    {
        "category": "Life Lessons",
        "title": "Material possessions don't bring lasting happiness",
        "content": "I worked hard to purchase my dream luxury car, expecting it to bring me fulfillment. The initial excitement faded in a month, leaving me with high insurance bills. I realized that experiences and relationships are the true sources of joy. I sold the car, simplified my life, and redirected my funds.",
        "emotion_tags": ["lessons", "simplicity", "finance", "growth"]
    },
    {
        "category": "Life Lessons",
        "title": "The importance of active listening in relationships",
        "content": "I used to listen to my partner only to formulate my rebuttal, which led to constant arguments. I decided to practice active listening: pausing, summarizing their point, and acknowledging their feelings. This simple adjustment resolved our communication issues and saved our relationship, proving that attention is key.",
        "emotion_tags": ["lessons", "communication", "relationships", "empathy"]
    },
    {
        "category": "Life Lessons",
        "title": "Success is a journey of small daily habits, not a single leap",
        "content": "I used to wait for major breakthroughs, neglecting my daily routines. I failed to make progress. I shifted to focusing on small daily inputs: writing 300 words, reading 10 pages, and walking daily. These small habits compounded over time, showing that consistency is the foundation of progress.",
        "emotion_tags": ["lessons", "habits", "consistency", "growth"]
    },
    {
        "category": "Life Lessons",
        "title": "Learning to forgive someone who never said sorry",
        "content": "Holding onto anger toward a former business partner was exhausting. I was waiting for an apology that never came. I chose to forgive them silently to release my own resentment. This forgiveness freed my mind, helping me focus on my new projects and proving that peace is internal.",
        "emotion_tags": ["lessons", "forgiveness", "anger", "healing"]
    },
    {
        "category": "Life Lessons",
        "title": "Comparing yourself to others is a thief of joy",
        "content": "Comparing my career to my peers' social media posts caused me constant self-doubt. I deactivated my accounts for a month and focused on my own projects. The reduction in anxiety was immediate. I learned to measure my progress against my own history, not others' highlights.",
        "emotion_tags": ["lessons", "social media", "anxiety", "growth"]
    },

    # ─── 16. JOB LOSS ─────────────────────────────────────────────────────
    {
        "category": "Job Loss",
        "title": "Getting laid off in the middle of a global tech recession",
        "content": "I was notified of my layoff during a brief HR video call, and my system access was locked immediately. I felt completely hollow and discarded after three years of dedication. I spent two weeks resting and processing the shock. I restructured my portfolio, applied to roles, and landed a better position at a stable company.",
        "emotion_tags": ["layoffs", "job loss", "recession", "resilience"]
    },
    {
        "category": "Job Loss",
        "title": "Fired from my job for a mistake I didn't mean to make",
        "content": "A deployment mistake I made caused a database outage, and I was fired the next day. I felt intense shame and questioned my abilities as a developer. Later, I realized that their blame culture was highly toxic and lacked safety protocols. I joined a firm that values collaborative post-mortems, restoring my confidence.",
        "emotion_tags": ["job loss", "mistake", "shame", "growth"]
    },
    {
        "category": "Job Loss",
        "title": "The devastation of losing my job of 15 years due to automation",
        "content": "My administrative role was automated, leaving me unemployed at 40. I felt too old to learn new systems and was terrified of the job market. I enrolled in a data analysis boot camp and practiced SQL. Landing an analyst role showed me that career adaptation is possible at any age.",
        "emotion_tags": ["job loss", "automation", "pivot", "resilience"]
    },
    {
        "category": "Job Loss",
        "title": "Our company went bankrupt and left us without our final paycheck",
        "content": "When our startup ran out of funds, operations closed immediately. We were left without our final month's salary. It was a severe financial hit. I had to take legal action while looking for work. The experience taught me to maintain an emergency fund and prioritize corporate governance checks in my job search.",
        "emotion_tags": ["job loss", "bankruptcy", "finance", "lessons"]
    },
    {
        "category": "Job Loss",
        "title": "Fired after my department got restructured",
        "content": "My manager told me my role was redundant due to a restructuring. I felt rejected and angry. I chose to pivot to independent freelance consulting. Within six months, I secured three clients and doubled my income, realizing that the corporate structure was limiting my potential.",
        "emotion_tags": ["job loss", "restructuring", "independence", "growth"]
    },
    {
        "category": "Job Loss",
        "title": "Losing my job during probation because of performance mismatch",
        "content": "During my three-month probation, the team lead told me my coding style didn't fit their speed. I felt incompetent. I realized that the role required a front-end focus, while my strengths were in backend data systems. I looked for backend roles, landing one where I succeeded.",
        "emotion_tags": ["job loss", "probation", "self doubt", "growth"]
    },
    {
        "category": "Job Loss",
        "title": "Laid off right before my stock options vested",
        "content": "I was laid off two weeks before a major portion of my options vested, which felt like corporate greed. I was furious and wanted to pursue legal action. I chose to let go of the anger, focus on my next step, and join a worker-friendly cooperative where employee equity is respected, finding peace.",
        "emotion_tags": ["job loss", "layoffs", "equity", "healing"]
    }
]

def seed_db():
    db = SessionLocal()
    try:
        print("--- Step 1: Cleaning existing experiences from database and vector collections ---")
        
        # 1. Clear database experiences
        db.query(Experience).delete()
        db.commit()
        print("Deleted existing experiences from SQL database.")
        
        # 2. Reset vector database collections to avoid remnants or leaks
        try:
            vector_service.client.delete_collection("experiences")
            vector_service.client.delete_collection("recommendations")
            print("Deleted old ChromaDB collections.")
        except Exception as ce:
            print(f"ChromaDB delete collections warning: {ce}")
            
        vector_service.experiences_col = vector_service.client.get_or_create_collection(
            name="experiences",
            metadata={"hnsw:space": "cosine"}
        )
        vector_service.recommendations_col = vector_service.client.get_or_create_collection(
            name="recommendations",
            metadata={"hnsw:space": "cosine"}
        )
        print("Re-created clean ChromaDB collections.")

        print("\n--- Step 2: Ensuring seed user exists ---")
        seed_user = db.query(User).filter(User.email == "contributor@veilory.com").first()
        if not seed_user:
            seed_user = User(
                name="Veilory Contributor",
                email="contributor@veilory.com",
                password_hash="pbkdf2:sha256:mock_hash_here_not_needed_for_seed",
                tier="free",
                interests=["resilience", "growth", "career", "lessons"]
            )
            db.add(seed_user)
            db.commit()
            db.refresh(seed_user)
            print("Created new seed user: contributor@veilory.com")
        else:
            print("Found existing seed user: contributor@veilory.com")

        print("\n--- Step 3: Seeding 112 unique experiences ---")
        now = datetime.now(timezone.utc)
        
        for idx, item in enumerate(RAW_DATA, 1):
            # Generate a realistic timestamp over the last 12 months
            days_ago = random.randint(1, 365)
            created_at = now - timedelta(days=days_ago)
            
            experience = Experience(
                user_id=seed_user.id,
                title=item["title"],
                content=item["content"],
                emotion_tags=item["emotion_tags"],
                privacy=PrivacyLevel.PUBLIC,
                created_at=created_at,
                updated_at=created_at,
                views_count=random.randint(10, 150),
                helpful_count=random.randint(2, 35)
            )
            db.add(experience)
            db.commit()
            db.refresh(experience)
            
            # Analyze using local AI service
            emotions = emotion_service.detect_emotions(experience.title, experience.content)
            experience.primary_emotion = emotions["primary"]
            experience.secondary_emotions = emotions["secondary"]
            experience.emotion_confidence = emotions["confidence"]
            
            # Extract AI wisdom reflection panels
            wisdom = wisdom_service.generate_wisdom(
                title=experience.title,
                content=experience.content,
                primary_emotion=emotions["primary"],
                secondary_emotions=emotions["secondary"]
            )
            
            # Populate generated fields
            experience.main_theme = wisdom["main_theme"]
            experience.theme_confidence = wisdom["theme_confidence"]
            experience.why_matters = wisdom["why_matters"]
            experience.short_summary = wisdom["short_summary"]
            experience.medium_summary = wisdom["medium_summary"]
            experience.key_lesson = wisdom["key_lesson"]
            experience.lessons_learned = wisdom["lessons_learned"]
            experience.emotion_initial = wisdom["emotion_initial"]
            experience.emotion_catalyst = wisdom["emotion_catalyst"]
            experience.emotion_outcome = wisdom["emotion_outcome"]
            
            # Index in ChromaDB
            doc_id = vector_service.index_experience(
                experience_id=experience.id,
                title=experience.title,
                content=experience.content,
                primary_emotion=emotions["primary"],
                secondary_emotions=emotions["secondary"]
            )
            experience.embedding_reference_id = doc_id
            
            db.commit()
            print(f"[{idx}/112] Seeded and Indexed: '{experience.title[:40]}...' (Theme: {experience.main_theme})")
            
        print("\n--- Seeding Completed Successfully! ---")
        print(f"Total seeded records: {db.query(Experience).count()}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
