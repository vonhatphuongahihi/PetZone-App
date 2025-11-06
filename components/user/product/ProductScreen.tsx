import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product } from '../../../services/productService';
import { productStyles } from './productStyles';

export default function ProductScreen() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={productStyles.container}>
                {/* Header */}
                <View style={productStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={productStyles.headerTitle}>{productId}</Text>
                </View>
            </SafeAreaView>
        </>
    );
}