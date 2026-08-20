"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ProofObject3D({
  reducedMotion,
}: {
  reducedMotion: boolean | null;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Cap DPR/quality on small or low-power devices so the proof field never
    // allocates an oversized canvas or burns GPU on phones/tablets.
    const constrained =
      typeof navigator !== "undefined" &&
      (navigator.hardwareConcurrency <= 4 ||
        ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
          8) <= 4);
    const maxDpr = constrained ? 1 : 1.5;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.1, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    const key = new THREE.DirectionalLight(0xc77dff, 3.2);
    key.position.set(4, 5, 6);
    const rim = new THREE.PointLight(0x38bdf8, 14, 12);
    rim.position.set(-3, 1, 4);
    scene.add(ambient, key, rim);

    const artifact = new THREE.Group();
    artifact.rotation.set(-0.16, 0.22, -0.08);
    scene.add(artifact);

    const purple = new THREE.MeshStandardMaterial({
      color: 0x3c096c,
      roughness: 0.28,
      metalness: 0.18,
      transparent: true,
      opacity: 0.94,
    });
    const violet = new THREE.MeshStandardMaterial({
      color: 0x7b2cbf,
      roughness: 0.2,
      metalness: 0.22,
      transparent: true,
      opacity: 0.64,
    });
    const sky = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.18,
      metalness: 0.12,
      transparent: true,
      opacity: 0.44,
    });

    const layers = [
      { y: -0.32, z: -0.28, rotation: -0.07, material: sky },
      { y: 0, z: 0, rotation: 0.035, material: violet },
      { y: 0.32, z: 0.28, rotation: 0.085, material: purple },
    ];
    for (const layer of layers) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 1.95, 0.16),
        layer.material,
      );
      mesh.position.set(0, layer.y, layer.z);
      mesh.rotation.z = layer.rotation;
      artifact.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.34,
        }),
      );
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      artifact.add(edges);
    }

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.72, 2),
      new THREE.MeshStandardMaterial({
        color: 0xf5efff,
        emissive: 0x7b2cbf,
        emissiveIntensity: 1.5,
        roughness: 0.18,
        metalness: 0.2,
      }),
    );
    core.position.z = 0.58;
    artifact.add(core);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
    });
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.018, 8, 128),
      ringMaterial,
    );
    ringA.rotation.x = Math.PI / 2.25;
    ringA.rotation.z = 0.2;
    ringA.position.z = 0.08;
    artifact.add(ringA);

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(1.28, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({
        color: 0xc77dff,
        transparent: true,
        opacity: 0.72,
      }),
    );
    ringB.rotation.y = Math.PI / 2.5;
    ringB.rotation.z = -0.32;
    ringB.position.z = 0.3;
    artifact.add(ringB);

    const pointPositions = new Float32Array(180 * 3);
    let seed = 17;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 180; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 2.25 + random() * 0.95;
      pointPositions[i * 3] = Math.cos(angle) * radius;
      pointPositions[i * 3 + 1] = (random() - 0.5) * 2.8;
      pointPositions[i * 3 + 2] = (random() - 0.5) * 1.4;
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(pointPositions, 3),
    );
    const points = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        color: 0x7b2cbf,
        size: 0.026,
        transparent: true,
        opacity: 0.48,
      }),
    );
    artifact.add(points);

    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: -0.16, y: 0.22 };
    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion) return;
      const rect = host.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotation.x = -0.16 + pointer.y * -0.16;
      targetRotation.y = 0.22 + pointer.x * 0.24;
    };
    host.addEventListener("pointermove", onPointerMove, { passive: true });

    let frame = 0;
    let visible = true;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.min(rect.width, 1024));
      const height = Math.max(1, Math.min(rect.height, 720));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    // Pause the render loop when the artifact scrolls out of view so offscreen
    // sections never keep a GPU context spinning.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visible;
        visible = entry.isIntersecting;
        if (visible && !wasVisible && !frame) {
          frame = window.requestAnimationFrame(animate);
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(host);

    const animate = (time: number) => {
      frame = 0;
      const seconds = time * 0.001;
      if (!reducedMotion) {
        artifact.rotation.x += (targetRotation.x - artifact.rotation.x) * 0.045;
        artifact.rotation.y += (targetRotation.y - artifact.rotation.y) * 0.045;
        artifact.position.y = Math.sin(seconds * 0.8) * 0.08;
        core.rotation.x += 0.003;
        core.rotation.y += 0.005;
        ringA.rotation.z += 0.002;
        ringB.rotation.x += 0.003;
        points.rotation.y -= 0.0008;
      }
      renderer.render(scene, camera);
      if (visible && !reducedMotion) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      purple.dispose();
      violet.dispose();
      sky.dispose();
      ringMaterial.dispose();
      pointsGeometry.dispose();
      if (renderer.domElement.parentNode === host)
        host.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.92]"
    />
  );
}
