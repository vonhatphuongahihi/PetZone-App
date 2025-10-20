import { API_BASE_URL } from '@/services/authService';
import { getSocket } from '@/services/socket';
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatStyles } from './chatStyles';

type Msg = { id: number; conversationId: number; senderId: string; body: string; createdAt: string; readAt?: string | null; temp?: boolean };

export default function ChatScreen() {
    const router = useRouter();
    const { chatId } = useLocalSearchParams<{ chatId: string }>();
    const conversationId = Number(chatId);
    const [items, setItems] = useState<Msg[]>([]);
    const [text, setText] = useState('');
    const listRef = useRef<FlatList<Msg>>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isPeerOnline, setIsPeerOnline] = useState<boolean | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const [lastReadAt, setLastReadAt] = useState<string | null>(null);
    const [peerName, setPeerName] = useState<string>('');

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
                        setMyUserId(me.user?.id || null);
                    }
                }
            } catch { }

            const socket = await getSocket();
            // rejoin khi reconnect
            socket.on('connect', () => {
                socket.emit('join_conversation', conversationId);
                socket.emit('mark_read', conversationId);
            });
            socket.emit('join_conversation', conversationId);
            socket.emit('mark_read', conversationId);
            socket.on('message:new', (m: Msg) => {
                if (m.conversationId !== conversationId || !mounted) return;
                setItems(prev => {
                    if (myUserId && m.senderId === myUserId) {
                        const idx = [...prev].reverse().findIndex(x => x.temp && x.body === m.body);
                        if (idx !== -1) {
                            const realIdx = prev.length - 1 - idx;
                            const next = prev.slice();
                            next[realIdx] = { ...m, temp: false };
                            return next;
                        }
                    }
                    return [...prev, m];
                });
            });
            socket.on('typing', () => setIsTyping(true));
            socket.on('stop_typing', () => setIsTyping(false));
            socket.on('presence:online', () => setIsPeerOnline(true));
            socket.on('presence:offline', () => setIsPeerOnline(false));
            socket.on('message:read', (payload: { conversationId: number; userId: string; readAt: string }) => {
                if (payload.conversationId !== conversationId) return;
                if (payload.userId !== myUserId) {
                    setLastReadAt(payload.readAt);
                }
                setItems(prev => prev.map(m => ({ ...m, readAt: m.readAt ?? (payload.userId !== myUserId ? payload.readAt : m.readAt) })));
            });

            const token = await AsyncStorage.getItem('jwt_token');
            // Load peer name from conversations
            try {
                const convs = await axios.get(`${API_BASE_URL}/chat/conversations`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                const conv = Array.isArray(convs.data) ? convs.data.find((c: any) => c.id === conversationId) : null;
                if (conv && myUserId) {
                    const other = (conv.participants || []).find((p: any) => p.userId !== myUserId);
                    const name = other?.user?.username || other?.user?.email || '';
                    if (name) setPeerName(name);
                }
            } catch { }

            const res = await axios.get(`${API_BASE_URL}/chat/messages/${conversationId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            });
            if (mounted) setItems(res.data.items);

            return () => {
                mounted = false;
                socket.emit('leave_conversation', conversationId);
                socket.off('message:new');
                socket.off('connect');
                socket.off('typing');
                socket.off('stop_typing');
                socket.off('message:read');
                socket.off('presence:online');
                socket.off('presence:offline');
            };
        })();
    }, [conversationId]);

    const send = async () => {
        const body = text.trim();
        if (!body) return;
        const socket = await getSocket();
        socket.emit('send_message', { conversationId, body });
        setText('');
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

    const renderMessage = ({ item }: { item: Msg }) => {
        const isMe = myUserId ? item.senderId === myUserId : false;
        const isLastMine = isMe && items.length > 0 && items[items.length - 1]?.id === item.id;
        const timeLabel = new Date(item.createdAt).toLocaleTimeString();
        return (
            <View style={[chatStyles.messageRow, isMe ? chatStyles.rightAlign : chatStyles.leftAlign]}>
                <View style={[chatStyles.bubble, isMe ? chatStyles.myBubble : chatStyles.shopBubble]}>
                    <Text style={[chatStyles.messageText, isMe ? chatStyles.myText : chatStyles.shopText]}>{item.body}</Text>
                </View>
                <Text style={chatStyles.time}>
                    {timeLabel}
                    {isLastMine && lastReadAt ? ' • Đã đọc' : ''}
                </Text>
            </View>
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={chatStyles.container}>
                <View style={chatStyles.header}>
                    <View style={chatStyles.headerLeft}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" style={{ marginRight: 4 }} />
                        </TouchableOpacity>
                        <View>
                            <Image source={require("../../../assets/images/shop.png")} style={chatStyles.avatar} />
                            {isPeerOnline ? <View style={chatStyles.onlineDot} /> : null}
                        </View>
                        <View>
                            <Text style={chatStyles.name}>{peerName}</Text>
                            <Text style={chatStyles.status}>{isTyping ? 'Đang nhập…' : (isPeerOnline ? 'Đang hoạt động' : 'Ngoại tuyến')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Feather name="more-vertical" color="#FBBC05" size={24} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={listRef}
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderMessage}
                    contentContainerStyle={chatStyles.messagesContainer}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={80}
                >
                    <View style={chatStyles.inputRow}>
                        <TextInput
                            placeholder="Nhập tin nhắn"
                            placeholderTextColor="#999"
                            style={chatStyles.input}
                            value={text}
                            onChangeText={onChangeText}
                            onSubmitEditing={send}
                            returnKeyType="send"
                        />
                        <TouchableOpacity style={chatStyles.sendButton} onPress={send}>
                            <FontAwesome5 name="paper-plane" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
