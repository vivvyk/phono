"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  TextInput,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { insertTransaction } from "@/supabase/queries/payments"

export default function PaymentScreen({ navigation, route }) {
  const { theme } = useTheme()
  const [amount, setAmount] = useState("0")
  const [description, setDescription] = useState("")
  const [showBankMenu, setShowBankMenu] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)
  const [currency, setCurrency] = useState("USD")

  const slideAnim = useRef(new Animated.Value(0)).current
  const screenHeight = Dimensions.get("window").height

  // Get friend from route params or use default
  const friend = route.params?.friend || null

  // Get action type from route params (pay or request)
  const [actionType, setActionType] = useState(route.params?.action || "pay")

  const handleNumberPress = (num) => {
    if (amount === "0") {
      setAmount(num)
    } else {
      setAmount(amount + num)
    }
  }

  const handleDecimalPress = () => {
    if (!amount.includes(".")) {
      setAmount(amount + ".")
    }
  }

  const handleDeletePress = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1))
    } else {
      setAmount("0")
    }
  }

  const handleContinue = () => {
    if (Number.parseFloat(amount) <= 0) return
  
    if (actionType === "request") {
      // Skip bank selection and send directly
      handleSend("request")
    } else {
      // Show bank selection menu for "pay"
      setShowBankMenu(true)
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }
  

  const handleCloseBankMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowBankMenu(false)
    })
  }

  const handleSelectBank = (bank) => {
    setSelectedBank(bank)
  }

  const handleSend = async () => {
    console.log("🔍 handleSend called")
    const destination_user_id = friend?.id
    const destination_clabe = String(Math.floor(1e17 + Math.random() * 9e17)) // 18-digit random
    const numericAmount = parseFloat(amount)
  
    const transactionStatus = actionType === "pay" ? "complete" : "pending"
    const transactionDirection = actionType === "pay" ? "outbound" : "inbound"
  
    const origin_clabe =
      actionType === "pay"
        ? selectedBank?.clabe ?? ""
        : String(Math.floor(1e17 + Math.random() * 9e17))
  
    if (actionType === "pay" && !selectedBank) {
      alert("Please select a bank")
      return
    }
  
    const success = await insertTransaction({
      destination_user_id,
      origin_clabe,
      destination_clabe,
      amount: numericAmount,
      currency,
      description,
      category: "transportation",
      request: actionType === "request",
      direction: transactionDirection,
      status: transactionStatus,
    })
  
    if (success) {
      alert(
        `You ${actionType === "pay" ? "paid" : "requested from"} ${
          friend?.name || "recipient"
        } $${amount} for "${description}"`
      )
      handleCloseBankMenu()
      navigation.navigate("Home")
    } else {
      alert("Error sending transaction. Please try again.")
    }
  }
  
  
  const banks = [
    {
      id: 1,
      name: "BBVA",
      logo: "https://placeholder.svg?height=40&width=40&query=BBVA+logo",
      color: "#004481",
      clabe: "012345678901234567",
    },
    {
      id: 2,
      name: "Santander",
      logo: "https://placeholder.svg?height=40&width=40&query=Santander+logo",
      color: "#EC0000",
      clabe: "014789456123789456",
    },
    {
      id: 3,
      name: "Banorte",
      logo: "https://placeholder.svg?height=40&width=40&query=Banorte+logo",
      color: "#E30613",
      clabe: "072123456789012345",
    },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Toggle and Close Button */}
      <View style={styles.header}>
        <View style={[styles.toggleContainer, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              actionType === "pay" ? styles.activeToggle : null,
              { backgroundColor: actionType === "pay" ? theme.cardBackground : "transparent" },
            ]}
            onPress={() => setActionType("pay")}
          >
            <Text style={[styles.toggleText, { color: actionType === "pay" ? theme.accent : theme.text }]}>Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              actionType === "request" ? styles.activeToggle : null,
              { backgroundColor: actionType === "request" ? theme.cardBackground : "transparent" },
            ]}
            onPress={() => setActionType("request")}
          >
            <Text style={[styles.toggleText, { color: actionType === "request" ? theme.accent : theme.text }]}>
              Request
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Friend Info */}
      {friend && (
        <View style={styles.friendContainer}>
          <View style={styles.friendAvatarContainer}>
            {friend.image ? (
              <Image source={{ uri: friend.image }} style={styles.friendAvatar} />
            ) : (
              <View style={[styles.friendAvatarFallback, { backgroundColor: theme.accent }]}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          </View>
          <Text style={[styles.friendName, { color: theme.text }]}>{friend.name}</Text>
          <Text style={[styles.friendHandle, { color: theme.textSecondary }]}>
            @{friend.handle || friend.name.toLowerCase().replace(/\s/g, "")}
          </Text>
        </View>
      )}

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: theme.text }]}>
          {currency === "USD" ? "$" : "MX$"}
          {amount}
        </Text>
      </View>

      {/* Currency Selector */}
      <View style={styles.currencyContainer}>
        <TouchableOpacity
          style={styles.currencySelector}
          onPress={() => {
            setCurrency(currency === "USD" ? "MXN" : "USD")
          }}
        >
          <Text style={[styles.currencyText, { color: theme.text }]}>{currency}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Description Field */}
      <View
        style={[
          styles.descriptionContainer,
          { backgroundColor: theme.cardBackground, borderColor: theme.border, marginHorizontal: 10 },
        ]}
      >
        <TextInput
          style={[styles.descriptionInput, { color: theme.text }]}
          placeholder="What's it for?"
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("1")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("2")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("3")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("4")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("5")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("6")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("7")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("8")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("9")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.keypadButton} onPress={handleDecimalPress}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={() => handleNumberPress("0")}>
            <Text style={[styles.keypadButtonText, { color: theme.text }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keypadButton} onPress={handleDeletePress}>
            <Ionicons name="backspace-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            backgroundColor:
              Number.parseFloat(amount) > 0 ? theme.accent : theme.disabled,
          },
        ]}
        onPress={handleContinue}
        disabled={Number.parseFloat(amount) <= 0}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Bank Selection Menu (only for 'pay') */}
      {showBankMenu && actionType !== "request" && (
        <TouchableWithoutFeedback onPress={handleCloseBankMenu}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.bankMenuContainer,
                {
                  backgroundColor: theme.cardBackground,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [screenHeight, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableWithoutFeedback>
                <View>
                  <View style={styles.bankMenuHeader}>
                    <Text style={[styles.bankMenuTitle, { color: theme.text }]}>
                      Select Bank
                    </Text>
                    <TouchableOpacity onPress={handleCloseBankMenu}>
                      <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankList}>
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.bankItem,
                          selectedBank?.id === bank.id && {
                            borderColor: bank.color,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => handleSelectBank(bank)}
                      >
                        <View
                          style={[styles.bankLogo, { backgroundColor: bank.color }]}
                        >
                          <Text style={styles.bankLogoText}>
                            {bank.name.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.bankInfo}>
                          <Text style={[styles.bankName, { color: theme.text }]}>
                            {bank.name}
                          </Text>
                          <Text
                            style={[styles.bankClabe, { color: theme.textSecondary }]}
                          >
                            CLABE: {bank.clabe}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: selectedBank
                          ? theme.accent
                          : theme.disabled,
                      },
                    ]}
                    onPress={() => handleSend()}
                    disabled={!selectedBank}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 25,
    overflow: "hidden",
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  activeToggle: {
    backgroundColor: "#162736",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    padding: 8,
  },
  friendContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  friendAvatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  friendHandle: {
    fontSize: 14,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amountText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  descriptionContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 4,
  },
  descriptionInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  keypadButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  keypadButtonText: {
    fontSize: 28,
    fontWeight: "500",
  },
  continueButton: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bankMenuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "50%",
  },
  bankMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bankMenuTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bankList: {
    marginBottom: 20,
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  bankLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankLogoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  bankClabe: {
    fontSize: 12,
  },
  sendButton: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 20,
    paddingRight: 10,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 4,
  },
})
