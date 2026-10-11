import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { heightAt } from './terrain';

type SeedTarget = {
  id: number;
  x: number;
  z: number;
};

const START: [number, number, number] = [0, 0.7, 7];

function BloomingSeed({ target }: { target: SeedTarget }) {
  const seed = useRef<Mesh>(null);
  const bloom = useRef<Group>(null);
  const elapsed = useRef(0);
  const baseY = heightAt(target.x, target.z);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const flightDuration = 1.45;
    const progress = Math.min(elapsed.current / flightDuration, 1);
    const eased = progress * progress * (3 - 2 * progress);

    if (seed.current) {
      seed.current.position.set(
        START[0] + (target.x - START[0]) * eased,
        START[1] + (baseY + 0.25 - START[1]) * eased + Math.sin(progress * Math.PI) * 1.8,
        START[2] + (target.z - START[2]) * eased,
      );
      if (progress >= 1) seed.current.visible = false;
    }

    if (bloom.current && progress >= 1) {
      bloom.current.visible = true;
      const growth = Math.min((elapsed.current - flightDuration) / 0.9, 1);
      const easedGrowth = growth * growth * (3 - 2 * growth);
      bloom.current.scale.setScalar(easedGrowth);
    }
  });

  return (
    <>
      <mesh ref={seed} position={START}>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial
          color="#fff0b5"
          emissive="#ffbd4a"
          emissiveIntensity={2.2}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      <group
        ref={bloom}
        position={[target.x, baseY, target.z]}
        visible={false}
        scale={0}
      >
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.045, 0.76, 7]} />
          <meshStandardMaterial color="#527b3d" roughness={0.9} />
        </mesh>
        <mesh position={[-0.12, 0.3, 0]} rotation={[0, 0, -0.55]} scale={[1, 0.45, 0.7]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#7caa55" roughness={0.85} />
        </mesh>
        <mesh position={[0.12, 0.48, 0]} rotation={[0, 0, 0.55]} scale={[1, 0.45, 0.7]}>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshStandardMaterial color="#9abb62" roughness={0.85} />
        </mesh>
        {Array.from({ length: 5 }, (_, index) => {
          const angle = (index / 5) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.cos(angle) * 0.17, 0.82, Math.sin(angle) * 0.17]}
              scale={[0.82, 0.62, 1]}
            >
              <sphereGeometry args={[0.13, 12, 10]} />
              <meshStandardMaterial
                color={['#fff0cf', '#f4b5c5', '#ffe3a0', '#fff8e7', '#e9b8d4'][index]}
                emissive="#e8a8a2"
                emissiveIntensity={0.12}
                roughness={0.55}
              />
            </mesh>
          );
        })}
        <mesh position={[0, 0.83, 0]}>
          <sphereGeometry args={[0.095, 14, 12]} />
          <meshStandardMaterial color="#f8c85e" emissive="#b77b23" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </>
  );
}

export default function ThoughtSeeds() {
  const [seeds, setSeeds] = useState<SeedTarget[]>([]);

  useEffect(() => {
    const onThought = () => {
      setSeeds((current) => [
        ...current,
        {
          id: Date.now() + Math.random(),
          x: (Math.random() - 0.5) * 12,
          z: -1 + Math.random() * 6,
        },
      ]);
    };
    window.addEventListener('garden:thought-seed', onThought);
    return () => window.removeEventListener('garden:thought-seed', onThought);
  }, []);

  return (
    <>
      {seeds.map((target) => (
        <BloomingSeed key={target.id} target={target} />
      ))}
    </>
  );
}
