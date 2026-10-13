'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  BufferGeometry,
  Float32BufferAttribute,
  InstancedMesh,
  Group,
  Object3D,
  Color,
  MathUtils,
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three';
import type { ArtDriver } from './Sculpture';
import { sculpturePose } from '@/lib/sculpture-poses';
export type SceneProps = {
  variant: 'hero' | 'chapter' | 'study';
  driver: ArtDriver;
  active: boolean;
  paused: boolean;
  mobile: boolean;
  onReady: () => void;
  onFailure: () => void;
};

class ArtBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Lamellae({ driver, active, paused, mobile, variant, onReady }: SceneProps) {
  const mesh = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const progress = useRef(driver.progress);
  const response = useRef(9.5);
  const pointer = useRef({ x: 0, y: 0 });
  const { invalidate } = useThree();
  const count = mobile ? 28 : 42;
  const dummy = useMemo(() => new Object3D(), []);
  useEffect(() => {
    const duration =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--motion-sculpture'),
      ) || 800;
    response.current = Math.log(1 / 0.0005) / (Math.max(1, duration) / 1000);
  }, []);
  // One curved ribbon geometry + one shared material, instanced for all layers.
  const geometry = useMemo(() => {
    const vertices: number[] = [],
      indices: number[] = [];
    const segments = mobile ? 72 : 112;
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 1.7 - Math.PI * 0.86;
      for (let edge = 0; edge < 2; edge++) {
        const w = (edge - 0.5) * ((2.6 / (count - 1)) * 0.58);
        vertices.push(
          Math.sin(theta) * 1.8 + w * 0.5,
          Math.cos(theta) * 2.45 + 0.52 * Math.sin(theta * 2) + w * 0.14 - 0.2,
          Math.sin(theta * 1.35) * 0.82 + w * 0.7,
        );
      }
      if (s < segments) {
        const a = s * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [mobile, count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    if (!mesh.current) return;
    const dark = new Color('#487657'),
      light = new Color('#dce7bd');
    for (let i = 0; i < count; i++)
      mesh.current.setColorAt(i, dark.clone().lerp(light, i / (count - 1)));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [count, invalidate]);
  useEffect(() => {
    const request = () => {
      if (active && !paused && !document.hidden) invalidate();
    };
    driver.requestRender = request;
    const visibility = () => {
      if (!document.hidden) request();
    };
    request();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      if (driver.requestRender === request) delete driver.requestRender;
    };
  }, [active, paused, driver, invalidate]);

  const delivered = useRef(false);
  useFrame((state, delta) => {
    if (!mesh.current || !group.current) return;
    if (paused && delivered.current) return;
    if (document.hidden || (!active && delivered.current)) return;
    const dt = Math.min(delta, 0.05);
    progress.current =
      variant === 'study' || driver.immediate
        ? driver.progress
        : MathUtils.damp(progress.current, driver.progress, response.current, dt);
    const target = variant === 'hero' && !mobile ? driver.pointer : undefined;
    pointer.current.x = MathUtils.damp(pointer.current.x, target?.x || 0, 8, dt);
    pointer.current.y = MathUtils.damp(pointer.current.y, target?.y || 0, 8, dt);
    const pose = sculpturePose(progress.current);
    for (let i = 0; i < count; i++) {
      const q = i / (count - 1) - 0.5;
      dummy.position.set(
        q * 1.32 * pose.spread,
        q * pose.rise * pose.spread,
        q * pose.depth * pose.spread,
      );
      dummy.rotation.set(0, q * pose.twist, q * pose.roll);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    // Pointer response is capped at three degrees and settles without an idle loop.
    group.current.rotation.set(
      pose.x + (pointer.current.y * Math.PI) / 60,
      pose.y + (pointer.current.x * Math.PI) / 60,
      pose.z,
    );
    group.current.scale.setScalar(variant !== 'hero' ? 0.82 : mobile ? 0.86 : 1);
    if (!delivered.current) {
      delivered.current = true;
      requestAnimationFrame(onReady);
    }
    const settling =
      Math.abs(progress.current - driver.progress) > 0.0005 ||
      Math.abs(pointer.current.x - (target?.x || 0)) > 0.0005 ||
      Math.abs(pointer.current.y - (target?.y || 0)) > 0.0005;
    if (settling && active && !paused) invalidate();
  });
  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.28}
          roughness={0.38}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          side={2}
        />
      </instancedMesh>
    </group>
  );
}
export default function SculptureScene(props: SceneProps) {
  return (
    <ArtBoundary onFailure={props.onFailure}>
      <Canvas
        className="sculpture-canvas"
        frameloop="demand"
        dpr={[1, props.mobile ? 1.25 : 1.5]}
        camera={{ position: [0, 0, 12.2], fov: 32, near: 0.1, far: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
          preserveDrawingBuffer:
            typeof window !== 'undefined' && new URLSearchParams(location.search).has('poster'),
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.domElement.addEventListener('webglcontextlost', props.onFailure, { once: true });
        }}
      >
        <ambientLight color="#d5e3c4" intensity={1.5} />
        <directionalLight color="#f5ffe8" intensity={4.4} position={[-4, 5, 6]} />
        <directionalLight color="#d9efa6" intensity={2.7} position={[5, 1, -2]} />
        <directionalLight color="#8cb89c" intensity={1.3} position={[-4, -3, 2]} />
        <Lamellae {...props} />
      </Canvas>
    </ArtBoundary>
  );
}
