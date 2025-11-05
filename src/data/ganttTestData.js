// Sample Data Generator for Gantt Chart Testing
// Copy this into your browser console when on the Kanban board to add test cards

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Sample cards with dates for testing Gantt view
const sampleCardsWithDates = [
  {
    title: "🎨 Design Homepage Mockup",
    description: "Create high-fidelity mockups for the new homepage design",
    priority: "high",
    startDate: new Date(),
    dueDate: addDays(new Date(), 5),
    estimateHours: 12,
    labels: ["Design", "Frontend"]
  },
  {
    title: "⚙️ Setup CI/CD Pipeline", 
    description: "Configure GitHub Actions for automated testing and deployment",
    priority: "urgent",
    startDate: addDays(new Date(), 1),
    dueDate: addDays(new Date(), 7),
    estimateHours: 16,
    labels: ["DevOps", "Infrastructure"]
  },
  {
    title: "📝 Write API Documentation",
    description: "Document all REST endpoints with examples",
    priority: "medium",
    startDate: addDays(new Date(), 3),
    dueDate: addDays(new Date(), 10),
    estimateHours: 8,
    labels: ["Documentation", "Backend"]
  },
  {
    title: "🐛 Fix Authentication Bug",
    description: "Users can't log in with special characters in password",
    priority: "urgent",
    startDate: new Date(),
    dueDate: addDays(new Date(), 2),
    estimateHours: 4,
    labels: ["Bug", "Security"]
  },
  {
    title: "🚀 Deploy to Staging",
    description: "Deploy latest changes to staging environment",
    priority: "high",
    startDate: addDays(new Date(), 8),
    dueDate: addDays(new Date(), 9),
    estimateHours: 3,
    labels: ["Deployment"]
  },
  {
    title: "📊 Create Analytics Dashboard",
    description: "Build dashboard showing key metrics and user activity",
    priority: "medium",
    startDate: addDays(new Date(), 5),
    dueDate: addDays(new Date(), 15),
    estimateHours: 24,
    labels: ["Feature", "Frontend"]
  },
  {
    title: "✅ Write E2E Tests",
    description: "Implement end-to-end tests for critical user flows",
    priority: "high",
    startDate: addDays(new Date(), 10),
    dueDate: addDays(new Date(), 17),
    estimateHours: 20,
    labels: ["Testing", "QA"]
  },
  {
    title: "🔐 Implement 2FA",
    description: "Add two-factor authentication for enhanced security",
    priority: "medium",
    startDate: addDays(new Date(), 12),
    dueDate: addDays(new Date(), 20),
    estimateHours: 16,
    labels: ["Feature", "Security"]
  },
  {
    title: "📱 Mobile App Testing",
    description: "Test app on various iOS and Android devices",
    priority: "high",
    startDate: addDays(new Date(), 15),
    dueDate: addDays(new Date(), 22),
    estimateHours: 12,
    labels: ["Testing", "Mobile"]
  },
  {
    title: "🎯 Performance Optimization",
    description: "Improve page load times and reduce bundle size",
    priority: "low",
    startDate: addDays(new Date(), 20),
    dueDate: addDays(new Date(), 28),
    estimateHours: 18,
    labels: ["Performance", "Frontend"]
  }
];

// Instructions to manually add these (since we can't access dispatch directly)
console.log("=== GANTT CHART TEST DATA ===");
console.log("Copy each card below and create them manually:");
console.log("");

sampleCardsWithDates.forEach((card, index) => {
  console.log(`Card ${index + 1}: ${card.title}`);
  console.log(`  Priority: ${card.priority}`);
  console.log(`  Start: ${card.startDate.toLocaleDateString()}`);
  console.log(`  Due: ${card.dueDate.toLocaleDateString()}`);
  console.log(`  Estimate: ${card.estimateHours}h`);
  console.log(`  Labels: ${card.labels.join(", ")}`);
  console.log(`  Description: ${card.description}`);
  console.log("");
});

console.log("TIP: Create 3-4 cards to see the Gantt chart in action!");
console.log("TIP: Vary the priorities to see different colors!");
