"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface NotFoundEffectProps {
  src: string;
}

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Recreates mimeyoi's pixi 404 stack (DisplacementFilter + RGBSplit + Pixelate +
// Noise inside a cursor-follow lens) in one fragment shader.
const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

vec2 coverUv(vec2 frag) {
  float s = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 size = uImg * s;
  vec2 origin = (uRes - size) * 0.5;
  return (frag - origin) / size;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float vmag = length(uVel);
  float amt = clamp(vmag / 60.0, 0.0, 1.0);

  float d = distance(frag, uMouse);
  float lensR = mix(0.14, 0.34, amt) * max(uRes.x, uRes.y);
  float lens = smoothstep(lensR, lensR * 0.15, d);

  float px = mix(1.0, 16.0, amt) * lens;
  vec2 fragQ = px > 1.0 ? floor(frag / px) * px + px * 0.5 : frag;

  vec2 np = fragQ * 0.006 + uTime * 0.12;
  vec2 disp = (vec2(noise(np), noise(np + 19.7)) - 0.5) * 2.0;
  vec2 warped = fragQ + disp * lens * amt * 46.0;

  vec2 uv = coverUv(warped);
  vec2 split = uVel * 0.0007 * (0.35 + lens);

  float r = texture2D(uTex, clamp(uv + split, 0.001, 0.999)).r;
  float g = texture2D(uTex, clamp(uv, 0.001, 0.999)).g;
  float b = texture2D(uTex, clamp(uv - split, 0.001, 0.999)).b;

  float grain = (hash(frag + fract(uTime) * 61.7) - 0.5) * amt * 0.14;
  gl_FragColor = vec4(vec3(r, g, b) + grain, 1.0);
}`;

export function NotFoundEffect({ src }: NotFoundEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) {
      return;
    }

    let raf = 0;
    let disposed = false;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uni = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uni("uRes");
    const uImg = uni("uImg");
    const uMouse = uni("uMouse");
    const uVel = uni("uVel");
    const uTime = uni("uTime");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...mouse };
    const vel = { x: 0, y: 0 };
    let lastMove = { x: target.x, y: target.y };

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      vel.x += event.clientX - lastMove.x;
      vel.y += event.clientY - lastMove.y;
      lastMove = { x: event.clientX, y: event.clientY };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;

    image.onload = () => {
      if (disposed) {
        return;
      }

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove, { passive: true });
      canvas.style.opacity = "1";

      const start = performance.now();
      const frame = (now: number) => {
        const dpr = canvas.width / Math.max(1, canvas.clientWidth);
        mouse.x += (target.x - mouse.x) * 0.16;
        mouse.y += (target.y - mouse.y) * 0.16;
        vel.x *= 0.9;
        vel.y *= 0.9;

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uImg, image.naturalWidth, image.naturalHeight);
        gl.uniform2f(uMouse, mouse.x * dpr, mouse.y * dpr);
        gl.uniform2f(uVel, vel.x, vel.y);
        gl.uniform1f(uTime, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        raf = window.requestAnimationFrame(frame);
      };
      raf = window.requestAnimationFrame(frame);
    };

    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reducedMotion, src]);

  if (reducedMotion) {
    return null;
  }

  return <canvas ref={canvasRef} className="error-page__canvas" aria-hidden="true" />;
}
