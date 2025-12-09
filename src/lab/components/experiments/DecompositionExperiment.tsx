import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const DecompositionExperiment = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<THREE.Clock | null>(null); // Ref to store clock instance
  const [isBurnerLit, setIsBurnerLit] = useState(false);
  const [vesselHeight, setVesselHeight] = useState(5);
  const [temperature, setTemperature] = useState(25);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [heatingRate, setHeatingRate] = useState(1.0);
  const [coolingRate, setCoolingRate] = useState(0.1);
  const [oxygenProduction, setOxygenProduction] = useState(0);
  const [decompositionStarted, setDecompositionStarted] = useState(false);
  const [hasCatalyst, setHasCatalyst] = useState(false);
  const [catalystAddedTime, setCatalystAddedTime] = useState<number | null>(null);
  const [transitionComplete, setTransitionComplete] = useState(false);
  
  // Create a ref to track catalyst state in the Three.js context
  const catalystStateRef = useRef({
    isActive: false,
    addedTime: null as number | null,
    transitionCompleted: false
  });
  
  // Add state variables for catalyst transition
  let localCatalystAddedTime = -1;
  let localTransitionComplete = false;

  useEffect(() => {
    // Update the ref when state changes
    catalystStateRef.current.isActive = hasCatalyst;
    
    // Initialize catalyst state ref with current values
    catalystStateRef.current.addedTime = localCatalystAddedTime;
    catalystStateRef.current.transitionCompleted = localTransitionComplete;
    
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

    // Bunsen Burner - Base (moved forward)
    const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.3, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.6,
      roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.15, 2);
    base.castShadow = true;
    scene.add(base);

    // Bunsen Burner - Tube (moved forward)
    const tubeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 32);
    const tubeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x555555,
      metalness: 0.7,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.position.set(0, 1.8, 2);
    tube.castShadow = true;
    scene.add(tube);

    // Bunsen Burner - Top ring (moved forward)
    const ringGeometry = new THREE.TorusGeometry(0.35, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x777777,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0, 3.3, 2);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // EXACT FLAME FROM COMBUSTION EXPERIMENT - Realistic Shader-Based Flame
    const flameVertexShader = `
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vDisplacement;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // Create turbulent motion using noise
        float noise1 = snoise(vec3(position.x * 2.0, position.y * 1.5 - time * 0.8, position.z * 2.0));
        float noise2 = snoise(vec3(position.x * 3.0, position.y * 2.0 - time * 1.2, position.z * 3.0));
        float noise3 = snoise(vec3(position.x * 1.5, position.y * 0.8 - time * 0.5, position.z * 1.5));
        
        // Combine noises for complex motion
        float displacement = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.3) * uv.y * 0.3;
        
        // Add upward taper and twist
        float heightFactor = uv.y * uv.y;
        float twist = sin(time * 2.0 + uv.y * 3.0) * 0.1 * heightFactor;
        
        vec3 newPosition = position;
        newPosition.x += displacement * intensity + twist;
        newPosition.z += displacement * intensity * 0.8 - twist * 0.5;
        newPosition.y += heightFactor * 0.2 * intensity;
        
        vDisplacement = displacement;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const flameFragmentShader = `
      uniform float time;
      uniform float intensity;
      uniform vec3 baseColor;
      uniform vec3 tipColor;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vDisplacement;
      
      void main() {
        // Create gradient from base (blue/white) to tip (blue/transparent)
        float gradient = vUv.y;
        
        // Add noise-based variation
        float noise = sin(vPosition.x * 10.0 + time * 5.0) * 0.5 + 0.5;
        noise *= sin(vPosition.z * 10.0 + time * 3.0) * 0.5 + 0.5;
        
        // Color mixing
        vec3 color = mix(baseColor, tipColor, gradient);
        
        // Add bright core
        float core = 1.0 - length(vec2(vUv.x - 0.5, vUv.y - 0.3) * 2.0);
        core = pow(max(core, 0.0), 3.0);
        color += vec3(0.8, 0.9, 1.0) * core;
        
        // Opacity falloff
        float alpha = (1.0 - gradient) * (0.6 + noise * 0.4);
        alpha *= smoothstep(0.0, 0.1, vUv.y);
        alpha *= smoothstep(1.0, 0.8, vUv.y);
        
        // Edge fade
        float edgeFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
        alpha *= smoothstep(0.0, 0.3, edgeFade);
        
        gl_FragColor = vec4(color, alpha * intensity);
      }
    `;

    // Create realistic flame geometry
    const createRealisticFlame = () => {
      const flameGeometry = new THREE.CylinderGeometry(0.05, 0.25, 1.8, 32, 32, true);
      
      const flameMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: 1.0 },
          baseColor: { value: new THREE.Color(0x4488ff) },
          tipColor: { value: new THREE.Color(0x0044aa) }
        },
        vertexShader: flameVertexShader,
        fragmentShader: flameFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      return new THREE.Mesh(flameGeometry, flameMaterial);
    };

    // Inner flame (brighter, more intense)
    const innerFlame = createRealisticFlame();
    innerFlame.position.set(0, 3.8, 2);
    innerFlame.scale.set(0.8, 1.0, 0.8);
    innerFlame.visible = false;
    scene.add(innerFlame);

    // Outer flame (softer, wider)
    const outerFlame = createRealisticFlame();
    outerFlame.position.set(0, 3.75, 2);
    outerFlame.scale.set(1.3, 1.1, 1.3);
    outerFlame.visible = false;
    (outerFlame.material as THREE.ShaderMaterial).uniforms.intensity.value = 0.6;
    (outerFlame.material as THREE.ShaderMaterial).uniforms.baseColor.value = new THREE.Color(0x2266dd);
    scene.add(outerFlame);

    // Heat haze effect (distortion plane above flame)
    const hazeVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const hazeFragmentShader = `
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        float distortion = sin(vUv.x * 20.0 + time * 3.0) * 0.02;
        distortion += sin(vUv.y * 15.0 + time * 2.0) * 0.02;
        
        vec2 distortedUv = vUv + vec2(distortion, distortion * 0.5);
        
        float alpha = 0.15 * (1.0 - vUv.y);
        gl_FragColor = vec4(0.3, 0.5, 0.8, alpha);
      }
    `;

    const hazeGeometry = new THREE.PlaneGeometry(1.5, 2);
    const hazeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: hazeVertexShader,
      fragmentShader: hazeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const heatHaze = new THREE.Mesh(hazeGeometry, hazeMaterial);
    heatHaze.position.set(0, 5, 2);
    heatHaze.visible = false;
    scene.add(heatHaze);

    // Point light for flame glow
    const flameLight = new THREE.PointLight(0x3366ff, 0, 3.5);
    flameLight.position.set(0, 4.2, 2);
    flameLight.decay = 2.0;
    flameLight.visible = false;
    scene.add(flameLight);

    // Create test tube (replaced beaker)
    const testTubeGroup = new THREE.Group();
    
    // Test tube body (cylinder with rounded bottom)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32, 1, true);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      side: THREE.DoubleSide
    });
    const testTubeBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    testTubeBody.position.y = 1.25;
    testTubeGroup.add(testTubeBody);

    // Test tube rim
    const rimGeometry = new THREE.TorusGeometry(0.4, 0.04, 16, 32);
    const rimMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 2.5;
    rim.rotation.x = Math.PI / 2;
    testTubeGroup.add(rim);

    // Test tube rounded bottom
    const bottomGeometry = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bottomMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.4,
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

    // Reactant inside test tube (H2O2) - starts from bottom
    const liquidGroup = new THREE.Group();
    
    // Adjusted to fill about 1/3 of the test tube height (2.5 units high)
    const reactantGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.83, 32);
    const reactantMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,      // WHITE (change from 0xff69b4)
      transparent: false,
      opacity: 1.0,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xdddddd,   // LIGHT GREY emissive (change from 0xff1493)
      emissiveIntensity: 0.5
    });
    const reactant = new THREE.Mesh(reactantGeometry, reactantMaterial);
    reactant.position.y = 0.415; // Half of 0.83
    liquidGroup.add(reactant);

    // Liquid bottom (to fill the rounded bottom completely)
    const liquidBottomGeometry = new THREE.SphereGeometry(0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const liquidBottomMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,      // WHITE (change from 0xff69b4)
      transparent: false,
      opacity: 1.0,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xdddddd,   // LIGHT GREY emissive (change from 0xff1493)
      emissiveIntensity: 0.5
    });
    const liquidBottom = new THREE.Mesh(liquidBottomGeometry, liquidBottomMaterial);
    liquidBottom.position.y = 0;
    liquidBottom.rotation.x = Math.PI;
    liquidGroup.add(liquidBottom);

    // Liquid surface
    const surfaceGeometry = new THREE.CircleGeometry(0.35, 32);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,      // WHITE (change from 0xff69b4)
      transparent: false,
      opacity: 1.0,
      roughness: 0.2,
      metalness: 0.2,
      emissive: 0xcccccc,   // LIGHT GREY emissive (change from 0xff1493)
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = 0.83; // Top of liquid
    surface.rotation.x = -Math.PI / 2;
    liquidGroup.add(surface);

    // MnO2 catalyst powder (black powder at bottom of test tube) - more visible particles
    const catalystGroup = new THREE.Group();
    
    // Base layer of catalyst powder
    const catalystBaseGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 32); // CHANGE from (0.3, 0.3, 0.1, 32)
    const catalystBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,      // CHANGE to pure black from 0x0a0a0a
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const catalystBase = new THREE.Mesh(catalystBaseGeometry, catalystBaseMaterial);
    catalystBase.position.y = 0.87;  // CHANGE from 0.83 to 0.87 (higher up)
    catalystGroup.add(catalystBase);
    
    // Add small particle clumps for realistic powder appearance
    const particleGeometry = new THREE.SphereGeometry(0.04, 8, 8); // CHANGE from 0.03 to 0.04 (bigger)
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 30; i++) {  // CHANGE from 15 to 30 (more particles)
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / 30) * Math.PI * 2;  // CHANGE from (i / 15) to (i / 30)
      const radius = 0.05 + Math.random() * 0.2;  // CHANGE from (0.1 + Math.random() * 0.15)
      particle.position.set(
        Math.cos(angle) * radius,
        0.87 + Math.random() * 0.08,  // CHANGE from (0.86 + Math.random() * 0.05)
        Math.sin(angle) * radius
      );
      particle.scale.set(
        1.0 + Math.random() * 0.6,  // CHANGE from (0.8 + Math.random() * 0.4) - bigger!
        1.0 + Math.random() * 0.6,
        1.0 + Math.random() * 0.6
      );
      catalystGroup.add(particle);
    }
    
    catalystGroup.visible = hasCatalyst; // Initialize visibility based on state
    liquidGroup.add(catalystGroup);

    scene.add(liquidGroup);
    liquidGroup.renderOrder = 1; // ADD THIS LINE - ensures liquid renders after test tube
    
    // Force update the materials to ensure they're visible
    reactantMaterial.needsUpdate = true;
    liquidBottomMaterial.needsUpdate = true;
    surfaceMaterial.needsUpdate = true;
    
    // State variables
    let isFlameOn = false;
    let currentTemp = 25;
    let currentEnergy = 0;
    let currentOxygen = 0;
    let decompositionActive = false;
    let catalystActive = false; // This needs to be updated when catalyst is added

    // Oxygen bubbles container
    const bubbles: THREE.Mesh[] = [];
    const maxBubbles = 10;  // CHANGED from 20 to 10
    clockRef.current = new THREE.Clock(); // Initialize clock and store in ref

    const createBubble = () => {
      const bubbleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
      const bubbleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      
      // Spawn bubbles inside the test tube at the bottom - SMALLER RADIUS
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.20;  // CHANGED from 0.25 to 0.20 - keeps bubbles inside
      const currentVesselHeight = testTubeGroup.position.y;
      
      bubble.position.set(
        Math.cos(angle) * radius,
        currentVesselHeight + 0.15,
        Math.sin(angle) * radius
      );
      
      bubble.userData = {
        velocity: 0.015 + Math.random() * 0.025,
        wobble: Math.random() * Math.PI * 2
      };
      
      scene.add(bubble);
      bubbles.push(bubble);
    };

    const toggleFlame = () => {
      isFlameOn = !isFlameOn;
      innerFlame.visible = isFlameOn;
      outerFlame.visible = isFlameOn;
      heatHaze.visible = isFlameOn;
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
    let oldElapsedTime = 0;
    let bubbleSpawnTimer = 0;

    const animate = () => {
      const elapsedTime = clockRef.current ? clockRef.current.getElapsedTime() : 0;
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      // Update catalyst visibility based on hasCatalyst state
      catalystGroup.visible = hasCatalyst;

      // Set catalystActive when hasCatalyst changes
      if (hasCatalyst && !catalystActive) {
        catalystActive = true;
        localCatalystAddedTime = elapsedTime;
        localTransitionComplete = false;
        
        // DO NOT immediately change color - let the transition handle it
      }
      
      // Color transition: TWO PHASES
      if (catalystActive && localCatalystAddedTime > 0 && !localTransitionComplete) {
        const timeSinceCatalyst = elapsedTime - localCatalystAddedTime;
        
        // PHASE 1: MnO2 dissolution (0-3 seconds) - White → Grey
        const dissolutionDuration = 3.0;
        
        if (timeSinceCatalyst <= dissolutionDuration) {
          const dissolutionProgress = timeSinceCatalyst / dissolutionDuration;
          const eased = dissolutionProgress * dissolutionProgress * (3 - 2 * dissolutionProgress);
          
          // Dissolve from white (#ffffff) to grey (#808080)
          const whiteColor = new THREE.Color(0xffffff);
          const greyColor = new THREE.Color(0x808080);
          const currentColor = whiteColor.clone().lerp(greyColor, eased);
          
          const startEmissive = 0.5;
          const greyEmissive = 0.3;
          const currentEmissive = startEmissive + (greyEmissive - startEmissive) * eased;
          
          // Update materials during dissolution
          reactantMaterial.color.copy(currentColor);
          reactantMaterial.transparent = false;
          reactantMaterial.opacity = 1.0;
          reactantMaterial.emissiveIntensity = currentEmissive;
          reactantMaterial.needsUpdate = true;
          
          liquidBottomMaterial.color.copy(currentColor);
          liquidBottomMaterial.transparent = false;
          liquidBottomMaterial.opacity = 1.0;
          liquidBottomMaterial.emissiveIntensity = currentEmissive;
          liquidBottomMaterial.needsUpdate = true;
          
          surfaceMaterial.color.copy(currentColor);
          surfaceMaterial.transparent = false;
          surfaceMaterial.opacity = 1.0;
          surfaceMaterial.emissiveIntensity = currentEmissive * 0.7;
          surfaceMaterial.needsUpdate = true;
          
          // Fade the MnO2 particles as they "dissolve"
          if (catalystGroup.visible) {
            catalystBaseMaterial.transparent = true;
            catalystBaseMaterial.opacity = 1.0 - eased;
            catalystBaseMaterial.needsUpdate = true;
            
            particleMaterial.transparent = true;
            particleMaterial.opacity = 1.0 - eased;
            particleMaterial.needsUpdate = true;
          }
        } 
        // PHASE 2: Decomposition (3-13 seconds) - Grey → Transparent #fffbf7
        else {
          const decompositionDuration: number = 10.0;
          const decompositionTime: number = timeSinceCatalyst - dissolutionDuration;
          const decompositionProgress: number = Math.min(decompositionTime / decompositionDuration, 1.0);
          
          const eased: number = decompositionProgress * decompositionProgress * (3 - 2 * decompositionProgress);
          
          // Fade from grey (#808080) to light grey (#fffbf7)
          const greyColor = new THREE.Color(0x808080);
          const endColor = new THREE.Color(0xfffbf7);  // Changed to #fffbf7
          const currentColor = greyColor.clone().lerp(endColor, eased);
          
          // Fade opacity from solid to semi-transparent
          const startOpacity: number = 1.0;
          const endOpacity: number = 0.65;  // Slightly increased for better visibility
          const currentOpacity: number = startOpacity + (endOpacity - startOpacity) * eased;
          
          // Fade emissive to 0
          const startEmissive: number = 0.3;
          const endEmissive: number = 0.0;
          const currentEmissive: number = startEmissive + (endEmissive - startEmissive) * eased;
          
          // Update liquid materials with decomposition
          reactantMaterial.color.copy(currentColor);
          reactantMaterial.transparent = true;
          reactantMaterial.opacity = currentOpacity;
          reactantMaterial.emissiveIntensity = currentEmissive;
          reactantMaterial.needsUpdate = true;
          
          liquidBottomMaterial.color.copy(currentColor);
          liquidBottomMaterial.transparent = true;
          liquidBottomMaterial.opacity = currentOpacity;
          liquidBottomMaterial.emissiveIntensity = currentEmissive;
          liquidBottomMaterial.needsUpdate = true;
          
          surfaceMaterial.color.copy(currentColor);
          surfaceMaterial.transparent = true;
          surfaceMaterial.opacity = currentOpacity * 0.8;
          surfaceMaterial.emissiveIntensity = currentEmissive * 0.7;
          surfaceMaterial.needsUpdate = true;
          
          // Hide catalyst particles completely after dissolution
          if (catalystGroup.visible) {
            catalystGroup.visible = false;
          }
          
          if (decompositionProgress >= 1.0) {
            localTransitionComplete = true;
          }
        }
      }

      // Animate flame with realistic shader-based motion (EXACT FROM COMBUSTION EXPERIMENT)
      if (isFlameOn) {
        // Update shader time uniform for animation
        (innerFlame.material as THREE.ShaderMaterial).uniforms.time.value = elapsedTime;
        (outerFlame.material as THREE.ShaderMaterial).uniforms.time.value = elapsedTime;
        (hazeMaterial as THREE.ShaderMaterial).uniforms.time.value = elapsedTime;
        
        // Flickering intensity
        const flicker = 0.95 + Math.sin(elapsedTime * 8) * 0.05 + (Math.random() - 0.5) * 0.03;
        (innerFlame.material as THREE.ShaderMaterial).uniforms.intensity.value = flicker;
        (outerFlame.material as THREE.ShaderMaterial).uniforms.intensity.value = flicker * 0.6;
        
        // Dynamic light flickering with color shift
        const lightFlicker = 2.0 + Math.sin(elapsedTime * 10) * 0.5 + (Math.random() - 0.5) * 0.3;
        flameLight.intensity = lightFlicker;
        
        // Subtle color shift (blue to slightly cyan)
        const colorShift = Math.sin(elapsedTime * 3) * 0.1 + 0.5;
        flameLight.color.setRGB(0.2 + colorShift * 0.3, 0.4 + colorShift * 0.4, 1.0);
        
        // Scale flame based on temperature (simulated)
        const tempScale = 0.9 + (currentTemp / 500) * 0.3;
        innerFlame.scale.y = tempScale;
        outerFlame.scale.y = tempScale * 1.05;

        // Heat the vessel when close to flame
        const distanceToFlame = Math.abs(vesselHeight - 3.5);
        const heatEffect = Math.max(0, 1 - distanceToFlame / 3);
        
        currentTemp += heatingRate * deltaTime * 10 * heatEffect;
        currentEnergy = Math.min(100, currentEnergy + heatingRate * deltaTime * 5 * heatEffect);
        
        // Start decomposition when temperature reaches 60°C
        if (currentTemp >= 60 && !decompositionActive) {
          decompositionActive = true;
          setDecompositionStarted(true);
          localCatalystAddedTime = elapsedTime;  // Start the transition timer
          localTransitionComplete = false;
        }
      } else {
        // Cool down
        currentTemp = Math.max(25, currentTemp - coolingRate * deltaTime * 20);
        currentEnergy = Math.max(0, currentEnergy - coolingRate * deltaTime * 10);
        
        if (currentTemp < 60) {
          decompositionActive = false;
          setDecompositionStarted(false);
        }
      }

      // Update temperature and energy
      setTemperature(Math.round(currentTemp));
      setEnergyLevel(Math.round(currentEnergy));

      // Decomposition reaction - produce oxygen bubbles
      if (decompositionActive) {
        // Catalyst increases reaction speed and bubble production significantly
        const reactionMultiplier = catalystActive ? 4.0 : 1.0;
        const bubbleSpawnRate = catalystActive ? 0.15 : 0.25;  // CHANGED: even slower
        const maxBubblesAllowed = catalystActive ? 10 : 7;     // CHANGED: 5-10 bubbles max
        
        currentOxygen = Math.min(100, currentOxygen + deltaTime * 8 * reactionMultiplier);
        setOxygenProduction(Math.round(currentOxygen));
        
        // Spawn bubbles more frequently with catalyst
        bubbleSpawnTimer += deltaTime;
        if (bubbleSpawnTimer > bubbleSpawnRate && bubbles.length < maxBubblesAllowed) {
          createBubble();
          bubbleSpawnTimer = 0;
        }
      } else {
        currentOxygen = Math.max(0, currentOxygen - deltaTime * 5);
        setOxygenProduction(Math.round(currentOxygen));
      }

      // Animate bubbles
      bubbles.forEach((bubble, index) => {
        bubble.position.y += bubble.userData.velocity;
        bubble.userData.wobble += deltaTime * 2;
        bubble.position.x += Math.sin(bubble.userData.wobble) * 0.01;
        bubble.position.z += Math.cos(bubble.userData.wobble) * 0.01;

        // Remove bubbles that reach the top
        const currentVesselHeight = testTubeGroup.position.y; // GET ACTUAL POSITION
        if (bubble.position.y > currentVesselHeight + 2.5) {
          scene.remove(bubble);
          bubbles.splice(index, 1);
        }
      });

      // Update test tube and liquid position
      testTubeGroup.position.y = vesselHeight;
      liquidGroup.position.y = vesselHeight;

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
      bubbles.forEach(bubble => scene.remove(bubble));
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [vesselHeight, heatingRate, coolingRate, hasCatalyst]);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Panel - Instructions */}
      <div className="w-64 bg-gray-800 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Decomposition of H₂O₂</h2>

        <div className="mb-4 p-3 bg-blue-900 rounded">
          <p className="text-sm font-mono">2H₂O₂ → 2H₂O + O₂↑</p>
        </div>

        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="space-y-2 text-sm">
          <li>• Click the Bunsen burner to ignite the flame</li>
          <li>• Position vessel close to flame (height 4-5)</li>
          <li>• Heat until temperature reaches 60°C</li>
          <li>• Optionally add MnO₂ catalyst for faster reaction</li>
          <li>• Observe oxygen bubble production</li>
          <li>• Watch solution become clearer as H₂O₂ decomposes</li>
        </ul>

        <div className="mt-4 p-3 bg-yellow-900 rounded">
          <p className="text-xs">⚠️ Safety: Always wear goggles when heating chemicals</p>
        </div>
      </div>

      {/* Center - 3D Visualization */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-2xl font-bold text-white mb-2">Thermal Decomposition Reaction</h1>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
            {hasCatalyst && (
              <span className="inline-block px-3 py-1 rounded bg-purple-600 text-white">
                ⚫ MnO₂ Catalyst Added
              </span>
            )}
            <span className={`inline-block px-3 py-1 rounded ${isBurnerLit ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>
              {isBurnerLit ? '🔥 Burner Active' : '⚫ Burner Off'}
            </span>
            {decompositionStarted && (
              <span className="inline-block px-3 py-1 rounded bg-green-600 text-white animate-pulse">
                ⚗️ Decomposition Active
              </span>
            )}
          </div>
        </div>
        <div ref={mountRef} className="w-full h-full" />
      </div>

      {/* Right Panel - Controls */}
      <div className="w-80 bg-gray-800 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Experiment Controls</h2>
        
        <div className="space-y-6">
          {/* Vessel Position */}
          <div>
            <h3 className="font-semibold mb-2">Vessel Position</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVesselHeight(Math.max(4, vesselHeight - 0.5))}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition"
              >
                ↓ Lower
              </button>
              <button
                onClick={() => setVesselHeight(Math.min(7, vesselHeight + 0.5))}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition"
              >
                ↑ Lift
              </button>
            </div>
            <div className="text-center mt-2 text-sm text-gray-400">
              Height: {vesselHeight.toFixed(1)} units
            </div>
          </div>

          {/* Bunsen Burner Control */}
          <div>
            <h3 className="font-semibold mb-2">Bunsen Burner</h3>
            <button
              onClick={() => setIsBurnerLit(!isBurnerLit)}
              className={`w-full py-2 px-4 rounded font-semibold ${
                isBurnerLit ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBurnerLit ? 'Extinguish Burner' : 'Ignite Burner'}
            </button>
          </div>

          {/* Catalyst Control */}
          <div>
            <h3 className="font-semibold mb-2">Catalyst</h3>
            <button
              onClick={() => {
                setHasCatalyst(!hasCatalyst);
                if (clockRef.current) {
                  const currentTime = clockRef.current.getElapsedTime();
                  setCatalystAddedTime(currentTime);
                  catalystStateRef.current.addedTime = currentTime;
                  localCatalystAddedTime = currentTime; // Set local variable
                }
                setTransitionComplete(false);
                catalystStateRef.current.transitionCompleted = false;
                localTransitionComplete = false; // Set local variable
              }}
              className={`w-full py-2 px-4 rounded font-semibold ${
                hasCatalyst ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {hasCatalyst ? '✓ MnO₂ Added' : 'Add MnO₂ (Catalyst)'}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              MnO₂ catalyst increases reaction speed significantly
            </p>
          </div>

          {/* Heating Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Heating Rate</span>
              <span className="text-sm font-semibold">{heatingRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={heatingRate}
              onChange={(e) => setHeatingRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Cooling Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Cooling Rate</span>
              <span className="text-sm font-semibold">{coolingRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={coolingRate}
              onChange={(e) => setCoolingRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Reaction Data */}
          <div>
            <h3 className="font-semibold mb-3">Reaction Data</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Temperature</div>
                <div className="text-3xl font-bold">
                  {temperature}°C
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {temperature >= 60 ? '✓ Decomposition temperature reached' : 'Heat to 60°C to start reaction'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">Energy Level</div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${energyLevel}%` }}
                  />
                </div>
                <div className="text-right text-sm mt-1">{energyLevel}%</div>
              </div>

              <div>
                <div className="text-sm text-gray-400">O₂ Production</div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${oxygenProduction}%` }}
                  />
                </div>
                <div className="text-right text-sm mt-1">{oxygenProduction}%</div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">Observations</h3>
            <ul className="text-sm space-y-1">
              <li className={temperature > 30 ? 'text-yellow-400' : 'text-gray-500'}>
                {temperature > 30 ? '✓' : '○'} Solution warming
              </li>
              <li className={temperature >= 60 ? 'text-green-400' : 'text-gray-500'}>
                {temperature >= 60 ? '✓' : '○'} Decomposition initiated
              </li>
              <li className={hasCatalyst ? 'text-purple-400' : 'text-gray-500'}>
                {hasCatalyst ? '✓' : '○'} MnO₂ catalyst present
              </li>
              <li className={oxygenProduction > 20 ? 'text-green-400' : 'text-gray-500'}>
                {oxygenProduction > 20 ? '✓' : '○'} Oxygen bubbles visible
              </li>
              <li className={oxygenProduction > 60 ? 'text-cyan-400' : 'text-gray-500'}>
                {oxygenProduction > 60 ? '✓' : '○'} Solution clearing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecompositionExperiment;