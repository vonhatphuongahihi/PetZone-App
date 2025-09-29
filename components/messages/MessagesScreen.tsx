import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { messagesStyles } from './messagesStyles';

const messages = [
  {
    id: "1",
    name: "Nhất Phương",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../assets/images/shop.png"),
    online: true,
  },
  {
    id: "2",
    name: "Võ Nhất Phương",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../assets/images/shop.png"),
    online: true,
  },
  {
    id: "3",
    name: "Nhất Phương Võ",
    message: "Vòng cổ mèo có size M ko shop",
    time: "3:46 PM",
    avatar: require("../../assets/images/shop.png"),
    online: false,
  },
];

export default function MessagesScreen() {
  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <TouchableOpacity 
        style={messagesStyles.messageRow}
        onPress={() => {
            router.push(`/chat?chatId=${item.id}`);
        }}
    >
      {/* Avatar */}
      <View style={messagesStyles.avatarContainer}>
        <Image source={item.avatar} style={messagesStyles.avatar} />
        {item.online && <View style={messagesStyles.onlineDot} />}
      </View>

      {/* Nội dung tin nhắn */}
      <View style={messagesStyles.messageContent}>
        <Text style={messagesStyles.name}>{item.name}</Text>
        <Text style={messagesStyles.text} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      {/* Thời gian */}
      <Text style={messagesStyles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={messagesStyles.container}>
      {/* Header */}
      <View style={messagesStyles.header}>
        <Text style={messagesStyles.headerTitle}>Nhắn tin</Text>
        <TouchableOpacity>
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
  );
}