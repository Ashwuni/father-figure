import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore'

interface ParticlesProps {
  count?: number
  streak: number
}

function Particles({ count = 200, streak }: ParticlesProps) {
  const mesh = useRef<THREE.Points>(null)
  const time = useRef(0)

  const { positions, velocities, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      velocities[i * 3] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = Math.random() * 0.003 + 0.001
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001

      sizes[i] = Math.random() * 3 + 0.5

      // Mix of gold and rose particles
      const isGold = Math.random() > 0.5
      if (isGold) {
        colors[i * 3] = 0.78
        colors[i * 3 + 1] = 0.66
        colors[i * 3 + 2] = 0.3
      } else {
        colors[i * 3] = 0.91
        colors[i * 3 + 1] = 0.12
        colors[i * 3 + 2] = 0.55
      }
    }

    return { positions, velocities, sizes, colors }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [positions, colors, sizes])

  useFrame((_, delta) => {
    if (!mesh.current) return
    time.current += delta

    const posAttr = mesh.current.geometry.attributes.position
    const posArray = posAttr.array as Float32Array
    const intensity = 1 + streak * 0.15

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3] * intensity
      posArray[i * 3 + 1] += velocities[i * 3 + 1] * intensity
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      // Wrap around
      if (posArray[i * 3 + 1] > 10) posArray[i * 3 + 1] = -10
      if (posArray[i * 3] > 10) posArray[i * 3] = -10
      if (posArray[i * 3] < -10) posArray[i * 3] = 10
    }
    posAttr.needsUpdate = true

    // Slow rotation
    mesh.current.rotation.y = time.current * 0.03
    mesh.current.rotation.x = Math.sin(time.current * 0.02) * 0.1
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.6 + Math.min(streak * 0.04, 0.35)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function FloatingOrbs({ streak }: { streak: number }) {
  const group = useRef<THREE.Group>(null)
  const time = useRef(0)

  const orbs = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    x: (Math.random() - 0.5) * 12,
    y: (Math.random() - 0.5) * 8,
    z: -3 - Math.random() * 4,
    radius: 0.3 + Math.random() * 0.5,
    speed: 0.3 + Math.random() * 0.5,
    phase: (i / 6) * Math.PI * 2,
    isGold: i % 2 === 0,
  })), [])

  useFrame((_, delta) => {
    if (!group.current) return
    time.current += delta
    group.current.children.forEach((child, i) => {
      const orb = orbs[i]
      if (!orb) return
      child.position.y = orb.y + Math.sin(time.current * orb.speed + orb.phase) * 0.8
      child.position.x = orb.x + Math.cos(time.current * orb.speed * 0.5 + orb.phase) * 0.3
    })
  })

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={[orb.x, orb.y, orb.z]}>
          <sphereGeometry args={[orb.radius, 16, 16]} />
          <meshBasicMaterial
            color={orb.isGold ? '#c9a84c' : '#e91e8c'}
            transparent
            opacity={0.04 + Math.min(streak * 0.005, 0.08)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function ParticleField() {
  const streak = useGameStore(s => s.streak)

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Particles count={250} streak={streak} />
        <FloatingOrbs streak={streak} />
      </Canvas>
    </div>
  )
}
