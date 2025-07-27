'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHardware } from '@/contexts/HardwareContext';
import { apiService, HardwareSearchParams } from '@/services/api';
import { HardwareCategory } from '@/types/hardware';

interface HardwareSelectorAPIProps {
  category: HardwareCategory;
  title: string;
  icon: string;
}

interface HardwareItem {
  _id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  specs: any;
  model3D: any;
  platform: any;
}

export default function HardwareSelectorAPI({ category, title, icon }: HardwareSelectorAPIProps) {
  const { state, selectHardware, removeHardware } = useHardware();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentItem = state.config[category];

  // 加载硬件数据
  const loadHardware = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getHardwareByCategory(category, 1, 50);
      
      if (response.hardware) {
        setItems(response.hardware);
      } else {
        setError('没有找到硬件数据');
      }
    } catch (err) {
      setError('加载硬件数据失败');
      console.error('加载硬件数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 当组件挂载或类别改变时加载数据
  useEffect(() => {
    if (isOpen && items.length === 0) {
      loadHardware();
    }
  }, [isOpen, category]);

  const handleSelect = (item: HardwareItem) => {
    // 转换为前端格式
    const hardwareItem = {
      id: item._id,
      name: item.name,
      brand: item.brand,
      model: item.model,
      price: item.price,
      originalPrice: item.originalPrice,
      stock: item.stock,
      image: item.image,
      specs: item.specs,
      model3D: item.model3D
    };
    
    selectHardware(category, hardwareItem);
    setIsOpen(false);
  };

  const handleRemove = () => {
    removeHardware(category);
  };

  const getCurrentItemName = () => {
    if (!currentItem) return null;

    if (Array.isArray(currentItem)) {
      if (currentItem.length === 0) return null;
      return `${currentItem.length}个 ${title}`;
    }

    return currentItem.name;
  };

  const getPriceDisplay = (price: number, originalPrice?: number) => {
    if (originalPrice && originalPrice > price) {
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-cyan-400 font-medium">¥{price.toLocaleString()}</span>
          <span className="text-xs text-gray-500 line-through">¥{originalPrice.toLocaleString()}</span>
          <span className="text-xs text-red-400">-{discount}%</span>
        </div>
      );
    }
    return <span className="text-sm text-cyan-400 font-medium">¥{price.toLocaleString()}</span>;
  };

  const getSpecsDisplay = (item: HardwareItem) => {
    const { specs } = item;
    
    switch (category) {
      case 'cpu':
        return specs.cores ? `${specs.cores}核${specs.threads || specs.cores}线程` : '';
      case 'gpu':
        return specs.gpuMemory ? `${specs.gpuMemory}GB ${specs.gpuMemoryType || ''}` : '';
      case 'ram':
        return specs.ramCapacity ? `${specs.ramCapacity}GB ${specs.speed || ''}MHz` : '';
      case 'storage':
        return specs.storageCapacity ? `${specs.storageCapacity}GB ${specs.type || ''}` : '';
      case 'psu':
        return specs.wattage ? `${specs.wattage}W ${specs.efficiency || ''}` : '';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      <motion.div
        className="card cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center">
              <span className="text-cyan-400 text-lg">{icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              {currentItem ? (
                <p className="text-xs text-gray-400">{getCurrentItemName()}</p>
              ) : (
                <p className="text-xs text-gray-500">未选择</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentItem && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-red-400 hover:text-red-300 text-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              加载中...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              <div className="mb-2">⚠️</div>
              {error}
              <button
                onClick={loadHardware}
                className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                重试
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              暂无数据
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item._id}
                className="p-3 hover:bg-gray-800 cursor-pointer border-b border-border last:border-b-0"
                onClick={() => handleSelect(item)}
                whileHover={{ backgroundColor: 'rgba(0, 255, 179, 0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.brand} {item.model}</div>
                    {getSpecsDisplay(item) && (
                      <div className="text-xs text-gray-500 mt-1">{getSpecsDisplay(item)}</div>
                    )}
                  </div>
                  <div className="text-right">
                    {getPriceDisplay(item.price, item.originalPrice)}
                    {item.stock > 0 ? (
                      <div className="text-xs text-green-400 mt-1">有库存</div>
                    ) : (
                      <div className="text-xs text-red-400 mt-1">缺货</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

export function HardwareSelectorAPIGrid() {
  const selectors = [
    { category: 'cpu' as HardwareCategory, title: '处理器', icon: '🔧' },
    { category: 'motherboard' as HardwareCategory, title: '主板', icon: '📋' },
    { category: 'gpu' as HardwareCategory, title: '显卡', icon: '🎮' },
    { category: 'ram' as HardwareCategory, title: '内存', icon: '💾' },
    { category: 'storage' as HardwareCategory, title: '存储', icon: '💿' },
    { category: 'psu' as HardwareCategory, title: '电源', icon: '⚡' },
    { category: 'cooler' as HardwareCategory, title: '散热器', icon: '❄️' },
    { category: 'case' as HardwareCategory, title: '机箱', icon: '🏠' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {selectors.map((selector) => (
        <HardwareSelectorAPI
          key={selector.category}
          category={selector.category}
          title={selector.title}
          icon={selector.icon}
        />
      ))}
    </div>
  );
} 