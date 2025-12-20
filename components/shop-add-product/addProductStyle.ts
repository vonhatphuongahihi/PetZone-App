import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },

  /* Header */
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: "#E0E0E0" 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: "center", 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#333", 
  },

  /* Label và Input */
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginTop: 8, 
    marginBottom: 4, 
    color: "#333"
  },
  input: { 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#FBBC05", 
    marginBottom: 12
  },
  inputFocused: {
    borderColor: "#FBBC05",
    borderWidth: 2, 
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },

  /* Picker */
  pickerWrapper: { 
    backgroundColor: "#fff", 
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FBBC05",
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 14,
    color: "#333"
  },

  /* Modal chọn danh mục */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 8,
    paddingVertical: 8,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },

  /* Hình ảnh sản phẩm */
  imageScroll: {
    flexDirection: "row",
    marginVertical: 8,
  },
  addImageButton: {
    width: 120, 
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FBBC05",
  },
  addImageText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center"
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    position: "relative",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Nút thêm sản phẩm */
  submitButton: { 
    backgroundColor: "#FBBC05", 
    paddingVertical: 16, 
    borderRadius: 12, 
    marginTop: 24, 
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16,
  },

  /* Modal Thêm sản phẩm thành công */
  successModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  successModalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  successModalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  successModalButton: {
    backgroundColor: "#FFEB99",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  successModalButtonText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
});
