import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingTop: 40,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },

  // Input
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  deleteBtn: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F44336",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  deleteText: { color: "#F44336", fontWeight: "bold" },
  saveBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#FBBC05",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },

  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Alert card: top colored header + white body */
  alertCard: {
    width: "82%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
  },
  alertHeader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  alertHeaderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    lineHeight: 20,
  },

  alertBody: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  // Primary button (colored)
  alertPrimaryBtn: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertPrimaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Secondary (ghost) button
  alertSecondaryBtn: {
    marginTop: 12,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  alertSecondaryBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },

  noteText: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },

    select: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },

});

