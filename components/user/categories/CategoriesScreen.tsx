// src/screens/CategoriesScreen.tsx
import { categoryService } from '@/services/categoryService';
import { ChildCategory, getChildCategory } from '@/utils/getChildCategory';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category, categoryService } from '../../../services/categoryService';
import { tokenService } from '../../../services/tokenService';
import { categoriesStyles } from './categoriesStyles';

export default function CategoriesScreen() {
    const { parentId, parentName } = useLocalSearchParams(); // nhận từ HomeScreen
    const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChildCategories = async () => {
        setLoading(true);

        const token = await AsyncStorage.getItem("jwt_token");
        if (!token) {
            Alert.alert("Lỗi", "Bạn chưa đăng nhập", [
                { text: "OK", onPress: () => router.replace("/login") }
            ]);
            setLoading(false);
            return;
        }

        try {
            // Lấy tất cả danh mục từ API
            const { data: categories } = await categoryService.getAllCategories(token);

            // Tìm danh mục cha
            const parent = categories.find(c => c.id.toString() === parentId);
            if (!parent) {
                Alert.alert("Lỗi", "Danh mục cha không tồn tại");
                setLoading(false);
                return;
            }

            // Lấy tất cả danh mục con lá
            let leafCategories = getChildCategory(parent.children || []);

            // 🔹 Thêm trường image từ API (nếu có)
            leafCategories = leafCategories.map(cat => ({
                ...cat,
                image: cat.image || undefined,
            }));

            setChildCategories(leafCategories);

        } catch (err) {
            console.error("Lỗi tải danh mục con:", err);
            Alert.alert("Lỗi", "Không tải được danh mục con");
        }

        setLoading(false);
    };

    useEffect(() => {
        if (parentId) fetchChildCategories();
    }, [parentId]);

    if (loading) {
        return (
            <SafeAreaView style={categoriesStyles.container}>
                <ActivityIndicator size="large" color="#FBBC05" style={{ marginTop: 20 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={categoriesStyles.container}>
            {/* Header với mũi tên quay lại kiểu < */}
            <View style={categoriesStyles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <Ionicons name="chevron-back-outline" size={28} color="#FBBC05" />
                </TouchableOpacity>
                <Text style={categoriesStyles.header}>{parentName || "Danh mục sản phẩm"}</Text>
            </View>

            {/* Danh sách danh mục con */}
            <FlatList
                data={childCategories}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={categoriesStyles.childContainer}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={[
                            categoriesStyles.childCard,
                            index % 2 === 0 ? { marginRight: 12 } : { marginLeft: 0 }
                        ]}
                        onPress={() => router.push(`/product-list?categoryId=${item.id}&categoryName=${item.name}`)}
                    >
                        <Image
                            source={item.image ? { uri: item.image } : require("../../../assets/images/cat.png")}
                            style={categoriesStyles.childImage}
                        />
                        <Text style={categoriesStyles.childText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
