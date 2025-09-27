import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelpCenterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // popup state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // open image library (yêu cầu quyền nếu cần)
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Quyền bị từ chối", "Bạn cần cho phép truy cập thư viện ảnh.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("pickImage error:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Trung tâm trợ giúp</Text>
          <MaterialIcons
            name="headset-mic"
            size={24}
            color="#FCCB05"
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 120 }}>
        <Text style={styles.label}>Họ và Tên</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Vấn đề gặp phải</Text>
        <TextInput style={styles.input} value={issue} onChangeText={setIssue} />

        <Text style={styles.label}>Mô tả chi tiết</Text>
        <TextInput
          style={[styles.input, { height: 110 }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Đính kèm ảnh (nếu có)</Text>
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <MaterialIcons name="photo-camera" size={20} color="#555" />
          <Text style={{ marginLeft: 8 }}>
            {image ? "Đã chọn ảnh" : "Chọn ảnh từ thư viện"}
          </Text>
        </TouchableOpacity>

        {image ? (
          <Image
            source={{ uri: image }}
            style={{ marginTop: 12, width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : null}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowCancelConfirm(true)}
        >
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => {
            // có thể validate các trường ở đây nếu cần
            setShowSuccess(true);
          }}
        >
          <Text style={styles.submitText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
      </View>

      {/* ------------------------
          POPUP XÁC NHẬN HỦY (kiểu giống ảnh)
         ------------------------ */}
      <Modal transparent visible={showCancelConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.card}>
            {/* top colored area (red) */}
            <View style={[styles.cardTop, { backgroundColor: "#F44336" }]}>
              <View style={styles.iconWrap}>
                <View style={styles.iconCircleWhite}>
                  <MaterialIcons name="error-outline" size={28} color="#F44336" />
                </View>
              </View>

              <Text style={styles.cardTopText}>Bạn có chắc muốn hủy?</Text>
            </View>

            {/* bottom white area */}
            <View style={styles.cardBottom}>
              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: "#F44336" }]}
                onPress={() => {
                  setShowCancelConfirm(false);
                  navigation.goBack(); // hủy -> quay lại
                }}
              >
                <Text style={styles.primaryActionText}>Đồng ý</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryAction]}
                onPress={() => setShowCancelConfirm(false)}
              >
                <Text style={styles.secondaryActionText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ------------------------
          POPUP THÀNH CÔNG (kiểu giống ảnh)
         ------------------------ */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.card}>
            {/* top colored area (yellow) */}
            <View style={[styles.cardTop, { backgroundColor: "#FBBC05" }]}>
              <View style={styles.iconWrap}>
                <View style={styles.iconCircleWhite}>
                  <MaterialIcons name="check" size={28} color="#FBBC05" />
                </View>
              </View>

              <Text style={styles.cardTopText}>Gửi yêu cầu thành công!</Text>
            </View>

            {/* bottom white area */}
            <View style={styles.cardBottom}>
              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: "#FBBC05" }]}
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate("HomeScreen");
                }}
              >
                <Text style={styles.primaryActionText}>Tiếp tục mua sắm</Text>
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
    // shadow for iOS/Android
    elevation: 8,
  },

  // top colored area
  cardTop: {
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  // white circle wrapper for icon (sitting on colored area)
  iconWrap: {
    // used to position circle visually pleasingly
    marginBottom: 8,
  },
  iconCircleWhite: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    // subtle shadow
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

  // bottom white area
  cardBottom: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  // primary button inside white area (yellow/red)
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

  // secondary ghost button (white with border)
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
