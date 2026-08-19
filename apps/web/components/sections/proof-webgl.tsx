"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";

type ProofWebGLProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  reducedMotion: boolean | null;
};

const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;
  uniform float u_motion;

  float line(float value, float width) {
    return 1.0 - smoothstep(0.0, width, abs(value));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;

    vec2 mouse = u_pointer - 0.5;
    mouse.x *= u_resolution.x / u_resolution.y;

    float distanceToMouse = length(p - mouse);
    float interaction = exp(-distanceToMouse * 4.6);
    float time = u_time * u_motion;

    float ripple = sin(distanceToMouse * 38.0 - time * 3.0) * interaction;
    float field = sin(p.x * 8.0 + p.y * 4.0 + time * 0.44);
    field += sin(p.y * 14.0 - p.x * 2.5 - time * 0.27) * 0.46;
    field += ripple * 2.0;

    float contour = line(sin(field * 3.2), 0.072);
    float meshA = line(sin((p.x + ripple * 0.065) * 34.0), 0.018) * 0.22;
    float meshB = line(sin((p.y - ripple * 0.065) * 34.0), 0.018) * 0.22;

    float orbit = line(length(p - mouse) - (0.13 + sin(time * 1.4) * 0.012), 0.006) * interaction;
    float glow = interaction * (0.34 + 0.16 * sin(time * 2.0));

    vec3 purple = vec3(0.235, 0.035, 0.424);
    vec3 violet = vec3(0.486, 0.173, 0.749);
    vec3 sky = vec3(0.22, 0.741, 0.969);
    vec3 color = mix(purple, violet, uv.x * 0.68 + glow * 0.32);
    color = mix(color, sky, interaction * 0.56 + meshB * 0.18);

    float alpha = contour * 0.33 + meshA + meshB + glow * 0.55 + orbit * 0.9;
    alpha *= smoothstep(1.15, 0.2, length(p));

    gl_FragColor = vec4(color, alpha);
  }
`;

function createProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const vertex = compile(gl.VERTEX_SHADER, vertexShader);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/**
 * Static stand-in for the live proof field. Shown to anonymous visitors (and
 * while auth state is still resolving) so we never ship the heavy WebGL canvas
 * to a signed-out user — and never flash it before we know who they are.
 */
function StaticPoster() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-95 [mask-image:radial-gradient(ellipse_78%_74%_at_70%_44%,black,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(124,58,237,0.30),transparent_46%),radial-gradient(circle_at_72%_36%,rgba(199,125,255,0.22),transparent_42%),radial-gradient(circle_at_78%_54%,rgba(56,189,248,0.18),transparent_44%),radial-gradient(circle_at_50%_82%,rgba(60,9,108,0.30),transparent_52%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_70%_70%_at_60%_45%,black,transparent)]" />
    </div>
  );
}

/**
 * Lightweight raw-WebGL field. The fragment shader becomes a static proof-map
 * when reduced motion is requested; on fine pointers it responds to the cursor.
 * The heavy canvas is gated to authenticated visitors — anon users get the
 * StaticPoster instead.
 */
export function ProofWebGL({ containerRef, reducedMotion }: ProofWebGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);
  const { user, loading } = useAuth();

  // Anonymous or still-resolving auth: render the static poster. This avoids a
  // flash-of-heavy-canvas for signed-out visitors and keeps authed users on the
  // live animation.
  const showStatic = loading || !user;

  useEffect(() => {
    if (showStatic) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setSupported(false);
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      setSupported(false);
      return;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      setSupported(false);
      return;
    }

    const pointer = { x: 0.72, y: 0.36 };
    const media = window.matchMedia("(pointer: fine)");
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const constrained = navigator.hardwareConcurrency <= 4 || deviceMemory <= 4;
    const maxDpr = constrained ? 1 : 1.55;
    let width = 0;
    let height = 0;
    let frame = 0;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    const motion = gl.getUniformLocation(program, "u_motion");

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const draw = (now = 0) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolution, width, height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(time, now * 0.001);
      gl.uniform1f(motion, reducedMotion ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || !media.matches) return;
      const rect = container.getBoundingClientRect();
      pointer.x = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      pointer.y =
        1 - Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    };

    const render = (now: number) => {
      draw(now);
      if (!reducedMotion) frame = window.requestAnimationFrame(render);
    };

    resize();
    draw();
    if (!reducedMotion) frame = window.requestAnimationFrame(render);

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [containerRef, reducedMotion, showStatic]);

  if (showStatic) {
    return <StaticPoster />;
  }

  if (!supported) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(124,58,237,0.2),transparent_22%),radial-gradient(circle_at_78%_52%,rgba(56,189,248,0.16),transparent_27%)]"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-95 [mask-image:radial-gradient(ellipse_78%_74%_at_70%_44%,black,transparent)]"
    />
  );
}
