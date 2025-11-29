import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const BurnerTest = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isBurnerLit, setIsBurnerLit] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x16213e,
      roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Bunsen Burner - Base
    const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.3, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.6,
      roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    scene.add(base);

    // Bunsen Burner - Tube
    const tubeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 32);
    const tubeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x555555,
      metalness: 0.7,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.position.y = 1.8;
    tube.castShadow = true;
    scene.add(tube);

    // Bunsen Burner - Top ring
    const ringGeometry = new THREE.TorusGeometry(0.35, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x777777,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 3.3;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Create Hershey's Kiss flame shape using lathe geometry
    const createFlameShape = (radius: number, height: number, color: number, opacity: number) => {
      const points = [];
      const segments = 30;
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        
        // Hershey's Kiss shape: wide at bottom, curved teardrop to point
        let r;
        if (t < 0.6) {
          // Bottom bulge - wider base
          r = radius * Math.sin(t * Math.PI / 0.6);
        } else {
          // Taper to point at top
          const tTop = (t - 0.6) / 0.4;
          r = radius * Math.sin(Math.PI / 2) * (1 - tTop * tTop);
        }
        
        // Add subtle irregularity for natural flame look
        r *= (1 + Math.sin(t * Math.PI * 5) * 0.08);
        r *= (1 + Math.cos(t * Math.PI * 7) * 0.06);
        
        const y = t * height;
        points.push(new THREE.Vector2(r, y));
      }
      
      const geometry = new THREE.LatheGeometry(points, 32);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
      
      return new THREE.Mesh(geometry, material);
    };

    // Blue Flame - Inner core (bright cyan)
    const flameInner = createFlameShape(0.15, 1.2, 0xaaffff, 0.95);
    flameInner.position.y = 3.4; // Positioned at the rim of the burner
    flameInner.visible = false;
    scene.add(flameInner);

    // Blue Flame - Middle layer (cyan-blue)
    const flameMiddle = createFlameShape(0.25, 1.6, 0x4499ff, 0.75);
    flameMiddle.position.y = 3.35; // Positioned at the rim of the burner
    flameMiddle.visible = false;
    scene.add(flameMiddle);

    // Blue Flame - Outer layer (deep blue)
    const flameOuter = createFlameShape(0.35, 1.9, 0x1155cc, 0.55);
    flameOuter.position.y = 3.3; // Positioned at the rim of the burner
    flameOuter.visible = false;
    scene.add(flameOuter);
    
    // Outermost glow layer (dark blue)
    const flameGlow = createFlameShape(0.42, 2.1, 0x0033aa, 0.35);
    flameGlow.position.y = 3.25; // Positioned at the rim of the burner
    flameGlow.visible = false;
    scene.add(flameGlow);

    // Point light for flame glow
    const flameLight = new THREE.PointLight(0x4499ff, 0, 6);
    flameLight.position.y = 3.5; // Positioned at the rim of the burner
    flameLight.visible = false;
    scene.add(flameLight);

    // State variables
    let isFlameOn = false;

    const toggleFlame = () => {
      isFlameOn = !isFlameOn;
      flameInner.visible = isFlameOn;
      flameMiddle.visible = isFlameOn;
      flameOuter.visible = isFlameOn;
      flameGlow.visible = isFlameOn;
      flameLight.visible = isFlameOn;
      
      if (isFlameOn) {
        flameLight.intensity = 2.5;
      } else {
        flameLight.intensity = 0;
      }
      
      setIsBurnerLit(isFlameOn);
    };

    // Mouse click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([tube, base, ring]);

      if (intersects.length > 0) {
        toggleFlame();
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      // Animate flame with flickering
      if (isFlameOn) {
        // Flickering effect with different frequencies for organic movement
        const flicker = Math.sin(elapsedTime * 10) * 0.04 + 0.96;
        const flicker2 = Math.sin(elapsedTime * 12 + 1) * 0.05 + 0.95;
        const flicker3 = Math.sin(elapsedTime * 9 + 2) * 0.06 + 0.94;
        const flicker4 = Math.sin(elapsedTime * 11 + 3) * 0.05 + 0.95;
        
        flameInner.scale.set(flicker, 1 + Math.sin(elapsedTime * 9) * 0.08, flicker);
        flameMiddle.scale.set(flicker2, 1 + Math.sin(elapsedTime * 7) * 0.1, flicker2);
        flameOuter.scale.set(flicker3, 1 + Math.sin(elapsedTime * 6) * 0.12, flicker3);
        flameGlow.scale.set(flicker4, 1 + Math.sin(elapsedTime * 5) * 0.14, flicker4);
        
        // Slight rotation for dynamic effect
        flameInner.rotation.y = Math.sin(elapsedTime * 2) * 0.15;
        flameMiddle.rotation.y = Math.sin(elapsedTime * 1.7) * 0.18;
        flameOuter.rotation.y = Math.sin(elapsedTime * 1.5) * 0.2;
        flameGlow.rotation.y = Math.sin(elapsedTime * 1.3) * 0.22;
        
        // Light intensity flicker
        flameLight.intensity = 2.5 + Math.sin(elapsedTime * 8) * 0.7;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Center - 3D Visualization */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Bunsen Burner Test</h1>
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className={`inline-block px-3 py-1 rounded ${isBurnerLit ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>
              {isBurnerLit ? '🔥 Blue Flame Active' : '⚫ Flame Off'}
            </span>
            <p className="text-sm text-gray-300 mt-2">Click on the burner to {isBurnerLit ? 'turn off' : 'ignite'} the blue flame</p>
          </div>
        </div>
        <div ref={mountRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default BurnerTest;