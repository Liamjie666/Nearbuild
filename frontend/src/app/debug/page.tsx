'use client';

import React from 'react';
import { HardwareProvider } from '@/contexts/HardwareContext';
import HardwareSearch from '@/components/HardwareSearch';
import ConfigurationResult from '@/components/ConfigurationResult';
import { useHardware } from '@/contexts/HardwareContext';

function DebugContent() {
  const { selectHardware } = useHardware();
  const [showConfigResult, setShowConfigResult] = React.useState(false);

  const handleSearchSelect = (item: any) => {
    console.log('Selected item:', item);
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
        <h1 className="text-3xl font-bold mb-8">调试页面</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">搜索组件测试</h2>
            <HardwareSearch 
              onSelect={handleSearchSelect}
              placeholder="测试搜索..."
            />
          </div>

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

        {showConfigResult && (
          <ConfigurationResult onClose={() => setShowConfigResult(false)} />
        )}
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <HardwareProvider>
      <DebugContent />
    </HardwareProvider>
  );
} 