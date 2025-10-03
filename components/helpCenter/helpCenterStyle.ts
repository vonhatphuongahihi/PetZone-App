import { StyleSheet } from "react-native";

export const helpCenterStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingTop: 40,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },

  // form
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
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },

  // footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingBottom: 24, 
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F44336",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  cancelText: { color: "#F44336", fontWeight: "bold" },
  submitBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#FBBC05",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.36)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Card common
  card: {
    width: "86%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 8,
  },

  // top colored area
  cardTop: {
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    marginBottom: 8,
  },
  iconCircleWhite: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  cardTopText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 12,
  },

  cardBottom: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  primaryAction: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
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
  secondaryActionText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
