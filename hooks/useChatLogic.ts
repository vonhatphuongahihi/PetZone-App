import { chatService, Message } from '@/services/chatService';
import { getSocket } from '@/services/socket';
import { SocketEventEmitter } from '@/services/socketEventEmitter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { API_BASE_URL } from '../config/api';

export function useChatLogic(conversationId: number) {
    const router = useRouter();
    const [items, setItems] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const listRef = useRef<FlatList<Message>>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isPeerOnline, setIsPeerOnline] = useState<boolean>(false);
    const [onlineStatusLoaded, setOnlineStatusLoaded] = useState<boolean>(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const myUserIdRef = useRef<string | null>(null);
    const hasJoinedRef = useRef<boolean>(false); // Prevent multiple joins
    const [lastReadAt] = useState<string | null>(null);
    const [peerName, setPeerName] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [chatTheme, setChatTheme] = useState('#0ED3AF');
    const [lastMessageReadStatus, setLastMessageReadStatus] = useState<boolean>(false);

    // Socket setup and message loading
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await AsyncStorage.getItem('jwt_token');
                if (token) {
                    const resMe = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (resMe.ok) {
                        const me = await resMe.json();
                        const userId = me.user?.id || null;
                        setMyUserId(userId);
                        myUserIdRef.current = userId;
                    }
                }
            } catch { }

            const socket = await getSocket();

            // Prevent multiple joins for the same conversation
            const joinConversation = () => {
                if (hasJoinedRef.current) return;
                hasJoinedRef.current = true;
                socket.emit('join_conversation', conversationId);

                // Auto mark as read when joining conversation
                setTimeout(() => {
                    socket.emit('mark_read', conversationId);
                }, 1000); // Delay to ensure conversation is fully loaded
            };

            // Join conversation immediately if socket is already connected
            if (socket.connected) {
                joinConversation();
            }

            // Socket event handlers
            socket.on('connect', () => {
                console.log('Socket connected');
                joinConversation();
            });

            socket.on('message:new', (m: Message) => {
                if (m.conversationId !== conversationId || !mounted) {
                    return;
                }
                setItems(prev => {
                    const exists = prev.some(x => x.id === m.id);
                    if (!exists) {
                        setTimeout(() => {
                            listRef.current?.scrollToEnd({ animated: true });
                        }, 100);

                        if (String(m.senderId) !== String(myUserIdRef.current)) {
                            setTimeout(async () => {
                                const socket = await getSocket();
                                socket.emit('mark_read', conversationId);
                            }, 500);
                        }

                        return [...prev, m];
                    }
                    return prev;
                });
            });

            socket.on('typing', (data: { userId: string }) => {
                if (data.userId !== String(myUserIdRef.current)) {
                    setIsTyping(true);
                    setTimeout(() => {
                        listRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                }
            });

            socket.on('stop_typing', (data: { userId: string }) => {
                if (data.userId !== String(myUserIdRef.current)) {
                    setIsTyping(false);
                }
            });

            // Listen for global online/offline events to update status
            const handleUserOnline = (data: { userId: string }) => {
                const { userId } = data;
                if (userId !== myUserIdRef.current) {
                    setIsPeerOnline(true);
                    // Mark as loaded when we receive real-time events
                    if (!onlineStatusLoaded) {
                        setOnlineStatusLoaded(true);
                    }
                }
            };

            const handleUserOffline = (data: { userId: string }) => {
                const { userId } = data;
                if (userId !== myUserIdRef.current) {
                    setIsPeerOnline(false);
                }
            };

            SocketEventEmitter.addListener('user_online', handleUserOnline);
            SocketEventEmitter.addListener('user_offline', handleUserOffline);

            socket.on('message:read', (data) => {
                if (!myUserIdRef.current) return;

                if (data.userId !== myUserIdRef.current) {
                    setLastMessageReadStatus(true);
                }
            }); socket.on('theme:updated', (payload: { conversationId: number; theme: string }) => {
                if (payload.conversationId !== conversationId) return;
                setChatTheme(payload.theme);
            });

            // Load messages
            try {
                const token = await AsyncStorage.getItem('jwt_token');
                const messages = await chatService.getMessages(conversationId, token || '');
                if (mounted) {
                    setItems(messages.items);
                    setHasMoreMessages(messages.nextCursor !== null);
                    setTimeout(() => {
                        listRef.current?.scrollToEnd({ animated: false });
                    }, 300);
                }
            } catch (error) {
                console.error('Load messages error:', error);
            }

            return () => {
                mounted = false;
                hasJoinedRef.current = false; // Reset join flag
                socket.emit('leave_conversation', conversationId);
                socket.off('message:new');
                socket.off('connect');
                socket.off('typing');
                socket.off('stop_typing');
                socket.off('message:read');
                socket.off('theme:updated');

                // Remove global online/offline listeners
                SocketEventEmitter.removeAllListeners('user_online');
                SocketEventEmitter.removeAllListeners('user_offline');
            };
        })();
    }, [conversationId]);

    // Handle screen focus/blur for proper presence management
    useFocusEffect(
        useCallback(() => {
            // Screen is focused - user is in chat
            return () => {
                // Screen is blurred - user left chat
                const handleLeave = async () => {
                    const socket = await getSocket();
                    socket.emit('leave_conversation', conversationId);
                };
                handleLeave();
            };
        }, [conversationId])
    );

    // Load conversation data and check peer online status
    useEffect(() => {
        if (!myUserId || !conversationId) return;

        const loadConversationData = async () => {
            try {
                const token = await AsyncStorage.getItem('jwt_token');
                const conv = await chatService.getConversationDetail(conversationId, token || '');

                if (conv.theme) {
                    setChatTheme(conv.theme);
                }

                const other = (conv.participants || []).find((p: any) => p.userId !== myUserId);
                const name = other?.user?.username || other?.user?.email || '';
                if (name) setPeerName(name);

                if (other?.user?.avatarUrl) {
                    setAvatarUrl(other.user.avatarUrl);
                } else {
                    setAvatarUrl('');
                }

                // Check if peer is online from API
                if (other?.userId) {
                    try {
                        const token = await AsyncStorage.getItem('jwt_token');
                        if (token) {
                            const response = await fetch(`${API_BASE_URL}/chat/online-users`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (response.ok) {
                                const data = await response.json();
                                const onlineUsers = data.onlineUsers || [];
                                const isOnline = onlineUsers.includes(other.userId);
                                setIsPeerOnline(isOnline);
                                setOnlineStatusLoaded(true); // Mark as loaded
                                console.log('🔌 [useChatLogic] Initial peer online status:', isOnline, 'for user:', other.userId);
                            }
                        }
                    } catch (error) {
                        console.error('🔌 [useChatLogic] Error checking initial online status:', error);
                        // Mark as loaded even on error to avoid stuck state
                        setOnlineStatusLoaded(true);
                    }
                }
            } catch (error) {
                console.error('Load conversation data error:', error);
            }
        };

        loadConversationData();
    }, [myUserId, conversationId]);

    const loadMoreMessages = async () => {
        if (isLoadingMore || !hasMoreMessages || items.length === 0) return;

        setIsLoadingMore(true);
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            const oldestMessage = items[0];
            const messages = await chatService.getMessages(
                conversationId,
                token || '',
                oldestMessage.id
            );

            if (messages.items && messages.items.length > 0) {
                setItems(prev => [...messages.items, ...prev]);
                setHasMoreMessages(messages.nextCursor !== null);
            } else {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Load more messages error:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const send = async () => {
        const body = text.trim();
        if (!body || !myUserId) return;

        setText('');
        // Reset read status when sending new message
        setLastMessageReadStatus(false);
        const socket = await getSocket();
        socket.emit('send_message', { conversationId, body });
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để gửi ảnh.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await uploadAndSendImage(asset.uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    const uploadAndSendImage = async (imageUri: string) => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token || !myUserId) return;

            const data = await chatService.uploadImageAndSendMessage(imageUri, conversationId, token);

            const socket = await getSocket();
            socket.emit('send_message', {
                conversationId,
                body: '[Ảnh]',
                imageUrl: data.imageUrl
            });
        } catch (error) {
            console.error('Upload image error:', error);
            Alert.alert('Lỗi', `Không thể gửi ảnh: ${error}`);
        }
    };

    const onChangeText = async (val: string) => {
        setText(val);
        const socket = await getSocket();
        socket.emit('typing', conversationId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(async () => {
            const s = await getSocket();
            s.emit('stop_typing', conversationId);
        }, 800);
    };

    const updateTheme = async (theme: string) => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            await chatService.updateConversationTheme(conversationId, theme, token || '');

            setChatTheme(theme);

            const socket = await getSocket();
            socket.emit('theme_updated', {
                conversationId,
                theme
            });
        } catch (error) {
            console.error('Update theme error:', error);
            Alert.alert('Lỗi', 'Không thể thay đổi màu chat');
        }
    };

    const deleteConversation = async () => {
        try {
            const token = await AsyncStorage.getItem('jwt_token');
            await chatService.deleteConversation(conversationId, token || '');
            router.back();
        } catch (error) {
            console.error('Delete conversation error:', error);
            Alert.alert('Lỗi', 'Không thể xóa đoạn chat');
        }
    };

    const markAsRead = async () => {
        try {
            const socket = await getSocket();
            socket.emit('mark_read', conversationId);
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    return {
        // State
        items,
        text,
        isTyping,
        isPeerOnline,
        onlineStatusLoaded,
        myUserId,
        lastReadAt,
        peerName,
        avatarUrl,
        isLoadingMore,
        hasMoreMessages,
        chatTheme,
        listRef,
        lastMessageReadStatus,

        // Actions
        send,
        pickImage,
        onChangeText,
        loadMoreMessages,
        updateTheme,
        deleteConversation,
        markAsRead,
    };
}