import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { helpCenterStyles as styles } from "./helpCenterStyle";

export default function HelpCenterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

        {image && (
          <Image
            source={{ uri: image }}
            style={{ marginTop: 12, width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
        )}
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
          onPress={() => setShowSuccess(true)}
        >
          <Text style={styles.submitText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
      </View>

      {/* Popup xác nhận hủy */}
      <Modal transparent visible={showCancelConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.card}>
            <View style={[styles.cardTop, { backgroundColor: "#AF0000" }]}>
              <View style={styles.iconWrap}>
                <View style={styles.iconCircleWhite}>
                  <MaterialIcons name="error-outline" size={28} color="#AF0000" />
                </View>
              </View>

              <Text style={styles.cardTopText}>Bạn có chắc muốn hủy?</Text>
            </View>

            <View style={styles.cardBottom}>
              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: "#AF0000" }]}
                onPress={() => {
                  setShowCancelConfirm(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.primaryActionText}>Đồng ý</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => setShowCancelConfirm(false)}
              >
                <Text style={styles.secondaryActionText}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Popup thành công */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.card}>
            <View style={[styles.cardTop, { backgroundColor: "#FBBC05" }]}>
              <View style={styles.iconWrap}>
                <View style={styles.iconCircleWhite}>
                  <MaterialIcons name="check" size={28} color="#FBBC05" />
                </View>
              </View>

              <Text style={styles.cardTopText}>Gửi yêu cầu thành công!</Text>
            </View>

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
