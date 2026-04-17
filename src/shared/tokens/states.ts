export const componentStates = {
  button: ["default", "pressed", "disabled"],
  card: ["default", "pressed", "featured"],
  favorite: ["inactive", "active", "animating"],
  progressBar: ["empty", "inProgress", "complete"],
  tabBar: ["default", "active", "pressed"]
} as const;
