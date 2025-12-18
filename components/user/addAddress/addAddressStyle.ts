import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  // Input
  label: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    height: 40,
  },
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#eee",
  },

  // Action Buttons
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#AF0000",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  cancelText: { color: "#AF0000", fontWeight: "bold" },
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Popup
  popup: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  popupHeader: {
    padding: 20,
    alignItems: "center",
  },
  popupHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  popupBody: {
    padding: 20,
    gap: 12,
  },
  popupBtnSuccess: {
    backgroundColor: "#FBBC05",
    padding: 15,
    margin: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  popupBtnWarning: {
    backgroundColor: "#AF0000",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  popupBtnSecondary: {
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  popupBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  popupBtnSecondaryText: {
    color: "#333",
    fontWeight: "bold",
  },

  noteText: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },

  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    elevation: 5, // shadow Android
    shadowColor: '#000', // shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

  // Address List
  addressListContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 10,
  },
  addressListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addressList: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFB400',
    marginRight: 8,
  },
  setDefaultText: {
    color: '#FFB400',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 4,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },

});

export default styles;
