'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHardware } from '@/contexts/HardwareContext';
import { 
  checkCompatibility, 
  predictBenchmarks, 
  getCompatibilityColor, 
  getBenchmarkGrade,
  type CompatibilityResult,
  type BenchmarkResult
} from '@/services/compatibility';
import { ExcelExportService, ExcelExportData } from '@/services/excelExport';

interface ConfigurationResultProps {
  onClose: () => void;
}

export default function ConfigurationResult({ onClose }: ConfigurationResultProps) {
  const { state } = useHardware();
  const [showDetails, setShowDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 转换配置格式
  const userConfig = {
    cpu: state.config.cpu,
    motherboard: state.config.motherboard,
    gpu: state.config.gpu,
    ram: Array.isArray(state.config.ram) ? state.config.ram : state.config.ram ? [state.config.ram] : [],
    storage: Array.isArray(state.config.storage) ? state.config.storage : state.config.storage ? [state.config.storage] : [],
    psu: state.config.psu,
    case: state.config.case,
    cooler: state.config.cooler
  };

  // 检查兼容性
  const compatibilityResult: CompatibilityResult = checkCompatibility(userConfig);
  
  // 预测跑分
  const benchmarkResult: BenchmarkResult = predictBenchmarks(userConfig);

  // 计算总价
  const totalPrice = Object.values(state.config).reduce((total, item) => {
    if (Array.isArray(item)) {
      return total + item.reduce((sum, i) => sum + (i?.price || 0), 0);
    }
    return total + (item?.price || 0);
  }, 0);

  const getComponentDisplay = (item: any, category: string) => {
    if (!item) return null;
    
    if (Array.isArray(item)) {
      return item.map((i, index) => (
        <div key={index} className="text-sm text-gray-300">
          {i.name} - ¥{i.price?.toLocaleString()}
        </div>
      ));
    }
    
    return (
      <div className="text-sm text-gray-300">
        {item.name} - ¥{item.price?.toLocaleString()}
      </div>
    );
  };

  const getBenchmarkDisplay = (score: number | undefined, label: string) => {
    if (!score) return null;
    
    const { grade, color } = getBenchmarkGrade(score);
    
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-cyan-400">{score.toLocaleString()}</span>
          <span className={`text-xs font-bold ${color}`}>{grade}</span>
        </div>
      </div>
    );
  };

  // 导出Excel配置单
  const handleExportExcel = async () => {
    setIsExporting(true);
    
    try {
      // 准备导出数据
      const exportData: ExcelExportData = {
        configName: `PC配置_${new Date().toISOString().split('T')[0]}`,
        totalPrice,
        items: Object.entries(state.config)
          .filter(([_, item]) => item)
          .flatMap(([category, item]) => {
            if (Array.isArray(item)) {
              return item.map(subItem => ({ ...subItem, category }));
            } else {
              return [{ ...item, category }];
            }
          }),
        performance: {
          gamingScore: benchmarkResult.totalScore || 0,
          productivityScore: benchmarkResult.cpuScore || 0,
          valueScore: benchmarkResult.gpuScore || 0
        },
        compatibility: {
          isCompatible: compatibilityResult.isCompatible,
          conflicts: compatibilityResult.conflicts,
          warnings: compatibilityResult.warnings
        }
      };

      await ExcelExportService.generateExcel(exportData);
      alert('✅ Excel配置单已生成并下载！');
    } catch (error) {
      console.error('导出Excel失败:', error);
      alert('❌ 导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-card-bg border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">配置确认</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* 总价 */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg text-gray-300">总价</span>
            <span className="text-2xl font-bold text-cyan-400">¥{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6">
          {/* 兼容性状态 */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-lg font-semibold text-white">兼容性检查</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                compatibilityResult.isCompatible && compatibilityResult.conflicts.length === 0
                  ? 'bg-green-500/20 text-green-400'
                  : compatibilityResult.conflicts.length > 0
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {compatibilityResult.isCompatible && compatibilityResult.conflicts.length === 0
                  ? '完全兼容'
                  : compatibilityResult.conflicts.length > 0
                  ? '存在冲突'
                  : '部分兼容'}
              </span>
            </div>

            {/* 缺失组件 */}
            {compatibilityResult.missingComponents.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-yellow-400 mb-2">缺失组件</h4>
                <div className="flex flex-wrap gap-2">
                  {compatibilityResult.missingComponents.map((component, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                      {component}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 冲突警告 */}
            {compatibilityResult.conflicts.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-red-400 mb-2">兼容性冲突</h4>
                <div className="space-y-1">
                  {compatibilityResult.conflicts.map((conflict, index) => (
                    <div key={index} className="text-sm text-red-400">• {conflict}</div>
                  ))}
                </div>
              </div>
            )}

            {/* 警告 */}
            {compatibilityResult.warnings.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-yellow-400 mb-2">注意事项</h4>
                <div className="space-y-1">
                  {compatibilityResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-400">• {warning}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 跑分结果 */}
          {(benchmarkResult.hasCpu || benchmarkResult.hasGpu) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">性能预测</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 基础跑分 */}
                <div className="space-y-2">
                  {getBenchmarkDisplay(benchmarkResult.cpuScore, 'CPU 分数')}
                  {getBenchmarkDisplay(benchmarkResult.gpuScore, 'GPU 分数')}
                  {getBenchmarkDisplay(benchmarkResult.totalScore, '总分')}
                </div>

                {/* 3DMark 跑分 */}
                <div className="space-y-2">
                  {getBenchmarkDisplay(benchmarkResult.timeSpyScore, '3DMark TimeSpy')}
                  {getBenchmarkDisplay(benchmarkResult.fireStrikeScore, '3DMark FireStrike')}
                  {getBenchmarkDisplay(benchmarkResult.portRoyalScore, '3DMark PortRoyal')}
                </div>
              </div>

              {/* 游戏帧率预测 */}
              {Object.keys(benchmarkResult.estimatedFps).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">游戏帧率预测</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(benchmarkResult.estimatedFps).map(([game, fps]) => (
                      <div key={game} className="flex justify-between text-sm">
                        <span className="text-gray-400">{game}</span>
                        <span className="text-cyan-400 font-medium">{fps} FPS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 详细配置 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">详细配置</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {showDetails ? '收起' : '展开'}
              </button>
            </div>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                {Object.entries(userConfig).map(([category, item]) => {
                  if (!item || (Array.isArray(item) && item.length === 0)) return null;
                  
                  return (
                    <div key={category} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-sm font-medium text-gray-300 mb-1">
                        {getCategoryName(category)}
                      </div>
                      {getComponentDisplay(item, category)}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-6 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50"
            >
              {isExporting ? '🔄 导出中...' : '📊 导出Excel'}
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 transition-colors"
            >
              一键下单
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getCategoryName(category: string): string {
  const names: { [key: string]: string } = {
    cpu: '处理器',
    motherboard: '主板',
    gpu: '显卡',
    ram: '内存',
    storage: '存储',
    psu: '电源',
    case: '机箱',
    cooler: '散热器'
  };
  return names[category] || category;
} 