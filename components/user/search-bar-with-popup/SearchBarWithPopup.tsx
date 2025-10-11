import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { SearchBarWithPopupStyles } from './searchBarWithPopupStyles';

interface Props {
  recentSearches: string[];
  hotProducts: {
    id: number;
    name: string;
    price: number;
    oldPrice: number;
    image: any;
  }[];
}

export default function SearchBarWithPopup({ recentSearches, hotProducts }: Props) {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState("");

    return (
        <View style={SearchBarWithPopupStyles.container}>
            {/* Thanh tìm kiếm */}
            <View style={SearchBarWithPopupStyles.Searchcontainer}>
                <TextInput
                    style={SearchBarWithPopupStyles.input}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={query}
                    onFocus={() => setVisible(true)}
                    onChangeText={setQuery}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => {}}>
                    <FontAwesome5 name="search" size={16} color="#999" style={SearchBarWithPopupStyles.searchIcon} />
                </TouchableOpacity>
            </View>

            {/* Popup tìm kiếm */}
            {visible && (
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={SearchBarWithPopupStyles.overlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={SearchBarWithPopupStyles.popup}>
                                {/* Lịch sử tìm kiếm */}
                                <Text style={SearchBarWithPopupStyles.sectionTitle}>Tìm kiếm gần đây</Text>
                                    {recentSearches.map((item, index) => (
                                    <View key={index} style={SearchBarWithPopupStyles.recentRow}>
                                        <TouchableOpacity>
                                            <Text style={SearchBarWithPopupStyles.recentText}>{item}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <AntDesign name="close" style={SearchBarWithPopupStyles.removeIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* Sản phẩm hot */}
                                <Text style={[SearchBarWithPopupStyles.sectionTitle, { marginTop: 16 }]}>
                                    Sản phẩm hot
                                </Text>
                                {hotProducts.map((item) => (
                                    <TouchableOpacity key={item.id.toString()} style={SearchBarWithPopupStyles.productRow}>
                                        <Image source={item.image} style={SearchBarWithPopupStyles.productImage} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={SearchBarWithPopupStyles.productName} numberOfLines={2}>
                                                {item.name}
                                            </Text>
                                            <View style={SearchBarWithPopupStyles.priceRow}>
                                                <Text style={SearchBarWithPopupStyles.productPrice}>
                                                    {item.price.toLocaleString("vi-VN")}đ
                                                </Text>
                                                <Text style={SearchBarWithPopupStyles.oldPrice}>
                                                    {item.oldPrice.toLocaleString("vi-VN")}đ
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}