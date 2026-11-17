export async function onRequestGet() {
  const sources = [
    {
      id: 'techcrunch',
      name: 'TechCrunch',
      nameZh: 'TechCrunch 創投科技',
      domain: 'techcrunch.com',
      color: '#059669',
      accentBg: '#ecfdf5',
      category: 'Startups & VC',
      categoryZh: '創投新創',
      feedUrl: 'https://techcrunch.com/feed/',
      description: 'Silicon Valley startups, venture capital funding, and disruptive AI businesses.',
      descriptionZh: '聚焦矽谷新創獨角獸融資、早期創投基金動態與顛覆性人工智慧商業模式。'
    },
    {
      id: 'theverge',
      name: 'The Verge',
      nameZh: 'The Verge 前沿視野',
      domain: 'theverge.com',
      color: '#e11d48',
      accentBg: '#fff1f2',
      category: 'Consumer Tech',
      categoryZh: '消費電子',
      feedUrl: 'https://www.theverge.com/rss/index.xml',
      description: 'Flagship consumer electronics reviews, mobile devices, and digital lifestyle.',
      descriptionZh: '旗艦消費級電子產品深評、行動硬體生態、數位生活指南與產業分析。'
    },
    {
      id: 'wired',
      name: 'WIRED',
      nameZh: 'WIRED 連線雜誌',
      domain: 'wired.com',
      color: '#1e293b',
      accentBg: '#f8fafc',
      category: 'Culture & Policy',
      categoryZh: '文化政經',
      feedUrl: 'https://www.wired.com/feed/rss',
      description: 'In-depth long-form journalism on technology, privacy policy, and global cyber trends.',
      descriptionZh: '科技倫理、AI 監管政策、地緣政治、資安防護與深度調查專題報導。'
    },
    {
      id: 'arstechnica',
      name: 'Ars Technica',
      nameZh: 'Ars Technica 技術精粹',
      domain: 'arstechnica.com',
      color: '#ea580c',
      accentBg: '#fff7ed',
      category: 'Deep Tech & Science',
      categoryZh: '技術與科學',
      feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
      description: 'Deep technical analysis, semiconductor advances, open source, and space systems.',
      descriptionZh: '深度晶片微架構分析、開源軟體生態、Linux 核心與航太太空科技。'
    },
    {
      id: 'engadget',
      name: 'Engadget',
      nameZh: 'Engadget 癮科技',
      domain: 'engadget.com',
      color: '#2563eb',
      accentBg: '#eff6ff',
      category: 'Gadgets & Audio',
      categoryZh: '新酷潮品',
      feedUrl: 'https://www.engadget.com/rss.xml',
      description: 'Hands-on hardware previews, home audio, automotive EV tech, and entertainment gear.',
      descriptionZh: '最前線硬體動手玩、聲學耳機評測、電動車智駕系統與家庭影音新裝備。'
    },
    {
      id: '9to5mac',
      name: '9to5Mac',
      nameZh: '9to5Mac 蘋果前線',
      domain: '9to5mac.com',
      color: '#475569',
      accentBg: '#f1f5f9',
      category: 'Apple Ecosystem',
      categoryZh: '蘋果生態',
      feedUrl: 'https://9to5mac.com/feed/',
      description: 'Exclusive Apple leaks, iOS/macOS updates, supply chain rumors, and developer tools.',
      descriptionZh: '第一手 Apple 爆料、iOS/macOS 開發者預覽、供應鏈訂單與全新配件解析。'
    },
    {
      id: 'venturebeat',
      name: 'VentureBeat',
      nameZh: 'VentureBeat 人工智慧',
      domain: 'venturebeat.com',
      color: '#0891b2',
      accentBg: '#ecfeff',
      category: 'Enterprise AI',
      categoryZh: '企業級 AI',
      feedUrl: 'https://venturebeat.com/category/ai/feed/',
      description: 'Generative AI transformations, foundational LLMs, and enterprise automation.',
      descriptionZh: '大語言模型架構演進、生成式 AI 企業端落地應用與前沿機器學習算法。'
    },
    {
      id: 'zdnet',
      name: 'ZDNET',
      nameZh: 'ZDNET 企業科技',
      domain: 'zdnet.com',
      color: '#b91c1c',
      accentBg: '#fef2f2',
      category: 'Enterprise IT',
      categoryZh: '企業 IT',
      feedUrl: 'https://www.zdnet.com/news/rss.xml',
      description: 'Practical business technology advice, cloud systems, and IT security.',
      descriptionZh: '商用資訊技術、企業雲端移轉、資安合規與數位轉型實戰指南。'
    },
    {
      id: 'mittech',
      name: 'MIT Tech Review',
      nameZh: 'MIT 科技評論',
      domain: 'technologyreview.com',
      color: '#4338ca',
      accentBg: '#eef2ff',
      category: 'Science & Emerging',
      categoryZh: '前沿科學',
      feedUrl: 'https://www.technologyreview.com/feed/',
      description: 'Authoritative journalism from MIT analyzing breakthrough technologies.',
      descriptionZh: '麻省理工學院主辦，洞察量子運算、固態電池與生醫科技突破。'
    },
    {
      id: 'gizmodo',
      name: 'Gizmodo',
      nameZh: 'Gizmodo 潮流科技',
      domain: 'gizmodo.com',
      color: '#7c3aed',
      accentBg: '#f5f3ff',
      category: 'Consumer & Design',
      categoryZh: '設計潮玩',
      feedUrl: 'https://gizmodo.com/feed',
      description: 'Design, consumer tech, futuristic prototypes, and digital culture.',
      descriptionZh: '工業設計、未來原型產品、極客潮玩與當代網路亞文化。'
    }
  ];

  return new Response(JSON.stringify({ success: true, data: sources }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
