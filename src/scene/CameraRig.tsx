import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { reducedMotion } from './motion';

const BASE = new Vector3(0, 2.2, 10);
const LOOK = new Vector3(0, 2.4, -40);
const target = new Vector3();

/**
 * Slow idle drift plus a soft parallax that follows the pointer/finger.
 * Pure camera motion: no controls, so touch never fights the page.
 */
export default function CameraRig() {
  useFrame((state, dt) => {
    const { camera, pointer, clock } = state;
    const t = reducedMotion ? 0 : clock.elapsedTime;
    const px = reducedMotion ? 0 : pointer.x;
    const py = reducedMotion ? 0 : pointer.y;

    const x = BASE.x + Math.sin(t * 0.09) * 0.7 + px * 0.9;
    const y = BASE.y + Math.sin(t * 0.07) * 0.12 + py * 0.25;
    camera.position.x = MathUtils.damp(camera.position.x, x, 2, dt);
    camera.position.y = MathUtils.damp(camera.position.y, y, 2, dt);
    camera.position.z = BASE.z;

    target.set(LOOK.x + px * 3, LOOK.y + py * 0.8, LOOK.z);
    camera.lookAt(target);
  });
  return null;
}
