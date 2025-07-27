'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHardware } from '@/contexts/HardwareContext';

interface GamePerformance {
  game: string;
  fps: number;
  quality: 'Low' | 'Medium' | 'High' | 'Ultra';
  resolution: string;
}

interface PerformanceScore {
  gamingScore: number;
  productivityScore: number;
  valueScore: number;
  details: {
    cpuScore: number;
    gpuScore: number;
    ramScore: number;
    storageScore: number;
  };
}

export default function PerformancePredictor() {
  const { state } = useHardware();
  const [performance, setPerformance] = useState<PerformanceScore | null>(null);
  const [gamePerformance, setGamePerformance] = useState<GamePerformance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(state.config).length > 0) {
      calculatePerformance();
    }
  }, [state.config]);

  const calculatePerformance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/performance/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: state.config
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPerformance(result.data.performance);
        setGamePerformance(result.data.gamePerformance);
      }
    } catch (error) {
      console.error('计算性能失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Ultra': return 'text-green-400';
      case 'High': return 'text-blue-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (Object.keys(state.config).length === 0) {
    return (
      <div className="bg-card-bg rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-white mb-4">性能预测</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-gray-400">请先选择硬件组件以查看性能预测</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">性能预测</h3>
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
            <span className="text-sm text-gray-400">计算中...</span>
          </div>
        )}
      </div>

      {performance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 总体性能分数 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">游戏性能</div>
              <div className={`text-3xl font-bold ${getScoreColor(performance.gamingScore)}`}>
                {performance.gamingScore}
              </div>
              <div className="text-sm text-gray-400">分数</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">生产力</div>
              <div className={`text-3xl font-bold ${getScoreColor(performance.productivityScore)}`}>
                {performance.productivityScore}
              </div>
              <div className="text-sm text-gray-400">分数</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">性价比</div>
              <div className={`text-3xl font-bold ${getScoreColor(performance.valueScore)}`}>
                {performance.valueScore}
              </div>
              <div className="text-sm text-gray-400">分数</div>
            </div>
          </div>

          {/* 详细分数 */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">详细分数</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">CPU</div>
                <div className={`text-xl font-bold ${getScoreColor(performance.details.cpuScore)}`}>
                  {performance.details.cpuScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">GPU</div>
                <div className={`text-xl font-bold ${getScoreColor(performance.details.gpuScore)}`}>
                  {performance.details.gpuScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">内存</div>
                <div className={`text-xl font-bold ${getScoreColor(performance.details.ramScore)}`}>
                  {performance.details.ramScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">存储</div>
                <div className={`text-xl font-bold ${getScoreColor(performance.details.storageScore)}`}>
                  {performance.details.storageScore}
                </div>
              </div>
            </div>
          </div>

          {/* 游戏性能预测 */}
          {gamePerformance.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-4">游戏性能预测</h4>
              <div className="space-y-3">
                {gamePerformance.map((game, index) => (
                  <motion.div
                    key={game.game}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                        <span className="text-accent text-sm">🎮</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{game.game}</div>
                        <div className="text-sm text-gray-400">{game.resolution}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{game.fps} FPS</div>
                      <div className={`text-sm font-medium ${getQualityColor(game.quality)}`}>
                        {game.quality} 画质
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 性能建议 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-400 mb-3">性能建议</h4>
            <div className="space-y-2 text-sm text-gray-300">
              {performance.gamingScore < 60 && (
                <p>• 建议升级显卡以获得更好的游戏体验</p>
              )}
              {performance.productivityScore < 60 && (
                <p>• 建议升级CPU以提高生产力性能</p>
              )}
              {performance.valueScore < 50 && (
                <p>• 当前配置性价比偏低，建议调整预算分配</p>
              )}
              {performance.gamingScore >= 80 && performance.productivityScore >= 80 && (
                <p>• 配置性能优秀，适合游戏和生产力工作</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 