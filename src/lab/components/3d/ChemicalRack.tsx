'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Chemical } from '@/types'
import { CHEMICALS } from '@/data/chemicalData'
import ChemicalBottle from './equipment/ChemicalBottle'

interface ChemicalRackProps {
  position: [number, number, number]
  chemicals: string[] // Array of chemical IDs to display
  onChemicalPour?: (chemical: Chemical) => void
}

export default function ChemicalRack({
  position,
  chemicals,
  onChemicalPour
}: ChemicalRackProps) {
  
  // Create rack geometry
  const rackGeometry = useMemo(() => {
    const group = new THREE.Group()
    
    // Base platform (larger and more prominent)
    const baseGeometry = new THREE.BoxGeometry(3.5, 0.15, 1)
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: '#8B4513',
      emissive: '#2D1810',
      emissiveIntensity: 0.1
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0
    group.add(base)
    
    // Back panel (higher)
    const backGeometry = new THREE.BoxGeometry(3.5, 0.8, 0.1)
    const back = new THREE.Mesh(backGeometry, baseMaterial)
    back.position.set(0, 0.475, -0.45)
    group.add(back)
    
    // Side supports
    const sideGeometry = new THREE.BoxGeometry(0.1, 0.8, 1)
    const leftSide = new THREE.Mesh(sideGeometry, baseMaterial)
    leftSide.position.set(-1.7, 0.475, 0)
    group.add(leftSide)
    
    const rightSide = new THREE.Mesh(sideGeometry, baseMaterial)
    rightSide.position.set(1.7, 0.475, 0)
    group.add(rightSide)
    
    // Bottle holders (more pronounced)
    const holderRadius = 0.22
    const holderGeometry = new THREE.CylinderGeometry(holderRadius, holderRadius, 0.08, 12)
    const holderMaterial = new THREE.MeshPhongMaterial({ 
      color: '#654321',
      emissive: '#1A0F0A',
      emissiveIntensity: 0.05
    })
    
    const spacing = 0.9
    const startX = -1.35
    for (let i = 0; i < 4; i++) {
      const holder = new THREE.Mesh(holderGeometry, holderMaterial)
      holder.position.set(startX + i * spacing, 0.115, 0)
      group.add(holder)
    }
    
    // Add decorative elements
    const labelGeometry = new THREE.PlaneGeometry(3, 0.3)
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: '#2D4A87',
      transparent: true,
      opacity: 0.8
    })
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial)
    labelMesh.position.set(0, 0.6, -0.46)
    group.add(labelMesh)
    
    return group
  }, [])

  // Get chemical objects
  const chemicalObjects = useMemo(() => {
    return chemicals.map(chemId => CHEMICALS[chemId.toUpperCase()]).filter(Boolean)
  }, [chemicals])

  return (
    <group position={position}>
      {/* Rack structure */}
      <primitive object={rackGeometry} />
      
      {/* Chemical bottles */}
      {chemicalObjects.map((chemical, index) => {
        const spacing = 0.9
        const startX = -1.35
        const bottlePosition: [number, number, number] = [
          startX + index * spacing,
          0.7,
          0
        ]
        
        return (
          <ChemicalBottle
            key={chemical.id}
            chemical={chemical}
            position={bottlePosition}
            scale={[0.9, 0.9, 0.9]}
            onPour={onChemicalPour}
          />
        )
      })}
      
      {/* Rack title */}
      <mesh position={[0, 0.9, -0.47]}>
        <planeGeometry args={[2.5, 0.25]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}