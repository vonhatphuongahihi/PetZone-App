import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatService, Conversation } from "../../../services/chatService";
import { getOnlineUsers } from "../../../services/onlineUsersService";
import { SocketEventEmitter } from "../../../services/socketEventEmitter";
import { tokenService } from "../../../services/tokenService";
import { messagesSellerStyles } from './messagesSellerStyles';

export default function MessagesSellerScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [onlineUsersLoaded, setOnlineUsersLoaded] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [typingUsers, setTypingUsers] = useState<Record<number, string[]>>({});

  useEffect(() => {
    getCurrentUserId();
    loadOnlineUsers();

    // Listen for real-time online/offline events
    const handleUserOnline = (data: { userId: string }) => {
      console.log('[MessagesSellerScreen] User online event received:', data.userId);
      setOnlineUsers(prev => {
        const newSet = new Set([...prev, data.userId]);
        console.log('[MessagesSellerScreen] Updated online users:', Array.from(newSet));
        return newSet;
      });
      // Mark as loaded when we receive real-time events
      if (!onlineUsersLoaded) {
        setOnlineUsersLoaded(true);
      }
      // Also refresh online users list to ensure consistency
      loadOnlineUsers();
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    // Listen for unread conversation notifications
    const handleUnreadNotification = (data: any) => {
      const { conversationId, message, senderId, timestamp } = data;
      // Only update if this is not from current user
      if (senderId === currentUserId) {
        return;
      }

      // Update conversations list first
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            const updatedConv = {
              ...conv,
              updatedAt: timestamp,
              messages: [...(conv.messages || []), message]
            };
            return updatedConv;
          }
          return conv;
        });

        // Sort by updatedAt to show latest conversations first
        return updated.sort((a, b) =>
          new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
      });

    };

    // Listen for typing events
    const handleTyping = (data: any) => {
      const { conversationId, userId } = data;

      if (userId === currentUserId) return;

      setTypingUsers(prev => {
        const currentTyping = prev[conversationId] || [];
        if (!currentTyping.includes(userId)) {
          return {
            ...prev,
            [conversationId]: [...currentTyping, userId]
          };
        }
        return prev;
      });
    };

    const handleStopTyping = (data: any) => {
      const { conversationId, userId } = data;

      if (userId === currentUserId) return;

      setTypingUsers(prev => {
        const currentTyping = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: currentTyping.filter(id => id !== userId)
        };
      });
    };

    const userOnlineSubscription = SocketEventEmitter.addListener('user_online', handleUserOnline);
    const userOfflineSubscription = SocketEventEmitter.addListener('user_offline', handleUserOffline);
    const unreadSubscription = SocketEventEmitter.addListener('conversation:unread', handleUnreadNotification);
    const typingSubscription = SocketEventEmitter.addListener('conversation:typing', handleTyping);
    const stopTypingSubscription = SocketEventEmitter.addListener('conversation:stop_typing', handleStopTyping);

    return () => {
      userOnlineSubscription.remove();
      userOfflineSubscription.remove();
      unreadSubscription.remove();
      typingSubscription.remove();
      stopTypingSubscription.remove();
    };
  }, [currentUserId, isSearchVisible, searchQuery]);

  const loadOnlineUsers = async () => {
    try {
      setOnlineUsersLoaded(false); // Reset loading state
      const onlineUserIds = await getOnlineUsers(true);
      setOnlineUsers(new Set(onlineUserIds));
      setOnlineUsersLoaded(true); // Mark as loaded
    } catch (error) {
      console.error('[MessagesSellerScreen] Error loading online users:', error);
      setOnlineUsersLoaded(true); // Mark as loaded even on error to avoid stuck state
    }
  };

  // Refresh conversations whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      loadOnlineUsers();
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
      // Get the last message (most recent)
      const lastMsg = conversation.messages[conversation.messages.length - 1];
      return lastMsg.body || 'Tin nhắn';
    }
    return 'Chưa có tin nhắn';
  }, []);

  // Cập nhật filteredConversations khi conversations thay đổi
  useEffect(() => {
    if (!isSearchVisible || !searchQuery) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conversation) => {
        const otherUser = getOtherUser(conversation);

        return (
          otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    }
  }, [conversations, isSearchVisible, searchQuery, getOtherUser, getLastMessage]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <Text key={index} style={messagesSellerStyles.highlightText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

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

  const renderMessage = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const lastMessage = getLastMessage(item);
    const time = item.updatedAt ? formatRelativeTime(item.updatedAt) : '';
    // Only show online status if we've loaded the online users list
    const isOtherUserOnline = onlineUsersLoaded && onlineUsers.has(otherUser.id);
    const avatarUrl = otherUser.avatarUrl;

    // Check if there are unread messages
    const unreadCount = unreadCounts[item.id] || 0;

    // Check if the last message is from someone else (not current user)
    const lastMessageObj = item.messages && item.messages.length > 0 ? item.messages[item.messages.length - 1] : null;
    const isLastMessageFromOther = lastMessageObj && String(lastMessageObj.senderId) !== String(currentUserId);

    const hasUnreadMessages = item.participants?.some((participant: any) => {
      // If this is the current user's participant record
      if (participant.userId === currentUserId) {
        // Only show unread if last message is from someone else AND lastReadAt is older than updatedAt
        if (isLastMessageFromOther && participant.lastReadAt && item.updatedAt) {
          return new Date(participant.lastReadAt) < new Date(item.updatedAt);
        }
        // If no lastReadAt but conversation has updatedAt and last message is from other, consider it unread
        return isLastMessageFromOther && !participant.lastReadAt && item.updatedAt;
      }
      return false;
    }) || false;

    // Check if someone is typing in this conversation
    const conversationTypingUsers = typingUsers[item.id] || [];
    const isTyping = conversationTypingUsers.length > 0;
    const typingText = isTyping ? `${otherUser.username} đang nhập...` : lastMessage;

    return (
      <TouchableOpacity
        style={messagesSellerStyles.messageRow}
        onPress={() => {
          router.push(`/seller/chat?chatId=${item.id}`);
        }}
      >
        {/* Avatar */}
        <View style={messagesSellerStyles.avatarContainer}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/images/shop.png")}
            style={messagesSellerStyles.avatar}
          />
          {/* Hiển thị nút xanh khi user thực sự online và đã load xong danh sách */}
          {isOtherUserOnline && <View style={messagesSellerStyles.onlineDot} />}
        </View>

        {/* Nội dung tin nhắn */}
        <View style={messagesSellerStyles.messageContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[messagesSellerStyles.name, hasUnreadMessages && { fontWeight: 'bold' }]}>
              {isSearchVisible && searchQuery ? highlightText(otherUser.username, searchQuery) : otherUser.username}
            </Text>
            {hasUnreadMessages && (
              <View style={{
                backgroundColor: '#FF3B30',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
                paddingHorizontal: 6
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount || '1'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[messagesSellerStyles.text, hasUnreadMessages && { fontWeight: 'bold' }, isTyping && { fontStyle: 'italic', color: '#666' }]} numberOfLines={1}>
            {typingText}
          </Text>
        </View>

        {/* Thời gian */}
        <Text style={messagesSellerStyles.time}>{time}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
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
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSearchPress}>
              <FontAwesome5 name="search" size={18} color="#FBBC05" />
            </TouchableOpacity>
          </View>
          <View style={[messagesSellerStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#FBBC05" />
            <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
          <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSearchPress}>
            <FontAwesome5 name="search" size={18} color="#FBBC05" />
          </TouchableOpacity>
        </View>

        {/* Thanh tìm kiếm */}
        {isSearchVisible && (
          <View style={messagesSellerStyles.searchContainer}>
            <TextInput
              style={messagesSellerStyles.searchInput}
              placeholder="Tìm kiếm..."
              placeholderTextColor={"gray"}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
            <TouchableOpacity
              style={messagesSellerStyles.cancelButton}
              onPress={handleCancelSearch}
            >
              <Text style={messagesSellerStyles.cancelButtonText}>Hủy</Text>
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
            <View style={messagesSellerStyles.noResultsContainer}>
              <Text style={messagesSellerStyles.noResultsText}>
                {searchQuery ? 'Không tìm thấy kết quả nào' : 'Chưa có cuộc trò chuyện nào'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}