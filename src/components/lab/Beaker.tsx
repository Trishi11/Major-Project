import { useRef, useState } from "react";
import { Mesh, Group } from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { toast } from "sonner";

interface BeakerProps {
  position: [number, number, number];
  color: string;
  fillLevel: number;
  showPrecipitation?: boolean; // Add precipitation state
}

export const Beaker = ({ position, color, fillLevel, showPrecipitation = false }: BeakerProps) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    toast.success(`Beaker selected - ${Math.round(fillLevel * 100)}% filled`);
  };

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.002;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
      }}
      onPointerUp={() => setIsDragging(false)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Main Beaker Body - Straight cylindrical shape */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 1, 64]} />
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
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 64]} />
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

      {/* Liquid Inside */}
      {fillLevel > 0 && (
        <mesh position={[0, -0.5 + (fillLevel * 0.95) / 2, 0]}>
          <cylinderGeometry args={[0.38, 0.38, fillLevel * 0.95, 32]} />
          <meshPhysicalMaterial
            color={color}
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
      {showPrecipitation && fillLevel > 0 && (
        <group position={[0, -0.5, 0]}>
          {/* Dense white layer at the bottom representing settled AgCl precipitate */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.1, 64]} />
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
                  (Math.random() - 0.5) * 0.6,
                  0.1 + Math.random() * (fillLevel * 0.85),
                  (Math.random() - 0.5) * 0.6
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
                  (Math.random() - 0.5) * 0.7,
                  0.1 + Math.random() * (fillLevel * 0.9),
                  (Math.random() - 0.5) * 0.7
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
                  (Math.random() - 0.5) * 0.8,
                  0.1 + Math.random() * (fillLevel * 0.95),
                  (Math.random() - 0.5) * 0.8
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

      {/* Measurement Markings - Accurate volumetric markings on the side */}
      {Array.from({ length: 10 }).map((_, index) => (
        <group key={`marking-${index}`} position={[0.4, -0.45 + index * 0.1, 0]}>
          <mesh
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.005, 0.005, index % 5 === 0 ? 0.12 : 0.07]} />
            <meshStandardMaterial 
              color={index % 5 === 0 ? "#1a202c" : "#4a5568"} 
              roughness={0.4} 
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};