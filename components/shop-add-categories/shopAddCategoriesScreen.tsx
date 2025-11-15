import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { categoryService } from "../../services/categoryService";
import { tokenService } from "../../services/tokenService";
import {
  headerStyles,
  imagePickerStyles,
  styles,
  successModalStyles,
} from "./shopAddCategories";

export default function AddCategoryScreen() {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState<File | string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Request permission for image library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh để chọn ảnh.");
      }
    })();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });
        setImage(file);
        setImageUri(asset.uri);
      } else {
        const uri = asset.uri.startsWith("file://") ? asset.uri : `file://${asset.uri}`;
        setImage(uri);
        setImageUri(uri);
      }
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!subCategory.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      setLoading(true);
      const token = await tokenService.getToken();
      if (!token) {
        Alert.alert("Lỗi xác thực", "Không tìm thấy token người dùng.");
        return;
      }

      const formData = new FormData();
      formData.append("mainCategory", mainCategory.trim());
      formData.append("subCategory", subCategory.trim());

      if (image instanceof File) {
        formData.append("image", image);
      } else if (typeof image === "string") {
        const filename = image.split("/").pop() || `image_${Date.now()}.jpg`;
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        formData.append("image", { uri: image, name: filename, type: mimeType } as any);
      }

      const response = await categoryService.createCategory(formData, token);

      if (response?.success) {
        setSuccessModalVisible(true);
        router.setParams({ refresh: "true" }); // signal ShopScreen to refresh
      } else {
        Alert.alert("Lỗi","Không thể tạo danh mục.");
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm danh mục:", error.message);
      Alert.alert("Thất bại", error.message || "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={headerStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={headerStyles.title}>Thêm danh mục</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Loại sản phẩm chính</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập loại sản phẩm chính"
          value={mainCategory}
          onChangeText={setMainCategory}
        />

        <Text style={styles.label}>Danh mục cụ thể</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập danh mục cụ thể"
          value={subCategory}
          onChangeText={setSubCategory}
        />

        <Text style={styles.label}>Thêm ảnh</Text>
        <TouchableOpacity
          style={imagePickerStyles.addImageButton}
          onPress={pickImage}
          disabled={loading}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={imagePickerStyles.imageThumb} />
          ) : (
            <View style={imagePickerStyles.placeholderInner}>
              <Ionicons name="add-outline" size={40} color="#FBBC05" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Đang thêm..." : "Thêm danh mục"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={successModalStyles.modalOverlay}>
          <View style={successModalStyles.modalContainer}>
            <Text style={successModalStyles.title}>Thành công!</Text>
            <Text style={successModalStyles.message}>
              Danh mục đã được thêm thành công!
            </Text>
            <TouchableOpacity
              style={successModalStyles.button}
              onPress={() => {
                setSuccessModalVisible(false);
                router.back();
              }}
            >
              <Text style={successModalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
