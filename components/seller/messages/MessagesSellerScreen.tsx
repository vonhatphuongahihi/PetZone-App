import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messagesSellerStyles } from './messagesSellerStyles';

const messages = [
  {
    id: "1",
    name: "Nhất Phương",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../../assets/images/shop.png"),
    online: true,
  },
  {
    id: "2",
    name: "Võ Nhất Phương",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../../assets/images/shop.png"),
    online: true,
  },
  {
    id: "3",
    name: "Nhất Phương Võ",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../../assets/images/shop.png"),
    online: false,
  },
];

export default function MessagesSellerScreen() {
  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <TouchableOpacity 
        style={messagesSellerStyles.messageRow}
        onPress={() => {
            router.push(`/seller/chat?chatId=${item.id}`);
        }}
    >
      {/* Avatar */}
      <View style={messagesSellerStyles.avatarContainer}>
        <Image source={item.avatar} style={messagesSellerStyles.avatar} />
        {item.online && <View style={messagesSellerStyles.onlineDot} />}
      </View>

      {/* Nội dung tin nhắn */}
      <View style={messagesSellerStyles.messageContent}>
        <Text style={messagesSellerStyles.name}>{item.name}</Text>
        <Text style={messagesSellerStyles.text} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      {/* Thời gian */}
      <Text style={messagesSellerStyles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={messagesSellerStyles.container}>
        {/* Header */}
        <View style={messagesSellerStyles.header}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={() => router.back()}>
            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" style={{ marginRight: 4 }} />
          </TouchableOpacity>
          <Text style={messagesSellerStyles.headerTitle}>Nhắn tin</Text>
          <TouchableOpacity style={{ marginLeft: 'auto' }}>
            <FontAwesome5 name="search" size={18} color="#FBBC05" />
          </TouchableOpacity>
        </View>

        {/* Danh sách tin nhắn */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
        />
      </SafeAreaView>
    </>
  );
}