'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useCursorTrailEnabled } from '@/hooks/use-cursor-trail'

const FC = 80
const FR = 60
const FN = FC * FR
const CC = 110
const EDGES = ['.', ',', '=', '+', '-']
const BRIGHTS = [...'PROJECTS']
const ALL_CHARS = [...EDGES, ...BRIGHTS]
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const TL = 320
const TS = 10
const TM = 72
const TRAIL_CFG = { fb: 0.08, fss: 18, ffm: 0.15, fir: 0.8, firl: 1.0 }

const VS = `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0, 1); }`

const FS = `#version 300 es
precision highp float;
uniform sampler2D uFluid, uAtlas;
uniform vec2 uRes;
uniform vec3 uColor;
uniform float uFade;
uniform int uPhase;
out vec4 O;
const float CC = ${CC}.0, FC = ${FC}.0, FR = ${FR}.0;
const int BAYER[16] = int[16](${BAYER.map((v) => Math.round((v / 16) * 255)).join(',')});
void main() {
  float cw = max(7.0, uRes.x / CC);
  vec2 grid = vec2(floor(gl_FragCoord.x / cw), floor((uRes.y - gl_FragCoord.y) / cw));
  vec2 cell = vec2(fract(gl_FragCoord.x / cw), fract((uRes.y - gl_FragCoord.y) / cw));
  vec2 uv = (grid + 0.5) * cw / uRes;
  ivec2 fc = clamp(ivec2(uv * vec2(FC, FR)), ivec2(0), ivec2(int(FC)-1, int(FR)-1));
  float strength = min(1.0, length(texelFetch(uFluid, fc, 0).rg) * 1.1) * uFade;
  float threshold = float(BAYER[(int(grid.y) & 3) * 4 + (int(grid.x) & 3)]);
  if(strength * 255.0 <= max(36.0, threshold)) discard;
  int ci = strength > 0.5 ? 5 + uPhase % ${BRIGHTS.length} : uPhase % 5;
  float alpha = texture(uAtlas, vec2((float(ci) + cell.x) / float(${ALL_CHARS.length}), cell.y)).a * strength * 0.65;
  if(alpha < 0.01) discard;
  O = vec4(uColor * alpha, alpha);
}`

function createFluid() {
  const vx = new Float32Array(FN)
  const vy = new Float32Array(FN)
  const vx0 = new Float32Array(FN)
  const vy0 = new Float32Array(FN)
  const p = new Float32Array(FN)
  const div = new Float32Array(FN)
  const fi = (x, y) =>
    Math.max(0, Math.min(FR - 1, y)) * FC + Math.max(0, Math.min(FC - 1, x))
  const bnd = (b, a) => {
    for (let x = 1; x < FC - 1; x++) {
      a[fi(x, 0)] = b === 2 ? -a[fi(x, 1)] : a[fi(x, 1)]
      a[fi(x, FR - 1)] = b === 2 ? -a[fi(x, FR - 2)] : a[fi(x, FR - 2)]
    }
    for (let y = 1; y < FR - 1; y++) {
      a[fi(0, y)] = b === 1 ? -a[fi(1, y)] : a[fi(1, y)]
      a[fi(FC - 1, y)] = b === 1 ? -a[fi(FC - 2, y)] : a[fi(FC - 2, y)]
    }
  }
  const diffuse = (b, d, s, diff, dt) => {
    const a = dt * diff * FN
    for (let k = 0; k < 4; k++) {
      for (let y = 1; y < FR - 1; y++)
        for (let x = 1; x < FC - 1; x++) {
          d[fi(x, y)] =
            (s[fi(x, y)] +
              a *
                (d[fi(x - 1, y)] +
                  d[fi(x + 1, y)] +
                  d[fi(x, y - 1)] +
                  d[fi(x, y + 1)])) /
            (1 + 4 * a)
        }
      bnd(b, d)
    }
  }
  const advect = (b, d, d0, ux, uy, dt) => {
    const dtx = dt * FC * 1.4
    const dty = dt * FR * 1.4
    for (let y = 1; y < FR - 1; y++)
      for (let x = 1; x < FC - 1; x++) {
        const px = Math.max(0.5, Math.min(FC - 1.5, x - dtx * ux[fi(x, y)]))
        const py = Math.max(0.5, Math.min(FR - 1.5, y - dty * uy[fi(x, y)]))
        const x0 = Math.floor(px),
          y0 = Math.floor(py)
        const s1 = px - x0,
          s0 = 1 - s1,
          t1 = py - y0,
          t0 = 1 - t1
        d[fi(x, y)] =
          s0 * (t0 * d0[fi(x0, y0)] + t1 * d0[fi(x0, y0 + 1)]) +
          s1 * (t0 * d0[fi(x0 + 1, y0)] + t1 * d0[fi(x0 + 1, y0 + 1)])
      }
    bnd(b, d)
  }
  const project = (ux, uy) => {
    const hx = 1 / FC,
      hy = 1 / FR
    for (let y = 1; y < FR - 1; y++)
      for (let x = 1; x < FC - 1; x++) {
        div[fi(x, y)] =
          -0.5 *
          (hx * (ux[fi(x + 1, y)] - ux[fi(x - 1, y)]) +
            hy * (uy[fi(x, y + 1)] - uy[fi(x, y - 1)]))
        p[fi(x, y)] = 0
      }
    bnd(0, div)
    bnd(0, p)
    for (let k = 0; k < 4; k++) {
      for (let y = 1; y < FR - 1; y++)
        for (let x = 1; x < FC - 1; x++)
          p[fi(x, y)] =
            (div[fi(x, y)] +
              p[fi(x - 1, y)] +
              p[fi(x + 1, y)] +
              p[fi(x, y - 1)] +
              p[fi(x, y + 1)]) /
            4
      bnd(0, p)
    }
    for (let y = 1; y < FR - 1; y++)
      for (let x = 1; x < FC - 1; x++) {
        ux[fi(x, y)] -= (0.5 * (p[fi(x + 1, y)] - p[fi(x - 1, y)])) / hx
        uy[fi(x, y)] -= (0.5 * (p[fi(x, y + 1)] - p[fi(x, y - 1)])) / hy
      }
    bnd(1, ux)
    bnd(2, uy)
  }
  return {
    vx,
    vy,
    fi,
    reset() {
      for (const field of [vx, vy, vx0, vy0, p, div]) field.fill(0)
    },
    step() {
      diffuse(1, vx0, vx, 0.00002, 0.016)
      diffuse(2, vy0, vy, 0.00002, 0.016)
      project(vx0, vy0)
      advect(1, vx, vx0, vx0, vy0, 0.016)
      advect(2, vy, vy0, vx0, vy0, 0.016)
      project(vx, vy)
      for (let i = 0; i < FN; i++) {
        vx[i] *= 0.94
        vy[i] *= 0.94
      }
    },
  }
}

// Cursor-only adaptation of ObsidianUI's dither fluid simulation.
export function DitherCursor() {
  const ref = useRef(null)
  const enabled = useCursorTrailEnabled()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !enabled || window.self !== window.top) return
    canvas.style.opacity = '0'
    canvas.style.pointerEvents = 'none'
    let gl
    try {
      gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
    } catch {
      return
    }
    if (!gl) return

    const textures = []
    const shaders = []
    const buffers = []
    let prog
    let rafId = 0
    let disposed = false
    let observer
    const listeners = []
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isStatic = () =>
      motion.matches ||
      document.hidden ||
      document.querySelector(
        '[data-project-preview], [data-cursor-exclude]:hover, [role=dialog]',
      ) !== null
    const listen = (target, event, handler) => {
      target.addEventListener(event, handler)
      listeners.push(() => target.removeEventListener(event, handler))
    }
    const cleanup = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(rafId)
      observer?.disconnect()
      listeners.forEach((remove) => remove())
      textures.forEach((texture) => gl.deleteTexture(texture))
      buffers.forEach((buffer) => gl.deleteBuffer(buffer))
      shaders.forEach((shader) => gl.deleteShader(shader))
      if (prog) gl.deleteProgram(prog)
    }
    const fallback = () => {
      if (disposed) return
      canvas.style.opacity = '0'
      canvas.style.pointerEvents = 'none'
      cleanup()
    }

    try {
      const mkShader = (type, source) => {
        const shader = gl.createShader(type)
        if (!shader) throw new Error('Shader allocation failed.')
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error('Shader compilation failed.')
        }
        return shader
      }
      const mkTex = (unit) => {
        const tex = gl.createTexture()
        if (!tex) throw new Error('Texture allocation failed.')
        textures.push(tex)
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        return tex
      }
      prog = gl.createProgram()
      if (!prog) throw new Error('Program allocation failed.')
      gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS))
      gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error('Shader linking failed.')
      }
      gl.useProgram(prog)
      const loc = (name) => gl.getUniformLocation(prog, name)
      const buf = gl.createBuffer()
      if (!buf) throw new Error('Buffer allocation failed.')
      buffers.push(buf)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      )
      const aPos = gl.getAttribLocation(prog, 'a_pos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      const fluidTex = mkTex(1)

      const atlasCanvas = document.createElement('canvas')
      const CELL = 64
      atlasCanvas.width = CELL * ALL_CHARS.length
      atlasCanvas.height = CELL
      const actx = atlasCanvas.getContext('2d')
      if (!actx) throw new Error('Character atlas unavailable.')
      actx.font = `${CELL * 0.92}px monospace`
      actx.textAlign = 'center'
      actx.textBaseline = 'middle'
      actx.fillStyle = '#fff'
      ALL_CHARS.forEach((char, index) =>
        actx.fillText(char, CELL * (index + 0.5), CELL * 0.5),
      )
      mkTex(2)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        atlasCanvas,
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      const tone = resolvedTheme === 'dark' ? 0.96 : 0.12
      gl.uniform3f(loc('uColor'), tone, tone, tone)
      gl.uniform1i(loc('uFluid'), 1)
      gl.uniform1i(loc('uAtlas'), 2)

      const fluid = createFluid()
      const fluidData = new Float32Array(FN * 2)
      const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 }
      const trail = []
      const now = () => performance.now()
      let lastMove = 0
      const onMove = (event) => {
        if (isStatic() || event.pointerType === 'touch') {
          reset()
          return
        }
        lastMove = now()
        if (!rafId) rafId = requestAnimationFrame(render)
        const rect = canvas.getBoundingClientRect()
        const px = mouse.x
        const py = mouse.y
        mouse.x = event.clientX - rect.left
        mouse.y = event.clientY - rect.top
        mouse.vx = mouse.x - px
        mouse.vy = mouse.y - py
        if (px < 0 || py < 0) {
          trail.unshift({ x: mouse.x, y: mouse.y, vx: 0, vy: 0, b: now() })
          if (trail.length > TM) trail.length = TM
          return
        }
        const d = Math.hypot(mouse.vx, mouse.vy)
        if (d < 0.5) return
        const steps = Math.max(1, Math.ceil(d / TS))
        const birth = now()
        for (let s = 1; s <= steps; s++) {
          const t = s / steps
          trail.unshift({
            x: px + mouse.vx * t,
            y: py + mouse.vy * t,
            vx: mouse.vx / steps,
            vy: mouse.vy / steps,
            b: birth,
          })
          if (trail.length > TM) trail.length = TM
        }
      }
      listen(window, 'pointermove', onMove)
      listen(document, 'pointerleave', () => {
        mouse.x = mouse.y = -9999
      })
      listen(canvas, 'webglcontextlost', (event) => {
        event.preventDefault()
        fallback()
      })
      let W = 1
      let H = 1
      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        W = canvas.width = Math.max(1, Math.round(rect.width))
        H = canvas.height = Math.max(1, Math.round(rect.height))
        gl.viewport(0, 0, W, H)
      }
      resize()
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      const uRes = loc('uRes')
      const uPhase = loc('uPhase')
      let phase = 0
      let frame = 0
      const uFade = loc('uFade')

      const draw = () => {
        if (disposed) return
        const ts = now()
        const { fb, fss, ffm, fir, firl } = TRAIL_CFG
        for (let i = trail.length - 1; i >= 0; i--) {
          const pt = trail[i]
          const age = ts - pt.b
          if (age >= TL) {
            trail.splice(i, 1)
            continue
          }
          const life = 1 - age / TL
          const radius = fir + life * firl
          const gr = Math.ceil(radius)
          const speed = Math.hypot(pt.vx, pt.vy)
          const force = (fb + Math.min(speed, fss) / fss) * life
          const cx = ((pt.x / W) * FC) | 0
          const cy = ((pt.y / H) * FR) | 0
          for (let dy = -gr; dy <= gr; dy++)
            for (let dx = -gr; dx <= gr; dx++) {
              const dist = Math.hypot(dx, dy)
              if (dist > radius) continue
              const f = (1 - dist / radius) ** 2
              fluid.vx[fluid.fi(cx + dx, cy + dy)] += pt.vx * f * force * ffm
              fluid.vy[fluid.fi(cx + dx, cy + dy)] += pt.vy * f * force * ffm
            }
        }
        fluid.step()
        if (frame++ % 8 === 0) phase = (phase + 1) % 255
        for (let i = 0; i < FN; i++) {
          fluidData[i * 2] = fluid.vx[i]
          fluidData[i * 2 + 1] = fluid.vy[i]
        }
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, fluidTex)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RG32F,
          FC,
          FR,
          0,
          gl.RG,
          gl.FLOAT,
          fluidData,
        )
        gl.uniform1f(uFade, Math.max(0, 1 - (ts - lastMove) / 1400))
        gl.uniform2f(uRes, W, H)
        gl.uniform1i(uPhase, phase)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        canvas.style.opacity = '1'
        canvas.style.pointerEvents = 'none'
      }
      let lastFrame = 0
      const reset = () => {
        cancelAnimationFrame(rafId)
        rafId = 0
        trail.length = 0
        fluid.reset()
        mouse.x = mouse.y = -9999
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
      }
      const render = () => {
        rafId = 0
        if (disposed) return
        const timestamp = now()
        if (isStatic() || timestamp - lastMove >= 1400) {
          reset()
          return
        }
        if (timestamp - lastFrame >= 1000 / 30) {
          try {
            draw()
          } catch {
            fallback()
            return
          }
          lastFrame = timestamp
        }
        rafId = requestAnimationFrame(render)
      }
      observer = new ResizeObserver(() => {
        resize()
        reset()
      })
      observer.observe(canvas)
      listen(window, 'pointerover', (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest('[data-cursor-exclude]')
        )
          reset()
      })
      listen(motion, 'change', reset)
      listen(document, 'visibilitychange', reset)
      listen(window, 'blur', reset)
      reset()
    } catch {
      fallback()
    }
    return cleanup
  }, [resolvedTheme, enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-dither-cursor=""
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
