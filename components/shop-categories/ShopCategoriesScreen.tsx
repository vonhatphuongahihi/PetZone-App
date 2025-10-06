import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as childStyles } from "./shopCategoriesStyle";

const childCategories = [
    { id: "c1", name: "Hạt dinh dưỡng", parentId: "1", image: require("../../assets/images/cat.png") },
    { id: "c2", name: "Pate", parentId: "1", image: require("../../assets/images/cat.png") },
    { id: "c3", name: "Cỏ mèo", parentId: "1", image: require("../../assets/images/cat.png") },
    { id: "c4", name: "Bàn cào móng", parentId: "2", image: require("../../assets/images/cat.png") },
    { id: "c5", name: "Nhà cây", parentId: "2", image: require("../../assets/images/cat.png") },
    { id: "c6", name: "Vòng cổ", parentId: "3", image: require("../../assets/images/cat.png") },
    { id: "c7", name: "Dây dắt", parentId: "3", image: require("../../assets/images/cat.png") },
    { id: "c8", name: "Nệm, ổ, thảm", parentId: "4", image: require("../../assets/images/cat.png") },
    { id: "c9", name: "Nhà vệ sinh", parentId: "4", image: require("../../assets/images/cat.png") },
    { id: "c10", name: "Áo", parentId: "5", image: require("../../assets/images/cat.png") },
    { id: "c11", name: "Mũ", parentId: "5", image: require("../../assets/images/cat.png") },
    { id: "c12", name: "Khăn", parentId: "5", image: require("../../assets/images/cat.png") },
];

export default function ShopChildCategoriesScreen() {
    const { parentId, parentName } = useLocalSearchParams();
    const children = childCategories.filter(c => c.parentId === parentId);

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
                                params: { categoryId: item.id, categoryName: item.name }
                            })
                        }
                    >
                        <Image source={item.image} style={childStyles.childImage} />
                        <Text style={childStyles.childText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}
