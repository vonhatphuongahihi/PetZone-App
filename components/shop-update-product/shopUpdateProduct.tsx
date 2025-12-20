import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "../../components/shop-update-product/updateProductStyles";
import { API_BASE_URL } from "../../config/api";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  categoryId: number;
  price: number;
  oldPrice?: number;
  quantity: number;
  description: string;
  images: { url: string }[];
}

export default function UpdateProductScreen() {
  const { product, storeId } = useLocalSearchParams();
  const productData: Product = product ? JSON.parse(product as string) : null;

  const [title, setTitle] = useState(productData?.title || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(productData?.categoryId);
  const [price, setPrice] = useState(productData?.price?.toString() || "");
  const [oldPrice, setOldPrice] = useState(productData?.oldPrice?.toString() || "");
  const [quantity, setQuantity] = useState(productData?.quantity?.toString() || "");
  const [description, setDescription] = useState(productData?.description || "");
  const [images, setImages] = useState<string[]>(productData?.images.map(img => img.url) || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    checkTokenAndFetchCategories();
  }, []);

  const checkTokenAndFetchCategories = async () => {
    setIsCheckingToken(true);
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.", [
          { text: "OK", onPress: () => router.replace("/login" as any) },
          { text: "Thử lại", onPress: () => checkTokenAndFetchCategories() },
        ]);
        return;
      }
      await fetchCategories(token);
    } catch (err) {
      console.error("Error checking token:", err);
      Alert.alert("Lỗi", "Không thể kiểm tra đăng nhập. Vui lòng thử lại.", [
        { text: "OK", onPress: () => router.replace("/login" as any) },
        { text: "Thử lại", onPress: () => checkTokenAndFetchCategories() },
      ]);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const fetchCategories = async (token: string, retryCount = 0) => {
    if (isLoadingCategories) return;
    setIsLoadingCategories(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${API_BASE_URL}/categories/child-categories`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data.map((c: any) => ({ id: c.id, name: c.name })));
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error("fetchCategories error:", err);
      if (err.name === "AbortError") {
        Alert.alert("Lỗi", "Kết nối timeout. Vui lòng thử lại.");
      } else if (retryCount < 2) {
        setTimeout(() => fetchCategories(token, retryCount + 1), 1000);
      } else {
        Alert.alert("Lỗi", "Không thể tải danh mục.");
      }
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImages([...images, ...result.assets.map(a => a.uri)]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể chọn ảnh.");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !categoryId || !price || !quantity || !description || images.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    if (!storeId || !productData?.id) return;

    const token = await AsyncStorage.getItem("jwt_token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập.", [
        { text: "OK", onPress: () => router.replace("/login" as any) },
      ]);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("categoryId", categoryId.toString());
    formData.append("price", price.toString());
    formData.append("quantity", quantity.toString());
    formData.append("description", description);
    if (oldPrice) formData.append("oldPrice", oldPrice.toString());

    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      if (Platform.OS === "web") {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append("images", new File([blob], `image_${i}.jpg`, { type: blob.type || "image/jpeg" }));
      } else {
        const filename = uri.split("/").pop() || `image_${i}.jpg`;
        const type = filename.includes(".") ? `image/${filename.split(".").pop()}` : "image/jpeg";
        formData.append("images", { uri, name: filename, type } as any);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${API_BASE_URL}/products/${productData.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        setSuccessModalVisible(true);
      } else {
        Alert.alert("Lỗi", data.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kết nối");
      } else {
        console.error(err);
        Alert.alert("Lỗi", "Không kết nối được server");
      }
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setCategoryId(item.id);
        setCategoryModalVisible(false);
      }}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật sản phẩm</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Tên sản phẩm</Text>
        <TextInput
          style={[styles.input, focusedInput === "title" && styles.inputFocused]}
          placeholder="Nhập tên sản phẩm"
          value={title}
          onChangeText={setTitle}
          onFocus={() => setFocusedInput("title")}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Danh mục</Text>
        <TouchableOpacity
          style={[styles.pickerWrapper, focusedInput === "category" && styles.inputFocused]}
          onPress={() => setCategoryModalVisible(true)}>
          <Text style={styles.pickerText}>
            {categoryId ? categories.find(c => c.id === categoryId)?.name : "Chọn danh mục"}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#333" />
        </TouchableOpacity>

        <Modal visible={categoryModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCategoryModalVisible(false)}>
            <View style={styles.modalContent}>
              {isCheckingToken || isLoadingCategories || categories.length === 0 ? (
                <Text style={styles.categoryText}>
                  {isCheckingToken
                    ? "Đang kiểm tra đăng nhập..."
                    : isLoadingCategories
                    ? "Đang tải danh mục..."
                    : "Không có danh mục con"}
                </Text>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderCategoryItem}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>Giá bán hiện tại</Text>
        <TextInput
          style={[styles.input, focusedInput === "price" && styles.inputFocused]}
          placeholder="Nhập giá bán"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          onFocus={() => setFocusedInput("price")}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Giá cũ (tùy chọn)</Text>
        <TextInput
          style={[styles.input, focusedInput === "oldPrice" && styles.inputFocused]}
          placeholder="Nhập giá cũ"
          value={oldPrice}
          onChangeText={setOldPrice}
          keyboardType="numeric"
          onFocus={() => setFocusedInput("oldPrice")}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Số lượng hàng</Text>
        <TextInput
          style={[styles.input, focusedInput === "quantity" && styles.inputFocused]}
          placeholder="Nhập số lượng"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          onFocus={() => setFocusedInput("quantity")}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Mô tả chi tiết</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput, focusedInput === "description" && styles.inputFocused]}
          placeholder="Nhập mô tả"
          value={description}
          onChangeText={setDescription}
          multiline
          onFocus={() => setFocusedInput("description")}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Ảnh sản phẩm</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
            <Ionicons name="add-outline" size={32} color="#FBBC05" />
          </TouchableOpacity>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(idx)}>
                <Ionicons name="close-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Cập nhật sản phẩm</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <Text style={styles.successModalTitle}>Thành công!</Text>
            <Text style={styles.successModalMessage}>
              Sản phẩm đã được cập nhật thành công!
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace({
                  pathname: '/seller/shop',
                  params: { refresh: 'true', tab: 'products' }
                });
              }}>
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}