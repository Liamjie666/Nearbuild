'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThreeViewer from '@/components/ThreeViewer';
import { HardwareSelectorAPIGrid } from '@/components/HardwareSelectorAPI';
import HardwareSearch from '@/components/HardwareSearch';
import ConfigurationResult from '@/components/ConfigurationResult';
import ConfigurationShare from '@/components/ConfigurationShare';
import PerformancePredictor from '@/components/PerformancePredictor';
import { useHardware } from '@/contexts/HardwareContext';

export default function Home() {
  const { state, selectHardware } = useHardware();
  const [activeTab, setActiveTab] = useState<'home' | 'config'>('home');
  const [showConfigResult, setShowConfigResult] = useState(false);
  const [showShareConfig, setShowShareConfig] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* 导航栏 */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">NB</span>
            </div>
            <span className="text-xl font-bold neon-glow">NeraBuild</span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <motion.button 
              onClick={() => setActiveTab('home')}
              className={`transition-colors ${activeTab === 'home' ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}
              whileHover={{ scale: 1.05 }}
            >
              首页
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('config')}
              className={`transition-colors ${activeTab === 'config' ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}
              whileHover={{ scale: 1.05 }}
            >
              3D装机
            </motion.button>
          </div>
          
                                <motion.button
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('config')}
                      >
                        开始装机
                      </motion.button>
        </div>
      </motion.nav>

      {/* 主要内容区域 */}
      <div className="flex h-screen pt-16">
        {/* 左侧 3D 视窗 */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <ThreeViewer />
          
          {/* 3D 视窗装饰 */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
            <div className="text-cyan-400 text-sm font-medium">3D 实时渲染</div>
            <div className="text-gray-400 text-xs">60 FPS</div>
          </div>
        </motion.div>

        {/* 右侧内容区域 */}
        <motion.div 
          className="flex-1 flex flex-col px-12 py-8 overflow-y-auto"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
                    {activeTab === 'home' ? (
            <HomeContent onStartConfig={() => setActiveTab('config')} />
          ) : (
                                    <ConfigContent
                          onSearchSelect={(item) => {
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
                          }}
                          onConfirmConfig={() => setShowConfigResult(true)}
                          onShareConfig={() => setShowShareConfig(true)}
                        />
          )}
        </motion.div>
      </div>

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

                        {/* 配置结果弹窗 */}
                  {showConfigResult && (
                    <ConfigurationResult onClose={() => setShowConfigResult(false)} />
                  )}

                  {/* 配置分享弹窗 */}
                  {showShareConfig && (
                    <ConfigurationShare onClose={() => setShowShareConfig(false)} />
                  )}
    </div>
  );
}

// 首页内容
interface HomeContentProps {
  onStartConfig: () => void;
}

function HomeContent({ onStartConfig }: HomeContentProps) {
  return (
    <>
      {/* 主标题 */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h1 className="text-6xl font-bold mb-4 neon-glow">
          黑匣装机
        </h1>
        <p className="text-2xl text-cyan-400 font-medium mb-2">
          All in Black, Build in 3D
        </p>
        <p className="text-gray-400 text-lg">
          专业的3D可视化装机平台，为DIY游戏玩家而生
        </p>
      </motion.div>

      {/* 功能特色 */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="card"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-cyan-400 text-lg">🔧</span>
              </div>
              <h3 className="text-lg font-semibold">全硬件数据库</h3>
            </div>
            <p className="text-gray-400 text-sm">
              覆盖CPU、GPU、主板等全品类硬件，实时价格更新
            </p>
          </motion.div>

          <motion.div 
            className="card"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-cyan-400 text-lg">🎮</span>
              </div>
              <h3 className="text-lg font-semibold">性能模拟器</h3>
            </div>
            <p className="text-gray-400 text-sm">
              基于真实跑分数据，精准预测游戏性能表现
            </p>
          </motion.div>

          <motion.div 
            className="card"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-cyan-400 text-lg">🛒</span>
              </div>
              <h3 className="text-lg font-semibold">一键下单</h3>
            </div>
            <p className="text-gray-400 text-sm">
              生成淘宝+京东购物车链接，保留优惠券逻辑
            </p>
          </motion.div>

          <motion.div 
            className="card"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-cyan-400 text-lg">📊</span>
              </div>
              <h3 className="text-lg font-semibold">冲突检测</h3>
            </div>
            <p className="text-gray-400 text-sm">
              实时检测尺寸、接口、供电冲突，避免装机错误
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 行动按钮 */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <motion.button 
          className="btn btn-primary text-lg px-8 py-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartConfig}
        >
          开始3D装机
        </motion.button>
        <motion.button 
          className="btn text-lg px-8 py-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          查看演示
        </motion.button>
      </motion.div>

      {/* 统计数据 */}
      <motion.div 
        className="mt-12 grid grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">10K+</div>
          <div className="text-gray-400 text-sm">成功装机</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
          <div className="text-gray-400 text-sm">硬件SKU</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">99%</div>
          <div className="text-gray-400 text-sm">准确率</div>
        </div>
      </motion.div>
    </>
  );
}

// 配置页面内容
interface ConfigContentProps {
  onSearchSelect: (item: any) => void;
  onConfirmConfig: () => void;
  onShareConfig: () => void;
}

function ConfigContent({ onSearchSelect, onConfirmConfig, onShareConfig }: ConfigContentProps) {
  const { state } = useHardware();
  const { config, totalPrice, isCompatible, conflicts } = state;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-2">3D 装机配置</h2>
        <p className="text-gray-400">选择硬件，实时查看3D模型变化</p>
      </motion.div>

      {/* 智能搜索 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">智能搜索</h3>
                                <HardwareSearch
                        onSelect={onSearchSelect}
                      />
        </div>
      </motion.div>

      {/* 硬件选择器 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <HardwareSelectorAPIGrid />
      </motion.div>

      {/* 配置信息 */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* 总价格 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">总价格</h3>
              <p className="text-gray-400 text-sm">当前配置总价</p>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              ¥{totalPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 兼容性检查 */}
        {!isCompatible && conflicts.length > 0 && (
          <div className="card border-red-500/50 bg-red-500/10">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs">⚠</span>
              </div>
              <h3 className="text-lg font-semibold text-red-400">兼容性警告</h3>
            </div>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <p key={index} className="text-sm text-red-300">
                  • {conflict}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 已选硬件列表 */}
        {Object.keys(config).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">已选硬件</h3>
            <div className="space-y-3">
              {Object.entries(config).map(([category, item]) => {
                if (!item) return null;
                
                if (Array.isArray(item)) {
                  return item.map((subItem, index) => (
                    <div key={`${category}-${index}`} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div>
                        <div className="text-sm font-medium">{subItem.name}</div>
                        <div className="text-xs text-gray-400">{subItem.brand} {subItem.model}</div>
                      </div>
                      <div className="text-sm text-cyan-400">¥{subItem.price.toLocaleString()}</div>
                    </div>
                  ));
                }
                
                return (
                  <div key={category} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.brand} {item.model}</div>
                    </div>
                    <div className="text-sm text-cyan-400">¥{item.price.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex space-x-4"
        >
          <button
            onClick={onShareConfig}
            className="flex-1 btn text-lg py-4"
            disabled={Object.keys(config).length === 0}
          >
            分享配置
          </button>
          <button
            onClick={onConfirmConfig}
            className="flex-1 btn btn-primary text-lg py-4"
            disabled={Object.keys(config).length === 0}
          >
            确认配置
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}


