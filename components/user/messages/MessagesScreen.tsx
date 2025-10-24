import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatService, Conversation } from "../../../services/chatService";
import { tokenService } from "../../../services/tokenService";
import { messagesStyles } from './messagesStyles';

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCurrentUserId();
  }, []);

  // Refresh conversations whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = await tokenService.getToken();
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const data = await chatService.getUserConversations(token);
      setConversations(data);
      setFilteredConversations(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = async () => {
    try {
      const user = await tokenService.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setSearchQuery('');
      setFilteredConversations(conversations);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredConversations(conversations);
      return;
    }

    // Tìm kiếm theo tên user
    const filtered = conversations.filter((conversation) => {
      const otherUser = getOtherUser(conversation);
      
      return (
        otherUser.username.toLowerCase().includes(query.toLowerCase())
      );
    });

    setFilteredConversations(filtered);
  };

  const handleCancelSearch = () => {
    setIsSearchVisible(false);
    setSearchQuery('');
    setFilteredConversations(conversations);
  };

  const getOtherUser = useCallback((conversation: Conversation) => {
    // Tìm user khác trong conversation (không phải current user)
    const otherParticipants = conversation.participants.filter(
      (participant) => participant.userId !== currentUserId
    );

    return otherParticipants[0]?.user || {
      id: '',
      username: 'Unknown User',
      email: '',
      isActive: false
    };
  }, [currentUserId]);

  const getLastMessage = useCallback((conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0].body || 'Tin nhắn';
    }
    return 'Chưa có tin nhắn';
  }, []);

  // Cập nhật filteredConversations khi conversations thay đổi
  useEffect(() => {
    if (!isSearchVisible || !searchQuery) {
      setFilteredConversations(conversations);
    } else {
      // Filter logic inline để tránh dependency issues
      const filtered = conversations.filter((conversation) => {
        const otherUser = getOtherUser(conversation);
        
        return (
          otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    }
  }, [conversations, isSearchVisible, searchQuery, getOtherUser]);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Nếu trong vòng 1 phút
    if (diffInMinutes < 1) {
      return 'Vừa xong';
    }
    
    // Nếu trong vòng 1 giờ
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    }
    
    // Nếu trong ngày hôm nay
    if (diffInHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    // Nếu hôm qua
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return 'Hôm qua';
    }
    
    // Nếu trong tuần này (1-7 ngày trước)
    if (diffInDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' }); // Thứ 2, Thứ 3...
    }
    
    // Nếu trong năm nay
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      }); // 15/10
    }
    
    // Nếu khác năm
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    }); // 15/10/23
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <Text key={index} style={messagesStyles.highlightText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderMessage = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const lastMessage = getLastMessage(item);
    const time = item.updatedAt ? formatRelativeTime(item.updatedAt) : '';
    // const avatarSource = otherUser.avatarUrl ? { uri: otherUser.avatarUrl } : require("../../../assets/images/shop.png");

    return (
      <TouchableOpacity
        style={messagesStyles.messageRow}
        onPress={() => {
          router.push(`/chat?chatId=${item.id}`);
        }}
      >
        {/* Avatar */}
        <View style={messagesStyles.avatarContainer}>
          <Image 
            source={require("../../../assets/images/shop.png")} 
            style={messagesStyles.avatar} 
          />
          {otherUser.isActive && <View style={messagesStyles.onlineDot} />}
        </View>

        {/* Nội dung tin nhắn */}
        <View style={messagesStyles.messageContent}>
          <Text style={messagesStyles.name}>
            {isSearchVisible && searchQuery ? highlightText(otherUser.username, searchQuery) : otherUser.username}
          </Text>
          <Text style={messagesStyles.text} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>

        {/* Thời gian */}
        <Text style={messagesStyles.time}>{time}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={messagesStyles.container}>
        <View style={messagesStyles.header}>
          <Text style={messagesStyles.headerTitle}>Nhắn tin</Text>
          <TouchableOpacity onPress={handleSearchPress}>
            <FontAwesome5 name="search" size={18} color="#FBBC05" />
          </TouchableOpacity>
        </View>
        <View style={[messagesStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FBBC05" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={messagesStyles.container}>
      {/* Header */}
      <View style={messagesStyles.header}>
        <Text style={messagesStyles.headerTitle}>Nhắn tin</Text>
        <TouchableOpacity onPress={handleSearchPress}>
          <FontAwesome5 name="search" size={18} color="#FBBC05" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      {isSearchVisible && (
        <View style={messagesStyles.searchContainer}>
          <TextInput
            style={messagesStyles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor={"gray"}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus={true}
          />
          <TouchableOpacity 
            style={messagesStyles.cancelButton}
            onPress={handleCancelSearch}
          >
            <Text style={messagesStyles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Danh sách tin nhắn */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        refreshing={loading}
        onRefresh={loadConversations}
        ListEmptyComponent={
          <View style={messagesStyles.noResultsContainer}>
            <Text style={messagesStyles.noResultsText}>
              {searchQuery ? 'Không tìm thấy kết quả nào' : 'Chưa có cuộc trò chuyện nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}