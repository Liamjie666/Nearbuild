'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/api';
import { useHardware } from '@/contexts/HardwareContext';

interface HardwareSearchProps {
  onSelect?: (hardware: any) => void;
}

export default function HardwareSearch({ onSelect }: HardwareSearchProps) {
  const { selectHardware } = useHardware();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [platform, setPlatform] = useState<'all' | 'taobao' | 'jd'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(99999);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // 获取硬件分类
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await apiService.getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // 搜索硬件
  const searchHardware = useCallback(async (page: number = 1) => {
    if (!query.trim() && !category) return;

    setLoading(true);
    try {
      const result = await apiService.searchHardware({
        q: query.trim(),
        category,
        platform,
        minPrice,
        maxPrice,
        page,
        limit: pagination.limit,
        liveSearch: true // 启用实时搜索
      });

      if (page === 1) {
        setResults(result.hardware);
      } else {
        setResults(prev => [...prev, ...result.hardware]);
      }
      setPagination(result.pagination);
      
      // 显示数据来源
      if (result.source === 'live') {
        console.log('🔍 实时搜索结果');
      } else {
        console.log('📊 数据库搜索结果');
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  }, [query, category, platform, minPrice, maxPrice, pagination.limit]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || category) {
        searchHardware(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, category, platform, minPrice, maxPrice, searchHardware]);

  // 加载更多
  const loadMore = () => {
    if (pagination.page < pagination.pages && !loading) {
      searchHardware(pagination.page + 1);
    }
  };

  // 选择硬件
  const handleSelect = (hardware: any) => {
    selectHardware(hardware.category, {
      id: hardware._id,
      name: hardware.name,
      brand: hardware.brand,
      model: hardware.model,
      price: hardware.price,
      stock: hardware.stock,
      image: hardware.image,
      specs: hardware.specs,
      model3D: hardware.model3D
    });
    onSelect?.(hardware);
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setCategory('');
    setPlatform('all');
    setMinPrice(0);
    setMaxPrice(99999);
    setResults([]);
    setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 搜索栏 */}
      <div className="bg-card-bg rounded-lg p-6 mb-6 border border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索输入框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索硬件名称、品牌或型号..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-border rounded-lg text-white placeholder-gray-400 focus:border-accent focus:outline-none"
            />
          </div>

          {/* 分类选择 */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-border rounded-lg text-white focus:border-accent focus:outline-none"
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>

          {/* 平台选择 */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
            className="px-4 py-3 bg-black/30 border border-border rounded-lg text-white focus:border-accent focus:outline-none"
          >
            <option value="all">所有平台</option>
            <option value="taobao">淘宝</option>
            <option value="jd">京东</option>
          </select>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
          >
            {showFilters ? '隐藏筛选' : '高级筛选'}
          </button>
        </div>

        {/* 高级筛选 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    最低价格
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/30 border border-border rounded text-white focus:border-accent focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    最高价格
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/30 border border-border rounded text-white focus:border-accent focus:outline-none"
                    placeholder="99999"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 清除按钮 */}
        {(query || category || platform !== 'all' || minPrice > 0 || maxPrice < 99999) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* 搜索结果 */}
      <div className="space-y-4">
        {loading && results.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-400 mt-2">搜索中...</p>
          </div>
        )}

        {!loading && results.length === 0 && (query || category) && (
          <div className="text-center py-8">
            <p className="text-gray-400">未找到相关硬件</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="text-sm text-gray-400">
              找到 {pagination.total} 个结果
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((hardware) => (
                <motion.div
                  key={hardware._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card-bg rounded-lg p-4 border border-border hover:border-accent transition-colors cursor-pointer"
                  onClick={() => handleSelect(hardware)}
                >
                  {/* 硬件图片 */}
                  <div className="aspect-square bg-black/30 rounded-lg mb-3 flex items-center justify-center">
                    {hardware.image ? (
                      <img
                        src={hardware.image}
                        alt={hardware.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-500 text-4xl">🖥️</div>
                    )}
                  </div>

                  {/* 硬件信息 */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-white line-clamp-2">
                      {hardware.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {hardware.brand} {hardware.model}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-accent font-bold">
                        ¥{hardware.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        库存: {hardware.stock}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 加载更多 */}
            {pagination.page < pagination.pages && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 