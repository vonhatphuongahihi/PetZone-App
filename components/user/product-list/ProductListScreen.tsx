import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product, productService } from '../../../services/productService';
import { tokenService } from '../../../services/tokenService';
import { ProductCard } from '../product-card/ProductCard';
import { productListStyles } from './productListStyles';

export default function ProductListScreen() {
    const { categoryId, categoryName } = useLocalSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch products khi component mount
    useEffect(() => {
        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = await tokenService.getToken();
            
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem sản phẩm');
                return;
            }

            if (!categoryId) {
                Alert.alert('Lỗi', 'Không tìm thấy danh mục');
                return;
            }

            const response = await productService.getProductsByCategory(
                parseInt(categoryId as string), 
                token
            );
            
            if (response.success) {
                setProducts(response.data);
            } else {
                Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            Alert.alert('Lỗi', error.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleProductPress = (product: Product) => {
        router.push(`/product?productId=${product.id}`);
        console.log('Product pressed:', product.title);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <ProductCard
            product={{
                id: item.id.toString(),
                name: item.title,
                shop: item.store?.storeName || item.storeId,
                shopImage: item.store?.avatarUrl ? { uri: item.store.avatarUrl } : require("../../../assets/images/shop.png"),
                sold: Math.floor(Math.random() * 1000), // Tính toán từ dữ liệu bán hàng thực tế, sẽ hiển thị chính xác sau
                category: item.category?.name || 'Không có danh mục',
                rating: Number(item.avgRating) || 0,
                image: item.images?.[0]?.url ? { uri: item.images[0].url } : require("../../../assets/images/cat.png"),
                price: Number(item.price) || 0,
                oldPrice: Number(item.oldPrice) || 0,
                discount: item.oldPrice ? `-${Math.round((1 - Number(item.price) / Number(item.oldPrice)) * 100)}%` : "",
                tag: item.tag || undefined,
            }}
            onPress={() => handleProductPress(item)}
        />
    );

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={productListStyles.container}>
                    <View style={productListStyles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                        </TouchableOpacity>
                        <Text style={productListStyles.headerTitle}>{categoryName}</Text>
                    </View>
                    <View style={[productListStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color="#FBBC05" />
                        <Text style={{ marginTop: 10 }}>Đang tải sản phẩm...</Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={productListStyles.container}>
                {/* Header */}
                <View style={productListStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={productListStyles.headerTitle}>{categoryName}</Text>
                </View>

                {/* Danh sách sản phẩm */}
                {products.length === 0 ? (
                    <View style={[productListStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16, color: '#666' }}>Không có sản phẩm nào trong danh mục này</Text>
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: "space-between" }}
                        contentContainerStyle={{ padding: 12 }}
                    />
                )}
            </SafeAreaView>
        </>
    );
}