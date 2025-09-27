import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditAddressScreen({ navigation }: any) {
  const [name, setName] = useState("Nguyễn Thu Phương");
  const [phone, setPhone] = useState("(+84) 389 144 068");
  const [province, setProvince] = useState(
    "Bình Dương\nThành phố Dĩ An\nPhường Đông Hòa"
  );
  const [street, setStreet] = useState("Kí túc xá Khu A, Đường số 6");
  const [type, setType] = useState("Nhà riêng");

  // popup state
  const [showDelete, setShowDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Địa chỉ</Text>
      </View>

      {/* Lưu ý */}
      <Text style={styles.noteText}>
        Địa chỉ (dùng thông tin trước sát nhập)
      </Text>

      {/* Nội dung */}
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
        <Text style={styles.label}>Họ và Tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          value={province}
          onChangeText={setProvince}
          multiline
        />

        <Text style={styles.label}>Tên đường, Tòa nhà, Số nhà</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
        />

        <Text style={styles.label}>Loại địa chỉ</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() =>
            setType(type === "Nhà riêng" ? "Văn phòng" : "Nhà riêng")
          }
        >
          <Text>{type}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#555" />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDelete(true)}
        >
          <Text style={styles.deleteText}>Xóa địa chỉ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setShowSuccess(true)}
        >
          <Text style={styles.saveText}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>

      {/* -------------------------
          POPUP XÓA (kiểu giống ảnh)
         ------------------------- */}
      <Modal transparent visible={showDelete} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            {/* colored header */}
            <View style={[styles.alertHeader, { backgroundColor: "#F44336" }]}>
              <View style={styles.iconCircle}>
                {/* icon màu đỏ nằm trong vòng trắng */}
                <MaterialIcons name="error-outline" size={28} color="#F44336" />
              </View>
              <Text style={styles.alertHeaderText}>
                Bạn có chắc chắn muốn xóa địa chỉ này?
              </Text>
            </View>

            {/* white body with buttons */}
            <View style={styles.alertBody}>
              <TouchableOpacity
                style={[styles.alertPrimaryBtn, { backgroundColor: "#F44336" }]}
                onPress={() => {
                  setShowDelete(false);
                  navigation.goBack(); // giữ logic cũ: quay lại
                }}
              >
                <Text style={styles.alertPrimaryBtnText}>Xóa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alertSecondaryBtn]}
                onPress={() => setShowDelete(false)}
              >
                <Text style={styles.alertSecondaryBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* -------------------------
          POPUP THÀNH CÔNG (kiểu giống ảnh)
         ------------------------- */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            {/* colored header */}
            <View style={[styles.alertHeader, { backgroundColor: "#FBBC05" }]}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="check" size={28} color="#FBBC05" />
              </View>
              <Text style={styles.alertHeaderText}>Sửa địa chỉ thành công!</Text>
            </View>

            {/* white body with single button */}
            <View style={styles.alertBody}>
              <TouchableOpacity
                style={[styles.alertPrimaryBtn, { backgroundColor: "#FBBC05" }]}
                onPress={() => {
                  setShowSuccess(false);
                  // giữ hành vi bạn dùng trước: chuyển về HomeScreen
                  navigation.navigate("HomeScreen");
                }}
              >
                <Text style={styles.alertPrimaryBtnText}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ========== STYLES ========== */
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
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#eee",
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
    // small shadow on Android/iOS
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

});
