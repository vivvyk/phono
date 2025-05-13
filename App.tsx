"use client"
import 'react-native-url-polyfill/auto'

if (__DEV__) {
  const nativeConsole = { ...console }

  const suppressOnDevice = (...args: any[]) => {
    if (typeof window === "undefined") {
      // This is the Metro/Node terminal (keep logs)
      nativeConsole.log(...args)
    }
    // Else: running in device environment (suppress)
  }

  console.log = suppressOnDevice
  console.warn = suppressOnDevice
  console.error = suppressOnDevice
  console.info = suppressOnDevice
  console.debug = suppressOnDevice
}

import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { ThemeProvider } from "./context/ThemeContext"
import { getInitialRoute } from "./authentication/auth"
import { startGlobalRealtimeListener } from "./hooks/realtimeListener"

import HomeScreen from "./screens/HomeScreen"
import FriendSelectionScreen from "./screens/FriendSelectionScreen"
import PaymentScreen from "./screens/PaymentScreen"
import TransactionSummaryScreen from "./screens/TransactionSummaryScreen"
import ProfileScreen from "./screens/ProfileScreen"
import InsightsScreen from "./screens/InsightsScreen"
import SplitExpenseScreen from "./screens/SplitExpenseScreen"
import InviteScreen from "./screens/InviteScreen"
import WelcomeScreen from "./screens/WelcomeScreen"
import ConnectBankScreen from "./screens/ConnectBankScreen"
import BankCredentialsScreen from "./screens/BankCredentialsScreen"
import SignUpScreen from "./screens/SignUpScreen"
import VerifyCodeScreen from "./screens/VerifyCodeScreen"
import PhoneSignInScreen from "./screens/PhoneSignInScreen"
import ProfileSetupScreen from "./screens/ProfileSetupScreen"
import TransactionsScreen from "./screens/TransactionsScreen"
import NotificationScreen from "./screens/NotificationScreen"
const Stack = createNativeStackNavigator()

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    startGlobalRealtimeListener(["users", "friends", "friend_requests", "transactions", "notifications"])
  }, [])

  useEffect(() => {
    const checkInitialRoute = async () => {
      const route = await getInitialRoute()
      setInitialRoute(route)
    }
    checkInitialRoute()
  }, [])

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="FriendSelection" component={FriendSelectionScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="TransactionSummary" component={TransactionSummaryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Insights" component={InsightsScreen} />
          <Stack.Screen name="SplitExpense" component={SplitExpenseScreen} />
          <Stack.Screen name="Invite" component={InviteScreen} />
          <Stack.Screen name="ConnectBank" component={ConnectBankScreen} />
          <Stack.Screen name="BankCredentials" component={BankCredentialsScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
          <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  )
}
