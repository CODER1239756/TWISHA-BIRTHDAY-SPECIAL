import { Canvas } from '@react-three/fiber';
import ThoughtSeeds from './ThoughtSeeds';
import { NeutralToneMapping } from 'three';
import Backdrop from './Backdrop';
import CameraRig from './CameraRig';
import Ground from './Ground';
import { PALETTE, SUN_DIR } from './palette';

const SUN_POS: [number, number, number] = [SUN_DIR.x * 80, SUN_DIR.y * 80, SUN_DIR.z * 80];

/** True when the browser can create a WebGL context at all. */
function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    // Release the probe context so it doesn't count against the browser's limit.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export default function GardenCanvas() {
  // Throwing here is caught by the boundary in App, which keeps the UI visible.
  if (!webglAvailable()) throw new Error('WebGL is not available in this browser');
  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        // Cap pixel ratio: iPads are 2x; 1.5 keeps fill-rate affordable.
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 2.2, 10], fov: 48, near: 0.1, far: 2000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          // Neutral keeps the golden-hour palette from washing out.
          gl.toneMapping = NeutralToneMapping;
        }}
      >
        <fog attach="fog" args={[PALETTE.horizon, 45, 220]} />

        {/* One warm low sun (the only shadow caster) + soft sky fill. */}
        <directionalLight
          position={SUN_POS}
          intensity={3.2}
          color="#ffd393"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={1}
          shadow-camera-far={170}
          shadow-bias={-0.0004}
          shadow-normalBias={0.05}
        />
        <hemisphereLight args={['#cfd9ee', '#8c6c3c', 1.25]} />

        <Backdrop />
        <Ground />
        <ThoughtSeeds />
        <CameraRig />
      </Canvas>
    </div>
  );
}
