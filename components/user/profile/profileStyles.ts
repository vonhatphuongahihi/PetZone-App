import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eee"
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000"
  },
  rank: {
    color: "#666",
    marginTop: 2
  },
  pawCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FBBC05",
    justifyContent: "center",
    alignItems: "center",
  },

  // Card
  card: {
    backgroundColor: "#FFF4CC",
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    padding: 20,
    paddingVertical: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000"
  },
  link: {
    color: "#666",
    fontSize: 12
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  // Menu item trong card
  menuItemCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flex: 1,
  },
  menuBox: {
    alignItems: "center",
    position: "relative",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuLabel: {
    fontSize: 13,
    marginTop: 8,
    color: "#000",
    fontWeight: "500"
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    position: "absolute",
    top: -5,
    right: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold"
  },

  // Menu dưới
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  firstMenuItem: {
    marginTop: 20,
  },
  menuText: {
    fontSize: 15,
    color: "#000"
  },

  // Logout
  logoutBtn: {
    margin: 40,
    backgroundColor: "#FBBC05",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCatImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FBBC05",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});