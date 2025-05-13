"use client"

import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop, Path, Rect } from "react-native-svg";

// Floating Particles Component
const FloatingParticles = () => {
  const { width, height } = Dimensions.get("window");
  const [particles, setParticles] = useState([]);
  
  // Generate random particles on component mount
  useEffect(() => {
    const particleCount = 20; // Number of particles
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1, // Random size between 1-4
        opacity: Math.random() * 0.3 + 0.1, // Random opacity between 0.1-0.4
        animated: new Animated.ValueXY({ x: Math.random() * width, y: Math.random() * height }),
        speed: Math.random() * 20000 + 15000, // Random speed between 15-35 seconds
      });
    }
    
    setParticles(newParticles);
  }, []);
  
  // Animate each particle
  useEffect(() => {
    particles.forEach(particle => {
      animateParticle(particle);
    });
  }, [particles]);
  
  // Animation function for a single particle
  const animateParticle = (particle) => {
    // Generate new random position
    const toX = Math.random() * width;
    const toY = Math.random() * height;
    
    // Create animation
    Animated.timing(particle.animated, {
      toValue: { x: toX, y: toY },
      duration: particle.speed,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      // When animation completes, start a new one
      animateParticle(particle);
    });
  };
  
  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map(particle => (
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
              transform: [
                { translateX: particle.animated.x },
                { translateY: particle.animated.y },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function WelcomeScreen({ navigation }) {
  const [showSignInOptions, setShowSignInOptions] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const signInOptionsAnimation = useRef(new Animated.Value(0)).current;

  const handleCreateAccount = () => {
    navigation.navigate("SignUp");
  };

  const handleSignIn = () => {
    // Start animation - faster duration
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSignInOptions(true);
      Animated.timing(signInOptionsAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(signInOptionsAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSignInOptions(false);
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handlePhoneSignIn = () => {
    navigation.navigate("PhoneSignIn");
  };

  const handleGoogleSignIn = () => {
    navigation.navigate("ConnectBank");
  };

  const handleAppleSignIn = () => {
    navigation.navigate("ConnectBank");
  };

  const { width, height } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1A2A', '#102030', '#0A1A2A']}
        style={styles.background}
      >
        {/* Sophisticated background design */}
        <View style={styles.backgroundDesign}>
          <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="gradTeal" cx="50%" cy="35%" rx="50%" ry="50%" gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor="#00ACC1" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#00ACC1" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="gradPink" cx="50%" cy="35%" rx="50%" ry="50%" gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor="#F8BBD0" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#F8BBD0" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            {/* Abstract shapes - one teal, one pink */}
            <Circle cx={width * 0.8} cy={height * 0.2} r={100} fill="url(#gradTeal)" />
            <Circle cx={width * 0.2} cy={height * 0.7} r={120} fill="url(#gradPink)" opacity={0.4} />
            
            {/* Subtle grid pattern */}
            <Path 
              d={`M0,${height/4} L${width},${height/4}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            <Path 
              d={`M0,${height/2} L${width},${height/2}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            <Path 
              d={`M0,${3*height/4} L${width},${3*height/4}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            <Path 
              d={`M${width/4},0 L${width/4},${height}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            <Path 
              d={`M${width/2},0 L${width/2},${height}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            <Path 
              d={`M${3*width/4},0 L${3*width/4},${height}`} 
              stroke="#FFFFFF" 
              strokeWidth="0.3" 
              opacity="0.05" 
            />
            
            {/* Decorative elements */}
            <Rect x={width*0.1} y={height*0.3} width={30} height={2} rx={1} fill="#00ACC1" opacity={0.3} />
            <Rect x={width*0.15} y={height*0.32} width={15} height={2} rx={1} fill="#00ACC1" opacity={0.2} />
            <Rect x={width*0.7} y={height*0.6} width={40} height={2} rx={1} fill="#F8BBD0" opacity={0.3} />
            <Rect x={width*0.75} y={height*0.62} width={20} height={2} rx={1} fill="#F8BBD0" opacity={0.2} />
          </Svg>
          
          {/* Floating particles */}
          <FloatingParticles />
        </View>
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.centerContent}>
              <Text style={styles.title}>Phono</Text>
              <Text style={styles.subtitle}>Make money with friends</Text>
            </View>

            <View style={styles.bottomContent}>
              {!showSignInOptions ? (
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    {
                      opacity: fadeAnimation,
                      transform: [{ translateY: slideAnimation }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.createAccountButton}
                    onPress={handlePhoneSignIn}
                  >
                    <Text style={styles.createAccountButtonText}>
                      Create account
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signInButton}
                    onPress={handleSignIn}
                  >
                    <Text style={styles.signInButtonText}>Sign in</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View
                  style={[
                    styles.signInOptionsContainer,
                    {
                      opacity: signInOptionsAnimation,
                    },
                  ]}
                >
                  <Text style={styles.lastSignInText}>
                    You signed in last time with your phone number.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.appleButton}
                    onPress={handleAppleSignIn}
                  >
                    <Ionicons name="logo-apple" size={20} color="#000000" style={styles.buttonIcon} />
                    <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                  >
                    <Ionicons name="logo-google" size={20} color="#000000" style={styles.buttonIcon} />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={handlePhoneSignIn}
                  >
                    <Ionicons name="call-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.phoneButtonText}>Sign in with Phone Number</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By tapping 'Sign in' / 'Create account', you agree to our{" "}
                  <Text
                    style={styles.link}
                    onPress={() => alert("Terms of Service")}
                  >
                    Terms of Service
                  </Text>
                  . Learn how we process your data in our{" "}
                  <Text
                    style={styles.link}
                    onPress={() => alert("Privacy Policy")}
                  >
                    Privacy Policy
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={styles.link}
                    onPress={() => alert("Cookies Policy")}
                  >
                    Cookies Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundDesign: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
  },
  bottomContent: {
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  signInOptionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  createAccountButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00ACC1",
    borderRadius: 50,
    paddingVertical: 16,
    marginBottom: 16,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signInButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
    paddingVertical: 16,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 16,
    marginBottom: 16,
  },
  appleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 16,
    marginBottom: 16,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00ACC1",
    borderRadius: 50,
    paddingVertical: 16,
    marginBottom: 16,
  },
  phoneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
    paddingVertical: 16,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
  },
  link: {
    color: "#00ACC1",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  lastSignInText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  }
});