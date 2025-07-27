'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHardware } from '@/contexts/HardwareContext';
import { PRESET_HARDWARE, HardwareCategory, HardwareItem } from '@/types/hardware';

interface HardwareSelectorProps {
  category: HardwareCategory;
  title: string;
  icon: string;
}

export default function HardwareSelector({ category, title, icon }: HardwareSelectorProps) {
  const { state, selectHardware, removeHardware } = useHardware();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentItem = state.config[category];
  const availableItems = PRESET_HARDWARE[category];

  const handleSelect = (item: HardwareItem) => {
    selectHardware(category, item);
    setIsOpen(false);
  };

  const handleRemove = () => {
    removeHardware(category);
  };

  // 获取当前选择的显示名称
  const getCurrentItemName = () => {
    if (!currentItem) return null;
    
    if (Array.isArray(currentItem)) {
      if (currentItem.length === 0) return null;
      return `${currentItem.length}个 ${title}`;
    }
    
    return currentItem.name;
  };

  return (
    <div className="relative">
      {/* 当前选择显示 */}
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

      {/* 下拉选项 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card-bg border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {availableItems.map((item) => (
            <motion.div
              key={item.id}
              className="p-3 hover:bg-gray-800 cursor-pointer border-b border-border last:border-b-0"
              onClick={() => handleSelect(item)}
              whileHover={{ backgroundColor: 'rgba(0, 255, 179, 0.1)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.brand} {item.model}</div>
                </div>
                <div className="text-sm text-cyan-400 font-medium">
                  ¥{item.price.toLocaleString()}
                </div>
              </div>
              
              {/* 规格信息 */}
              <div className="mt-2 text-xs text-gray-500">
                {category === 'cpu' && item.specs.cores && (
                  <span>{item.specs.cores}核{item.specs.threads}线程</span>
                )}
                {category === 'gpu' && item.specs.gpuMemory && (
                  <span>{item.specs.gpuMemory}GB {item.specs.memoryType}</span>
                )}
                {category === 'ram' && item.specs.ramCapacity && (
                  <span>{item.specs.ramCapacity}GB {item.specs.speed}MHz</span>
                )}
                {category === 'storage' && item.specs.storageCapacity && (
                  <span>{item.specs.storageCapacity}GB {item.specs.type}</span>
                )}
                {category === 'psu' && item.specs.wattage && (
                  <span>{item.specs.wattage}W {item.specs.efficiency}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// 硬件选择器网格
export function HardwareSelectorGrid() {
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
        <HardwareSelector
          key={selector.category}
          category={selector.category}
          title={selector.title}
          icon={selector.icon}
        />
      ))}
    </div>
  );
} 