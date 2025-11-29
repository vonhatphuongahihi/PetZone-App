import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category, categoryService } from '../../../services/categoryService';
import { tokenService } from '../../../services/tokenService';
import { categoriesStyles } from './categoriesStyles';

export default function CategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu categories từ backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const token = await tokenService.getToken();
                
                if (!token) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem danh mục');
                    return;
                }

                const response = await categoryService.getAllCategories(token);
                
                if (response.success) {
                    setCategories(response.data);
                } else {
                    Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
                }
            } catch (error: any) {
                console.error('Error fetching categories:', error);
                Alert.alert('Lỗi', error.message || 'Không thể kết nối đến server');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const parentCategories = categories;

    if (loading) {
        return (
            <SafeAreaView style={categoriesStyles.container}>
                <Text style={categoriesStyles.header}>Danh mục sản phẩm</Text>
                <View style={[categoriesStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#FBBC05" />
                    <Text style={{ marginTop: 10 }}>Đang tải danh mục...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={categoriesStyles.container}>
            {/* Tiêu đề */}
            <Text style={categoriesStyles.header}>Danh mục sản phẩm</Text>

            {/* Hiển thị Category cha và Category con */}
            <FlatList
                data={parentCategories}
                keyExtractor={(item) => item.id.toString()}
                style={categoriesStyles.categoryContainer}
                renderItem={({ item: parent }) => {
                    // lấy danh sách category con từ children property
                    const children = parent.children || [];

                    return (
                        <View style={categoriesStyles.categorySection}>
                            <View style={categoriesStyles.categoryHeader}>
                                {parent.image ? (
                                    <Image 
                                        source={{ uri: parent.image }} 
                                        style={categoriesStyles.categoryIcon}
                                        defaultSource={require("../../../assets/images/cat.png")}
                                    />
                                ) : (
                                    <Image 
                                        source={require("../../../assets/images/cat.png")} 
                                        style={categoriesStyles.categoryIcon} 
                                    />
                                )}
                                <Text style={categoriesStyles.categoryTitle}>{parent.name}</Text>
                            </View>
                            <View style={categoriesStyles.childContainer}>
                                {children.map((child: Category) => (
                                    <TouchableOpacity
                                        key={child.id}
                                        style={categoriesStyles.childCard}
                                        onPress={() => {
                                            router.push(`/product-list?categoryId=${child.id}&categoryName=${encodeURIComponent(child.name)}&storeId=${child.storeId}`);
                                        }}
                                    >
                                        {child.image ? (
                                            <Image 
                                                source={{ uri: child.image }} 
                                                style={categoriesStyles.childImage}
                                                defaultSource={require("../../../assets/images/cat.png")}
                                            />
                                        ) : (
                                            <Image 
                                                source={require("../../../assets/images/cat.png")} 
                                                style={categoriesStyles.childImage} 
                                            />
                                        )}
                                        <Text style={categoriesStyles.childText}>{child.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}