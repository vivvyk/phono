"use client"

import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from "@react-navigation/native"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import SettingsModal from "../components/SettingsModal"
import { signOut } from "../authentication/auth"
import { getProfile, type ProfileData } from "../supabase/getView"

export default function ProfileScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(theme.dark)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  const fetchProfile = async () => {
    const data = await getProfile()
    console.log("profileData", data)
    setProfileData(data)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Run when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile()
    }, []),
  )

  const handleDarkModeToggle = () => {
    toggleTheme()
    setIsDarkMode(!isDarkMode)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsModalVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle" size={80} color="#00BCD4" />
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>{profileData?.name ?? "Loading..."}</Text>
          <Text style={[styles.profileSubtitle, { color: theme.textSecondary }]}>{profileData?.role ?? ""}</Text>
        </View>

        {/* Balance */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Your Balance</Text>
          </View>
          <Text style={[styles.balanceAmount, { color: theme.text }]}>
            {formatCurrency(profileData?.balance ?? 0)}
          </Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#00BCD4" }]}>
            <Text style={styles.actionButtonText}>Transfer Money</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: "#00BCD4" }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {profileData?.recent_transactions?.map((txn) => {
            const isInbound = txn.direction === "inbound"
            const amountColor = isInbound ? "#10B981" : "#EF4444"
            const amountPrefix = isInbound ? "+" : "-"
            const date = new Date(txn.transaction_datetime)
            const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            return (
              <View style={styles.transactionItem} key={txn.transaction_id}>
                <View style={styles.transactionLeftSection}>
                  <View style={[styles.transactionAvatar, { backgroundColor: isInbound ? "#00BCD4" : "#F59E0B" }]}>
                    <Ionicons name="person" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionPerson, { color: theme.text }]}>{txn.counterparty_name}</Text>
                    <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>Today, {formattedTime}</Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: amountColor }]}>
                  {amountPrefix}${txn.amount}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Friends */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Friends</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: "#00BCD4" }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsContainer}>
            {profileData?.friends?.map((friend) => (
              <TouchableOpacity style={styles.friendItem} key={friend.user_id}>
                <View style={[styles.friendAvatar, { backgroundColor: "#00BCD4" }]}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.friendName, { color: theme.textSecondary }]}>{friend.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Banks/Cards Section */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Banks</Text>
          </View>

          <View style={[styles.bankItem, { borderBottomColor: theme.border }]}>
            <View style={styles.bankLogo}>
              <Text style={styles.bankLogoText}>BBVA</Text>
            </View>
            <View style={styles.bankDetails}>
              <Text style={[styles.bankName, { color: theme.text }]}>BBVA</Text>
              <Text style={[styles.accountNumber, { color: theme.textSecondary }]}>•••• 4321</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </View>

          <TouchableOpacity style={styles.addBankButton} onPress={() => navigation.navigate("ConnectBank")}>
            <Ionicons name="add-circle-outline" size={20} color="#00BCD4" />
            <Text style={[styles.addBankText, { color: "#00BCD4" }]}>Add Another Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Settings</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#E0E0E0", true: "#00BCD4" }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                  try {
                    await signOut(); // Supabase sign out
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Welcome" }],
                    });
                  } catch (err) {
                    console.error("Error signing out:", err);
                    Alert.alert("Sign Out Failed", "Please try again.");
                  }
                },
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#EF4444" }}>Sign Out</Text>
      </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        theme={{
          text: theme.text,
          primary: "#00BCD4",
          secondaryText: theme.textSecondary,
          background: theme.background,
          card: theme.cardBackground,
          border: theme.border,
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileIconContainer: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {},
  transactionPerson: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  friendsContainer: {
    marginBottom: 8,
  },
  friendItem: {
    alignItems: "center",
    marginRight: 20,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bankLogo: {
    width: 40,
    height: 40,
    backgroundColor: "#004481",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankLogoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
  },
  addBankButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  addBankText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
  },
})