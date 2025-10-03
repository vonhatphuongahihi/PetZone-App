import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
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
  headerTitle: { marginLeft: 8, fontSize: 20, fontWeight: "500", color: "#000" },

  // Item
  item: {
    borderWidth: 1,
    borderColor: "#FBBC05",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center" },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#FBBC05",
    borderColor: "#FBBC05",
  },
  shopName: { fontWeight: "bold", fontSize: 14, color: "#000" },
  image: { width: 70, height: 70, borderRadius: 8 },
  productName: { fontSize: 14, fontWeight: "400" },
  productDesc: { color: "#666", fontSize: 12, marginTop: 2 },
  price: { color: "red", fontWeight: "bold", fontSize: 15 },

  // Actions
  remove: { color: "rgba(0,0,0,0.55)", fontSize: 12, marginLeft: 12 },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CE",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  counterBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { fontSize: 16, fontWeight: "bold", color: "rgba(0,0,0,0.55)" },
  counterValue: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(0,0,0,0.55)",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  buyBtn: {
    backgroundColor: "#FBBC05",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buyBtnText: { color: "#fff", fontWeight: "bold" },
});

export default styles;
