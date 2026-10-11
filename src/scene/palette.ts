import { Color, Vector3 } from 'three';

/** Direction from the scene towards the low golden-hour sun (front-left). */
export const SUN_DIR = new Vector3(-0.38, 0.16, -1).normalize();

export const PALETTE = {
  zenith: '#5f8fc4',
  mid: '#d4cfdc',
  horizon: '#f7c58f',
  sun: '#ffd7a0',
  lakeDeep: '#2d6577',
} as const;

/** Uniforms shared by the sky dome and the lake so they always agree. */
export function createSkyUniforms() {
  return {
    uZenith: { value: new Color(PALETTE.zenith) },
    uMid: { value: new Color(PALETTE.mid) },
    uHorizon: { value: new Color(PALETTE.horizon) },
    uSunColor: { value: new Color(PALETTE.sun) },
    uSunDir: { value: SUN_DIR.clone() },
  };
}

/** GLSL: sky colour for a view direction. Used by the sky and lake shaders. */
export const SKY_GLSL = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;

vec3 skyColor(vec3 d) {
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHorizon, uMid, smoothstep(0.0, 0.22, h));
  c = mix(c, uZenith, smoothstep(0.18, 0.85, h));
  float s = max(dot(d, uSunDir), 0.0);
  c += uSunColor * (pow(s, 2500.0) * 6.0 + pow(s, 300.0) * 1.2 + pow(s, 14.0) * 0.38);
  return c;
}
`;
