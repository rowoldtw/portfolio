'use client'

// Adapted from ObsidianUI Art Gallery for the portfolio's album catalog.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

const defaultConfig = {
  cellSize: 0.75,
  zoomLevel: 1.25,
  lerpFactor: 0.075,
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec2 uOffset;
  uniform vec2 uResolution;
  uniform vec4 uBackgroundColor;
  uniform float uZoom;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  varying vec2 vUv;

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;
    float radius = length(screenUV);
    float distortion = 1.0 - 0.08 * radius * radius;
    vec2 distortedUV = screenUV * distortion;
    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 worldCoord = distortedUV * aspectRatio;
    worldCoord *= uZoom;
    worldCoord += uOffset;
    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);
    vec3 backgroundColor = uBackgroundColor.rgb;
    float imageSize = 0.6;
    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;
    vec2 edgeSmooth = max(fwidth(cellPos) / imageSize, vec2(0.001));
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;
    vec2 shadowDistance = abs(imageUV + vec2(0.0, 0.025) - 0.5) - 0.5;
    float shadowEdge = length(max(shadowDistance, 0.0)) + min(max(shadowDistance.x, shadowDistance.y), 0.0);
    float shadowAlpha = (1.0 - smoothstep(-0.02, 0.14, shadowEdge)) * 0.18;
    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    vec3 color = mix(backgroundColor, vec3(0.0), shadowAlpha);
    float atlasSize = ceil(sqrt(uTextureCount));
    vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
    // Flip within the tile; flipping the atlas would sample its unused rows.
    vec2 tileUV = clamp(vec2(imageUV.x, 1.0 - imageUV.y), 0.0, 1.0);
    vec2 atlasUV = (atlasPos * 264.0 + 4.5 + tileUV * 255.0) / (atlasSize * 264.0);
    vec3 imageColor = texture2D(uImageAtlas, atlasUV).rgb;
    color = mix(color, imageColor, imageAlpha);
    float fade = 1.0 - smoothstep(1.2, 1.8, radius);
    gl_FragColor = vec4(mix(uBackgroundColor.rgb, color, fade), 1.0);
    #include <colorspace_fragment>
  }
`

function getPalette(isDark) {
  const dark = new THREE.Color('#080808')
  return {
    background: isDark ? [dark.r, dark.g, dark.b, 1] : [1, 1, 1, 1],
  }
}

function blankImage() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, 512, 512)
  }
  return canvas
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image()
    let retries = 0
    if (/^https?:\/\//.test(src)) image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => {
      if (retries === 0) {
        retries = 1
        image.src = `${src}${src.includes('?') ? '&' : '?'}retry=1`
        return
      }
      resolve(null)
    }
    image.src = src
  })
}

async function prepareImage(image) {
  if (!image) return null
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(image, {
        resizeWidth: 256,
        resizeHeight: 256,
        resizeQuality: 'high',
      })
    } catch {}
  }
  try {
    await image.decode()
  } catch {}
  return image
}

function closeBitmaps(images) {
  images.forEach((image) => image?.close?.())
}

function createTextureAtlas(sources) {
  const atlasSize = Math.ceil(Math.sqrt(sources.length))
  const textureSize = 256
  const padding = 4
  const tileSize = textureSize + padding * 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = atlasSize * tileSize
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const fallbackSource = sources.find(Boolean)
    sources.forEach((source, index) => {
      const x = (index % atlasSize) * tileSize + padding
      const y = Math.floor(index / atlasSize) * tileSize + padding
      if (!source) return
      try {
        ctx.drawImage(source, x, y, textureSize, textureSize)
      } catch {
        if (fallbackSource)
          ctx.drawImage(fallbackSource, x, y, textureSize, textureSize)
      }
      ctx.drawImage(
        canvas,
        x,
        y,
        1,
        textureSize,
        x - padding,
        y,
        padding,
        textureSize,
      )
      ctx.drawImage(
        canvas,
        x + textureSize - 1,
        y,
        1,
        textureSize,
        x + textureSize,
        y,
        padding,
        textureSize,
      )
      ctx.drawImage(
        canvas,
        x - padding,
        y,
        tileSize,
        1,
        x - padding,
        y - padding,
        tileSize,
        padding,
      )
      ctx.drawImage(
        canvas,
        x - padding,
        y + textureSize - 1,
        tileSize,
        1,
        x - padding,
        y + textureSize,
        tileSize,
        padding,
      )
    })
  }
  const atlasTexture = new THREE.CanvasTexture(canvas)
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping
  atlasTexture.minFilter = THREE.LinearMipmapLinearFilter
  atlasTexture.magFilter = THREE.LinearFilter
  atlasTexture.flipY = false
  atlasTexture.generateMipmaps = true
  atlasTexture.colorSpace = THREE.SRGBColorSpace
  return atlasTexture
}

function ArtGalleryScene({
  active,
  images,
  cellSize,
  zoomLevel,
  reducedMotion,
  isDark,
  onActiveChange,
  navigateRef,
  fallback,
}) {
  const containerRef = useRef(null)
  const materialRef = useRef(null)
  const rendererRef = useRef(null)
  const isDarkRef = useRef(isDark)
  const activeRef = useRef(active)
  const animationControlRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useLayoutEffect(() => {
    activeRef.current = active
    if (active) animationControlRef.current?.start()
    else animationControlRef.current?.stop()
  }, [active])

  useLayoutEffect(() => {
    isDarkRef.current = isDark
    const palette = getPalette(isDark)
    materialRef.current?.uniforms.uBackgroundColor.value.set(
      ...palette.background,
    )
    rendererRef.current?.setClearColor(
      new THREE.Color(...palette.background.slice(0, 3)),
      1,
    )
  }, [isDark])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    setReady(false)

    let cancelled = false
    let animFrameId = 0
    let renderer
    let plane
    let geometry
    let material
    let imageAtlas

    const state = {
      isDragging: false,
      pointerType: 'mouse',
      previousPointer: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      targetOffset: { x: 0, y: 0 },
      zoom: 1,
      targetZoom: 1,
      selectedIndex: 0,
      wheelNavigating: false,
    }

    const mod = (value, count) => ((value % count) + count) % count
    const selectIndex = (index) => {
      if (index === state.selectedIndex) return
      state.selectedIndex = index
      onActiveChange?.(index)
    }
    const selectAt = (x, y) => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      const screenX = (x / width - 0.5) * 2
      const screenY = (0.5 - y / height) * 2
      const radius = Math.hypot(screenX, screenY)
      const distortion = 1 - 0.08 * radius * radius
      const worldX =
        screenX * distortion * (width / height) * state.zoom + state.offset.x
      const worldY = screenY * distortion * state.zoom + state.offset.y
      const column = Math.floor(worldX / cellSize)
      const row = Math.floor(worldY / cellSize)
      selectIndex(mod(column + row * 3, images.length))
    }

    navigateRef.current = (delta) => {
      state.pointerType = 'mouse'
      state.targetOffset.x += delta * cellSize
      selectIndex(mod(state.selectedIndex + delta, images.length))
    }

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    } catch {
      const frame = requestAnimationFrame(() => setFailed(true))
      return () => cancelAnimationFrame(frame)
    }
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    const bgColor = getPalette(isDarkRef.current).background
    renderer.setClearColor(
      new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
      bgColor[3],
    )
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const dragZoom = reducedMotion ? 1 : zoomLevel

    const animate = () => {
      animFrameId = 0
      if (!activeRef.current) return
      const lerpFactor = reducedMotion
        ? 1
        : state.pointerType === 'touch'
          ? 0.18
          : defaultConfig.lerpFactor
      state.offset.x += (state.targetOffset.x - state.offset.x) * lerpFactor
      state.offset.y += (state.targetOffset.y - state.offset.y) * lerpFactor
      state.zoom += (state.targetZoom - state.zoom) * lerpFactor
      if (plane?.material.uniforms) {
        plane.material.uniforms.uOffset.value.set(
          state.offset.x,
          state.offset.y,
        )
        plane.material.uniforms.uZoom.value = state.zoom
      }
      if (state.wheelNavigating) {
        selectAt(container.clientWidth / 2, container.clientHeight / 2)
        if (
          Math.abs(state.targetOffset.x - state.offset.x) < 0.002 &&
          Math.abs(state.targetOffset.y - state.offset.y) < 0.002
        ) {
          state.wheelNavigating = false
        }
      }
      renderer.render(scene, camera)
      animFrameId = requestAnimationFrame(animate)
    }
    const startAnimation = () => {
      if (!animFrameId && activeRef.current)
        animFrameId = requestAnimationFrame(animate)
    }
    const stopAnimation = () => {
      cancelAnimationFrame(animFrameId)
      animFrameId = 0
    }

    const updateMousePosition = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      selectAt(event.clientX - rect.left, event.clientY - rect.top)
    }

    const startDrag = (x, y, pointerType) => {
      state.isDragging = true
      state.pointerType = pointerType
      state.previousPointer.x = x
      state.previousPointer.y = y
    }

    const handleMove = (x, y) => {
      if (!state.isDragging) return
      const deltaX = x - state.previousPointer.x
      const deltaY = y - state.previousPointer.y
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        if (state.targetZoom === 1) state.targetZoom = dragZoom
      }
      const sensitivity = state.pointerType === 'touch' ? 0.0075 : 0.003
      state.targetOffset.x -= deltaX * sensitivity
      state.targetOffset.y += deltaY * sensitivity
      if (state.pointerType === 'touch') state.wheelNavigating = true
      state.previousPointer.x = x
      state.previousPointer.y = y
    }

    const endDrag = () => {
      state.isDragging = false
      state.targetZoom = 1
    }

    const onWheel = (event) => {
      if (event.ctrlKey || event.metaKey) return
      if (event.deltaX === 0 && event.deltaY === 0) return
      event.preventDefault()
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? container.clientHeight
            : 1
      state.pointerType = 'mouse'
      state.targetOffset.x += event.deltaX * unit * 0.003
      state.targetOffset.y -= event.deltaY * unit * 0.003
      state.wheelNavigating = true
    }

    const onPointerDown = (event) => {
      event.preventDefault()
      container.setPointerCapture?.(event.pointerId)
      startDrag(event.clientX, event.clientY, event.pointerType)
    }
    const onPointerMove = (event) => {
      if (event.pointerType !== 'touch') updateMousePosition(event)
      handleMove(event.clientX, event.clientY)
    }
    const onPointerUp = (event) => {
      if (container.hasPointerCapture?.(event.pointerId))
        container.releasePointerCapture(event.pointerId)
      endDrag()
    }
    const onPointerLeave = () => {
      endDrag()
    }
    const onResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      plane?.material.uniforms.uResolution.value.set(width, height)
    }

    const init = async () => {
      const loadedImages = await Promise.all(
        images.map((src) => loadImage(src)),
      )
      if (cancelled) return
      const preparedImages = []
      for (let index = 0; index < loadedImages.length; index += 4) {
        if (cancelled) {
          closeBitmaps(preparedImages)
          return
        }
        const batch = await Promise.all(
          loadedImages.slice(index, index + 4).map(prepareImage),
        )
        preparedImages.push(...batch)
        if (cancelled) {
          closeBitmaps(preparedImages)
          return
        }
        if (index + 4 < loadedImages.length) {
          await new Promise(requestAnimationFrame)
        }
      }
      const replacement = preparedImages.find(Boolean) ?? blankImage()
      const imageTiles = preparedImages.map((image) => image ?? replacement)
      try {
        imageAtlas = createTextureAtlas(imageTiles)
      } finally {
        closeBitmaps(preparedImages)
      }
      if (cancelled) return

      const uniforms = {
        uOffset: { value: new THREE.Vector2(0, 0) },
        uResolution: {
          value: new THREE.Vector2(
            container.clientWidth,
            container.clientHeight,
          ),
        },
        uBackgroundColor: {
          value: new THREE.Vector4(...getPalette(isDarkRef.current).background),
        },
        uZoom: { value: 1 },
        uCellSize: { value: cellSize },
        uTextureCount: { value: images.length },
        uImageAtlas: { value: imageAtlas },
      }

      geometry = new THREE.PlaneGeometry(2, 2)
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      })
      materialRef.current = material
      plane = new THREE.Mesh(geometry, material)
      scene.add(plane)

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', onPointerUp)
      container.addEventListener('pointercancel', onPointerUp)
      container.addEventListener('pointerleave', onPointerLeave)
      container.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('resize', onResize)
      animationControlRef.current = {
        start: startAnimation,
        stop: stopAnimation,
      }
      startAnimation()
      setReady(true)
    }

    init()

    return () => {
      cancelled = true
      stopAnimation()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointercancel', onPointerUp)
      container.removeEventListener('pointerleave', onPointerLeave)
      container.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      imageAtlas?.dispose()
      geometry?.dispose()
      material?.dispose()
      renderer?.dispose()
      materialRef.current = null
      rendererRef.current = null
      animationControlRef.current = null
      if (renderer?.domElement?.parentNode === container)
        container.removeChild(renderer.domElement)
      navigateRef.current = null
    }
  }, [images, cellSize, zoomLevel, reducedMotion, onActiveChange, navigateRef])

  if (failed) return fallback

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  )
}

/** @param {{ active?: boolean, images: string[], cellSize?: number, zoomLevel?: number, className?: string, style?: import("react").CSSProperties, fallback?: import("react").ReactNode, onActiveChange?: (index: number) => void, navigateRef: import("react").RefObject<((delta: number) => void) | null> }} props */
export function ArtGallery({
  active = true,
  images,
  cellSize = defaultConfig.cellSize,
  zoomLevel = defaultConfig.zoomLevel,
  className,
  style,
  fallback,
  onActiveChange,
  navigateRef,
}) {
  const reducedMotion = usePrefersReducedMotion()
  const { resolvedTheme } = useTheme()

  return (
    <div
      className={cn(
        'bg-background relative isolate h-[28rem] w-full overflow-hidden',
        className,
      )}
      style={{ containerType: 'size', ...style }}
    >
      <ArtGalleryScene
        active={active}
        images={images}
        cellSize={cellSize}
        zoomLevel={zoomLevel}
        reducedMotion={reducedMotion}
        isDark={resolvedTheme === 'dark'}
        onActiveChange={onActiveChange}
        navigateRef={navigateRef}
        fallback={fallback}
      />
    </div>
  )
}
