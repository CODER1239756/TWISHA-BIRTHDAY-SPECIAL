import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Float32BufferAttribute,
  InstancedMesh,
  MathUtils,
  Object3D,
  PlaneGeometry,
  Points,
} from 'three';
import { WATER_LEVEL, heightAt, mulberry32 } from './terrain';
import { reducedMotion } from './motion';

/*
 * PLACEHOLDER (Stage 1): a procedural meadow - terrain, grass tufts, wild
 * flowers, shore boulders and drifting light motes. Stage 2 replaces the
 * props with real models (pergola, pond, trees).
 */

const GRASS_COUNT = 5200;
const FLOWER_COUNT = 280;
const STONE_COUNT = 16;
const MOTE_COUNT = 110;

const dummy = new Object3D();
const tmp = new Color();

// ---------- terrain ----------
function useTerrainGeometry() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(100, 46, 200, 92);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 3);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const lush = new Color('#5d7c34');
    const sunlit = new Color('#a9a649');
    const dry = new Color('#8f8a47');
    const sand = new Color('#c9ab78');
    const wet = new Color('#7d6a4a');
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      const patch = 0.5 + 0.5 * Math.sin(x * 0.35) * Math.cos(z * 0.4 + 1);
      c.copy(lush).lerp(dry, patch * 0.45).lerp(sunlit, MathUtils.smoothstep(-z, -6, 12) * 0.35);
      c.lerp(sand, MathUtils.smoothstep(h, WATER_LEVEL + 0.55, WATER_LEVEL + 0.1) * 0.9);
      c.lerp(wet, MathUtils.smoothstep(h, WATER_LEVEL + 0.1, WATER_LEVEL - 0.25) * 0.7);
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

// ---------- grass ----------
function tuftGeometry(): BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const nrm: number[] = [];
  const root = new Color('#3f5f22');
  const tip = new Color('#d0d27a');
  const blades = 5;
  for (let k = 0; k < blades; k++) {
    const a = (k / blades) * Math.PI * 2 + 0.4;
    const h = k % 2 ? 0.62 : 0.86;
    const lean = 0.14 + 0.06 * (k % 3);
    const w = 0.045;
    const cx = Math.cos(a) * 0.05;
    const cz = Math.sin(a) * 0.05;
    const sx = -Math.sin(a) * w; // blade width direction
    const sz = Math.cos(a) * w;
    const tx = cx + Math.cos(a) * lean;
    const tz = cz + Math.sin(a) * lean;
    pos.push(cx - sx, 0, cz - sz, cx + sx, 0, cz + sz, tx, h, tz);
    col.push(root.r, root.g, root.b, root.r, root.g, root.b, tip.r, tip.g, tip.b);
    nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nrm, 3));
  return g;
}

function Grass() {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(tuftGeometry, []);
  const uTime = useMemo(() => ({ value: 0 }), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = mulberry32(7);
    let n = 0;
    while (n < GRASS_COUNT) {
      const x = (rnd() - 0.5) * 44;
      const z = -11 + rnd() * 27; // 16 .. -11, in front of the shoreline
      const y = heightAt(x, z);
      if (y < WATER_LEVEL + 0.25) continue;
      const s = 0.7 + rnd() * 0.9;
      dummy.position.set(x, y - 0.02, z);
      dummy.rotation.set((rnd() - 0.5) * 0.25, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.25);
      dummy.scale.set(s, s * (0.8 + rnd() * 0.6), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      const v = 0.82 + rnd() * 0.3;
      tmp.setRGB(v, v * (0.96 + rnd() * 0.08), v * 0.88);
      mesh.setColorAt(n, tmp);
      n++;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    uTime.value = reducedMotion ? 0 : clock.elapsedTime;
  });

  return (
    <instancedMesh ref={ref} args={[geo, undefined, GRASS_COUNT]} frustumCulled={false}>
      <meshStandardMaterial
        vertexColors
        side={DoubleSide}
        roughness={1}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = uTime;
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uTime;')
            .replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
               float sway = position.y * position.y;
               vec4 ip = instanceMatrix[3];
               transformed.x += sin(uTime * 1.2 + ip.x * 0.5 + ip.z * 0.35) * 0.09 * sway;
               transformed.z += cos(uTime * 0.9 + ip.x * 0.3) * 0.05 * sway;`,
            );
        }}
      />
    </instancedMesh>
  );
}

// ---------- wild flowers ----------
const BLOOMS = ['#fff0d0', '#f4b3c6', '#ffffff', '#f6d36e', '#c9a8ea'];

function Flowers() {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = mulberry32(21);
    const centres = Array.from({ length: 14 }, () => ({
      x: (rnd() - 0.5) * 30,
      z: -8 + rnd() * 18,
      c: BLOOMS[Math.floor(rnd() * BLOOMS.length)],
    }));
    let n = 0;
    while (n < FLOWER_COUNT) {
      const k = centres[Math.floor(rnd() * centres.length)];
      const x = k.x + (rnd() + rnd() - 1) * 2.4;
      const z = k.z + (rnd() + rnd() - 1) * 2.4;
      const y = heightAt(x, z);
      if (y < WATER_LEVEL + 0.3) continue;
      dummy.position.set(x, y + 0.3 + rnd() * 0.3, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.7 + rnd() * 0.7);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);
      tmp.set(rnd() < 0.8 ? k.c : BLOOMS[Math.floor(rnd() * BLOOMS.length)]);
      mesh.setColorAt(n, tmp);
      n++;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, FLOWER_COUNT]} frustumCulled={false}>
      <icosahedronGeometry args={[0.055, 1]} />
      <meshStandardMaterial roughness={0.65} />
    </instancedMesh>
  );
}

// ---------- shore boulders ----------
function Stones() {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = mulberry32(5);
    for (let i = 0; i < STONE_COUNT; i++) {
      const x = (rnd() - 0.5) * 34;
      const z = -9.5 - rnd() * 2.5;
      const s = 0.25 + rnd() * rnd() * 0.9;
      dummy.position.set(x, heightAt(x, z) + s * 0.12, z);
      dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      dummy.scale.set(s * (1 + rnd() * 0.5), s * 0.6, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      const g = 0.5 + rnd() * 0.25;
      mesh.setColorAt(i, tmp.setRGB(g, g * 0.95, g * 0.86));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, STONE_COUNT]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={0.95} flatShading />
    </instancedMesh>
  );
}

// ---------- drifting light motes ----------
function Motes() {
  const ref = useRef<Points>(null);
  const { geo, base } = useMemo(() => {
    const rnd = mulberry32(99);
    const base = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      base[i * 3] = (rnd() - 0.5) * 30;
      base[i * 3 + 1] = 0.5 + rnd() * 5;
      base[i * 3 + 2] = -10 + rnd() * 20;
    }
    const g = new BufferGeometry();
    const attr = new Float32BufferAttribute(base.slice(), 3);
    attr.setUsage(DynamicDrawUsage);
    g.setAttribute('position', attr);
    return { geo: g, base };
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.elapsedTime;
    const p = geo.attributes.position;
    for (let i = 0; i < MOTE_COUNT; i++) {
      p.setXYZ(
        i,
        base[i * 3] + Math.sin(t * 0.18 + i) * 0.8,
        base[i * 3 + 1] + Math.sin(t * 0.25 + i * 1.7) * 0.4,
        base[i * 3 + 2] + Math.cos(t * 0.15 + i * 0.6) * 0.8,
      );
    }
    p.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color="#ffe2a8"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function Ground() {
  const terrain = useTerrainGeometry();
  return (
    <>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <Grass />
      <Flowers />
      <Stones />
      <Motes />
    </>
  );
}
