'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserConfig, HardwareItem, HardwareCategory } from '@/types/hardware';
import { checkCompatibility as checkCompatibilityService } from '@/services/compatibility';

// 状态类型
interface HardwareState {
  config: UserConfig;
  totalPrice: number;
  isCompatible: boolean;
  conflicts: string[];
}

// Action 类型
type HardwareAction = 
  | { type: 'SELECT_HARDWARE'; category: HardwareCategory; item: HardwareItem }
  | { type: 'REMOVE_HARDWARE'; category: HardwareCategory }
  | { type: 'CLEAR_CONFIG' }
  | { type: 'CHECK_COMPATIBILITY' };

// 初始状态
const initialState: HardwareState = {
  config: {},
  totalPrice: 0,
  isCompatible: true,
  conflicts: []
};

// Reducer 函数
function hardwareReducer(state: HardwareState, action: HardwareAction): HardwareState {
  switch (action.type) {
    case 'SELECT_HARDWARE': {
      const newConfig = { ...state.config };
      
      if (action.category === 'ram' || action.category === 'storage') {
        // 对于 RAM 和存储，支持多个
        const currentItems = newConfig[action.category] || [];
        newConfig[action.category] = [...currentItems, action.item];
      } else {
        // 对于其他硬件，替换现有选择
        newConfig[action.category] = action.item;
      }
      
      const totalPrice = calculateTotalPrice(newConfig);
      const compatibilityResult = checkCompatibilityService(newConfig);
      
      return {
        ...state,
        config: newConfig,
        totalPrice,
        isCompatible: compatibilityResult.isCompatible,
        conflicts: compatibilityResult.conflicts
      };
    }
    
    case 'REMOVE_HARDWARE': {
      const newConfig = { ...state.config };
      delete newConfig[action.category];
      
      const totalPrice = calculateTotalPrice(newConfig);
      const compatibilityResult = checkCompatibilityService(newConfig);
      
      return {
        ...state,
        config: newConfig,
        totalPrice,
        isCompatible: compatibilityResult.isCompatible,
        conflicts: compatibilityResult.conflicts
      };
    }
    
    case 'CLEAR_CONFIG': {
      return {
        ...initialState
      };
    }
    
    case 'CHECK_COMPATIBILITY': {
      const compatibilityResult = checkCompatibilityService(state.config);
      return {
        ...state,
        isCompatible: compatibilityResult.isCompatible,
        conflicts: compatibilityResult.conflicts
      };
    }
    
    default:
      return state;
  }
}

// 计算总价格
function calculateTotalPrice(config: UserConfig): number {
  let total = 0;
  
  if (config.cpu) total += config.cpu.price;
  if (config.gpu) total += config.gpu.price;
  if (config.motherboard) total += config.motherboard.price;
  if (config.psu) total += config.psu.price;
  if (config.case) total += config.case.price;
  if (config.cooler) total += config.cooler.price;
  
  // 处理RAM数组
  if (config.ram && Array.isArray(config.ram)) {
    config.ram.forEach(item => total += item.price);
  }
  
  // 处理存储数组
  if (config.storage && Array.isArray(config.storage)) {
    config.storage.forEach(item => total += item.price);
  }
  
  return total;
}



// Context 类型
interface HardwareContextType {
  state: HardwareState;
  selectHardware: (category: HardwareCategory, item: HardwareItem) => void;
  removeHardware: (category: HardwareCategory) => void;
  clearConfig: () => void;
  checkCompatibility: () => void;
}

// 创建 Context
const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

// Provider 组件
export function HardwareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hardwareReducer, initialState);
  
  const selectHardware = (category: HardwareCategory, item: HardwareItem) => {
    dispatch({ type: 'SELECT_HARDWARE', category, item });
  };
  
  const removeHardware = (category: HardwareCategory) => {
    dispatch({ type: 'REMOVE_HARDWARE', category });
  };
  
  const clearConfig = () => {
    dispatch({ type: 'CLEAR_CONFIG' });
  };
  
  const checkCompatibility = () => {
    dispatch({ type: 'CHECK_COMPATIBILITY' });
  };
  
  return (
    <HardwareContext.Provider value={{
      state,
      selectHardware,
      removeHardware,
      clearConfig,
      checkCompatibility
    }}>
      {children}
    </HardwareContext.Provider>
  );
}

// Hook 用于使用 Context
export function useHardware() {
  const context = useContext(HardwareContext);
  if (context === undefined) {
    throw new Error('useHardware must be used within a HardwareProvider');
  }
  return context;
} 