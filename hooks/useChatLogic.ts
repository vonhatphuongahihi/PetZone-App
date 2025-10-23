import { API_BASE_URL } from '@/services/authService';
import { chatService, Message } from '@/services/chatService';
import { getSocket } from '@/services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList } from 'react-native';

export function useChatLogic(conversationId: number) {
    const router = useRouter();
    const [items, setItems] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const listRef = useRef<FlatList<Message>>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isPeerOnline, setIsPeerOnline] = useState<boolean | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const myUserIdRef = useRef<string | null>(null);
    const hasJoinedRef = useRef<boolean>(false); // Prevent multiple joins
    const [lastReadAt] = useState<string | null>(null);
    const [peerName, setPeerName] = useState<string>('');
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
                console.log('Joining conversation for the first time:', conversationId);
                // Reset presence state when joining conversation
                setIsPeerOnline(false);
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
                if (m.conversationId !== conversationId || !mounted) return;
                setItems(prev => {
                    const exists = prev.some(x => x.id === m.id);
                    if (!exists) {
                        setTimeout(() => {
                            listRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                        
                        // Auto mark as read if message is from peer (not from current user)
                        if (String(m.senderId) !== String(myUserIdRef.current)) {
                            setTimeout(async () => {
                                const socket = await getSocket();
                                socket.emit('mark_read', conversationId);
                            }, 500); // Small delay to ensure user sees the message
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
            
            socket.on('presence:online', (data: { userId: number }) => {
                if (String(data.userId) !== myUserIdRef.current) {
                    setIsPeerOnline(true);
                }
            });
            socket.on('presence:offline', (data: { userId: number }) => {
                if (String(data.userId) !== myUserIdRef.current) {
                    setIsPeerOnline(false);
                }
            });
            
            // Listen for peer joining/leaving the conversation
            socket.on('peer_joined_conversation', (data: { userId: number }) => {
                if (String(data.userId) !== myUserIdRef.current) {
                    setIsPeerOnline(true);
                }
            });
            socket.on('peer_left_conversation', (data: { userId: number }) => {
                if (String(data.userId) !== myUserIdRef.current) {
                    setIsPeerOnline(false);
                }
            });
            
        socket.on('message:read', (data) => {
            if (!myUserIdRef.current) return;
            
            if (data.userId !== myUserIdRef.current) {
                setLastMessageReadStatus(true);
            }
        });            socket.on('theme:updated', (payload: { conversationId: number; theme: string }) => {
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
                setIsPeerOnline(false); // Reset presence state when leaving
                socket.emit('leave_conversation', conversationId);
                socket.off('message:new');
                socket.off('connect');
                socket.off('typing');
                socket.off('stop_typing');
                socket.off('message:read');
                socket.off('theme:updated');
                socket.off('presence:online');
                socket.off('presence:offline');
                socket.off('peer_joined_conversation');
                socket.off('peer_left_conversation');
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

    // Load conversation data
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
        myUserId,
        lastReadAt,
        peerName,
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