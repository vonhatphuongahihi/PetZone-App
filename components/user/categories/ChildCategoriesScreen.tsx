import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category, categoryService } from '../../../services/categoryService';
import { tokenService } from '../../../services/tokenService';
import { categoriesStyles } from './categoriesStyles';

export default function ChildCategoriesScreen() {
    const { parentId, parentName, parentImage } = useLocalSearchParams();
    const [childCategories, setChildCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh mục con của danh mục cha
    useEffect(() => {
        const fetchChildCategories = async () => {
            try {
                setLoading(true);
                const token = await tokenService.getToken();

                if (!token) {
                    Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem danh mục');
                    return;
                }

                // Lấy tất cả categories và filter để tìm children của parent
                const response = await categoryService.getAllCategories(token);

                if (response.success) {
                    // Tìm parent category
                    const parent = response.data.find((cat: Category) => cat.id === parseInt(parentId as string));

                    if (parent && parent.children) {
                        setChildCategories(parent.children);
                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy danh mục con');
                    }
                } else {
                    Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
                }
            } catch (error: any) {
                console.error('Error fetching child categories:', error);
                Alert.alert('Lỗi', error.message || 'Không thể kết nối đến server');
            } finally {
                setLoading(false);
            }
        };

        if (parentId) {
            fetchChildCategories();
        }
    }, [parentId]);

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={categoriesStyles.container}>
                    <View style={categoriesStyles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                        </TouchableOpacity>
                        <Text style={categoriesStyles.headerTitle}>
                            {parentName || 'Danh mục con'}
                        </Text>
                        <View style={{ width: 20 }} />
                    </View>
                    <View style={[categoriesStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color="#FBBC05" />
                        <Text style={{ marginTop: 10 }}>Đang tải danh mục...</Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={categoriesStyles.container}>
                {/* Header với nút back */}
                <View style={categoriesStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={categoriesStyles.headerTitleChild}>
                        {parentName || 'Danh mục con'}
                    </Text>
                    <View style={{ width: 20 }} />
                </View>

                {/* Hiển thị danh mục cha */}
                <View style={categoriesStyles.categorySection}>

                    {/* Hiển thị danh mục con */}
                    {childCategories.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999' }}>Không có danh mục con</Text>
                        </View>
                    ) : (
                        <View style={categoriesStyles.childContainer}>
                            {childCategories.map((child: Category) => (
                                <TouchableOpacity
                                    key={child.id}
                                    style={categoriesStyles.childCard}
                                    onPress={() => {
                                        router.push(`/product-list?categoryId=${child.id}&categoryName=${encodeURIComponent(child.name)}`);
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
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

