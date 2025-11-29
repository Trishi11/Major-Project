import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Group, Vector3 } from "three";

interface DraggableEquipmentProps {
  id: string;
  type: "beaker" | "flask" | "test-tube" | "burner";
  position: [number, number, number];
  onPlace: (equipmentId: string, position: Vector3) => void;
  currentLiquid?: {
    color: string;
    level: number;
    chemicalIds?: string[]; // Add chemical IDs to determine precipitation
  };
  showPrecipitation?: boolean; // Add precipitation state
}

export const DraggableEquipment = ({
  id,
  type,
  position,
  onPlace,
  currentLiquid,
  showPrecipitation = false, // Default to false
}: DraggableEquipmentProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dragOffset = useRef(new Vector3());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    if (groupRef.current) {
      dragOffset.current.copy(groupRef.current.position).sub(
        new Vector3(e.point.x, e.point.y, e.point.z)
      );
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    if (groupRef.current) {
      onPlace(id, groupRef.current.position);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      groupRef.current.position.x = e.point.x + dragOffset.current.x;
      groupRef.current.position.y = Math.max(1, e.point.y + dragOffset.current.y);
      groupRef.current.position.z = e.point.z + dragOffset.current.z;
    }
  };

  useFrame(() => {
    if (groupRef.current && hovered && !isDragging) {
      groupRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.02);
    } else if (groupRef.current && !isDragging) {
      groupRef.current.scale.setScalar(1);
    }
  });

  const renderEquipment = () => {
    switch (type) {
      case "beaker":
        return (
          <>
            {/* Main Beaker Body - Straight cylindrical shape */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.8, 64]} />
              <meshPhysicalMaterial
                color="#e2e8f0"
                transparent
                opacity={0.45}
                roughness={0.25}
                metalness={0.05}
                transmission={0.7}
                thickness={0.15}
                ior={1.52}
                clearcoat={0.3}
                clearcoatRoughness={0.2}
                envMapIntensity={0.2}
              />
            </mesh>
            
            {/* Beaker Base - Flat circular base */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.03, 64]} />
              <meshPhysicalMaterial
                color="#e2e8f0"
                transparent
                opacity={0.45}
                roughness={0.25}
                metalness={0.05}
                transmission={0.7}
                thickness={0.15}
                ior={1.52}
              />
            </mesh>
            
            {/* Measurement Markings - Accurate volumetric markings on the side */}
            {Array.from({ length: 8 }).map((_, index) => (
              <group key={`marking-${index}`} position={[0.3, -0.35 + index * 0.1, 0]}>
                <mesh
                  position={[0, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.004, 0.004, index % 4 === 0 ? 0.1 : 0.06]} />
                  <meshStandardMaterial 
                    color={index % 4 === 0 ? "#1a202c" : "#4a5568"} 
                    roughness={0.4} 
                  />
                </mesh>
              </group>
            ))}
            
            {currentLiquid && currentLiquid.level > 0 && (
              <mesh position={[0, -0.4 + currentLiquid.level * 0.4, 0]}>
                <cylinderGeometry args={[0.28, 0.28, currentLiquid.level * 0.8, 32]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.85}
                  roughness={0.1}
                  metalness={0.01}
                  clearcoat={0.4}
                  clearcoatRoughness={0.15}
                  transmission={0.6}
                  ior={1.33}
                  depthWrite={true}
                />
              </mesh>
            )}
            
            {/* Precipitation effect for AgCl - shown when showPrecipitation is true */}
            {showPrecipitation && currentLiquid && currentLiquid.level > 0 && (
              <group position={[0, -0.4, 0]}>
                {/* Dense white layer at the bottom representing settled AgCl precipitate */}
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.28, 0.28, 0.1, 64]} />
                  <meshPhysicalMaterial
                    color="#ffffff" // Pure white for opaque AgCl precipitate
                    roughness={0.9} // Higher roughness for cloudy appearance
                    metalness={0.0} // No metalness for opaque appearance
                    transparent={false} // Opaque for realistic precipitate
                    opacity={1.0} // Fully opaque
                    transmission={0.0} // No transmission for opaque appearance
                    clearcoat={0.0} // No clearcoat for matte appearance
                    clearcoatRoughness={1.0}
                    envMapIntensity={0.0}
                    ior={1.0}
                    specularIntensity={0.0} // No specular for matte effect
                  />
                </mesh>
                
                {/* Enhanced floating cloudy particles during precipitation formation */}
                <group>
                  {/* Primary floating particles - larger, more visible particles for soft cloud effect */}
                  {Array.from({ length: 70 }).map((_, index) => (
                    <mesh
                      key={`streak-${index}`}
                      position={[
                        (Math.random() - 0.5) * 0.5,
                        0.1 + Math.random() * (currentLiquid.level * 0.8),
                        (Math.random() - 0.5) * 0.5
                      ]}
                    >
                      <sphereGeometry args={[0.03 + Math.random() * 0.07]} />
                      <meshPhysicalMaterial
                        color="#ffffff" // Pure white for AgCl precipitate
                        roughness={0.85} // High roughness for cloudy appearance
                        metalness={0.0} // No metalness for opaque appearance
                        transparent={true}
                        opacity={0.85} // Semi-transparent for floating effect
                        transmission={0.05}
                        clearcoat={0.0}
                        clearcoatRoughness={1.0}
                        envMapIntensity={0.0}
                        specularIntensity={0.0} // No specular for matte effect
                      />
                    </mesh>
                  ))}
                  
                  {/* Secondary smaller shimmering particles - for dynamic sparkle effect */}
                  {Array.from({ length: 100 }).map((_, index) => (
                    <mesh
                      key={`particle-${index}`}
                      position={[
                        (Math.random() - 0.5) * 0.6,
                        0.1 + Math.random() * (currentLiquid.level * 0.85),
                        (Math.random() - 0.5) * 0.6
                      ]}
                    >
                      <sphereGeometry args={[0.01 + Math.random() * 0.03]} />
                      <meshPhysicalMaterial
                        color="#ffffff" // Pure white for maximum shimmer
                        roughness={0.8} // High roughness for cloudy appearance
                        metalness={0.0} // No metalness for opaque appearance
                        transparent={true}
                        opacity={0.75} // More transparent for floating effect
                        transmission={0.1}
                        clearcoat={0.0}
                        clearcoatRoughness={1.0}
                        envMapIntensity={0.0}
                        specularIntensity={0.0} // No specular for matte effect
                      />
                    </mesh>
                  ))}
                  
                  {/* Tertiary micro particles - for subtle cloud-like texture */}
                  {Array.from({ length: 160 }).map((_, index) => (
                    <mesh
                      key={`micro-${index}`}
                      position={[
                        (Math.random() - 0.5) * 0.7,
                        0.1 + Math.random() * (currentLiquid.level * 0.9),
                        (Math.random() - 0.5) * 0.7
                      ]}
                    >
                      <sphereGeometry args={[0.003 + Math.random() * 0.012]} />
                      <meshPhysicalMaterial
                        color="#ffffff" // Pure white for subtle texture
                        roughness={0.85} // High roughness
                        metalness={0.0} // No metalness
                        transparent={true}
                        opacity={0.6} // More transparent
                        transmission={0.15}
                        clearcoat={0.0}
                        clearcoatRoughness={1.0}
                        envMapIntensity={0.0}
                        specularIntensity={0.0} // No specular
                      />
                    </mesh>
                  ))}
                </group>
              </group>
            )}
          </>
        );

      case "flask":
        return (
          <>
            <mesh castShadow receiveShadow>
              <coneGeometry args={[0.35, 0.7, 32]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
                transmission={0.9}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.9}
              />
            </mesh>
            {currentLiquid && (
              <mesh position={[0, -0.2, 0]}>
                <coneGeometry args={[0.33, currentLiquid.level * 0.7, 32]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            )}
          </>
        );

      case "test-tube":
        return (
          <>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.05}
                transmission={0.9}
              />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.9}
              />
            </mesh>
            {currentLiquid && (
              <mesh position={[0, -0.35 + currentLiquid.level * 0.35, 0]}>
                <cylinderGeometry args={[0.09, 0.09, currentLiquid.level * 0.7, 16]} />
                <meshPhysicalMaterial
                  color={currentLiquid.color}
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
            )}
          </>
        );

      case "burner":
        return (
          <>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
            </mesh>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderEquipment()}
      {hovered && !isDragging && (
        <pointLight position={[0, 0.5, 0]} intensity={0.3} distance={2} color="#00ffff" />
      )}
    </group>
  );
};