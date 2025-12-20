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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../components/shop-add-product/addProductStyle";

// === IP / BASE_URL của backend ===
const API_BASE_URL = 'http://10.10.3.117:3001/api';

interface Category {
  id: number;
  name: string;
}

interface AddProductScreenProps {
  storeId?: string;
}

export default function AddProductScreen() {
  const { storeId, refresh } = useLocalSearchParams();
  console.log("AddProductScreen rendered with storeId:", storeId, "refresh:", refresh);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    checkTokenAndFetchCategories();
  }, []);

  const checkTokenAndFetchCategories = async () => {
    setIsCheckingToken(true);
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      console.log("Checking token in AsyncStorage:", token ? "OK" : "null");
      if (!token) {
        console.log("No token found, redirecting to login");
        Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.", [
          {
            text: "OK",
            onPress: () => router.replace("/login" as any),
          },
          {
            text: "Thử lại",
            onPress: () => checkTokenAndFetchCategories(),
          },
        ]);
        return;
      }
      await fetchCategories(token);
    } catch (err) {
      console.error("Error checking token:", err);
      Alert.alert("Lỗi", "Không thể kiểm tra đăng nhập. Vui lòng thử lại.", [
        {
          text: "OK",
          onPress: () => router.replace("/login" as any),
        },
        {
          text: "Thử lại",
          onPress: () => checkTokenAndFetchCategories(),
        },
      ]);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const fetchCategories = async (token: string, retryCount = 0) => {
    if (isLoadingCategories) return;
    setIsLoadingCategories(true);
    try {
      const url = `${API_BASE_URL}/categories/child-categories`;
      console.log("BẮT ĐẦU LẤY DANH MỤC TỪ:", url);

      // Tạo AbortController cho timeout thủ công
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout nếu request thành công

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log("DATA NHẬN VỀ:", data);

      if (data.success && Array.isArray(data.data)) {
        const childCategories = data.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }));
        setCategories(childCategories);
        console.log("DANH MỤC CON TẢI XONG:", childCategories);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error("LỖI fetchCategories:", err.message);
      if (err.name === 'AbortError') {
        console.log("Request bị timeout sau 10 giây");
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
        const uris = result.assets.map((asset) => asset.uri);
        setImages([...images, ...uris]);
        console.log("Selected images:", uris);
      }
    } catch (err) {
      console.error("Error selecting images:", err);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleBack = () => {
    if (title || price || quantity || description || images.length > 0) {
      Alert.alert("Xác nhận", "Bạn có muốn hủy thêm sản phẩm không?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!title || !categoryId || !price || !quantity || !description || images.length === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (!storeId) {
      Alert.alert("Lỗi", "Không tìm thấy ID cửa hàng. Vui lòng thử lại.");
      return;
    }

    const token = await AsyncStorage.getItem("jwt_token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập lại.", [
        { text: "OK", onPress: () => router.replace("/login" as any) },
      ]);
      return;
    }

    setIsAdding(true);
    console.log("storeId đang gửi:", storeId);
    const formData = new FormData();
    formData.append("storeId", storeId as string);
    formData.append("title", title);
    formData.append("categoryId", categoryId.toString());
    formData.append("price", price.toString());
    formData.append("quantity", quantity.toString());
    if (oldPrice) formData.append("oldPrice", oldPrice.toString());
    formData.append("description", description);

    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      if (Platform.OS === "web") {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const file = new File([blob], `image_${i}.jpg`, { type: blob.type || "image/jpeg" });
          formData.append("images", file);
        } catch (err) {
          console.error("Lỗi xử lý ảnh web:", err);
          Alert.alert("Lỗi", "Không thể xử lý ảnh trên web.");
          setIsAdding(false);
          return;
        }
      } else {
        const filename = uri.split("/").pop() || `image_${i}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("images", { uri, name: filename, type } as any);
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        Alert.alert("Lỗi server", `Mã lỗi: ${res.status}`);
        setIsAdding(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSuccessModalVisible(true);
        router.setParams({ refresh: "true" });
      } else {
        Alert.alert("Lỗi", data.message || "Thêm sản phẩm thất bại");
        setIsAdding(false);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kết nối (10s)");
      } else {
        console.error("Lỗi kết nối:", err);
        Alert.alert("Lỗi", "Không kết nối được server");
      }
      setIsAdding(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setCategoryId(item.id);
        setCategoryModalVisible(false);
        console.log("ĐÃ CHỌN DANH MỤC:", item);
      }}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm sản phẩm</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
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
          onPress={async () => {
            const token = await AsyncStorage.getItem("jwt_token");
            console.log("BẤM CHỌN DANH MỤC - token:", token ? "OK" : "null");

            if (!token) {
              Alert.alert("Lỗi", "Bạn chưa đăng nhập.", [
                { text: "OK", onPress: () => router.replace("/login" as any) },
              ]);
              return;
            }

            if (categories.length === 0 && !isLoadingCategories) {
              console.log("Danh mục rỗng → gọi fetchCategories...");
              setIsLoadingCategories(true);
              await fetchCategories(token);
            }

            setCategoryModalVisible(true);
            console.log("MỞ MODAL - categories length:", categories.length);
          }}
          onFocus={() => setFocusedInput("category")}
          onBlur={() => setFocusedInput(null)}
        >
          <Text style={styles.pickerText}>
            {categoryId
              ? categories.find((c) => c.id === categoryId)?.name || "Chọn danh mục"
              : "Chọn danh mục"}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#333" />
        </TouchableOpacity>

        <Modal visible={categoryModalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setCategoryModalVisible(false);
              console.log("ĐÓNG MODAL DANH MỤC");
            }}
          >
            <View style={styles.modalContent}>
              {isCheckingToken ? (
                <Text style={styles.categoryText}>Đang kiểm tra đăng nhập...</Text>
              ) : isLoadingCategories ? (
                <Text style={styles.categoryText}>Đang tải danh mục...</Text>
              ) : categories.length === 0 ? (
                <Text style={styles.categoryText}>Không có danh mục con</Text>
              ) : (
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderCategoryItem}
                  ListEmptyComponent={<Text style={styles.categoryText}>Không có danh mục con</Text>}
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

          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                <Ionicons name="close-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.submitButton, isAdding && { opacity: 0.6, backgroundColor: '#ccc' }]} 
          onPress={handleSubmit}
          disabled={isAdding}
        >
          <Text style={styles.submitButtonText}>
            {isAdding ? "Đang thêm sản phẩm..." : "Thêm sản phẩm"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={successModalStyles.modalOverlay}>
          <View style={successModalStyles.modalContainer}>
            <Text style={successModalStyles.title}>Thành công!</Text>
            <Text style={successModalStyles.message}>Sản phẩm đã được thêm thành công!</Text>
            <TouchableOpacity
              style={successModalStyles.button}
              onPress={() => {
                setSuccessModalVisible(false);
                setIsAdding(false);
                router.push({
                  pathname: '/seller/shop',
                  params: { refresh: 'true', tab: 'products' }
                });
              }}
            >
              <Text style={successModalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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