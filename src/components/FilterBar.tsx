import React from 'react';
import { CategoryFilter, SortOption } from '../types/news';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filteredCount: number;
}

const CATEGORIES: { id: CategoryFilter; zh: string }[] = [
  { id: 'All', zh: '全部新聞' },
  { id: 'AI', zh: 'AI 人工智慧' },
  { id: 'Hardware', zh: '晶片與硬體' },
  { id: 'Mobile', zh: '行動生態' },
  { id: 'Big Tech', zh: '科技巨頭' },
  { id: 'Policy', zh: '政策與監管' },
  { id: 'Startups', zh: '創業投資' },
  { id: 'Cybersecurity', zh: '資訊安全' }
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  filteredCount
}) => {
  return (
    <div className="bg-white border-b border-stone-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 分類按鈕 */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {cat.zh}
                </button>
              );
            })}
          </div>

          {/* 搜尋與排序選單 */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* 搜尋框 */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋新聞標題、中譯或關鍵字…"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 排序選單 */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value as SortOption)}
                className="appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer transition-colors"
              >
                <option value="salience">脈動焦點排序 (熱門權重)</option>
                <option value="latest">最新發佈時間</option>
                <option value="most-liked">最多人按讚</option>
                <option value="most-discussed">最多人留言討論</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="hidden lg:block text-xs text-stone-500 font-mono tabular-nums whitespace-nowrap">
              共 {filteredCount} 則報導
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
