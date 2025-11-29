import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ChemicalExperiment = () => {
  const mountRef = useRef(null);
  const [step, setStep] = useState(0);
  const sceneRef = useRef(null);
  const liquidMeshRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e8e8);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(2, 2, 4);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-3, 3, -3);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Simple lab table/surface
    const tableGeometry = new THREE.BoxGeometry(6, 0.15, 3);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c2c2c,
      roughness: 0.4,
      metalness: 0.1
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.075;
    table.receiveShadow = true;
    scene.add(table);

    // Test tube - conical flask style (standing on table)
    const tubeRadius = 0.3;
    const tubeHeight = 2.5;
    const tubeThickness = 0.025;
    
    // Outer cylinder with visible edge
    const tubeOuterGeometry = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      tubeHeight,
      32,
      1,
      false
    );
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xccddff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const tubeOuter = new THREE.Mesh(tubeOuterGeometry, glassMaterial);
    tubeOuter.position.set(0, 1.25, 0);
    tubeOuter.castShadow = true;
    tubeOuter.receiveShadow = true;
    scene.add(tubeOuter);

    // Rim of test tube
    const rimGeometry = new THREE.TorusGeometry(tubeRadius, 0.015, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x88aacc,
      metalness: 0.3,
      roughness: 0.3
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(0, 2.5, 0);
    rim.rotation.x = Math.PI / 2;
    scene.add(rim);

    // Test tube rounded bottom (visible)
    const bottomGeometry = new THREE.SphereGeometry(tubeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bottom = new THREE.Mesh(bottomGeometry, glassMaterial);
    bottom.position.set(0, 0, 0);
    bottom.castShadow = true;
    scene.add(bottom);

    // Visible edge at bottom
    const bottomRingGeometry = new THREE.TorusGeometry(tubeRadius - 0.005, 0.01, 16, 32);
    const bottomRing = new THREE.Mesh(bottomRingGeometry, rimMaterial);
    bottomRing.position.set(0, 0, 0);
    bottomRing.rotation.x = Math.PI / 2;
    scene.add(bottomRing);

    // Liquid inside test tube
    const liquidGeometry = new THREE.CylinderGeometry(
      tubeRadius - tubeThickness - 0.01,
      tubeRadius - tubeThickness - 0.01,
      0.1,
      32
    );
    const liquidMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      shininess: 100,
      emissive: 0x000000,
    });
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.set(0, 0.05, 0);
    scene.add(liquid);
    liquidMeshRef.current = liquid;

    // Beakers on table for chemicals
    const createBeaker = (x, z, labelColor, label) => {
      const beakerGroup = new THREE.Group();
      
      const beakerGeometry = new THREE.CylinderGeometry(0.22, 0.2, 0.45, 32);
      const beakerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaccee,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        transmission: 0.85,
      });
      const beaker = new THREE.Mesh(beakerGeometry, beakerMaterial);
      beaker.castShadow = true;
      beakerGroup.add(beaker);

      // Liquid in beaker
      const beakerLiquidGeometry = new THREE.CylinderGeometry(0.18, 0.17, 0.25, 32);
      const beakerLiquidMaterial = new THREE.MeshPhongMaterial({ 
        color: labelColor,
        transparent: true,
        opacity: 0.7,
        shininess: 80
      });
      const beakerLiquid = new THREE.Mesh(beakerLiquidGeometry, beakerLiquidMaterial);
      beakerLiquid.position.y = -0.05;
      beakerGroup.add(beakerLiquid);

      beakerGroup.position.set(x, 0.225, z);
      return beakerGroup;
    };

    const beaker1 = createBeaker(-1.8, 0.8, 0x8b008b, "KMnO₄");
    const beaker2 = createBeaker(-2.3, -0.3, 0xff8888, "H₂SO₄");
    const beaker3 = createBeaker(-1.3, -1.2, 0x88dddd, "Oxalic");
    scene.add(beaker1, beaker2, beaker3);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0xbbbbbb, 0xdddddd);
    gridHelper.position.y = -0.09;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Animate particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.velocity.y -= 0.003; // gravity
        particle.position.add(particle.velocity);
        
        // Remove if hit liquid or out of bounds
        if (particle.position.y < liquid.position.y + liquid.scale.y * 0.05 || particle.position.y < 0.4) {
          scene.remove(particle);
          particles.splice(i, 1);
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const createParticles = (color, count, duration) => {
    const scene = sceneRef.current;
    const particles = particlesRef.current;
    
    const startTime = Date.now();
    
    const addParticle = () => {
      if (Date.now() - startTime > duration) return;
      
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.3
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Start position (above test tube)
      particle.position.set(
        (Math.random() - 0.5) * 0.05,
        2.5,
        (Math.random() - 0.5) * 0.05
      );
      
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        -0.02,
        (Math.random() - 0.5) * 0.01
      );
      
      scene.add(particle);
      particles.push(particle);
      
      setTimeout(addParticle, 50);
    };
    
    addParticle();
  };

  const addKMnO4 = () => {
    if (step !== 0) return;
    const liquid = liquidMeshRef.current;
    
    createParticles(0x8b008b, 40, 2000);
    
    const targetHeight = 1.2;
    const targetColor = new THREE.Color(0x8b008b);
    
    let progress = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    const animatePour = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      const currentHeight = progress * targetHeight;
      liquid.scale.y = currentHeight / 0.1;
      liquid.position.y = 0.05 + currentHeight / 2;
      
      liquid.material.color.lerp(targetColor, progress);
      liquid.material.opacity = 0.85 * progress;
      liquid.material.emissive.copy(targetColor).multiplyScalar(0.2 * progress);
      
      if (progress < 1) {
        requestAnimationFrame(animatePour);
      }
    };
    
    animatePour();
    setStep(1);
  };

  const addH2SO4 = () => {
    if (step !== 1) return;
    const liquid = liquidMeshRef.current;
    
    createParticles(0xffcccc, 30, 1500);
    
    const currentHeight = liquid.scale.y * 0.1;
    const targetHeight = currentHeight + 0.4;
    
    let progress = 0;
    const duration = 1500;
    const startTime = Date.now();
    const startHeight = currentHeight;
    
    const animatePour = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      const newHeight = startHeight + (targetHeight - startHeight) * progress;
      liquid.scale.y = newHeight / 0.1;
      liquid.position.y = 0.05 + newHeight / 2;
      
      const slightlyLighter = new THREE.Color(0x9400d3);
      liquid.material.color.lerp(slightlyLighter, progress * 0.15);
      
      if (progress < 1) {
        requestAnimationFrame(animatePour);
      }
    };
    
    animatePour();
    setStep(2);
  };

  const addOxalicAcid = () => {
    if (step !== 2) return;
    const liquid = liquidMeshRef.current;
    
    createParticles(0xaaffff, 50, 2500);
    
    const currentHeight = liquid.scale.y * 0.1;
    const targetHeight = currentHeight + 0.5;
    
    let progress = 0;
    const duration = 5000;
    const startTime = Date.now();
    const startHeight = currentHeight;
    const startColor = liquid.material.color.clone();
    const pinkColor = new THREE.Color(0xffb6c1);
    const colorlessColor = new THREE.Color(0xf0f0f0);
    
    const animateReaction = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      const newHeight = startHeight + (targetHeight - startHeight) * progress;
      liquid.scale.y = newHeight / 0.1;
      liquid.position.y = 0.05 + newHeight / 2;
      
      if (progress < 0.5) {
        const phaseProgress = progress * 2;
        liquid.material.color.lerpColors(startColor, pinkColor, phaseProgress);
        liquid.material.emissive.copy(pinkColor).multiplyScalar(0.15 * phaseProgress);
      } else {
        const phaseProgress = (progress - 0.5) * 2;
        liquid.material.color.lerpColors(pinkColor, colorlessColor, phaseProgress);
        liquid.material.opacity = 0.85 - (0.55 * phaseProgress);
        liquid.material.emissive.multiplyScalar(1 - phaseProgress);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateReaction);
      }
    };
    
    animateReaction();
    setStep(3);
  };

  const reset = () => {
    const liquid = liquidMeshRef.current;
    liquid.scale.y = 1;
    liquid.position.y = 0.05;
    liquid.material.color.set(0xffffff);
    liquid.material.opacity = 0;
    liquid.material.emissive.set(0x000000);
    
    // Clear particles
    const particles = particlesRef.current;
    particles.forEach(p => sceneRef.current.remove(p));
    particlesRef.current = [];
    
    setStep(0);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '240px',
      }}>
        <h2 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '17px' }}>
          KMnO₄ Titration
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={addKMnO4}
            disabled={step !== 0}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              background: step === 0 ? 'linear-gradient(135deg, #8b008b, #a020f0)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: step === 0 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              boxShadow: step === 0 ? '0 3px 6px rgba(139,0,139,0.3)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            1. Add KMnO₄
          </button>
          
          <button
            onClick={addH2SO4}
            disabled={step !== 1}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              background: step === 1 ? 'linear-gradient(135deg, #ff6b6b, #ff8888)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: step === 1 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              boxShadow: step === 1 ? '0 3px 6px rgba(255,107,107,0.3)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            2. Add H₂SO₄
          </button>
          
          <button
            onClick={addOxalicAcid}
            disabled={step !== 2}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              background: step === 2 ? 'linear-gradient(135deg, #4ecdc4, #5ee7df)' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: step === 2 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              boxShadow: step === 2 ? '0 3px 6px rgba(78,205,196,0.3)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            3. Add Oxalic Acid
          </button>
          
          <button
            onClick={reset}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, #555, #777)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: 'bold',
              boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            }}
          >
            🔄 Reset
          </button>
        </div>
        
        <div style={{ 
          marginTop: '12px', 
          padding: '10px', 
          background: '#f9f9f9', 
          borderRadius: '5px',
          fontSize: '12px',
          color: '#555',
          fontWeight: '500'
        }}>
          {step === 0 && "🧪 Ready"}
          {step === 1 && "🟣 Purple"}
          {step === 2 && "⚗️ Acidified"}
          {step === 3 && "✨ Decolorized"}
        </div>
      </div>
    </div>
  );
};

export default ChemicalExperiment;