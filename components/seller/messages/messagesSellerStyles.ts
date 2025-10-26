import { StyleSheet } from 'react-native';

export const messagesSellerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CD964",
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  text: {
    fontSize: 14,
    color: "#333",
    opacity: 0.6,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#333",
    opacity: 0.6,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    color: "#FBBC05",
    fontSize: 16,
    fontWeight: "600",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  highlightText: {
    backgroundColor: "#FBBC05",
    color: "#000",
    fontWeight: "600",
  },
});
