import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const Globe: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.2;
    }
  });

  return (
    <group>
      {/* Ambient lighting for the premium dark feel */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#D4AF37" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />

      {/* The Globe */}
      <Sphere ref={sphereRef} args={[2.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#050505"
          emissive="#111"
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={1.5}
          wireframe={true}
        />
      </Sphere>

      {/* Glow effect behind the globe */}
      <Sphere args={[2.6, 32, 32]}>
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.05} />
      </Sphere>
    </group>
  );
};
