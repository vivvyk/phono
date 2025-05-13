import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"

export default function ConnectBankScreen({ navigation }) {
  const handleBankSelection = (bank) => {
    // Make sure we're passing the bank parameter correctly
    navigation.navigate("BankCredentials", { bank: bank })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Connect your bank</Text>
          <Text style={styles.subtitle}>Set up your bank to send money instantly.</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.banksContainer}>
          <TouchableOpacity style={styles.bankCard} onPress={() => handleBankSelection("BBVA")}>
            <View style={styles.logoContainer}>
              <View style={styles.bbvaLogo}>
                <Text style={styles.bbvaText}>BBVA</Text>
              </View>
            </View>
            <Text style={styles.bankName}>BBVA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bankCard} onPress={() => handleBankSelection("Banorte")}>
            <View style={styles.logoContainer}>
              <View style={styles.banorteLogo}>
                <Text style={styles.banorteText}>B</Text>
              </View>
            </View>
            <Text style={styles.bankName}>Banorte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bankCard} onPress={() => handleBankSelection("Banco Azteca")}>
            <View style={styles.logoContainer}>
              <View style={styles.aztecaLogo}>
                <Text style={styles.aztecaText}>BA</Text>
              </View>
            </View>
            <Text style={styles.bankName}>Banco Azteca</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't see your bank?{" "}
            <Text style={styles.contactLink} onPress={() => alert("Contact support")}>
              Contact us
            </Text>
            .
          </Text>
          <Text style={styles.smallText}>Mexico can be retarded etc.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContainer: {
    marginTop: "25%", // Position title about 25% from the top
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  spacer: {
    flex: 1,
    minHeight: 80, // Minimum space between title and banks
  },
  banksContainer: {
    width: "100%",
    marginBottom: 20,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    marginRight: 12,
  },
  bbvaLogo: {
    width: 40,
    height: 40,
    backgroundColor: "#004481",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  bbvaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  banorteLogo: {
    width: 40,
    height: 40,
    backgroundColor: "#EC1C24",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  banorteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  aztecaLogo: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  aztecaText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  bankName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 4,
  },
  contactLink: {
    color: "#007AFF",
    fontWeight: "500",
  },
  smallText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
  },
})
