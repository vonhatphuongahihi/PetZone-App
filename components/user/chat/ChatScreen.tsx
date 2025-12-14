import { Feather, FontAwesome5 } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatLogic } from '../../../hooks/useChatLogic';
import { Message } from '../../../services/chatService';
import { chatStyles } from './chatStyles';
import ChatOptionsModal from './modals/ChatOptionsModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';
import ThemeSelectionModal from './modals/ThemeSelectionModal';

// Helper functions for time formatting and date checking
const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const isDifferentDate = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() !== d2.getDate() ||
        d1.getMonth() !== d2.getMonth() ||
        d1.getFullYear() !== d2.getFullYear();
};

export default function ChatScreen() {
    const router = useRouter();
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const conversationId = Number(chatId);

    // Use custom hook for chat logic
    const {
        items,
        text,
        isTyping,
        isPeerOnline,
        myUserId,
        peerName,
        avatarUrl,
        isLoadingMore,
        chatTheme,
        listRef,
        lastMessageReadStatus,
        send,
        pickImage,
        onChangeText,
        loadMoreMessages,
        updateTheme,
        deleteConversation,
    } = useChatLogic(conversationId);

    // Modal states
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [shouldShowRead, setShouldShowRead] = useState(false);

    // Update shouldShowRead when lastMessageReadStatus changes
    useEffect(() => {
        // Check if last message is mine and has been read
        if (items.length > 0) {
            const lastMessage = items[items.length - 1];
            const isLastMine = myUserId ? lastMessage.senderId === myUserId : false;
            const newShouldShowRead = isLastMine && lastMessageReadStatus;
            setShouldShowRead(newShouldShowRead);
        } else {
            setShouldShowRead(false);
        }
    }, [items, lastMessageReadStatus, myUserId]);

    // Modal handlers
    const handleOptionsClose = () => setShowOptionsModal(false);
    const handleChangeTheme = () => {
        setShowOptionsModal(false);
        setShowThemeModal(true);
    };
    const handleDeleteChat = () => {
        setShowOptionsModal(false);
        setShowDeleteModal(true);
    };
    const handleThemeSelect = (theme: string) => {
        updateTheme(theme);
        setShowThemeModal(false);
    };
    const handleDeleteConfirm = () => {
        deleteConversation();
        setShowDeleteModal(false);
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = myUserId ? item.senderId === myUserId : false;
        const isLastMine = isMe && items.length > 0 && items[items.length - 1]?.id === item.id;

        const timeLabel = formatMessageTime(item.createdAt);

        // Check if we need to show date separator
        const showDateSeparator = index === 0 ||
            (index > 0 && isDifferentDate(item.createdAt, items[index - 1].createdAt));

        if (item.imageUrl) {
            // Render image message without bubble
            return (
                <View>
                    {showDateSeparator && (
                        <View style={chatStyles.dateSeparator}>
                            <Text style={chatStyles.dateSeparatorText}>
                                {formatDateSeparator(item.createdAt)}
                            </Text>
                        </View>
                    )}
                    <View style={[chatStyles.messageRow, isMe ? chatStyles.rightAlign : chatStyles.leftAlign]}>
                        <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={{
                                    width: 240,
                                    height: 200,
                                    borderRadius: 12,
                                    marginBottom: 4,
                                }}
                                resizeMode="contain"
                            />
                            {item.body && item.body !== '[Ảnh]' ? (
                                <View style={[
                                    chatStyles.bubble,
                                    isMe ? { ...chatStyles.myBubble, backgroundColor: chatTheme } : chatStyles.shopBubble,
                                    { marginTop: 4 }
                                ]}>
                                    <Text style={[chatStyles.messageText, isMe ? chatStyles.myText : chatStyles.shopText]}>
                                        {item.body}
                                    </Text>
                                </View>
                            ) : null}
                            <Text style={chatStyles.time}>
                                {timeLabel}
                                {isLastMine && shouldShowRead ? ' • Đã đọc' : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }

        // Render text message with bubble
        return (
            <View>
                {showDateSeparator && (
                    <View style={chatStyles.dateSeparator}>
                        <Text style={chatStyles.dateSeparatorText}>
                            {formatDateSeparator(item.createdAt)}
                        </Text>
                    </View>
                )}
                <View style={[chatStyles.messageRow, isMe ? chatStyles.rightAlign : chatStyles.leftAlign]}>
                    <View style={[
                        chatStyles.bubble,
                        isMe ? { ...chatStyles.myBubble, backgroundColor: chatTheme } : chatStyles.shopBubble
                    ]}>
                        <Text style={[chatStyles.messageText, isMe ? chatStyles.myText : chatStyles.shopText]}>
                            {item.body}
                        </Text>
                    </View>
                    <Text style={chatStyles.time}>
                        {timeLabel}
                        {isLastMine && shouldShowRead ? ' • Đã đọc' : ''}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Modals */}
            <ChatOptionsModal
                visible={showOptionsModal}
                onClose={handleOptionsClose}
                onChangeTheme={handleChangeTheme}
                onDeleteChat={handleDeleteChat}
            />

            <ThemeSelectionModal
                visible={showThemeModal}
                onClose={() => setShowThemeModal(false)}
                currentTheme={chatTheme}
                onSelectTheme={handleThemeSelect}
            />

            <DeleteConfirmationModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
            />

            <SafeAreaView style={chatStyles.container}>
                <View style={chatStyles.header}>
                    <View style={chatStyles.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" style={{ marginRight: 4 }} />
                        </TouchableOpacity>
                        <View>
                            <Image
                                source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/images/shop.jpg")}
                                style={chatStyles.avatar}
                            />
                            {isPeerOnline ? <View style={chatStyles.onlineDot} /> : null}
                        </View>
                        <View>
                            <Text style={chatStyles.name}>{peerName}</Text>
                            <Text style={chatStyles.status}>{isPeerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setShowOptionsModal(true)}>
                        <Feather name="more-vertical" color="#FBBC05" size={24} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={listRef}
                    data={items}
                    keyExtractor={(item) => `msg-${item.id}`}
                    renderItem={renderMessage}
                    contentContainerStyle={chatStyles.messagesContainer}
                    extraData={isTyping}
                    inverted={false}
                    onEndReached={loadMoreMessages}
                    onEndReachedThreshold={0.1}
                    ListHeaderComponent={
                        isLoadingMore ? (
                            <View style={{ padding: 16, alignItems: 'center' }}>
                                <Text style={{ color: '#666', fontSize: 14 }}>Đang tải tin nhắn cũ...</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={() => (
                        isTyping ? (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
                                <Text style={{ color: '#666', fontStyle: 'italic', fontSize: 14 }}>
                                    {peerName || 'Người dùng'} đang nhập...
                                </Text>
                            </View>
                        ) : <View style={{ height: 8 }} />
                    )}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={80}
                >
                    <View style={chatStyles.inputRow}>
                        <TouchableOpacity onPress={pickImage}>
                            <FontAwesome6 name="image" solid color={chatTheme} size={24} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Nhập tin nhắn"
                            placeholderTextColor="#999"
                            style={chatStyles.input}
                            value={text}
                            onChangeText={onChangeText}
                            onSubmitEditing={send}
                            returnKeyType="send"
                        />
                        <TouchableOpacity style={[chatStyles.sendButton, { backgroundColor: chatTheme }]} onPress={send}>
                            <FontAwesome5 name="paper-plane" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}