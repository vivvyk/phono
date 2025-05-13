"use client"

import { useState } from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Sample data for language options
const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Español" },
  { id: "fr", name: "Français" },
]

// Sample data for spending categories
const defaultCategories = [
  { id: "1", name: "Food & Dining", icon: "restaurant", color: "#F59E0B" },
  { id: "2", name: "Transportation", icon: "car", color: "#10B981" },
  { id: "3", name: "Shopping", icon: "cart", color: "#8B5CF6" },
  { id: "4", name: "Bills & Utilities", icon: "receipt", color: "#EF4444" },
  { id: "5", name: "Entertainment", icon: "film", color: "#6366F1" },
]

const SettingsModal = ({ visible, onClose, theme }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [categories, setCategories] = useState(defaultCategories)
  const [defaultAmount, setDefaultAmount] = useState("100")
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [transactionAlerts, setTransactionAlerts] = useState(true)

  // Language selection handler
  const handleLanguageSelect = (langId) => {
    setSelectedLanguage(langId)
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={[styles.centeredView, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalView, { backgroundColor: theme.card || theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Language Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Language Preference</Text>
              <View style={styles.optionsContainer}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.languageOption,
                      selectedLanguage === lang.id && {
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                      },
                    ]}
                    onPress={() => handleLanguageSelect(lang.id)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        { color: theme.text },
                        selectedLanguage === lang.id && {
                          color: theme.primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {lang.name}
                    </Text>
                    {selectedLanguage === lang.id && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Spending Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Spending Categories</Text>
              <FlatList
                data={categories}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.categoryItem}>
                    <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon} size={16} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
                    <TouchableOpacity>
                      <Ionicons name="create-outline" size={20} color={theme.secondaryText} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={[styles.addButton, { borderColor: theme.border || "rgba(0,0,0,0.1)" }]}>
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={{ color: theme.primary, marginLeft: 8 }}>Add Category</Text>
              </TouchableOpacity>
            </View>

            {/* Default Transfer Amount */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Default Transfer Amount</Text>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: theme.border || "rgba(0,0,0,0.1)", backgroundColor: theme.background },
                ]}
              >
                <Text style={{ color: theme.text, fontSize: 16 }}>$</Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.text }]}
                  value={defaultAmount}
                  onChangeText={setDefaultAmount}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
              <Text style={[styles.helperText, { color: theme.secondaryText }]}>
                This amount will be pre-filled when you initiate a transfer
              </Text>
            </View>

            {/* Notification Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Preferences</Text>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>Push Notifications</Text>
                  <Text style={[styles.notificationDesc, { color: theme.secondaryText }]}>
                    Receive alerts on your device
                  </Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: "#E0E0E0", true: theme.primary }}
                  thumbColor={"#FFFFFF"}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>Email Notifications</Text>
                  <Text style={[styles.notificationDesc, { color: theme.secondaryText }]}>
                    Receive updates via email
                  </Text>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: "#E0E0E0", true: theme.primary }}
                  thumbColor={"#FFFFFF"}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]}>Transaction Alerts</Text>
                  <Text style={[styles.notificationDesc, { color: theme.secondaryText }]}>
                    Get notified for all transactions
                  </Text>
                </View>
                <Switch
                  value={transactionAlerts}
                  onValueChange={setTransactionAlerts}
                  trackColor={{ false: "#E0E0E0", true: theme.primary }}
                  thumbColor={"#FFFFFF"}
                />
              </View>
            </View>

            {/* Help & Support */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Help & Support</Text>

              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="help-circle-outline" size={22} color={theme.primary} />
                <Text style={[styles.helpText, { color: theme.text }]}>FAQ / Help Center</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} style={{ marginLeft: "auto" }} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpItem}>
                <Ionicons name="chatbubble-outline" size={22} color={theme.primary} />
                <Text style={[styles.helpText, { color: theme.text }]}>Contact Support</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsContainer: {
    marginTop: 8,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  helperText: {
    fontSize: 14,
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  notificationDesc: {
    fontSize: 14,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  helpText: {
    fontSize: 16,
    marginLeft: 12,
  },
})

export default SettingsModal
