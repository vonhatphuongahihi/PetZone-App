import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { API_BASE_URL } from "../../../config/api";
import { SearchBarWithPopupStyles } from './searchBarWithPopupStyles';

interface Props {
    searchQuery?: string;  // optional
    recentSearches?: string[];   // optional
    hotProducts?: any[];
}

export default function SearchBarWithPopup({ searchQuery = "" }: Props) {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState(searchQuery);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const inputRef = useRef<TextInput>(null);

    // Cập nhật query khi searchQuery prop thay đổi
    useEffect(() => {
        if (searchQuery) {
            setQuery(searchQuery);
        }
    }, [searchQuery]);

    // Tìm kiếm khi nhập
    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("jwt_token");
                if (!token) {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                const params = new URLSearchParams({
                    q: query.trim(),
                    limit: "3",
                });

                const res = await fetch(`${API_BASE_URL}/products/search?${params}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const json = await res.json();
                    setResults(json.success ? json.data : []);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.log("Search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Load lịch sử khi mở search
    const loadHistory = async () => {
        const json = await AsyncStorage.getItem("searchHistory");
        setSearchHistory(json ? JSON.parse(json) : []);
    };

    // Xử lý tìm kiếm (Enter hoặc nút search)
    const handleSearch = async (keywordParam?: string) => {
        const keyword = (keywordParam ?? query).trim();
        if (!keyword) return;

        setVisible(false);
        inputRef.current?.blur();

        // Lưu lịch sử
        try {
            let history = [...searchHistory];
            history = history.filter(item => item !== keyword);
            history.unshift(keyword);
            history = history.slice(0, 3);
            await AsyncStorage.setItem("searchHistory", JSON.stringify(history));
            setSearchHistory(history);
        } catch (err) {
            console.log("Save history error:", err);
        }

        router.push({
            pathname: "/search-results",
            params: { q: keyword }
        } as any);

    };

    return (
        <View style={SearchBarWithPopupStyles.container}>
            {/* Thanh tìm kiếm */}
            <View style={SearchBarWithPopupStyles.Searchcontainer}>
                <TextInput
                    ref={inputRef}
                    style={SearchBarWithPopupStyles.input}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={query}
                    onFocus={() => {
                        setVisible(true);
                        loadHistory();
                    }}
                    onChangeText={setQuery}
                    onSubmitEditing={() => handleSearch()}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => handleSearch()}>
                    <FontAwesome5 name="search" size={16} color="#999" style={SearchBarWithPopupStyles.searchIcon} />
                </TouchableOpacity>
            </View>

            {/* Popup tìm kiếm */}
            {visible && (
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={SearchBarWithPopupStyles.overlay}>

                        {/* chặn click xuyên */}
                        <View style={SearchBarWithPopupStyles.popup}>

                            {/* Nếu đang nhập → show kết quả */}
                            {query.trim().length >= 2 ? (
                                <View>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#FBBC05" style={{ padding: 20 }} />
                                    ) : results.length > 0 ? (
                                        <ScrollView style={{ maxHeight: 300 }}>
                                            {results.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id.toString()}
                                                    style={SearchBarWithPopupStyles.productRow}
                                                    onPress={() => {
                                                        setVisible(false);
                                                        inputRef.current?.blur();
                                                        router.push({
                                                            pathname: "/product",
                                                            params: { productId: item.id.toString() }
                                                        } as any);
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: item.images?.[0]?.url || "https://via.placeholder.com/60" }}
                                                        style={SearchBarWithPopupStyles.productImage}
                                                    />
                                                    <View style={{ flex: 1 }}>
                                                        <Text
                                                            style={SearchBarWithPopupStyles.productName}
                                                            numberOfLines={2}
                                                            ellipsizeMode="tail"
                                                        >
                                                            {item.title || item.name || ""}
                                                        </Text>

                                                        <View style={SearchBarWithPopupStyles.priceRow}>
                                                            <Text style={SearchBarWithPopupStyles.productPrice}>
                                                                {Number(item.price || 0).toLocaleString("vi-VN")}đ
                                                            </Text>
                                                            {!!item.oldPrice && (
                                                                <Text style={SearchBarWithPopupStyles.oldPrice}>
                                                                    {Number(item.oldPrice).toLocaleString("vi-VN")}đ
                                                                </Text>
                                                            )}
                                                        </View>

                                                        <Text style={{ fontSize: 12, color: "#666" }}>
                                                            {item.store?.storeName ?? ""}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <Text style={{ padding: 20, textAlign: "center", color: "#999" }}>
                                            Không tìm thấy sản phẩm
                                        </Text>
                                    )}
                                </View>
                            ) : (
                                <View>
                                    <Text style={SearchBarWithPopupStyles.sectionTitle}>
                                        Tìm kiếm gần đây
                                    </Text>

                                    {searchHistory.length > 0 ? searchHistory.map((item, index) => (
                                        <View key={index} style={SearchBarWithPopupStyles.recentRow}>
                                            <TouchableOpacity onPress={() => handleSearch(item)}>
                                                <Text style={SearchBarWithPopupStyles.recentText}>{item}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const newHistory = searchHistory.filter(h => h !== item);
                                                    await AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
                                                    setSearchHistory(newHistory);
                                                }}
                                            >
                                                <AntDesign name="close" size={16} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    )) : (
                                        <Text style={{ padding: 10, color: "#999" }}>
                                            Chưa có lịch sử tìm kiếm
                                        </Text>
                                    )}
                                </View>
                            )}

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}
