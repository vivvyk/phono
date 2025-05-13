"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Animated, Dimensions, Easing } from "react-native"

const FloatingParticles = () => {
  const { width, height } = Dimensions.get("window")
  const [particles, setParticles] = useState([])

  // Generate random particles on component mount
  useEffect(() => {
    const particleCount = 20 // Number of particles
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1, // Random size between 1-4
        opacity: Math.random() * 0.3 + 0.1, // Random opacity between 0.1-0.4
        animated: new Animated.ValueXY({ x: Math.random() * width, y: Math.random() * height }),
        speed: Math.random() * 20000 + 15000, // Random speed between 15-35 seconds
      })
    }

    setParticles(newParticles)
  }, [])

  // Animate each particle
  useEffect(() => {
    particles.forEach((particle) => {
      animateParticle(particle)
    })
  }, [particles])

  // Animation function for a single particle
  const animateParticle = (particle) => {
    // Generate new random position
    const toX = Math.random() * width
    const toY = Math.random() * height

    // Create animation
    Animated.timing(particle.animated, {
      toValue: { x: toX, y: toY },
      duration: particle.speed,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      // When animation completes, start a new one
      animateParticle(particle)
    })
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              backgroundColor: "#00ACC1",
              borderRadius: particle.size / 2,
              transform: [{ translateX: particle.animated.x }, { translateY: particle.animated.y }],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
  },
})

export default FloatingParticles
