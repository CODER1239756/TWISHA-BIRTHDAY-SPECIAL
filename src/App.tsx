import ErrorBoundary from './ErrorBoundary';
import GardenCanvas from './scene/GardenCanvas';
import GlassShell from './ui/GlassShell';

/** Shown in place of the 3D garden if it cannot start. The interface stays. */
function SceneUnavailable() {
  return (
    <div className="stage scene-fallback" role="status">
      <p>The 3D garden could not start on this device or browser.</p>
      <p>Try a recent Safari, Chrome or Edge with hardware acceleration enabled.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ErrorBoundary label="garden scene" fallback={<SceneUnavailable />}>
        <GardenCanvas />
      </ErrorBoundary>
      <GlassShell />
    </>
  );
}
