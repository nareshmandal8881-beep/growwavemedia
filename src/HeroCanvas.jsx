import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { MeshTransmissionMaterial, Float, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ── Floating Physics Object ──────────────────────────────── */
function PhysicsBox({ position, args, color, emissive }) {
  const ref = useRef();
  return (
    <RigidBody position={position} restitution={0.6} friction={0.2} linearDamping={0.3} angularDamping={0.4}>
      <mesh ref={ref} castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </RigidBody>
  );
}

function PhysicsSphere({ position, radius, color, emissive }) {
  return (
    <RigidBody position={position} restitution={0.75} friction={0.1} linearDamping={0.4} angularDamping={0.5}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>
    </RigidBody>
  );
}

function GlassCard({ position, rotation }) {
  const ref = useRef();
  return (
    <RigidBody position={position} rotation={rotation} restitution={0.5} friction={0.3} linearDamping={0.5} angularDamping={0.6}>
      <mesh ref={ref} castShadow>
        <boxGeometry args={[1.8, 1.1, 0.08]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          metalness={0.1}
          roughness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}

/* ── Camera Parallax ──────────────────────────────────────── */
function CameraRig({ mouseRef }) {
  const { camera } = useThree();
  useFrame(() => {
    if (!mouseRef.current) return;
    camera.position.x += (mouseRef.current.x * 2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseRef.current.y * 1.5 - camera.position.y) * 0.03;
    camera.lookAt(0, -3, 0);
  });
  return null;
}

/* ── Neon Ring Particles ──────────────────────────────────── */
function ParticleField() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return arr;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00d4ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Ground Plane ─────────────────────────────────────────── */
function Ground() {
  return (
    <RigidBody type="fixed" restitution={0.5} friction={0.4}>
      <CuboidCollider args={[30, 0.5, 10]} position={[0, -8, 0]} />
    </RigidBody>
  );
}

/* ── Floating decorative ring (no physics) ────────────────── */
function DecorRing({ position, radius, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.4;
      ref.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[radius, 0.03, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </Float>
  );
}

/* ── Main Canvas ──────────────────────────────────────────── */
export default function HeroCanvas({ mouseRef }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 12], fov: 60 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[-6, 8, 4]} intensity={40} color="#00d4ff" castShadow />
      <pointLight position={[6, 6, 2]}  intensity={30} color="#8b5cf6" />
      <pointLight position={[0, -2, 6]} intensity={20} color="#f97316" />

      <Stars radius={80} depth={30} count={3000} factor={2} saturation={0} fade speed={0.5} />
      <ParticleField />

      {/* Decorative rings */}
      <DecorRing position={[-7, 3, -3]} radius={1.8} color="#00d4ff" />
      <DecorRing position={[7, 1, -2]}  radius={1.2} color="#8b5cf6" />
      <DecorRing position={[0, 5, -5]}  radius={2.5} color="#f97316" />

      {/* Camera parallax */}
      <CameraRig mouseRef={mouseRef} />

      {/* Physics world */}
      <Physics gravity={[0, -4, 0]}>
        <Ground />

        {/* Boxes */}
        <PhysicsBox position={[-4,  8, 0]} args={[0.9, 0.9, 0.9]} color="#00d4ff" emissive="#00d4ff" />
        <PhysicsBox position={[3,  10, 1]} args={[1.1, 1.1, 1.1]} color="#8b5cf6" emissive="#8b5cf6" />
        <PhysicsBox position={[-1,  12, -1]} args={[0.7, 0.7, 0.7]} color="#f97316" emissive="#f97316" />
        <PhysicsBox position={[5, 9, -0.5]} args={[0.6, 0.6, 0.6]} color="#ec4899" emissive="#ec4899" />
        <PhysicsBox position={[-6, 11, 0.5]} args={[0.8, 0.8, 0.8]} color="#00d4ff" emissive="#00d4ff" />

        {/* Spheres */}
        <PhysicsSphere position={[1,   14, 0.5]} radius={0.55} color="#8b5cf6" emissive="#8b5cf6" />
        <PhysicsSphere position={[-3,  13, -0.5]} radius={0.45} color="#00d4ff" emissive="#00d4ff" />
        <PhysicsSphere position={[4,   15, 1]} radius={0.7} color="#f97316" emissive="#f97316" />
        <PhysicsSphere position={[-5,  16, 0]} radius={0.4} color="#ec4899" emissive="#ec4899" />

        {/* Glass cards */}
        <GlassCard position={[2,  9, 0.3]} rotation={[0.2, 0.3, 0.1]} />
        <GlassCard position={[-2, 11, -0.2]} rotation={[-0.1, -0.2, 0.2]} />
        <GlassCard position={[0,  13, 0.5]} rotation={[0.1, 0.1, -0.15]} />
      </Physics>
    </Canvas>
  );
}
