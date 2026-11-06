import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../lib/ticker';
import { useInView, useReducedMotion } from '../lib/hooks';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

// Ridges are contour lines of a multi-scale blur of the glyph mask, so they hug each letter like a fingerprint.
const FRAG = `
precision highp float;
uniform sampler2D uSharp, uSoft, uPhoto;
uniform vec2 uRes, uMouse;
uniform vec3 uInk;
uniform vec4 uIntro, uLabel, uPortrait;
uniform float uLens, uClarity, uTime, uDpr;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y); }
bool inside(vec2 p, vec4 box){ return all(greaterThanEqual(p,box.xy)) && all(lessThan(p,box.zw)); }
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  if (inside(px, uIntro) || inside(px, uLabel)) { gl_FragColor = vec4(0.); return; }
  float d = length(px - uMouse);
  float lens = uLens > 0. ? 1. - smoothstep(uLens * .55, uLens, d) : 0.;
  float c = clamp(max(uClarity, lens), 0., 1.);
  float block = max(1., floor(mix(26., 1., pow(c, .7)) * uDpr));
  vec2 cell = floor(px / block);
  vec2 q = (cell + .5) * block;
  vec2 uv = q / uRes;
  float grain = hash(cell + floor(uTime * 9.));
  float detail = smoothstep(.25, .75, c);
  float stat = step(1. - .06 * (1. - c), grain);
  vec2 drift = q / (90. * uDpr) + vec2(uTime * .04, -uTime * .03);
  vec4 sig = vec4(1., .231, .071, 1.);
  vec4 col;
  if (inside(px, uPortrait)) {
    vec2 uvPhoto = clamp((q-uPortrait.xy)/(uPortrait.zw-uPortrait.xy), 0., 1.);
    vec2 photo = texture2D(uPhoto, uvPhoto).rg;
    float tone = clamp(photo.r+(grain-.5)*.20*(1.-c), 0., 1.);
    if (detail > 0.) {
      float contour = smoothstep(.05,.55,sin(photo.g*120.+vnoise(drift)*6.-uTime*.5));
      tone = mix(tone, tone*mix(.36,1.14,contour), .57*detail);
    }
    col = vec4(mix(uInk,vec3(.96,.92,.85),clamp(tone,0.,1.)),1.);
  } else {
    float sharp = texture2D(uSharp, uv).r;
    float soft = texture2D(uSoft, uv).r;
    // Outside the lettering, only the grain and lens ring can contribute.
    col = vec4(uInk, 1.) * stat * .55;
    if (sharp > .045 || soft > .02) {
      float line = smoothstep(.05, .55, sin(soft * 120. + vnoise(drift) * 6. - uTime * .5));
      float present = smoothstep(.42, .58, sharp + (grain - .5) * (1. - c) * .75);
      float aura = smoothstep(.02, .5, soft) * (1. - present);
      float ink = present * mix(.82, line, detail) + aura * line * .16 * (.4 + .6 * c);
      ink = max(ink, stat * (1. - present) * .55);
      float minutia = step(.9965, hash(floor(px / (7. * uDpr)))) * present * line * c;
      col = mix(vec4(uInk, 1.) * clamp(ink, 0., 1.), sig, minutia);
    }
  }
  float ring = uLens > 0. ? 1. - smoothstep(0., 1.2 * uDpr, abs(d - uLens)) : 0.;
  col = mix(col, sig, ring * .95);
  gl_FragColor = col;
}`;

const LINES = ['FIRAT', 'ADEM', 'BILGE'];
const AMBIENT_FRAME_MS = 1000 / 30;

function drawMask(w: number, h: number, dpr: number, nameW: number, nameH: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff';
  g.textBaseline = 'alphabetic';
  const narrow = nameW / dpr < 700;
  const padX = nameW * (narrow ? 0.05 : 0.045);
  const top = nameH * (narrow ? 0.14 : 0.06);
  const availH = nameH * (narrow ? 0.56 : 0.82);
  g.font = `900 100px "Big Shoulders Display"`;
  const widest = Math.max(...LINES.map((l) => g.measureText(l).width));
  const lh = 0.86;
  const size = Math.min(((nameW - padX * 2) / widest) * 100, availH / (LINES.length * lh));
  g.font = `900 ${size}px "Big Shoulders Display"`;
  LINES.forEach((l, i) => g.fillText(l, padX, top + size * (0.78 + i * lh)));
  return c;
}

/** Multi-radius separable box blur on a quarter-res copy; no ctx.filter so it works everywhere. */
function softField(src: HTMLCanvasElement) {
  const sw = Math.max(1, Math.round(src.width / 4));
  const sh = Math.max(1, Math.round(src.height / 4));
  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  const g = c.getContext('2d')!;
  g.drawImage(src, 0, 0, sw, sh);
  const img = g.getImageData(0, 0, sw, sh);
  const base = new Float32Array(sw * sh);
  for (let i = 0; i < base.length; i++) base[i] = img.data[i * 4] / 255;
  const acc = new Float32Array(sw * sh);
  const tmp = new Float32Array(sw * sh);
  for (const r of [3, 9, 22]) {
    const a = base.slice();
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < sh; y++) {
        let s = 0;
        for (let x = -r; x <= r; x++) s += a[y * sw + Math.min(sw - 1, Math.max(0, x))];
        for (let x = 0; x < sw; x++) {
          tmp[y * sw + x] = s / (2 * r + 1);
          s += a[y * sw + Math.min(sw - 1, x + r + 1)] - a[y * sw + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < sw; x++) {
        let s = 0;
        for (let y = -r; y <= r; y++) s += tmp[Math.min(sh - 1, Math.max(0, y)) * sw + x];
        for (let y = 0; y < sh; y++) {
          a[y * sw + x] = s / (2 * r + 1);
          s += tmp[Math.min(sh - 1, y + r + 1) * sw + x] - tmp[Math.max(0, y - r) * sw + x];
        }
      }
    }
    for (let i = 0; i < acc.length; i++) acc[i] += a[i] / 3;
  }
  for (let i = 0; i < acc.length; i++) {
    const v = Math.round(acc[i] * 255);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** Pack the portrait's grayscale image and its four-tap contour field into one texture. */
function portraitField(portrait: HTMLImageElement) {
  const size = 512; // The cover portrait is at most 300 CSS px at 1.5× render scale.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(portrait, 0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  const luma = new Uint8ClampedArray(size * size);
  for (let i = 0; i < luma.length; i++) {
    const k = i * 4;
    luma[i] = .2126 * image.data[k] + .7152 * image.data[k + 1] + .0722 * image.data[k + 2];
  }
  const offset = Math.round(size * .018);
  for (let y = 0; y < size; y++) {
    const top = Math.max(0, y - offset) * size;
    const bottom = Math.min(size - 1, y + offset) * size;
    for (let x = 0; x < size; x++) {
      const left = Math.max(0, x - offset);
      const right = Math.min(size - 1, x + offset);
      const i = y * size + x;
      image.data[i * 4] = luma[i];
      image.data[i * 4 + 1] = (luma[top + left] + luma[top + right] + luma[bottom + left] + luma[bottom + right]) / 4;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function texture(gl: WebGLRenderingContext, unit: number, src: HTMLCanvasElement) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  return t;
}

/**
 * The cover: the name as a weak signal. Pixel blocks shrink as the page resolves (scroll),
 * and the pointer is a super-resolution lens.
 */
export function RidgeName() {
  const ref = useRef<HTMLCanvasElement>(null);
  const seen = useInView(ref, '0px', true);
  const reduced = useReducedMotion();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!seen || fallback) return;
    const canvas = ref.current!;
    const cover = canvas.closest<HTMLElement>('.cover')!;
    const intro = cover.querySelector<HTMLElement>('.cover__foot')!;
    const label = cover.querySelector<HTMLElement>('.cover__kicker')!;
    const portrait = cover.querySelector<HTMLImageElement>('.cover__portrait')!;
    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    const vertex = sh(gl.VERTEX_SHADER, VERT);
    const fragment = sh(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(prog, vertex);
    gl.attachShader(prog, fragment);
    gl.linkProgram(prog);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      setFallback(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = { res: u('uRes'), mouse: u('uMouse'), lens: u('uLens'), clarity: u('uClarity'), time: u('uTime'), dpr: u('uDpr'), ink: u('uInk'), intro: u('uIntro'), label: u('uLabel'), portrait: u('uPortrait') };
    gl.uniform1i(u('uSharp'), 0);
    gl.uniform1i(u('uSoft'), 1);
    const photoSampler = u('uPhoto');
    gl.uniform1i(photoSampler, 0);

    let dpr = 1;
    let w = 0;
    let h = 0;
    let visible = true;
    let disposed = false;
    let dirty = true;
    let lastScroll = -1;
    let rect: DOMRect | undefined;
    let unsub: (() => void) | undefined;
    let textures: (WebGLTexture | null)[] = [];
    let photo: WebGLTexture | null = null;
    let nameW = 0;
    let nameH = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false };
    let t0: number | undefined;
    let lastDraw = -Infinity;

    const stop = () => {
      unsub?.();
      unsub = undefined;
    };
    // Ambient motion runs only while the cover is in view. The shared ticker pauses in hidden tabs.
    const wake = () => {
      if (!reduced && visible && w && !disposed && !unsub) unsub = subscribe(tick);
    };

    const fontReady = document.fonts.load('900 100px "Big Shoulders Display"').catch(() => []);
    const layout = async () => {
      await fontReady;
      if (disposed) return;
      const { clientWidth, clientHeight } = canvas;
      if (!clientWidth || !clientHeight) return;
      const style = getComputedStyle(cover);
      const rgb = style.color.match(/[\d.]+/g)?.slice(0, 3).map((channel) => Number(channel) / 255);
      if (rgb?.length === 3) gl.uniform3fv(U.ink, rgb);
      // Limit fragment work on large or high-density displays.
      dpr = Math.min(1.5, devicePixelRatio || 1, Math.sqrt(750_000 / (clientWidth * clientHeight)));
      const nextWidth = Math.round(clientWidth * dpr);
      const nextHeight = Math.round(clientHeight * dpr);
      const nextNameW = nextWidth * Number(style.getPropertyValue('--name-width'));
      const nextNameH = nextHeight * Number(style.getPropertyValue('--name-height'));
      rect = undefined;
      dirty = true;
      if (nextWidth === w && nextHeight === h && nextNameW === nameW && nextNameH === nameH) {
        if (reduced) draw(performance.now());
        else wake();
        return;
      }
      w = nextWidth;
      h = nextHeight;
      nameW = nextNameW;
      nameH = nextNameH;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      textures.forEach((t) => gl.deleteTexture(t));
      const mask = drawMask(w, h, dpr, nameW, nameH);
      textures = [texture(gl, 0, mask), texture(gl, 1, softField(mask))];
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.dpr, dpr);
      if (reduced) draw(performance.now());
      else wake();
    };

    const clarity = (elapsed: number, height: number) => {
      if (reduced) return 1;
      const intro = Math.min(1, elapsed / 2200);
      const p = Math.min(1, Math.max(0, lastScroll / (height * 0.75)));
      return Math.min(1, 0.04 + 0.3 * (1 - Math.pow(1 - intro, 3)) + 0.66 * p);
    };

    const draw = (now: number) => {
      if (!w) return;
      t0 ??= now;
      if (!rect) {
        const bounds = canvas.getBoundingClientRect();
        rect = bounds;
        const box = (uniform: WebGLUniformLocation | null, el: Element, pad: number) => {
          const r = el.getBoundingClientRect();
          gl.uniform4f(uniform, (r.left - bounds.left - pad) * dpr, (r.top - bounds.top - pad) * dpr,
            (r.right - bounds.left + pad) * dpr, (r.bottom - bounds.top + pad) * dpr);
        };
        box(U.intro, intro, 7);
        box(U.label, label, 7);
        if (photo) box(U.portrait, portrait, -1);
      } else if (lastScroll !== scrollY) rect = canvas.getBoundingClientRect();
      lastScroll = scrollY;
      const elapsed = now - t0;
      mouse.x += (mouse.tx - mouse.x) * 0.28;
      mouse.y += (mouse.ty - mouse.y) * 0.28;
      gl.uniform2f(U.mouse, (mouse.x - rect.left) * dpr, (mouse.y - rect.top) * dpr);
      gl.uniform1f(U.lens, mouse.on && !reduced ? Math.min(nameW, nameH) * 0.16 : 0);
      gl.uniform1f(U.clarity, clarity(elapsed, nameH / dpr));
      gl.uniform1f(U.time, reduced ? 0 : elapsed / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      lastDraw = now;
      dirty = false;
    };

    const move = (e: PointerEvent) => {
      if (e.target instanceof Node && (intro.contains(e.target) || label.contains(e.target))) {
        if (mouse.on) leave();
        return;
      }
      if (!mouse.on) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.on = true;
      dirty = true;
      wake();
    };
    const leave = () => {
      mouse.on = false;
      dirty = true;
      wake();
    };
    const scroll = () => {
      dirty = true;
      wake();
    };
    if (!reduced) {
      cover.addEventListener('pointermove', move);
      cover.addEventListener('pointerdown', move);
      cover.addEventListener('pointerleave', leave);
      window.addEventListener('scroll', scroll, { passive: true });
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        rect = undefined;
        dirty = true;
        wake();
      } else stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => layout());
    ro.observe(canvas);
    ro.observe(intro);
    ro.observe(label);
    ro.observe(portrait);
    const contextLost = () => setFallback(true);
    canvas.addEventListener('webglcontextlost', contextLost);
    if (!reduced) {
      void portrait.decode().then(() => {
        if (disposed || gl.isContextLost()) return;
        photo = texture(gl, 2, portraitField(portrait));
        gl.uniform1i(photoSampler, 2);
        rect = undefined;
        dirty = true;
        wake();
      }).catch(() => { /* Leave the underlying portrait visible if the texture is unavailable. */ });
    }
    function tick(seconds: number) {
      const now = seconds * 1000;
      const lensMoving = mouse.on && Math.hypot(mouse.tx - mouse.x, mouse.ty - mouse.y) > 0.25;
      const introPlaying = t0 === undefined || now - t0 < 2200;
      if (dirty || lensMoving || introPlaying || now - lastDraw >= AMBIENT_FRAME_MS - 1) draw(now);
    }

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', contextLost);
      cover.removeEventListener('pointermove', move);
      cover.removeEventListener('pointerdown', move);
      cover.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteTexture(photo);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [seen, reduced, fallback]);

  return fallback ? (
    <p className="cover__fallback" aria-hidden="true">
      {LINES.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </p>
  ) : (
    <canvas ref={ref} className="cover__canvas" aria-hidden="true" />
  );
}
