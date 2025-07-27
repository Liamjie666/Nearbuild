'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HardwareSearch from './HardwareSearch';
import { useHardware } from '@/contexts/HardwareContext';
import { apiService } from '@/services/api';

interface ConfigContentProps {
  onSearchSelect: (item: any) => void;
  onConfirmConfig: () => void;
  onShareConfig: () => void;
}

export default function ConfigContent({ onSearchSelect, onConfirmConfig, onShareConfig }: ConfigContentProps) {
  const { state, removeHardware } = useHardware();
  const [activeTab, setActiveTab] = useState<'search' | 'config'>('search');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  // 简单处理硬件配置
  const selectedHardware = Object.entries(state.config)
    .filter(([_, item]) => item)
    .flatMap(([category, item]) => {
      if (Array.isArray(item)) {
        return item.map(subItem => ({ ...subItem, category }));
      } else {
        return [{ ...item, category }];
      }
    });

  const totalPrice = selectedHardware.reduce((sum, item) => sum + (item?.price || 0), 0);

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      cpu: '处理器',
      gpu: '显卡',
      motherboard: '主板',
      ram: '内存',
      storage: '存储',
      psu: '电源',
      case: '机箱',
      cooler: '散热器'
    };
    return names[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      cpu: '🔲',
      gpu: '🎮',
      motherboard: '🔌',
      ram: '📱',
      storage: '💾',
      psu: '⚡',
      case: '🖥️',
      cooler: '❄️'
    };
    return icons[category] || '🔧';
  };

  // 一键下单到淘宝
  const handleOrderToTaobao = async () => {
    setIsOrdering(true);
    setOrderMessage('正在添加到淘宝购物车...');
    
    try {
      const result = await apiService.orderToTaobao(selectedHardware);
      
      if (result.success && result.cartUrl) {
        window.open(result.cartUrl, '_blank');
        setOrderMessage('✅ 已添加到淘宝购物车！');
      } else {
        setOrderMessage('❌ ' + (result.message || '淘宝下单失败'));
      }
    } catch (error) {
      console.error('淘宝下单失败:', error);
      setOrderMessage('❌ 淘宝下单失败，请重试');
    } finally {
      setIsOrdering(false);
    }
  };

  // 一键下单到京东
  const handleOrderToJD = async () => {
    setIsOrdering(true);
    setOrderMessage('正在添加到京东购物车...');
    
    try {
      const result = await apiService.orderToJD(selectedHardware);
      
      if (result.success && result.cartUrl) {
        window.open(result.cartUrl, '_blank');
        setOrderMessage('✅ 已添加到京东购物车！');
      } else {
        setOrderMessage('❌ ' + (result.message || '京东下单失败'));
      }
    } catch (error) {
      console.error('京东下单失败:', error);
      setOrderMessage('❌ 京东下单失败，请重试');
    } finally {
      setIsOrdering(false);
    }
  };

  // 一键下单到所有平台
  const handleOrderToAll = async () => {
    setIsOrdering(true);
    setOrderMessage('正在添加到购物车...');
    
    try {
      const result = await apiService.orderToAllPlatforms(selectedHardware);
      
      if (result.success && result.cartUrl) {
        window.open(result.cartUrl, '_blank');
        setOrderMessage('✅ 已添加到购物车！');
      } else {
        setOrderMessage('❌ ' + (result.message || '下单失败'));
      }
    } catch (error) {
      console.error('下单失败:', error);
      setOrderMessage('❌ 下单失败，请重试');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">硬件配置</h1>
        <p className="text-gray-400">选择你的硬件组件，构建完美配置</p>
      </motion.div>

      {/* 标签页 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-accent text-black'
              : 'bg-card-bg text-gray-400 hover:text-white'
          }`}
        >
          搜索硬件
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-accent text-black'
              : 'bg-card-bg text-gray-400 hover:text-white'
          }`}
        >
          我的配置 ({selectedHardware.length})
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'search' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full overflow-y-auto"
          >
            <HardwareSearch onSelect={onSearchSelect} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full overflow-y-auto"
          >
            {/* 配置概览 */}
            <div className="bg-card-bg rounded-lg p-6 mb-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">配置概览</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">
                    ¥{totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    共 {selectedHardware.length} 个组件
                  </div>
                </div>
              </div>

              {selectedHardware.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🖥️</div>
                  <p className="text-gray-400 mb-4">还没有选择任何硬件</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                  >
                    开始选择硬件
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHardware.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black/30 rounded-lg p-4 border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                          <div className="flex-1">
                            <h3 className="font-medium text-white line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {item.brand} {item.model}
                            </p>
                            <p className="text-accent font-bold">
                              ¥{item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeHardware(item.category)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 订单状态消息 */}
            {orderMessage && (
              <div className="mb-4 p-3 rounded-lg text-center text-sm">
                {orderMessage}
              </div>
            )}

            {/* 操作按钮 */}
            {selectedHardware.length > 0 && (
              <div className="space-y-4">
                {/* 一键下单按钮 */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleOrderToTaobao}
                    disabled={isOrdering}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {isOrdering ? '🔄' : '🛒'} 淘宝下单
                  </button>
                  <button
                    onClick={handleOrderToJD}
                    disabled={isOrdering}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {isOrdering ? '🔄' : '🛒'} 京东下单
                  </button>
                  <button
                    onClick={handleOrderToAll}
                    disabled={isOrdering}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded-lg transition-colors"
                  >
                    {isOrdering ? '🔄' : '🛒'} 一键下单
                  </button>
                </div>

                {/* 其他操作按钮 */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-8 py-3 bg-card-bg border border-border text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    继续选择
                  </button>
                  <button
                    onClick={onShareConfig}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    导出配置
                  </button>
                  <button
                    onClick={onConfirmConfig}
                    className="px-8 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors"
                  >
                    确认配置
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 