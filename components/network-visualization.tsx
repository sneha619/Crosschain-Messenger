"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with fallback for SSR
    const resizeCanvas = () => {
      if (typeof window !== 'undefined') {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      } else {
        canvas.width = 1200
        canvas.height = 800
      }
    }

    resizeCanvas()
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", resizeCanvas)
    }

    // Node class
    class Node {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      connected: Node[]

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.connected = []
      }

      update(width: number, height: number) {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < this.radius || this.x > width - this.radius) {
          this.vx *= -1
        }
        if (this.y < this.radius || this.y > height - this.radius) {
          this.vy *= -1
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Draw connections
        this.connected.forEach((node) => {
          ctx.beginPath()
          ctx.moveTo(this.x, this.y)
          ctx.lineTo(node.x, node.y)
          ctx.strokeStyle = `rgba(100, 116, 139, 0.1)`
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }
    }

    // Create nodes
    const nodeCount = Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 100) // Responsive node count
    const nodes: Node[] = []
    const colors = [
      "rgba(59, 130, 246, 0.5)", // blue
      "rgba(168, 85, 247, 0.5)", // purple
      "rgba(236, 72, 153, 0.5)", // pink
      "rgba(99, 102, 241, 0.5)", // indigo
    ]

    for (let i = 0; i < nodeCount; i++) {
      const radius = Math.random() * 2 + 1
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const color = colors[Math.floor(Math.random() * colors.length)]
      nodes.push(new Node(x, y, radius, color))
    }

    // Connect nodes
    nodes.forEach((node) => {
      const connectCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < connectCount; i++) {
        const randomNode = nodes[Math.floor(Math.random() * nodes.length)]
        if (randomNode !== node && !node.connected.includes(randomNode)) {
          node.connected.push(randomNode)
        }
      }
    })

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw nodes
      nodes.forEach((node) => {
        node.update(canvas.width, canvas.height)
        node.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-80 dark:opacity-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 1 }}
    />
  )
}