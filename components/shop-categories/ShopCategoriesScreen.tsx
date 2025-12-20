import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as childStyles } from "./shopCategoriesStyle";

// Type Category nếu bạn có interface từ API
interface Category {
  id: string;
  name: string;
  parentId?: string;
  image?: string | any; // any để hỗ trợ require() image local
}

export default function ShopChildCategoriesScreen() {
  const { parentName, subCategories, storeId } = useLocalSearchParams();

  // Parse subCategories từ params một cách an toàn
  const children: Category[] = useMemo(() => {
    if (!subCategories) return [];
    try {
      // Nếu là array string do router gửi, lấy phần tử đầu
      const raw = Array.isArray(subCategories) ? subCategories[0] : subCategories;
      return JSON.parse(raw) as Category[];
    } catch (err) {
      console.error("Error parsing subCategories:", err);
      return [];
    }
  }, [subCategories]);

  return (
    <SafeAreaView style={childStyles.container}>
      {/* Header */}
      <View style={childStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={childStyles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FBBC05" />
        </TouchableOpacity>
        <Text style={childStyles.headerTitle}>{parentName}</Text>
      </View>

      {/* Danh mục con */}
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={childStyles.childCard}
            onPress={() =>
              router.push({
                pathname: "/seller/shopProductList",
                params: { 
                  categoryId: item.id, 
                  categoryName: item.name,
                  storeId: storeId 
                },
              })
            }
          >
            <Image
              source={item.image ? { uri: item.image } : require("../../assets/images/cat.png")}
              style={childStyles.childImage}
            />
            <Text style={childStyles.childText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
