"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

// Mock data for the chart
const generateChartData = (period) => {
  const now = new Date()
  const data = []

  switch (period) {
    case "1d":
      // Generate hourly data for the last 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = new Date(now)
        hour.setHours(now.getHours() - 23 + i)
        const value = 1000 + Math.random() * 300 - (i < 12 ? 50 : 0)
        data.push({ time: hour.toLocaleTimeString([], { hour: "2-digit" }), value })
      }
      break
    case "1w":
      // Generate daily data for the last 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(now)
        day.setDate(now.getDate() - 6 + i)
        const value = 950 + Math.random() * 400 - (i < 3 ? 100 : 0)
        data.push({ time: day.toLocaleDateString([], { weekday: "short" }), value })
      }
      break
    case "1m":
      // Generate weekly data for the last month
      for (let i = 0; i < 4; i++) {
        const week = new Date(now)
        week.setDate(now.getDate() - 28 + i * 7)
        const value = 900 + Math.random() * 500 - (i < 2 ? 150 : 0)
        data.push({ time: `Week ${i + 1}`, value })
      }
      break
    case "all":
      // Generate monthly data for the last year
      for (let i = 0; i < 12; i++) {
        const month = new Date(now)
        month.setMonth(now.getMonth() - 11 + i)
        const value = 800 + Math.random() * 600 - (i < 6 ? 200 : 0)
        data.push({ time: month.toLocaleDateString([], { month: "short" }), value })
      }
      break
  }

  return data
}

// Calculate net change based on chart data
const calculateNetChange = (data) => {
  if (data.length < 2) return { amount: 0, percentage: 0 }

  const startValue = data[0].value
  const endValue = data[data.length - 1].value
  const change = endValue - startValue
  const percentage = (change / startValue) * 100

  return {
    amount: change.toFixed(2),
    percentage: percentage.toFixed(2),
  }
}

export default function InsightsScreen({ navigation }) {
  const { theme } = useTheme()
  const [period, setPeriod] = useState("1w") // Default to 1 week
  const [selectedCategory, setSelectedCategory] = useState("all") // Default to all categories
  const chartData = generateChartData(period)
  const netChange = calculateNetChange(chartData)

  // Available transaction categories
  const categories = [
    { id: "all", name: "All", icon: "apps-outline" },
    { id: "food", name: "Food", icon: "restaurant-outline" },
    { id: "transport", name: "Transport", icon: "car-outline" },
    { id: "entertainment", name: "Entertainment", icon: "film-outline" },
    { id: "shopping", name: "Shopping", icon: "cart-outline" },
  ]

  // Calculate chart dimensions with proper padding
  const screenWidth = Dimensions.get("window").width
  const chartWidth = screenWidth - 120 // Account for padding and y-axis labels
  const chartHeight = 180
  const maxValue = Math.max(...chartData.map((item) => item.value))
  const minValue = Math.min(...chartData.map((item) => item.value))
  const valueRange = maxValue - minValue

  // Function to draw the chart
  const renderChart = () => {
    // Calculate positions for the line
    const dataPoints = chartData.map((item, index) => {
      const x = (index / (chartData.length - 1)) * (chartWidth - 10)
      const normalizedValue = (item.value - minValue) / valueRange
      const y = chartHeight - normalizedValue * chartHeight
      return { x, y, value: item.value, time: item.time }
    })

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>${maxValue.toFixed(0)}</Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>
            ${(minValue + valueRange / 2).toFixed(0)}
          </Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>${minValue.toFixed(0)}</Text>
        </View>

        {/* Chart line */}
        <View style={styles.chartContent}>
          <View style={styles.lineContainer}>
            {/* Draw the line */}
            <View style={styles.lineBackground}>
              {dataPoints.map((point, index) => {
                if (index === 0) return null
                const prevPoint = dataPoints[index - 1]

                // Calculate line angle and length
                const dx = point.x - prevPoint.x
                const dy = point.y - prevPoint.y
                const length = Math.sqrt(dx * dx + dy * dy)
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI

                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.lineSegment,
                      {
                        width: length,
                        left: prevPoint.x,
                        top: prevPoint.y,
                        transform: [{ rotate: `${angle}deg` }],
                        backgroundColor: theme.dark ? "#6366F1" : "#6366F1",
                      },
                    ]}
                  />
                )
              })}

              {/* Draw the data points */}
              {dataPoints.map((point, index) => (
                <View
                  key={`point-${index}`}
                  style={[
                    styles.dataPoint,
                    {
                      left: point.x - 4, // Center the point (8px width / 2)
                      top: point.y - 4, // Center the point (8px height / 2)
                      backgroundColor: theme.dark ? "#FFFFFF" : "#FFFFFF",
                      borderColor: theme.dark ? "#6366F1" : "#6366F1",
                    },
                  ]}
                />
              ))}
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              {chartData.map((item, index) => {
                // Only show labels for first, middle, and last points for dense data
                if (chartData.length > 5) {
                  if (index !== 0 && index !== Math.floor(chartData.length / 2) && index !== chartData.length - 1) {
                    return null
                  }
                }

                return (
                  <Text
                    key={`label-${index}`}
                    style={[
                      styles.timeLabel,
                      {
                        color: theme.textSecondary,
                        position: "absolute",
                        left: (index / (chartData.length - 1)) * chartWidth - 15,
                        width: 30,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {item.time}
                  </Text>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Insights</Text>
        <View style={{ width: 24 }} /> {/* Empty view for spacing */}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "1d" && [styles.activePeriod, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }],
            ]}
            onPress={() => setPeriod("1d")}
          >
            <Text
              style={[
                styles.periodText,
                { color: theme.textSecondary },
                period === "1d" && { color: theme.text, fontWeight: "600" },
              ]}
            >
              1D
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "1w" && [styles.activePeriod, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }],
            ]}
            onPress={() => setPeriod("1w")}
          >
            <Text
              style={[
                styles.periodText,
                { color: theme.textSecondary },
                period === "1w" && { color: theme.text, fontWeight: "600" },
              ]}
            >
              1W
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "1m" && [styles.activePeriod, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }],
            ]}
            onPress={() => setPeriod("1m")}
          >
            <Text
              style={[
                styles.periodText,
                { color: theme.textSecondary },
                period === "1m" && { color: theme.text, fontWeight: "600" },
              ]}
            >
              1M
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "all" && [styles.activePeriod, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }],
            ]}
            onPress={() => setPeriod("all")}
          >
            <Text
              style={[
                styles.periodText,
                { color: theme.textSecondary },
                period === "all" && { color: theme.text, fontWeight: "600" },
              ]}
            >
              ALL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categorySelector}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && [
                  styles.activeCategory,
                  { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" },
                ],
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? (theme.dark ? "#FFFFFF" : "#000000") : theme.textSecondary}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.textSecondary },
                  selectedCategory === category.id && { color: theme.text, fontWeight: "500" },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Net change cards */}
        <View style={styles.netChangeContainer}>
          <View style={[styles.netChangeCard, { backgroundColor: theme.cardBackground }, { marginRight: 8 }]}>
            <Text style={[styles.netChangeLabel, { color: theme.textSecondary }]}>Net Change</Text>
            <Text
              style={[
                styles.netChangeValue,
                { color: Number.parseFloat(netChange.amount) >= 0 ? "#10B981" : "#EF4444" },
              ]}
            >
              {Number.parseFloat(netChange.amount) >= 0 ? "+" : ""}
              {netChange.amount}
            </Text>
          </View>

          <View style={[styles.netChangeCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.netChangeLabel, { color: theme.textSecondary }]}>Percentage</Text>
            <Text
              style={[
                styles.netChangeValue,
                { color: Number.parseFloat(netChange.percentage) >= 0 ? "#10B981" : "#EF4444" },
              ]}
            >
              {Number.parseFloat(netChange.percentage) >= 0 ? "+" : ""}
              {netChange.percentage}%
            </Text>
          </View>
        </View>

        {/* Recent activity summary */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Activity Summary</Text>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconContainer, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }]}>
              <Ionicons name="arrow-up-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.summaryDetails}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Money Sent</Text>
              <Text style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
                {period === "1d"
                  ? "Today"
                  : period === "1w"
                    ? "This week"
                    : period === "1m"
                      ? "This month"
                      : "All time"}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: "#EF4444" }]}>-$798</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconContainer, { backgroundColor: theme.dark ? "#333333" : "#F3F4F6" }]}>
              <Ionicons name="arrow-down-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.summaryDetails}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Money Received</Text>
              <Text style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
                {period === "1d"
                  ? "Today"
                  : period === "1w"
                    ? "This week"
                    : period === "1m"
                      ? "This month"
                      : "All time"}
              </Text>
            </View>
            <Text style={[styles.summaryAmount, { color: "#10B981" }]}>+$90</Text>
          </View>
        </View>

        {/* Balance chart - moved to the end */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, paddingBottom: 24 }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Balance Trend</Text>
          {renderChart()}
        </View>

        {/* Category breakdown */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Category Breakdown</Text>

          <View style={styles.categoryBreakdownItem}>
            <View style={[styles.categoryIcon, { backgroundColor: "#6366F1" }]}>
              <Ionicons name="restaurant-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.categoryBreakdownDetails}>
              <View style={styles.categoryBreakdownHeader}>
                <Text style={[styles.categoryBreakdownName, { color: theme.text }]}>Food</Text>
                <Text style={[styles.categoryBreakdownAmount, { color: "#EF4444" }]}>-$320</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: "40%", backgroundColor: "#6366F1" }]} />
              </View>
            </View>
          </View>

          <View style={styles.categoryBreakdownItem}>
            <View style={[styles.categoryIcon, { backgroundColor: "#F59E0B" }]}>
              <Ionicons name="car-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.categoryBreakdownDetails}>
              <View style={styles.categoryBreakdownHeader}>
                <Text style={[styles.categoryBreakdownName, { color: theme.text }]}>Transport</Text>
                <Text style={[styles.categoryBreakdownAmount, { color: "#EF4444" }]}>-$180</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: "22%", backgroundColor: "#F59E0B" }]} />
              </View>
            </View>
          </View>

          <View style={styles.categoryBreakdownItem}>
            <View style={[styles.categoryIcon, { backgroundColor: "#EC4899" }]}>
              <Ionicons name="film-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.categoryBreakdownDetails}>
              <View style={styles.categoryBreakdownHeader}>
                <Text style={[styles.categoryBreakdownName, { color: theme.text }]}>Entertainment</Text>
                <Text style={[styles.categoryBreakdownAmount, { color: "#EF4444" }]}>-$150</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: "18%", backgroundColor: "#EC4899" }]} />
              </View>
            </View>
          </View>

          <View style={styles.categoryBreakdownItem}>
            <View style={[styles.categoryIcon, { backgroundColor: "#10B981" }]}>
              <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.categoryBreakdownDetails}>
              <View style={styles.categoryBreakdownHeader}>
                <Text style={[styles.categoryBreakdownName, { color: theme.text }]}>Shopping</Text>
                <Text style={[styles.categoryBreakdownAmount, { color: "#EF4444" }]}>-$148</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: "18%", backgroundColor: "#10B981" }]} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
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
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activePeriod: {
    backgroundColor: "#F3F4F6",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activeCategory: {
    backgroundColor: "#F3F4F6",
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 230,
    paddingBottom: 50,
    paddingRight: 16,
  },
  yAxisLabels: {
    width: 50,
    height: 180,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  axisLabel: {
    fontSize: 12,
  },
  chartContent: {
    flex: 1,
    position: "relative",
    height: 220,
  },
  lineContainer: {
    flex: 1,
    height: 180,
    position: "relative",
    paddingRight: 10, // Add padding to prevent chart from touching the right edge
  },
  lineBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  lineSegment: {
    height: 2,
    position: "absolute",
    transformOrigin: "left center",
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    borderWidth: 2,
  },
  xAxisLabels: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 20,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 10,
  },
  netChangeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  netChangeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  netChangeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  netChangeValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  summarySubtitle: {
    fontSize: 14,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryBreakdownItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryBreakdownDetails: {
    flex: 1,
  },
  categoryBreakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryBreakdownName: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryBreakdownAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
})
