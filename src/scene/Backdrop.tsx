import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
} from 'three';
import { PALETTE, SKY_GLSL, SUN_DIR, createSkyUniforms } from './palette';
import { WATER_LEVEL, mulberry32 } from './terrain';
import { reducedMotion } from './motion';

/*
 * PLACEHOLDERS (Stage 1): the sky gradient, the layered mountain silhouettes
 * and the lake are procedural stand-ins. They are meant to be replaced or
 * upgraded with real models/textures in Stage 2.
 */

const shaderTail = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: createSkyUniforms(),
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          ${SKY_GLSL}
          void main() {
            gl_FragColor = vec4(skyColor(normalize(vDir)), 1.0);
            ${shaderTail}
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[900, 32, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Lake() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        fog: false,
        uniforms: {
          ...createSkyUniforms(),
          uTime: { value: 0 },
          uDeep: { value: new Color(PALETTE.lakeDeep) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vWorld;
          uniform float uTime;
          uniform vec3 uDeep;
          ${SKY_GLSL}
          void main() {
            vec3 V = normalize(vWorld - cameraPosition);
            vec2 p = vWorld.xz;
            // Cheap ripple normal. Stretched along x so far water reads as
            // calm horizontal streaks (and the sun path glitters).
            float a = sin(p.x * 0.30 + uTime * 0.50) * cos(p.y * 0.35 - uTime * 0.40);
            float b = sin(p.x * 0.90 - uTime * 0.80 + p.y * 1.10);
            float c = sin(p.x * 2.30 + uTime * 1.10) * sin(p.y * 2.10 - uTime * 0.90);
            vec3 n = normalize(vec3(
              a * 0.020 + b * 0.012 + c * 0.006,
              1.0,
              (a - b) * 0.030 + c * 0.012));
            vec3 R = reflect(V, n);
            R.y = abs(R.y);
            float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, n), 0.0), 4.0);
            vec3 col = mix(uDeep, skyColor(R), clamp(fres * 1.1 + 0.08, 0.0, 1.0));
            gl_FragColor = vec4(col, 1.0);
            ${shaderTail}
          }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, WATER_LEVEL, -450]}>
      <planeGeometry args={[2400, 900]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

interface Layer { z: number; amp: number; seed: number; crest: string; }
const LAYERS: Layer[] = [
  { z: -340, amp: 62, seed: 11, crest: '#c8b4c4' },
  { z: -260, amp: 50, seed: 23, crest: '#a597b3' },
  { z: -195, amp: 36, seed: 37, crest: '#77759b' },
];
const HAZE = new Color(PALETTE.horizon);
const BASE_Y = WATER_LEVEL - 1.5;

function ridgeGeometry({ z, amp, seed, crest }: Layer): BufferGeometry {
  const rnd = mulberry32(seed);
  const p1 = rnd() * 6.28, p2 = rnd() * 6.28, p3 = rnd() * 6.28;
  // Keep a valley where the sun sits so the glow reads over the lake.
  const sunX = (SUN_DIR.x / -SUN_DIR.z) * -z;
  const W = 800;
  const step = 5;
  const shape = new Shape();
  shape.moveTo(-W, BASE_Y);
  for (let x = -W; x <= W; x += step) {
    const n =
      0.55 * Math.sin(x * 0.0085 + p1) +
      0.30 * Math.sin(x * 0.021 + p2) +
      0.12 * Math.sin(x * 0.055 + p3) +
      0.06 * (rnd() - 0.5);
    const valley = 0.3 + 0.7 * MathUtils.smoothstep(Math.abs(x - sunX), 0, 110);
    shape.lineTo(x, BASE_Y + Math.max(0.04, 0.5 + n * 0.6) * amp * valley);
  }
  shape.lineTo(W, BASE_Y);
  shape.closePath();

  const geo = new ShapeGeometry(shape);
  // Atmospheric gradient: hazy at the waterline, tinted at the crest.
  const pos = geo.attributes.position;
  const top = new Color(crest);
  const colors: number[] = [];
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const t = MathUtils.smoothstep((pos.getY(i) - BASE_Y) / amp, 0.0, 0.55);
    c.copy(HAZE).lerp(top, t);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geo;
}

function Mountains() {
  const geos = useMemo(() => LAYERS.map(ridgeGeometry), []);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={LAYERS[i].z} geometry={g} position={[0, 0, LAYERS[i].z]}>
          <meshBasicMaterial vertexColors fog={false} />
        </mesh>
      ))}
    </>
  );
}

export default function Backdrop() {
  return (
    <>
      <Sky />
      <Mountains />
      <Lake />
    </>
  );
}
