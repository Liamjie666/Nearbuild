'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useHardware } from '@/contexts/HardwareContext';

export default function ThreeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const animationIdRef = useRef<number | null>(null);

  const { state } = useHardware();
  const config = state.config;

  useEffect(() => {
    if (!mountRef.current) return;

    // 清理旧场景
    if (rendererRef.current && rendererRef.current.domElement.parentNode) {
      rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
    }

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      55,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(2.5, 2, 3);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 光照
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const fillLight = new THREE.PointLight(0x00ffb3, 0.7, 10);
    fillLight.position.set(0, 2, 3);
    scene.add(fillLight);

    // 机箱外壳
    const caseGeometry = new THREE.BoxGeometry(2, 1.5, 0.7);
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // 白色
      metalness: 0.7,
      roughness: 0.3
    });
    const computerCase = new THREE.Mesh(caseGeometry, caseMaterial);
    computerCase.position.set(0, 0.75, 0);
    computerCase.castShadow = true;
    computerCase.receiveShadow = true;
    scene.add(computerCase);

    // 侧板玻璃
    const glassGeometry = new THREE.BoxGeometry(1.98, 1.48, 0.015);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffb3,
      transparent: true,
      opacity: 0.18,
      metalness: 0.2,
      roughness: 0.1,
      emissive: 0x00ffb3,
      emissiveIntensity: 0.08
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(0, 0.75, 0.36);
    scene.add(glass);

    // 硬件布局参数
    const yBase = 0.2;
    // 主板
    if (config.motherboard) {
      const mbGeometry = new THREE.BoxGeometry(1.2, 1, 0.03);
      const mbMaterial = new THREE.MeshStandardMaterial({ color: 0x4ecdc4, metalness: 0.5, roughness: 0.3 });
      const mb = new THREE.Mesh(mbGeometry, mbMaterial);
      mb.position.set(-0.2, yBase + 0.5, 0);
      scene.add(mb);
    }
    // CPU
    if (config.cpu) {
      const cpuGeometry = new THREE.BoxGeometry(0.18, 0.18, 0.04);
      const cpuMaterial = new THREE.MeshStandardMaterial({ color: 0xffe066, metalness: 0.7, roughness: 0.2 });
      const cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
      cpu.position.set(-0.2, yBase + 0.7, 0.02);
      scene.add(cpu);
    }
    // GPU
    if (config.gpu) {
      const gpuGeometry = new THREE.BoxGeometry(0.9, 0.18, 0.08);
      const gpuMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b, metalness: 0.6, roughness: 0.2 });
      const gpu = new THREE.Mesh(gpuGeometry, gpuMaterial);
      gpu.position.set(0.1, yBase + 0.35, 0.04);
      scene.add(gpu);
    }
    // 内存
    if (config.ram) {
      const ramGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.03);
      const ramMaterial = new THREE.MeshStandardMaterial({ color: 0x45b7d1, metalness: 0.5, roughness: 0.3 });
      const ram = new THREE.Mesh(ramGeometry, ramMaterial);
      ram.position.set(-0.5, yBase + 0.7, 0.04);
      scene.add(ram);
    }
    // 存储
    if (config.storage) {
      const ssdGeometry = new THREE.BoxGeometry(0.25, 0.08, 0.02);
      const ssdMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffb3, metalness: 0.5, roughness: 0.3 });
      const ssd = new THREE.Mesh(ssdGeometry, ssdMaterial);
      ssd.position.set(0.5, yBase + 0.2, -0.2);
      scene.add(ssd);
    }
    // 电源
    if (config.psu) {
      const psuGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.3);
      const psuMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7, roughness: 0.2 });
      const psu = new THREE.Mesh(psuGeometry, psuMaterial);
      psu.position.set(-0.6, yBase + 0.1, -0.2);
      scene.add(psu);
    }

    // 轨道控制器
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 动画循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [config]);

  return (
    <div className="w-full h-full bg-black relative">
      <div ref={mountRef} className="w-full h-full" />
      {/* 状态指示器 */}
      <div className="absolute top-4 left-4 z-10">
        <div className="three-status-box">
          <div className="text-cyan-400 text-sm font-medium">3D 实时渲染</div>
          <div className="text-gray-400 text-xs">60 FPS</div>
        </div>
      </div>
      {/* 控制说明 */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
        <div className="text-cyan-400 text-xs">鼠标拖拽旋转 · 滚轮缩放</div>
      </div>
    </div>
  );
} 