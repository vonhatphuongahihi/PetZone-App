import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categoryService } from "../../services/categoryService";
import { tokenService } from "../../services/tokenService";
import { styles as childStyles } from "./shopCategoriesStyle";

// Type Category nếu bạn có interface từ API
interface Category {
  id: string | number;
  name: string;
  parentId?: string | number;
  image?: string | any; // any để hỗ trợ require() image local
  children?: Category[];
}

export default function ShopChildCategoriesScreen() {
  const { parentName, subCategories, storeId, parentId, refresh } = useLocalSearchParams();
  const [children, setChildren] = useState<Category[]>([]);

  // Parse subCategories từ params ban đầu
  const initialChildren: Category[] = useMemo(() => {
    if (!subCategories) return [];
    try {
      const raw = Array.isArray(subCategories) ? subCategories[0] : subCategories;
      return JSON.parse(raw) as Category[];
    } catch (err) {
      console.error("Error parsing subCategories:", err);
      return [];
    }
  }, [subCategories]);

  // Fetch fresh data from API
  const fetchCategories = useCallback(async () => {
    try {
      const token = await tokenService.getToken();
      if (!token) return;

      const response = await categoryService.getAllCategories(token);
      if (response?.success && Array.isArray(response.data)) {
        // Find parent category and get its children
        const parent = response.data.find((cat: any) => cat.id.toString() === parentId);
        if (parent?.children) {
          setChildren(parent.children);
        } else {
          // Fallback: filter by parentId
          const filteredChildren = response.data.filter(
            (cat: any) => cat.parentId?.toString() === parentId
          );
          setChildren(filteredChildren);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to initial data if API fails
      setChildren(initialChildren);
    }
  }, [parentId, initialChildren]);

  // Initial load
  useMemo(() => {
    setChildren(initialChildren);
  }, [initialChildren]);

  // Refresh on focus if needed
  useFocusEffect(
    useCallback(() => {
      if (refresh === "true" && parentId) {
        fetchCategories();
      }
    }, [refresh, parentId, fetchCategories])
  );

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
        keyExtractor={(item) => item.id.toString()}
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
