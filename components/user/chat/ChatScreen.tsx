import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatStyles } from './chatStyles';

const messages = [
    { id: "1", text: "Shop ơi", time: "8:54 AM", sender: "me" },
    { id: "2", text: "Shop chào bạn", time: "8:56 AM", sender: "shop" },
    { id: "3", text: "Shop có vòng cổ màu vàng cho mèo ko", time: "9:02 AM", sender: "me" },
    { id: "4", text: "Hiện tại bên mình hết màu vàng rồi ạ", time: "9:04 AM", sender: "shop" },
    { id: "5", text: "Vậy còn màu đỏ ko shop", time: "9:06 AM", sender: "me" },
    { id: "6", text: "Còn bạn nhé, bạn muốn mình gửi link sản phẩm cho bạn ko ạ?", time: "9:10 AM", sender: "shop" },
    { id: "7", text: "Ok bạn gửi mình xem với", time: "9:12 AM", sender: "me" },
    { id: "8", text: "Đây bạn nhé https://shopee.vn/Vòng-Cổ-Màu-Đỏ-Cho-Chó-Mèo-Sang-Trọng-Đẳng-Cấp-i.12345678.234567890", time: "9:14 AM", sender: "shop" },
    { id: "9", text: "Cảm ơn shop nhiều nha", time: "9:15 AM", sender: "me" },
    { id: "10", text: "Không có gì bạn nhé, chúc bạn một ngày tốt lành ạ!", time: "9:16 AM", sender: "shop" },
];

export default function ChatScreen() {
    const router = useRouter();
    const renderMessage = ({ item }: { item: typeof messages[0] }) => {
        const isMe = item.sender === "me";
        return (
            <View style={[chatStyles.messageRow, isMe ? chatStyles.rightAlign : chatStyles.leftAlign]}>
                <View style={[chatStyles.bubble, isMe ? chatStyles.myBubble : chatStyles.shopBubble]}>
                    <Text style={[chatStyles.messageText, isMe ? chatStyles.myText : chatStyles.shopText]}>{item.text}</Text>
                </View>
                <Text style={chatStyles.time}>{item.time}</Text>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={chatStyles.container}>
                {/* Header */}
                <View style={chatStyles.header}>
                    <View style={chatStyles.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" style={{ marginRight: 4 }} />
                        </TouchableOpacity>
                        <View>
                            <Image source={require("../../../assets/images/shop.png")} style={chatStyles.avatar} />
                            <View style={chatStyles.onlineDot} />
                        </View>
                        <View>
                            <Text style={chatStyles.name}>Nhất Phương</Text>
                            <Text style={chatStyles.status}>Đang hoạt động</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Feather name="more-vertical" color="#FBBC05" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={chatStyles.messagesContainer}
                />

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={80}
                >
                    <View style={chatStyles.inputRow}>
                        <TextInput
                            placeholder="Nhập tin nhắn"
                            placeholderTextColor="#999"
                            style={chatStyles.input}
                        />
                        <TouchableOpacity style={chatStyles.sendButton}>
                            <FontAwesome5 name="paper-plane" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
