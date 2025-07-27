'use client';

import React, { useState } from 'react';
import HardwareSearch from '@/components/HardwareSearch';
import ConfigurationResult from '@/components/ConfigurationResult';
import { useHardware } from '@/contexts/HardwareContext';

export default function TestPage() {
  const { selectHardware } = useHardware();
  const [showConfigResult, setShowConfigResult] = useState(false);

  const handleSearchSelect = (item: any) => {
    const category = item.category as any;
    selectHardware(category, {
      id: item._id,
      name: item.name,
      brand: item.brand,
      model: item.model,
      price: item.price,
      stock: item.stock,
      image: item.image,
      specs: item.specs,
      model3D: item.model3D
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">功能测试页面</h1>
        
        <div className="space-y-8">
          {/* 搜索测试 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">智能搜索测试</h2>
            <HardwareSearch 
              onSelect={handleSearchSelect}
              placeholder="测试搜索功能..."
            />
          </div>

          {/* 配置确认测试 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">配置确认测试</h2>
            <button
              onClick={() => setShowConfigResult(true)}
              className="px-6 py-3 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors"
            >
              打开配置确认
            </button>
          </div>
        </div>

        {/* 配置结果弹窗 */}
        {showConfigResult && (
          <ConfigurationResult onClose={() => setShowConfigResult(false)} />
        )}
      </div>
    </div>
  );
} 