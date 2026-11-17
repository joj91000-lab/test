import React, { useState } from 'react';
import { NewsSource } from '../types/news';
import { ExternalLink, Rss, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface SourcesDirectoryProps {
  sources: NewsSource[];
  articleCountsBySource: Record<string, number>;
  onSelectSource: (sourceId: string) => void;
}

export const SourcesDirectory: React.FC<SourcesDirectoryProps> = ({
  sources,
  articleCountsBySource,
  onSelectSource
}) => {
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  const handleCopyFeed = (feedUrl: string) => {
    navigator.clipboard?.writeText(feedUrl);
    setCopiedFeed(feedUrl);
    setTimeout(() => setCopiedFeed(null), 2000);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-stone-200 pb-5 mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>官方認證 RSS / ATOM 訂閱源 · 美國十大科技媒體矩陣</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            美國十大核心科技媒體專區
          </h2>
          <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
            本站透過高頻率 XML 輪詢與智慧去重叢集機制，自動整合這 10 家指標科技刊物的原創報導，包含矽谷新創動向、半導體先進製程、前瞻 AI 論文、科技反壟斷裁決與消費硬體深度評測。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map(source => {
            const count = articleCountsBySource[source.id] || 0;
            const isCopied = copiedFeed === source.feedUrl;

            return (
              <div
                key={source.id}
                className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: source.color }}
                      />
                      <div>
                        <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-blue-700 transition-colors">
                          {source.nameZh || source.name}
                        </h3>
                        <a
                          href={`https://${source.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 font-mono"
                        >
                          <span>{source.domain}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {count} 篇報導
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
                    {source.descriptionZh || source.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => handleCopyFeed(source.feedUrl)}
                    className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 py-1 px-2 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                    title="複製 RSS 連結"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">已複製 Feed</span>
                      </>
                    ) : (
                      <>
                        <Rss className="w-3.5 h-3.5 text-amber-600" />
                        <span>複製 RSS 網址</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectSource(source.id)}
                    className="inline-flex items-center gap-1 text-stone-900 font-semibold hover:text-blue-700 cursor-pointer"
                  >
                    <span>開啟分頁專屬列表</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
