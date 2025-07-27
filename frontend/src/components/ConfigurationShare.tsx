'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHardware } from '@/contexts/HardwareContext';
import { apiService } from '@/services/api';

interface ConfigurationShareProps {
  onClose: () => void;
}

export default function ConfigurationShare({ onClose }: ConfigurationShareProps) {
  const { state } = useHardware();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const selectedItems = Object.entries(state.config)
    .filter(([_, item]) => item)
    .map(([category, item]) => {
      if (Array.isArray(item)) {
        return item.map(subItem => ({
          category,
          hardwareId: subItem.id,
          name: subItem.name,
          brand: subItem.brand,
          model: subItem.model,
          price: subItem.price,
          specs: subItem.specs
        }));
      } else {
        return [{
          category,
          hardwareId: item.id,
          name: item.name,
          brand: item.brand,
          model: item.model,
          price: item.price,
          specs: item.specs
        }];
      }
    })
    .flat();

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入配置名称');
      return;
    }

    if (selectedItems.length === 0) {
      alert('请先选择硬件');
      return;
    }

    setIsSaving(true);
    try {
      const result = await apiService.saveConfiguration({
        name: name.trim(),
        description: description.trim(),
        items: selectedItems,
        isPublic
      });
      
      if (result.success && result.data) {
        const shareId = result.data.shareId;
        const shareUrl = `${window.location.origin}/config/${shareId}`;
        setShareUrl(shareUrl);
      } else {
        alert('保存失败: ' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('分享链接已复制到剪贴板');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card-bg rounded-lg p-6 w-full max-w-2xl mx-4 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">保存配置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* 配置信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              配置名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：游戏主机配置"
              className="w-full px-4 py-3 bg-black/30 border border-border rounded-lg text-white placeholder-gray-400 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              配置描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个配置的用途和特点..."
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-border rounded-lg text-white placeholder-gray-400 focus:border-accent focus:outline-none resize-none"
            />
          </div>

          {/* 隐私设置 */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-accent bg-black/30 border-border rounded focus:ring-accent focus:ring-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-300">
              设为公开配置（可分享给他人）
            </label>
          </div>

          {/* 配置概览 */}
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">配置概览</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">硬件数量</span>
                <span className="text-white">{selectedItems.length} 个</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">总价格</span>
                <span className="text-accent font-bold">¥{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">兼容性</span>
                <span className={state.isCompatible ? 'text-green-400' : 'text-red-400'}>
                  {state.isCompatible ? '✓ 兼容' : '✗ 不兼容'}
                </span>
              </div>
            </div>

            {/* 硬件列表 */}
            {selectedItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-300">已选硬件</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-white">¥{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 分享链接 */}
          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <h3 className="text-green-400 font-medium mb-2">配置保存成功！</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-black/30 border border-green-500/30 rounded text-white text-sm"
                />
                <button
                  onClick={copyShareUrl}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded transition-colors"
                >
                  复制
                </button>
              </div>
            </motion.div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-card-bg border border-border text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || selectedItems.length === 0}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 