import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./addProductStyle";

const categories = [

  { id: "c1", name: "Hạt dinh dưỡng" },
  { id: "c2", name: "Pate" },
  { id: "c3", name: "Cỏ mèo" },
  { id: "c4", name: "Bàn cào móng" },
  { id: "c5", name: "Nhà cây" },
  { id: "c6", name: "Vòng cổ" },
  { id: "c7", name: "Dây dắt" },
  { id: "c8", name: "Nệm, Ô, Thảm" },
  { id: "c9", name: "Nhà vệ sinh" },
  { id: "c10", name: "Áo" },
  { id: "c11", name: "Mũ" },
  { id: "c12", name: "Khăn" },
];


export default function AddProductScreen() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false); // <-- Khai báo đúng vị trí

  const handleFocus = (field: string) => setFocusedInput(field);
  const handleBlur = () => setFocusedInput(null);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages([...images, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleBack = () => {
    if (title || price || quantity || description || images.length > 0) {
      Alert.alert(
        "Xác nhận",
        "Bạn có muốn hủy thêm sản phẩm không?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đồng ý", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (!title || !categoryId || !price || !quantity || !description || images.length === 0) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    const newProduct = {
      title,
      category_id: categoryId,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : undefined,
      quantity: Number(quantity),
      description,
      images,
    };

    console.log("Product submitted:", newProduct);
    setSuccessModalVisible(true); // Hiển thị modal thành công
  };

  const renderCategoryItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setCategoryId(item.id);
        setCategoryModalVisible(false);
      }}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm sản phẩm</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        {/* Tên sản phẩm */}
        <Text style={styles.label}>Tên sản phẩm</Text>
        <TextInput
          style={[styles.input, focusedInput === "title" && styles.inputFocused]}
          placeholder="Nhập tên sản phẩm"
          value={title}
          onChangeText={setTitle}
          onFocus={() => handleFocus("title")}
          onBlur={handleBlur}
        />

        {/* Danh mục */}
        <Text style={styles.label}>Danh mục</Text>
        <TouchableOpacity
          style={[styles.pickerWrapper, focusedInput === "category" && styles.inputFocused]}
          onPress={() => setCategoryModalVisible(true)}
          onFocus={() => handleFocus("category")}
          onBlur={handleBlur}
        >
          <Text style={styles.pickerText}>
            {categoryId ? categories.find((c) => c.id === categoryId)?.name : "Chọn danh mục"}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#333" />
        </TouchableOpacity>

        <Modal visible={categoryModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setCategoryModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryItem}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Giá bán */}
        <Text style={styles.label}>Giá bán hiện tại</Text>
        <TextInput
          style={[styles.input, focusedInput === "price" && styles.inputFocused]}
          placeholder="Nhập giá bán"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          onFocus={() => handleFocus("price")}
          onBlur={handleBlur}
        />

        <Text style={styles.label}>Giá cũ (tùy chọn)</Text>
        <TextInput
          style={[styles.input, focusedInput === "oldPrice" && styles.inputFocused]}
          placeholder="Nhập giá cũ"
          value={oldPrice}
          onChangeText={setOldPrice}
          keyboardType="numeric"
          onFocus={() => handleFocus("oldPrice")}
          onBlur={handleBlur}
        />

        <Text style={styles.label}>Số lượng hàng</Text>
        <TextInput
          style={[styles.input, focusedInput === "quantity" && styles.inputFocused]}
          placeholder="Nhập số lượng"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          onFocus={() => handleFocus("quantity")}
          onBlur={handleBlur}
        />

        <Text style={styles.label}>Mô tả chi tiết</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput, focusedInput === "description" && styles.inputFocused]}
          placeholder="Nhập mô tả"
          value={description}
          onChangeText={setDescription}
          multiline
          onFocus={() => handleFocus("description")}
          onBlur={handleBlur}
        />

        {/* Ảnh sản phẩm */}
        <Text style={styles.label}>Ảnh sản phẩm</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
            <Ionicons name="add-outline" size={32} color="#FBBC05" />
          </TouchableOpacity>

          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal thành công */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={successModalStyles.modalOverlay}>
          <View style={successModalStyles.modalContainer}>
            <Text style={successModalStyles.title}>Thành công!</Text>
            <Text style={successModalStyles.message}>
              Sản phẩm đã được thêm thành công!
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

const successModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFEB99",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "600",
    color: "#333",
  },
});
