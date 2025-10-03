import { router } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categoriesStyles } from './categoriesStyles';

// Mock data
const parentCategories = [
  { id: "1", name: "Thức ăn", icon: require("../../assets/images/food-icon.png") },
  { id: "2", name: "Đồ chơi", icon: require("../../assets/images/toy-icon.png") },
  { id: "3", name: "Phụ kiện", icon: require("../../assets/images/accessory-icon.png") },
  { id: "4", name: "Dụng cụ", icon: require("../../assets/images/tool-icon.png") },
  { id: "5", name: "Quần áo", icon: require("../../assets/images/clothes-icon.png") },
];

// Bảng Category con
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

export default function CategoriesScreen() {
    return (
        <SafeAreaView style={categoriesStyles.container}>
            {/* Tiêu đề */}
            <Text style={categoriesStyles.header}>Danh mục sản phẩm</Text>

            {/* Hiển thị Category cha và Category con */}
            <FlatList
                data={parentCategories}
                keyExtractor={(item) => item.id}
                style ={categoriesStyles.categoryContainer}
                renderItem={({ item: parent }) => {
                    // lấy danh sách category con theo parentId
                    const children = childCategories.filter((c) => c.parentId === parent.id);
                    
                    return (
                        <View style={categoriesStyles.categorySection}>
                            <View style={categoriesStyles.categoryHeader}>
                                <Image source={parent.icon} style={categoriesStyles.categoryIcon} />
                                <Text style={categoriesStyles.categoryTitle}>{parent.name}</Text>
                            </View>
                            <View style={categoriesStyles.childContainer}>
                                {children.map((child) => (
                                    <TouchableOpacity 
                                        key={child.id} 
                                        style={categoriesStyles.childCard}
                                        onPress={() => {
                                             router.push(`/product-list?categoryId=${child.id}&categoryName=${child.name}`);
                                        }}
                                    >
                                        <Image source={child.image} style={categoriesStyles.childImage} />
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