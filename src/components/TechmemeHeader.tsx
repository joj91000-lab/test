import React from 'react';
import { TOP_10_SOURCES } from '../data/sources';

interface TechmemeHeaderProps {
  lastUpdated: string;
  selectedSource: string;
  onSelectSource: (sourceId: string) => void;
}

export const TechmemeHeader: React.FC<TechmemeHeaderProps> = ({
  selectedSource,
  onSelectSource
}) => {
  const todayFormatted = new Intl.DateTimeFormat('zh-TW', {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="bg-[#fcfbf9] border-b border-stone-200 pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頂部日期與發行資訊 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/80 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-stone-800 font-medium">{todayFormatted}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-stone-500">全天候即時 RSS 聚合</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-600 font-medium">美國十大頂尖科技媒體連線</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span>雙語對照 · 標題與摘要附中文翻譯</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>即時按讚與深度評論交流</span>
          </div>
        </div>

        {/* 報頭標題與敘述 */}
        <div className="py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                科技頭條即時情報 · TechPulse 雙語聚合
              </h1>
              <p className="text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
                自動索引 TechCrunch、The Verge、WIRED 等美國十大權威科技媒體之公開 RSS 摘要，提供英文原文與繁體中文導讀對照，點擊標題即可直達原文出處。
              </p>
            </div>
          </div>
        </div>

        {/* 10 大媒體快捷切換標籤列 */}
        <div className="pt-3 border-t border-stone-200/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-stone-400 font-medium whitespace-nowrap shrink-0 pr-1">
            媒體切換：
          </span>
          <button
            onClick={() => onSelectSource('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedSource === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            全部媒體
          </button>
          {TOP_10_SOURCES.map(source => {
            const isSelected = selectedSource === source.id;
            return (
              <button
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span>{source.nameZh ? source.nameZh.split(' ')[0] : source.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TechPulseHeader = TechmemeHeader;
