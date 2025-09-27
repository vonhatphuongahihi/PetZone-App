import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CartPopupProps = {
  visible: boolean;
  onClose: () => void;
};

export default function CartPopup({ visible, onClose }: CartPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header vàng */}
          <View style={styles.header}>
            <MaterialIcons name="shopping-cart" size={40} color="#fff" />
            <Text style={styles.headerText}>Đăng nhập để xem giỏ hàng</Text>
          </View>

          {/* Nút đăng nhập */}
          <TouchableOpacity style={styles.loginBtn} onPress={onClose}>
            <MaterialIcons name="login" size={20} color="#fff" />
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Nút đăng ký */}
          <TouchableOpacity style={styles.registerBtn} onPress={onClose}>
            <MaterialIcons name="person-add" size={20} color="#fbbf24" />
            <Text style={styles.registerText}>Đăng ký</Text>
          </TouchableOpacity>

          {/* Divider hoặc */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>hoặc</Text>
            <View style={styles.line} />
          </View>

          {/* Tiếp tục mua sắm */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.continueText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 300,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    backgroundColor: "#fbbf24", // vàng đậm
    alignItems: "center",
    paddingVertical: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbbf24",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 6 },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fbbf24",
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerText: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    marginHorizontal: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#ddd" },
  orText: { marginHorizontal: 8, color: "#888" },
  continueText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
});
