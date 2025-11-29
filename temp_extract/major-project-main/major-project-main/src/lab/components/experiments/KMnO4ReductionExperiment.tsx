import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const KMnO4ReductionExperiment = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const [chemicalIds, setChemicalIds] = useState<string[]>([]);
  const [reactionStarted, setReactionStarted] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionComplete, setReactionComplete] = useState(false);
  const [showAcidWarning, setShowAcidWarning] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x4a5568); // Dark grey-blue
    
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

    // Create test tube
    const testTubeGroup = new THREE.Group();
    
    // Test tube body (cylinder with rounded bottom)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 4, 32, 1, true);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      side: THREE.DoubleSide
    });
    const testTubeBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    testTubeBody.position.y = 2;
    testTubeGroup.add(testTubeBody);

    // Test tube rim
    const rimGeometry = new THREE.TorusGeometry(0.4, 0.03, 16, 32);
    const rimMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 4;
    rim.rotation.x = Math.PI / 2;
    testTubeGroup.add(rim);

    // Test tube rounded bottom
    const bottomGeometry = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bottomMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5
    });
    const testTubeBottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    testTubeBottom.position.y = 0;
    testTubeBottom.rotation.x = Math.PI;
    testTubeGroup.add(testTubeBottom);

    testTubeGroup.castShadow = true;
    scene.add(testTubeGroup);

    // Liquid inside test tube - starts with no liquid
    const liquidGroup = new THREE.Group();
    
    // Liquid body
    const liquidGeometry = new THREE.CylinderGeometry(0.35, 0.35, 3, 32);
    const liquidMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'), // Start with clear/white
      transparent: false,
      opacity: 0.0,
      roughness: 0.3,
      metalness: 0.1
    });
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.y = 1.5;
    liquidGroup.add(liquid);

    // Liquid bottom (to fill the rounded bottom completely)
    const liquidBottomGeometry = new THREE.SphereGeometry(0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const liquidBottomMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'), // Start with clear/white
      transparent: false,
      opacity: 0.0,
      roughness: 0.3,
      metalness: 0.1
    });
    const liquidBottom = new THREE.Mesh(liquidBottomGeometry, liquidBottomMaterial);
    liquidBottom.position.y = 0;
    liquidBottom.rotation.x = Math.PI;
    liquidGroup.add(liquidBottom);

    // Liquid surface
    const surfaceGeometry = new THREE.CircleGeometry(0.35, 32);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'), // Start with clear/white
      transparent: false,
      opacity: 0.0,
      roughness: 0.2,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = 3; // Top of liquid
    surface.rotation.x = -Math.PI / 2;
    liquidGroup.add(surface);

    scene.add(liquidGroup);
    liquidGroup.renderOrder = 1; // Ensures liquid renders after test tube

    // Animation loop
    let oldElapsedTime = 0;

    const animate = () => {
      const elapsedTime = clockRef.current ? clockRef.current.getElapsedTime() : 0;
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      // Check if all required chemicals are present to start reaction
      const hasKMnO4 = chemicalIds.includes('kmno4');
      const hasH2SO4 = chemicalIds.includes('h2so4');
      const hasOxalicAcid = chemicalIds.includes('oxalic-acid');

      if (hasKMnO4 && hasH2SO4 && hasOxalicAcid && !reactionStarted) {
        setReactionStarted(true);
        setReactionStartTime(elapsedTime);
        setReactionComplete(false);
        setShowAcidWarning(false);
      }

      // Update liquid appearance based on added chemicals
      if (hasKMnO4 && !hasH2SO4 && !hasOxalicAcid) {
        // Only KMnO4 added - show purple solution
        liquidMaterial.color.set('#9D27B0');
        liquidMaterial.opacity = 1.0;
        liquidMaterial.transparent = false;
        liquidMaterial.needsUpdate = true;
        
        liquidBottomMaterial.color.set('#9D27B0');
        liquidBottomMaterial.opacity = 1.0;
        liquidBottomMaterial.transparent = false;
        liquidBottomMaterial.needsUpdate = true;
        
        surfaceMaterial.color.set('#9D27B0');
        surfaceMaterial.opacity = 1.0;
        surfaceMaterial.transparent = false;
        surfaceMaterial.needsUpdate = true;
      }

      // Color transition logic for KMnO4 reduction
      if (reactionStarted && reactionStartTime !== null && !reactionComplete) {
        const timeSinceStart = elapsedTime - reactionStartTime;
        const totalDuration = 9.0; // 9 seconds total transition to match requirement
        
        if (timeSinceStart <= totalDuration) {
          const progress = Math.min(timeSinceStart / totalDuration, 1.0);
          // Use linear interpolation as requested
          
          // Define color transitions
          const startColor = new THREE.Color('#9D27B0'); // Purple as specified
          const midColor = new THREE.Color('#F2C9DA');   // Pale pink
          const endColor = new THREE.Color('#FFF5FA');   // Almost colorless
          
          let currentColor;
          if (progress <= 0.5) {
            // First half: Purple → Pale pink
            const localProgress = progress / 0.5;
            currentColor = new THREE.Color().lerpColors(startColor, midColor, localProgress);
          } else {
            // Second half: Pale pink → Almost colorless
            const localProgress = (progress - 0.5) / 0.5;
            currentColor = new THREE.Color().lerpColors(midColor, endColor, localProgress);
          }
          
          // Update liquid materials with interpolated color
          liquidMaterial.color.copy(currentColor);
          liquidMaterial.opacity = 1.0 - progress * 0.3; // Slight opacity reduction
          liquidMaterial.transparent = progress > 0.5; // Enable transparency in later stages
          liquidMaterial.needsUpdate = true;
          
          liquidBottomMaterial.color.copy(currentColor);
          liquidBottomMaterial.opacity = 1.0 - progress * 0.3;
          liquidBottomMaterial.transparent = progress > 0.5;
          liquidBottomMaterial.needsUpdate = true;
          
          surfaceMaterial.color.copy(currentColor);
          surfaceMaterial.opacity = 1.0 - progress * 0.3;
          surfaceMaterial.transparent = progress > 0.5;
          surfaceMaterial.needsUpdate = true;
        } else {
          setReactionComplete(true);
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Initialize clock
    clockRef.current = new THREE.Clock();
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
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [chemicalIds]);

  const addChemical = (chemicalId: string) => {
    // Check if adding oxalic acid before acid
    if (chemicalId === 'oxalic-acid' && !chemicalIds.includes('h2so4')) {
      setShowAcidWarning(true);
      setTimeout(() => setShowAcidWarning(false), 3000);
      return;
    }
    
    if (!chemicalIds.includes(chemicalId)) {
      setChemicalIds([...chemicalIds, chemicalId]);
    }
  };

  const resetExperiment = () => {
    setChemicalIds([]);
    setReactionStarted(false);
    setReactionStartTime(null);
    setReactionComplete(false);
    setShowAcidWarning(false);
  };

  // Check which chemicals have been added
  const hasKMnO4 = chemicalIds.includes('kmno4');
  const hasH2SO4 = chemicalIds.includes('h2so4');
  const hasOxalicAcid = chemicalIds.includes('oxalic-acid');

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Panel - Instructions */}
      <div className="w-64 bg-gray-800 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">KMnO₄ Reduction Reaction</h2>

        <div className="mb-4 p-3 bg-blue-900 rounded">
          <p className="text-sm font-mono">2KMnO₄ + 5H₂C₂O₄ + 3H₂SO₄ → 2MnSO₄ + 10CO₂ + 8H₂O</p>
        </div>

        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="space-y-2 text-sm">
          <li>• Add potassium permanganate solution to test tube</li>
          <li>• Add dilute sulfuric acid to the solution</li>
          <li>• Add oxalic acid solution</li>
          <li>• Observe color change from purple to colorless</li>
        </ul>

        <div className="mt-4 p-3 bg-yellow-900 rounded">
          <p className="text-xs">⚠️ Safety: Handle all chemicals with care. Wear protective equipment.</p>
        </div>
      </div>

      {/* Center - 3D Visualization */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-2xl font-bold text-white mb-2">KMnO₄ Reduction Reaction</h1>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
            {hasKMnO4 && (
              <span className="inline-block px-3 py-1 rounded bg-purple-600 text-white">
                ⚫ KMnO₄ Added
              </span>
            )}
            {hasH2SO4 && (
              <span className="inline-block px-3 py-1 rounded bg-orange-600 text-white">
                ⚫ H₂SO₄ Added
              </span>
            )}
            {hasOxalicAcid && (
              <span className="inline-block px-3 py-1 rounded bg-green-600 text-white">
                ⚫ Oxalic Acid Added
              </span>
            )}
            {reactionStarted && (
              <span className="inline-block px-3 py-1 rounded bg-green-600 text-white animate-pulse">
                🧪 Reaction Active
              </span>
            )}
            {reactionComplete && (
              <span className="inline-block px-3 py-1 rounded bg-pink-600 text-white">
                ✅ Reaction Complete
              </span>
            )}
          </div>
          
          {/* Informational text based on experiment state */}
          <div className="mt-2 bg-gray-800/80 px-4 py-2 rounded-lg text-white text-sm">
            {!hasKMnO4 && !hasH2SO4 && !hasOxalicAcid && (
              <p>Purple KMnO₄ is a strong oxidizing agent.</p>
            )}
            {hasKMnO4 && !hasH2SO4 && !hasOxalicAcid && (
              <p>Purple KMnO₄ solution added to test tube.</p>
            )}
            {hasKMnO4 && hasH2SO4 && !hasOxalicAcid && (
              <p>In acidic medium, KMnO₄ can be reduced to Mn²⁺.</p>
            )}
            {reactionStarted && !reactionComplete && (
              <p>KMnO₄ is being reduced. The disappearance of purple indicates reduction.</p>
            )}
            {reactionComplete && (
              <p>KMnO₄ reduced to Mn²⁺ (solution becomes pale pink / nearly colorless).</p>
            )}
          </div>
          
          {/* Warning message */}
          {showAcidWarning && (
            <div className="mt-2 bg-red-800 px-4 py-2 rounded-lg text-white text-sm animate-pulse">
              Add acid first to allow reduction.
            </div>
          )}
        </div>
        <div ref={mountRef} className="w-full h-full" />
      </div>

      {/* Right Panel - Controls */}
      <div className="w-80 bg-gray-800 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Experiment Controls</h2>
        
        <div className="space-y-6">
          {/* Chemical Addition */}
          <div>
            <h3 className="font-semibold mb-2">Add Chemicals</h3>
            <div className="space-y-2">
              <button
                onClick={() => addChemical('kmno4')}
                disabled={hasKMnO4}
                className={`w-full py-2 px-4 rounded font-semibold ${
                  hasKMnO4 
                    ? 'bg-purple-800 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {hasKMnO4 ? '✓ KMnO₄ Added' : 'Add KMnO₄'}
              </button>
              <button
                onClick={() => addChemical('h2so4')}
                disabled={hasH2SO4}
                className={`w-full py-2 px-4 rounded font-semibold ${
                  hasH2SO4 
                    ? 'bg-orange-800 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {hasH2SO4 ? '✓ H₂SO₄ Added' : 'Add H₂SO₄'}
              </button>
              <button
                onClick={() => addChemical('oxalic-acid')}
                disabled={hasOxalicAcid}
                className={`w-full py-2 px-4 rounded font-semibold ${
                  hasOxalicAcid 
                    ? 'bg-green-800 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {hasOxalicAcid ? '✓ Oxalic Acid Added' : 'Add Oxalic Acid'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Reaction starts when KMnO₄, H₂SO₄, and Oxalic Acid are added
            </p>
          </div>

          {/* Reset Button */}
          <div>
            <h3 className="font-semibold mb-2">Reset Experiment</h3>
            <button
              onClick={resetExperiment}
              className="w-full py-2 px-4 rounded font-semibold bg-green-600 hover:bg-green-700"
            >
              🔄 Reset Experiment
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Removes all chemicals and resets reaction
            </p>
          </div>

          {/* Reaction Progress */}
          <div>
            <h3 className="font-semibold mb-3">Reaction Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-lg font-bold">
                  {reactionComplete 
                    ? 'Complete' 
                    : reactionStarted 
                      ? 'In Progress' 
                      : 'Waiting for chemicals'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Required Chemicals</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <span className={hasKMnO4 ? 'text-green-400' : 'text-gray-500'}>
                      {hasKMnO4 ? '✓' : '○'}
                    </span>
                    <span className="ml-2">KMnO₄ (Potassium Permanganate)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={hasH2SO4 ? 'text-green-400' : 'text-gray-500'}>
                      {hasH2SO4 ? '✓' : '○'}
                    </span>
                    <span className="ml-2">H₂SO₄ (Sulfuric Acid)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={hasOxalicAcid ? 'text-green-400' : 'text-gray-500'}>
                      {hasOxalicAcid ? '✓' : '○'}
                    </span>
                    <span className="ml-2">Oxalic Acid (Reducing Agent)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">Observations</h3>
            <ul className="text-sm space-y-1">
              <li className={hasKMnO4 ? 'text-purple-400' : 'text-gray-500'}>
                {hasKMnO4 ? '✓' : '○'} Deep purple KMnO₄ solution added
              </li>
              <li className={hasH2SO4 ? 'text-orange-400' : 'text-gray-500'}>
                {hasH2SO4 ? '✓' : '○'} Acidic conditions established
              </li>
              <li className={hasOxalicAcid ? 'text-green-400' : 'text-gray-500'}>
                {hasOxalicAcid ? '✓' : '○'} Reductant (Oxalic Acid) added
              </li>
              <li className={reactionStarted ? 'text-green-400' : 'text-gray-500'}>
                {reactionStarted ? '✓' : '○'} Redox reaction initiated
              </li>
              <li className={reactionComplete ? 'text-pink-400' : 'text-gray-500'}>
                {reactionComplete ? '✓' : '○'} Color transition complete
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KMnO4ReductionExperiment;