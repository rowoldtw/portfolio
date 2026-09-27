'use client'

// Adapted from ObsidianUI Art Gallery for the portfolio's album catalog.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useEffectReducedMotion } from '@/lib/effects/shared/webgl-surface'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

const defaultConfig = {
  cellSize: 0.75,
  zoomLevel: 1.25,
  lerpFactor: 0.075,
  textColor: 'rgba(128, 128, 128, 1)',
  hoverColor: 'rgba(255, 255, 255, 0)',
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
  uniform vec4 uBorderColor;
  uniform vec4 uHoverColor;
  uniform vec4 uBackgroundColor;
  uniform vec2 uMousePos;
  uniform float uZoom;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  uniform sampler2D uTextAtlas;
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
    vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenUV.y = -mouseScreenUV.y;
    float mouseRadius = length(mouseScreenUV);
    float mouseDistortion = 1.0 - 0.08 * mouseRadius * mouseRadius;
    vec2 mouseDistortedUV = mouseScreenUV * mouseDistortion;
    vec2 mouseWorldCoord = mouseDistortedUV * aspectRatio;
    mouseWorldCoord *= uZoom;
    mouseWorldCoord += uOffset;
    vec2 mouseCellPos = mouseWorldCoord / uCellSize;
    vec2 mouseCellId = floor(mouseCellPos);
    vec2 cellCenter = cellId + 0.5;
    vec2 mouseCellCenter = mouseCellId + 0.5;
    float cellDistance = length(cellCenter - mouseCellCenter);
    float hoverIntensity = 1.0 - smoothstep(0.4, 0.7, cellDistance);
    bool isHovered = hoverIntensity > 0.0 && uMousePos.x >= 0.0;
    vec3 backgroundColor = uBackgroundColor.rgb;
    if (isHovered) {
      backgroundColor = mix(uBackgroundColor.rgb, uHoverColor.rgb, hoverIntensity * uHoverColor.a);
    }
    float lineWidth = 0.005;
    float gridX = smoothstep(0.0, lineWidth, cellUV.x) * smoothstep(0.0, lineWidth, 1.0 - cellUV.x);
    float gridY = smoothstep(0.0, lineWidth, cellUV.y) * smoothstep(0.0, lineWidth, 1.0 - cellUV.y);
    float gridMask = gridX * gridY;
    float imageSize = 0.6;
    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;
    float edgeSmooth = 0.01;
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;
    bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;
    float textHeight = 0.08;
    float textY = 0.88;
    bool inTextArea = cellUV.x >= 0.05 && cellUV.x <= 0.95 && cellUV.y >= textY && cellUV.y <= (textY + textHeight);
    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    vec3 color = backgroundColor;
    if (inImageArea && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
      // Flip within the tile; flipping the atlas would sample its unused rows.
      vec2 atlasUV = (atlasPos + vec2(imageUV.x, 1.0 - imageUV.y)) / atlasSize;
      vec3 imageColor = texture2D(uImageAtlas, atlasUV).rgb;
      color = mix(color, imageColor, imageAlpha);
    }
    if (inTextArea) {
      vec2 textCoord = vec2((cellUV.x - 0.05) / 0.9, (cellUV.y - textY) / textHeight);
      textCoord.y = 1.0 - textCoord.y;
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
      vec2 atlasUV = (atlasPos + textCoord) / atlasSize;
      vec4 textColor = texture2D(uTextAtlas, atlasUV);
      color = mix(backgroundColor, textColor.rgb, textColor.a);
    }
    vec3 borderRGB = uBorderColor.rgb;
    float borderAlpha = uBorderColor.a;
    color = mix(color, borderRGB, (1.0 - gridMask) * borderAlpha);
    float fade = 1.0 - smoothstep(1.2, 1.8, radius);
    gl_FragColor = vec4(mix(uBackgroundColor.rgb, color, fade), 1.0);
    #include <colorspace_fragment>
  }
`

function rgbaToArray(rgba) {
  const match = rgba.match(/rgba?\(([^)]+)\)/)
  if (!match) return [1, 1, 1, 1]
  const parts = match[1].split(',')
  return [
    parseFloat(parts[0]) / 255,
    parseFloat(parts[1]) / 255,
    parseFloat(parts[2]) / 255,
    parseFloat(parts[3] ?? '1'),
  ]
}

function getPalette(isDark) {
  const dark = new THREE.Color('#080808')
  const darkBorder = new THREE.Color('#292929')
  return {
    background: isDark ? [dark.r, dark.g, dark.b, 1] : [1, 1, 1, 1],
    border: isDark
      ? [darkBorder.r, darkBorder.g, darkBorder.b, 1]
      : [0, 0, 0, 0.15],
  }
}

function createTextCanvas(title, year, textColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 1024, 128)
    ctx.font = '40px monospace'
    ctx.fillStyle = textColor
    ctx.textBaseline = 'middle'
    ctx.imageSmoothingEnabled = false
    ctx.textAlign = 'left'
    ctx.fillText(String(title).toUpperCase(), 15, 64)
    ctx.textAlign = 'right'
    ctx.fillText(String(year), 1024 - 15, 64)
  }
  return canvas
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

function createTextureAtlas(sources, isText = false) {
  const atlasSize = Math.ceil(Math.sqrt(sources.length))
  const textureSize = isText ? 384 : 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = atlasSize * textureSize
  const ctx = canvas.getContext('2d')
  if (ctx) {
    if (isText) ctx.clearRect(0, 0, canvas.width, canvas.height)
    else {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    const fallbackSource = sources.find(Boolean)
    sources.forEach((source, index) => {
      const x = (index % atlasSize) * textureSize
      const y = Math.floor(index / atlasSize) * textureSize
      if (!source) return
      try {
        ctx.drawImage(source, x, y, textureSize, textureSize)
      } catch {
        if (fallbackSource)
          ctx.drawImage(fallbackSource, x, y, textureSize, textureSize)
      }
    })
  }
  const atlasTexture = new THREE.CanvasTexture(canvas)
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping
  atlasTexture.minFilter = THREE.LinearFilter
  atlasTexture.magFilter = THREE.LinearFilter
  atlasTexture.flipY = false
  atlasTexture.generateMipmaps = false
  atlasTexture.colorSpace = THREE.SRGBColorSpace
  return atlasTexture
}

function ArtGalleryScene({
  active,
  images,
  items,
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
    materialRef.current?.uniforms.uBorderColor.value.set(...palette.border)
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
    let textAtlas

    const state = {
      isDragging: false,
      previousPointer: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      targetOffset: { x: 0, y: 0 },
      mousePosition: { x: -1, y: -1 },
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

    const lerpFactor = reducedMotion ? 1 : defaultConfig.lerpFactor
    const dragZoom = reducedMotion ? 1 : zoomLevel

    const animate = () => {
      animFrameId = 0
      if (!activeRef.current) return
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
      state.mousePosition.x = event.clientX - rect.left
      state.mousePosition.y = event.clientY - rect.top
      plane?.material.uniforms.uMousePos.value.set(
        state.mousePosition.x,
        state.mousePosition.y,
      )
      selectAt(state.mousePosition.x, state.mousePosition.y)
    }

    const startDrag = (x, y) => {
      state.isDragging = true
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
      state.targetOffset.x -= deltaX * 0.003
      state.targetOffset.y += deltaY * 0.003
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
      state.targetOffset.x += event.deltaX * unit * 0.003
      state.targetOffset.y -= event.deltaY * unit * 0.003
      state.wheelNavigating = true
    }

    const onPointerDown = (event) => {
      event.preventDefault()
      container.setPointerCapture?.(event.pointerId)
      startDrag(event.clientX, event.clientY)
    }
    const onPointerMove = (event) => {
      updateMousePosition(event)
      handleMove(event.clientX, event.clientY)
    }
    const onPointerUp = (event) => {
      if (container.hasPointerCapture?.(event.pointerId))
        container.releasePointerCapture(event.pointerId)
      endDrag()
    }
    const onPointerLeave = () => {
      state.mousePosition.x = state.mousePosition.y = -1
      plane?.material.uniforms.uMousePos.value.set(-1, -1)
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
      const textCanvases = items.map((item) =>
        createTextCanvas(item.title, item.year, defaultConfig.textColor),
      )
      try {
        imageAtlas = createTextureAtlas(imageTiles, false)
      } finally {
        closeBitmaps(preparedImages)
      }
      textAtlas = createTextureAtlas(textCanvases, true)
      if (cancelled) return

      const uniforms = {
        uOffset: { value: new THREE.Vector2(0, 0) },
        uResolution: {
          value: new THREE.Vector2(
            container.clientWidth,
            container.clientHeight,
          ),
        },
        uBorderColor: {
          value: new THREE.Vector4(...getPalette(isDarkRef.current).border),
        },
        uHoverColor: {
          value: new THREE.Vector4(...rgbaToArray(defaultConfig.hoverColor)),
        },
        uBackgroundColor: {
          value: new THREE.Vector4(...getPalette(isDarkRef.current).background),
        },
        uMousePos: { value: new THREE.Vector2(-1, -1) },
        uZoom: { value: 1 },
        uCellSize: { value: cellSize },
        uTextureCount: { value: images.length },
        uImageAtlas: { value: imageAtlas },
        uTextAtlas: { value: textAtlas },
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
      textAtlas?.dispose()
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
  }, [
    images,
    items,
    cellSize,
    zoomLevel,
    reducedMotion,
    onActiveChange,
    navigateRef,
  ])

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

/** @param {{ active?: boolean, images: string[], items: { title: string, year: string | number }[], cellSize?: number, zoomLevel?: number, className?: string, style?: import("react").CSSProperties, fallback?: import("react").ReactNode, onActiveChange?: (index: number) => void, navigateRef: import("react").RefObject<((delta: number) => void) | null> }} props */
export function ArtGallery({
  active = true,
  images,
  items,
  cellSize = defaultConfig.cellSize,
  zoomLevel = defaultConfig.zoomLevel,
  className,
  style,
  fallback,
  onActiveChange,
  navigateRef,
}) {
  const reducedMotion = useEffectReducedMotion()
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
        items={items}
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
