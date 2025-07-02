"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function NetworkVisualization() {
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; id: number }>>([])  
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const generateNodes = () => {
      if (typeof window === 'undefined') return
      
      const newNodes = Array.from({ length: 8 }, (_, i) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        id: i,
      }))
      setNodes(newNodes)
    }

    generateNodes()
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", generateNodes)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("resize", generateNodes)
      }
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-70 dark:opacity-50 z-5">
      <svg className="w-full h-full">
        {/* Connection Lines */}
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((otherNode, j) => {
            const distance = Math.sqrt(Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2))
            if (distance < 300) {
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={node.x}
                  y1={node.y}
                  x2={otherNode.x}
                  y2={otherNode.y}
                  stroke="url(#gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                />
              )
            }
            return null
          }),
        )}

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Network Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="4"
            fill="url(#gradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  )
}
