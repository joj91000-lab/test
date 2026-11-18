import { NewsItem, NewsComment } from '../types/news';

export const INITIAL_COMMENTS: NewsComment[] = [
  {
    id: 'c1',
    newsId: 'lead-1',
    author: 'Alex Chen',
    avatarBg: '#0284c7',
    content: 'The architectural shift here is huge. If latency drops below 80ms for reasoning tokens, mobile agent frameworks suddenly become viable offline.',
    createdAt: '22m ago',
    timestamp: Date.now() - 22 * 60 * 1000,
    upvotes: 14
  },
  {
    id: 'c2',
    newsId: 'lead-1',
    author: 'Sarah Jenkins',
    avatarBg: '#e11d48',
    content: 'Very curious how Apple’s private cloud compute handles the load balancing compared to AWS Bedrock. Ars Technica’s breakdown highlighted memory bandwidth constraints.',
    createdAt: '15m ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    upvotes: 9
  },
  {
    id: 'c3',
    newsId: 'lead-1',
    author: 'David Wu',
    avatarBg: '#059669',
    content: 'Open-weights developers are already reverse-engineering the quantization technique. Exciting week for local AI.',
    createdAt: '8m ago',
    timestamp: Date.now() - 8 * 60 * 1000,
    upvotes: 5
  },
  {
    id: 'c4',
    newsId: 'lead-2',
    author: 'Elena Rostova',
    avatarBg: '#7c3aed',
    content: 'Antitrust regulators are finally looking at default app bundling rather than just gross store margins. The Verge nailed the legal nuance.',
    createdAt: '40m ago',
    timestamp: Date.now() - 40 * 60 * 1000,
    upvotes: 12
  },
  {
    id: 'c5',
    newsId: 'lead-3',
    author: 'Markus Weber',
    avatarBg: '#d97706',
    content: 'TSMC’s 2nm test run wafer yield exceeding expectations is the biggest hardware headline this quarter. NVIDIA and AMD will fight for capacity.',
    createdAt: '1h ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    upvotes: 18
  }
];

export const SEED_NEWS: NewsItem[] = [
  {
    id: 'lead-1',
    title: 'OpenAI Unveils Next-Gen Reasoning Architecture with 10x Inference Efficiency and Native Tool Autonomy',
    link: 'https://techcrunch.com',
    sourceId: 'techcrunch',
    sourceName: 'TechCrunch',
    sourceDomain: 'techcrunch.com',
    pubDate: 'Mon, 26 Oct 2026 09:15:00 GMT',
    timestamp: Date.now() - 18 * 60 * 1000,
    timeAgo: '18m ago',
    summary: 'The new model series introduces speculative tree-search pruning directly at the token generation layer, allowing multi-step verification without multiplicative latency overhead. Early enterprise benchmarks demonstrate a 64% reduction in hallucinations on structured data synthesis and autonomous API orchestration.',
    contentSnippet: 'In an unexpected Monday announcement, the research team detailed how architectural breakthroughs in attention caching and continuous test-time compute allow reasoning models to scale down onto consumer-grade workstations while matching cluster-level verification scores.',
    category: 'AI',
    author: 'Kyle Wiggers',
    likesCount: 142,
    isLiked: false,
    commentsCount: 28,
    isLeadStory: true,
    relatedStories: [
      {
        title: 'Ars Technica breaks down the mathematical foundations of low-overhead recursive verification',
        link: 'https://arstechnica.com',
        sourceName: 'Ars Technica',
        sourceDomain: 'arstechnica.com',
        timeAgo: '14m ago'
      },
      {
        title: 'The Verge tests early developer previews: "It feels noticeably less robotic on complex coding tasks"',
        link: 'https://theverge.com',
        sourceName: 'The Verge',
        sourceDomain: 'theverge.com',
        timeAgo: '11m ago'
      },
      {
        title: 'WIRED: Why the race for test-time compute is replacing parameter count as Silicon Valley’s primary metric',
        link: 'https://wired.com',
        sourceName: 'WIRED',
        sourceDomain: 'wired.com',
        timeAgo: '8m ago'
      },
      {
        title: 'VentureBeat: Enterprise CTOs weigh cloud egress costs against internal fine-tuning requirements',
        link: 'https://venturebeat.com',
        sourceName: 'VentureBeat',
        sourceDomain: 'venturebeat.com',
        timeAgo: '5m ago'
      }
    ],
    discussions: [
      {
        platform: 'HackerNews',
        author: 'tptacek',
        snippet: 'The fascinating aspect isn’t raw MMLU scores, but how cache quantization handles state branching without ballooning VRAM footprint.',
        url: 'https://news.ycombinator.com',
        commentsCount: 312
      },
      {
        platform: 'X/Twitter',
        author: 'karpathy',
        handle: '@karpathy',
        snippet: 'Thinking tokens are officially the new compilation step. The paradigm shift is happening much faster than expected.',
        url: 'https://x.com'
      }
    ]
  },
  {
    id: 'lead-2',
    title: 'Department of Justice Wins Landmark Ruling on Mobile Ecosystem Defaults, Mandating Choice Screens',
    link: 'https://theverge.com',
    sourceId: 'theverge',
    sourceName: 'The Verge',
    sourceDomain: 'theverge.com',
    pubDate: 'Mon, 26 Oct 2026 08:30:00 GMT',
    timestamp: Date.now() - 45 * 60 * 1000,
    timeAgo: '45m ago',
    summary: 'A federal judge has ruled that exclusive multi-billion-dollar default search and browser agreements suppress competitive market entry. Platforms will be required to offer unbiased setup screens across North American devices starting next spring.',
    contentSnippet: 'The sweeping 280-page decision marks the most consequential antitrust ruling in tech since the Microsoft browser cases of the late 1990s. Both Google and Apple signaled immediate appeals.',
    category: 'Policy',
    author: 'Nilay Patel',
    likesCount: 96,
    isLiked: false,
    commentsCount: 42,
    isLeadStory: true,
    relatedStories: [
      {
        title: 'WIRED explores the economic fallout: Could search revenue-sharing shifts reshape iOS hardware pricing?',
        link: 'https://wired.com',
        sourceName: 'WIRED',
        sourceDomain: 'wired.com',
        timeAgo: '38m ago'
      },
      {
        title: 'Ars Technica analyzes the legal remedy phase and why compliance timelines may stretch into 2027',
        link: 'https://arstechnica.com',
        sourceName: 'Ars Technica',
        sourceDomain: 'arstechnica.com',
        timeAgo: '29m ago'
      },
      {
        title: 'ZDNET: Enterprise IT administrators prepare for device management profile updates under new policy guidelines',
        link: 'https://zdnet.com',
        sourceName: 'ZDNET',
        sourceDomain: 'zdnet.com',
        timeAgo: '16m ago'
      }
    ],
    discussions: [
      {
        platform: 'HackerNews',
        author: 'dang',
        snippet: 'Discussion on regulatory precedents and potential impact on third-party browser rendering engines.',
        url: 'https://news.ycombinator.com',
        commentsCount: 450
      }
    ]
  },
  {
    id: 'lead-3',
    title: 'TSMC Announces 2nm Pilot Yields Surpassing 68%, Accelerating Commercial Delivery for 2027 Flagships',
    link: 'https://arstechnica.com',
    sourceId: 'arstechnica',
    sourceName: 'Ars Technica',
    sourceDomain: 'arstechnica.com',
    pubDate: 'Mon, 26 Oct 2026 07:45:00 GMT',
    timestamp: Date.now() - 75 * 60 * 1000,
    timeAgo: '1h ago',
    summary: 'Nanosheet GAA transistor structures exhibit notable energy reduction curves. Both Apple and NVIDIA have reportedly booked over 80% of initial foundry capacity for next-generation silicon packages.',
    contentSnippet: 'Fab 20 in Hsinchu achieved milestone metric stability, paving the way for backside power delivery network integration ahead of original fab roadmap milestones.',
    category: 'Hardware',
    author: 'Samuel Axon',
    likesCount: 88,
    isLiked: false,
    commentsCount: 19,
    relatedStories: [
      {
        title: '9to5Mac: What TSMC’s GAA milestone means for Apple’s upcoming M6 and A20 Pro SoC roadmaps',
        link: 'https://9to5mac.com',
        sourceName: '9to5Mac',
        sourceDomain: '9to5mac.com',
        timeAgo: '50m ago'
      },
      {
        title: 'Engadget: How nanosheet transistors solve thermal throttling in ultra-thin folding devices',
        link: 'https://engadget.com',
        sourceName: 'Engadget',
        sourceDomain: 'engadget.com',
        timeAgo: '32m ago'
      }
    ]
  },
  {
    id: 'news-4',
    title: 'Apple Previews macOS Sequoia Feature Drop: Full On-Device Xcode Compilation and Universal Control 2',
    link: 'https://9to5mac.com',
    sourceId: '9to5mac',
    sourceName: '9to5Mac',
    sourceDomain: '9to5mac.com',
    pubDate: 'Mon, 26 Oct 2026 06:20:00 GMT',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    timeAgo: '2h ago',
    summary: 'The update introduces seamless tablet-to-desktop compile offloading and an overhauled neural engine debugger capable of profiling CoreML weights in real-time.',
    category: 'Mobile',
    author: 'Chance Miller',
    likesCount: 64,
    isLiked: false,
    commentsCount: 15,
    relatedStories: [
      {
        title: 'The Verge hands-on with Universal Control 2: Dragging live audio streams across devices without lag',
        link: 'https://theverge.com',
        sourceName: 'The Verge',
        sourceDomain: 'theverge.com',
        timeAgo: '1h ago'
      }
    ]
  },
  {
    id: 'news-5',
    title: 'MIT Tech Review: New Solid-State Battery Architecture Achieves 800 Wh/kg in Continuous Laboratory Cycling',
    link: 'https://technologyreview.com',
    sourceId: 'mittech',
    sourceName: 'MIT Tech Review',
    sourceDomain: 'technologyreview.com',
    pubDate: 'Mon, 26 Oct 2026 05:10:00 GMT',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    timeAgo: '3h ago',
    summary: 'Researchers utilize self-healing composite polymer electrolytes that eliminate lithium dendrite formation under rapid 10-minute fast charging conditions.',
    category: 'Science & Emerging' as any,
    author: 'Casey Crownhart',
    likesCount: 112,
    isLiked: false,
    commentsCount: 23,
    relatedStories: [
      {
        title: 'WIRED: Inside the race to scale solid-state chemistry out of cleanrooms into gigafactories',
        link: 'https://wired.com',
        sourceName: 'WIRED',
        sourceDomain: 'wired.com',
        timeAgo: '2h ago'
      }
    ]
  },
  {
    id: 'news-6',
    title: 'VentureBeat: Enterprise AI Spend Surpasses $140B as Autonomous Workflow Agents Replace Single-Turn Chatbots',
    link: 'https://venturebeat.com',
    sourceId: 'venturebeat',
    sourceName: 'VentureBeat',
    sourceDomain: 'venturebeat.com',
    pubDate: 'Mon, 26 Oct 2026 04:00:00 GMT',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    timeAgo: '4h ago',
    summary: 'A new survey of Fortune 500 engineering leaders reveals that multi-agent orchestration frameworks have seen a 340% increase in production deployment since Q1.',
    category: 'AI',
    author: 'Michael Nuñez',
    likesCount: 53,
    isLiked: false,
    commentsCount: 11
  },
  {
    id: 'news-7',
    title: 'ZDNET: Critical Zero-Day in Cloud Hypervisor Virtualization Layer Patched Across Global Data Centers',
    link: 'https://zdnet.com',
    sourceId: 'zdnet',
    sourceName: 'ZDNET',
    sourceDomain: 'zdnet.com',
    pubDate: 'Mon, 26 Oct 2026 03:30:00 GMT',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    timeAgo: '5h ago',
    summary: 'Security advisories from AWS, Microsoft Azure, and Google Cloud confirm coordinated live live-patching without VM restarts, mitigating speculative side-channel leaks.',
    category: 'Cybersecurity',
    author: 'Liam Tung',
    likesCount: 77,
    isLiked: false,
    commentsCount: 14
  },
  {
    id: 'news-8',
    title: 'Gizmodo: The Retro-Futurist Mechanical Keyboards Driving Silicon Valley Ergonomics Obsession',
    link: 'https://gizmodo.com',
    sourceId: 'gizmodo',
    sourceName: 'Gizmodo',
    sourceDomain: 'gizmodo.com',
    pubDate: 'Mon, 26 Oct 2026 02:15:00 GMT',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    timeAgo: '6h ago',
    summary: 'Custom split Ortholinear keyboards with hall-effect magnetic switches and tactile haptic thumb clusters have transformed programmer workstations into design showcases.',
    category: 'Hardware',
    author: 'Phillip Tracy',
    likesCount: 45,
    isLiked: false,
    commentsCount: 8
  },
  {
    id: 'news-9',
    title: 'Engadget: Next-Generation Spatial Computing Headsets Target 350-Gram Weight Threshold with Micro-OLED',
    link: 'https://engadget.com',
    sourceId: 'engadget',
    sourceName: 'Engadget',
    sourceDomain: 'engadget.com',
    pubDate: 'Mon, 26 Oct 2026 01:00:00 GMT',
    timestamp: Date.now() - 7 * 60 * 60 * 1000,
    timeAgo: '7h ago',
    summary: 'By offloading battery packs and compute tethering to pocket pucks, hardware makers hope to unlock comfortable all-day wear for immersive engineering modeling.',
    category: 'Hardware',
    author: 'Devindra Hardawar',
    likesCount: 68,
    isLiked: false,
    commentsCount: 16
  },
  {
    id: 'news-10',
    title: 'TechCrunch: Y Combinator Fall Cohort Sees 70% of Seed Startups Building for Autonomous Physical Robotics',
    link: 'https://techcrunch.com',
    sourceId: 'techcrunch',
    sourceName: 'TechCrunch',
    sourceDomain: 'techcrunch.com',
    pubDate: 'Sun, 25 Oct 2026 23:45:00 GMT',
    timestamp: Date.now() - 9 * 60 * 60 * 1000,
    timeAgo: '9h ago',
    summary: 'From warehouse humanoid teleoperation to robotic precision agriculture, venture investors are pouring record capital into embodied intelligence hardware platforms.',
    category: 'Startups',
    author: 'Alex Wilhelm',
    likesCount: 82,
    isLiked: false,
    commentsCount: 21
  }
];
