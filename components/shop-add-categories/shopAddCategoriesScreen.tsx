import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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
import { headerStyles, imagePickerStyles, styles, successModalStyles } from "./shopAddCategories";

export default function AddCategoryScreen() {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = () => {
    if (!mainCategory.trim() || !subCategory.trim() || !image) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setSuccessModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={headerStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={headerStyles.title}>Thêm danh mục</Text>
        <View style={{ width: 24 }} /> {/* để cân giữa icon */}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Loại sản phẩm chính */}
        <Text style={styles.label}>Loại sản phẩm chính</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập loại sản phẩm chính (ví dụ: Thức ăn)"
          value={mainCategory}
          onChangeText={setMainCategory}
        />

        {/* Danh mục cụ thể */}
        <Text style={styles.label}>Danh mục cụ thể</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập danh mục cụ thể (ví dụ: Hạt dinh dưỡng)"
          value={subCategory}
          onChangeText={setSubCategory}
        />

        {/* Ảnh danh mục */}
        <Text style={styles.label}>Thêm ảnh</Text>
        <TouchableOpacity style={imagePickerStyles.addImageButton} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={imagePickerStyles.imageThumb} />
          ) : (
            <View style={imagePickerStyles.placeholderInner}>
              <Ionicons name="add-outline" size={40} color="#FBBC05" />
            </View>
          )}
        </TouchableOpacity>

        {/* Nút submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Thêm danh mục</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal thành công */}
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
