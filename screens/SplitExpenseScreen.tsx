"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Sample data for contacts and groups
const RECENT_CONTACTS = [
  { id: "1", name: "Andrew Phennicie", color: "#3B82F6", selected: false },
  { id: "2", name: "Roop Pal", color: "#F97316", selected: false },
  { id: "3", name: "Jonathan Cadiz", color: "#F97316", selected: false },
]

const GROUPS = [
  { id: "g1", name: "1024 Jena Terrace", icon: "home", color: "#00BCD4", selected: false },
  { id: "g2", name: "Cadiz '23", icon: "airplane", color: "#00BCD4", selected: false },
  { id: "g3", name: "Roommates", icon: "people", color: "#00BCD4", selected: false },
]

export default function SplitExpenseScreen({ navigation }) {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [recentContacts, setRecentContacts] = useState(RECENT_CONTACTS)
  const [groups, setGroups] = useState(GROUPS)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [step, setStep] = useState(1) // 1: Select people, 2: Enter amount and description

  const inputRef = useRef(null)

  const toggleContactSelection = (id) => {
    setRecentContacts(
      recentContacts.map((contact) => (contact.id === id ? { ...contact, selected: !contact.selected } : contact)),
    )
  }

  const toggleGroupSelection = (id) => {
    setGroups(groups.map((group) => (group.id === id ? { ...group, selected: !group.selected } : group)))
  }

  const handleContinue = () => {
    if (step === 1) {
      // Check if any contact or group is selected
      if (recentContacts.some((c) => c.selected) || groups.some((g) => g.selected)) {
        setStep(2)
      } else {
        alert("Please select at least one person or group")
      }
    } else {
      // Handle saving the expense
      if (!amount || !description) {
        alert("Please enter an amount and description")
        return
      }

      const selectedContacts = recentContacts.filter((c) => c.selected).map((c) => c.name)
      const selectedGroups = groups.filter((g) => g.selected).map((g) => g.name)

      alert(
        `Expense of $${amount} for "${description}" will be split with: ${[...selectedContacts, ...selectedGroups].join(
          ", ",
        )}`,
      )
      navigation.goBack()
    }
  }

  const renderSelectPeopleScreen = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>With you and:</Text>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: theme.text, borderColor: theme.border }]}
          placeholder="Enter names, emails, or phone #s"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Contacts Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent</Text>
        {recentContacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            onPress={() => toggleContactSelection(contact.id)}
          >
            <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
              <Text style={styles.contactInitials}>
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
            <View
              style={[
                styles.selectionCircle,
                {
                  borderColor: theme.border,
                  backgroundColor: contact.selected ? "#00BCD4" : "transparent",
                },
              ]}
            >
              {contact.selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Groups Section */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Groups</Text>
        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.contactItem} onPress={() => toggleGroupSelection(group.id)}>
            <View style={[styles.groupAvatar, { backgroundColor: group.color }]}>
              <Ionicons name={group.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.contactName, { color: theme.text }]}>{group.name}</Text>
            <View
              style={[
                styles.selectionCircle,
                {
                  borderColor: theme.border,
                  backgroundColor: group.selected ? "#00BCD4" : "transparent",
                },
              ]}
            >
              {group.selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  )

  const renderAmountScreen = () => (
    <View style={styles.amountContainer}>
      <Text style={[styles.amountLabel, { color: theme.text }]}>How much was the expense?</Text>
      <View style={styles.amountInputContainer}>
        <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
        <TextInput
          style={[styles.amountInput, { color: theme.text }]}
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />
      </View>

      <Text style={[styles.descriptionLabel, { color: theme.text }]}>What was it for?</Text>
      <TextInput
        style={[styles.descriptionInput, { color: theme.text, borderColor: theme.border }]}
        placeholder="Enter a description"
        placeholderTextColor={theme.textSecondary}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.selectedPeopleContainer}>
        <Text style={[styles.selectedPeopleLabel, { color: theme.text }]}>Splitting with:</Text>
        <View style={styles.selectedPeopleList}>
          {recentContacts
            .filter((c) => c.selected)
            .map((contact) => (
              <View key={contact.id} style={[styles.selectedPersonChip, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.selectedPersonName, { color: theme.text }]}>{contact.name}</Text>
              </View>
            ))}
          {groups
            .filter((g) => g.selected)
            .map((group) => (
              <View key={group.id} style={[styles.selectedPersonChip, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.selectedPersonName, { color: theme.text }]}>{group.name}</Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Add an expense</Text>
          <TouchableOpacity onPress={handleContinue} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: "#00BCD4" }]}>{step === 1 ? "Next" : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{step === 1 ? renderSelectPeopleScreen() : renderAmountScreen()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInitials: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  contactName: {
    flex: 1,
    fontSize: 16,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  selectedPeopleContainer: {
    marginTop: 16,
  },
  selectedPeopleLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  selectedPeopleList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedPersonChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPersonName: {
    fontSize: 14,
  },
})