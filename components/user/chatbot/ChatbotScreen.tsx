import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartService } from '../../../services/cartService';
import { chatbotService, ChatMessage, Product } from '../../../services/chatbotService';
import { tokenService } from '../../../services/tokenService';
import { chatbotStyles } from './chatbotStyles';

// Import avatar images
const botAvatarImage = require('../../../assets/images/shop.jpg');
const userAvatarImage = require('../../../assets/images/user.jpg');

// Quick reply suggestions
const QUICK_REPLIES = [
    { text: 'Tôi cần thức ăn cho chó', query: 'thức ăn cho chó' },
    { text: 'Sản phẩm bán chạy nhất', query: 'sản phẩm bán chạy' },
    { text: 'Sản phẩm giá rẻ', query: 'sản phẩm giá rẻ' },
    { text: 'Sản phẩm mới nhất', query: 'sản phẩm mới' },
];

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Load lịch sử chat từ database khi mở chatbot
        const loadChatHistory = async () => {
            try {
                setIsLoadingHistory(true);
                const token = await tokenService.getToken();
                if (!token) {
                    console.log('[Chatbot Screen] No token, showing welcome message only');
                    setMessages([{
                        role: 'assistant',
                        content: 'Xin chào! Tôi là trợ lý bán hàng của PetZone. Tôi có thể giúp bạn tìm sản phẩm phù hợp cho thú cưng của bạn. Bạn cần tìm gì hôm nay?',
                        timestamp: new Date().toISOString()
                    }]);
                    setIsLoadingHistory(false);
                    return;
                }

                console.log('[Chatbot Screen] Loading chat history...');
                const history = await chatbotService.getHistory(token);
                console.log('[Chatbot Screen] Loaded history:', history.length, 'messages');

                if (history.length > 0) {
                    // Có lịch sử, hiển thị lịch sử
                    setMessages(history);
                } else {
                    // Không có lịch sử, hiển thị message chào mừng
                    setMessages([{
                        role: 'assistant',
                        content: 'Xin chào! Tôi là trợ lý bán hàng của PetZone. Tôi có thể giúp bạn tìm sản phẩm phù hợp cho thú cưng của bạn. Bạn cần tìm gì hôm nay?',
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (error: any) {
                console.error('[Chatbot Screen] Error loading chat history:', error);
                // Nếu có lỗi, vẫn hiển thị message chào mừng
                setMessages([{
                    role: 'assistant',
                    content: 'Xin chào! Tôi là trợ lý bán hàng của PetZone. Tôi có thể giúp bạn tìm sản phẩm phù hợp cho thú cưng của bạn. Bạn cần tìm gì hôm nay?',
                    timestamp: new Date().toISOString()
                }]);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadChatHistory();
    }, []);

    useEffect(() => {
        // Scroll to bottom when new message arrives or history is loaded
        if (messages.length > 0 && !isLoadingHistory) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 200);
        }
    }, [messages, isLoadingHistory]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date().toISOString()
        };

        // Thêm user message vào UI ngay lập tức
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        setSuggestedProducts([]);

        try {
            const token = await tokenService.getToken();
            if (!token) {
                console.error('[Chatbot Screen] No token found');
                router.replace('/login');
                return;
            }

            console.log('[Chatbot Screen] Calling chatbot service...');
            console.log('[Chatbot Screen] User message:', userMessage.content);
            console.log('[Chatbot Screen] Messages history count:', messages.length);

            // Gọi API chatbot
            const response = await chatbotService.chat(
                userMessage.content,
                messages.map(m => ({ role: m.role, content: m.content })),
                token
            );

            console.log('[Chatbot Screen] Received response');
            console.log('[Chatbot Screen] Bot message:', response.message);
            console.log('[Chatbot Screen] Products count:', response.products?.length || 0);
            console.log('[Chatbot Screen] Products:', response.products);

            // Thêm bot response
            const botMessage: ChatMessage = {
                role: 'assistant',
                content: response.message,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestedProducts(response.products || []);
        } catch (error: any) {
            console.error('[Chatbot Screen] Error chatting with bot:', error);
            console.error('[Chatbot Screen] Error message:', error.message);
            console.error('[Chatbot Screen] Error stack:', error.stack);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. ${error.message || 'Vui lòng thử lại sau.'}`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductPress = (product: Product) => {
        router.push(`/product?productId=${product.id}`);
    };

    const handleAddToCart = async (product: Product, event?: any) => {
        if (event) {
            event.stopPropagation(); // Ngăn trigger onPress của card
        }

        if (addingToCart === product.id) return;

        try {
            setAddingToCart(product.id);
            const token = await tokenService.getToken();

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => router.replace('/login') }
                ]);
                return;
            }

            await cartService.addToCart(token, Number(product.id), 1);
            Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error: any) {
            console.error('[Chatbot Screen] Error adding to cart:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setAddingToCart(null);
        }
    };

    const handleBuyNow = (product: Product, event?: any) => {
        if (event) {
            event.stopPropagation(); // Ngăn trigger onPress của card
        }

        router.push({
            pathname: '/payment',
            params: {
                productId: product.id,
                quantity: '1',
                type: 'buy_now',
            },
        });
    };

    const handleQuickReply = (query: string) => {
        setInputText(query);
    };

    const handleDeleteHistory = async () => {
        try {
            const token = await tokenService.getToken();
            if (!token) {
                console.error('[Chatbot Screen] No token found');
                return;
            }

            // Xóa lịch sử từ database
            await chatbotService.deleteHistory(token);
            console.log('[Chatbot Screen] History deleted successfully');

            // Reset messages về message chào mừng
            setMessages([{
                role: 'assistant',
                content: 'Xin chào! Tôi là trợ lý bán hàng của PetZone. Tôi có thể giúp bạn tìm sản phẩm phù hợp cho thú cưng của bạn. Bạn cần tìm gì hôm nay?',
                timestamp: new Date().toISOString()
            }]);
            setSuggestedProducts([]);
        } catch (error: any) {
            console.error('[Chatbot Screen] Error deleting history:', error);
            // Có thể hiển thị alert hoặc toast notification ở đây
        }
    };

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isUser = item.role === 'user';
        const showAvatar = index === 0 || messages[index - 1]?.role !== item.role;

        return (
            <View style={[
                chatbotStyles.messageContainer,
                isUser ? chatbotStyles.userMessageContainer : chatbotStyles.botMessageContainer
            ]}>
                {!isUser && showAvatar && (
                    <Image
                        source={botAvatarImage}
                        style={chatbotStyles.botAvatar}
                        resizeMode="cover"
                    />
                )}
                <View style={[
                    chatbotStyles.messageBubble,
                    isUser ? chatbotStyles.userMessageBubble : chatbotStyles.botMessageBubble
                ]}>
                    <Text style={[
                        chatbotStyles.messageText,
                        isUser ? chatbotStyles.userMessageText : chatbotStyles.botMessageText
                    ]}>
                        {item.content}
                    </Text>
                </View>
                {isUser && showAvatar && (
                    <Image
                        source={userAvatarImage}
                        style={chatbotStyles.userAvatar}
                        resizeMode="cover"
                    />
                )}
            </View>
        );
    };

    const renderProduct = (product: Product) => (
        <TouchableOpacity
            key={product.id}
            style={chatbotStyles.productCard}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.7}
        >
            {product.imageUrl && (
                <Image
                    source={{ uri: product.imageUrl }}
                    style={chatbotStyles.productImage}
                />
            )}
            <View style={chatbotStyles.productInfo}>
                <Text style={chatbotStyles.productTitle} numberOfLines={2}>
                    {product.title}
                </Text>
                {product.category && (
                    <Text style={chatbotStyles.productCategory}>{product.category}</Text>
                )}
                <Text style={chatbotStyles.productPrice}>
                    {product.price?.toLocaleString('vi-VN')}đ
                </Text>

                {/* Quick Actions */}
                <View style={chatbotStyles.productActions}>
                    <TouchableOpacity
                        style={[chatbotStyles.actionButton, chatbotStyles.addToCartButton]}
                        onPress={(e) => handleAddToCart(product, e)}
                        disabled={addingToCart === product.id}
                        activeOpacity={0.7}
                    >
                        {addingToCart === product.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <MaterialIcons name="add-shopping-cart" size={16} color="#FFF" />
                                <Text style={chatbotStyles.actionButtonText}>Thêm</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[chatbotStyles.actionButton, chatbotStyles.buyNowButton]}
                        onPress={(e) => handleBuyNow(product, e)}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="flash-on" size={16} color="#FFF" />
                        <Text style={chatbotStyles.actionButtonText}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={chatbotStyles.container}>
            {/* Header */}
            <View style={chatbotStyles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={chatbotStyles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                </TouchableOpacity>
                <View style={chatbotStyles.headerInfo}>
                    <Image
                        source={botAvatarImage}
                        style={chatbotStyles.headerAvatar}
                        resizeMode="cover"
                    />
                    <View style={chatbotStyles.headerTextContainer}>
                        <Text style={chatbotStyles.headerTitle}>Trợ lý PetZone</Text>
                        <Text style={chatbotStyles.headerSubtitle}>Đang hoạt động</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleDeleteHistory}
                    style={chatbotStyles.deleteButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete-outline" size={24} color="#FF4444" />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <KeyboardAvoidingView
                style={chatbotStyles.messagesContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {isLoadingHistory ? (
                    <View style={chatbotStyles.loadingHistoryContainer}>
                        <ActivityIndicator size="large" color="#FBBC05" />
                        <Text style={chatbotStyles.loadingHistoryText}>Đang tải lịch sử chat...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item, index) => `message-${index}-${item.timestamp || index}`}
                        contentContainerStyle={chatbotStyles.messagesList}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Suggested Products */}
                {suggestedProducts.length > 0 && (
                    <View style={chatbotStyles.productsSection}>
                        <Text style={chatbotStyles.productsSectionTitle}>Sản phẩm gợi ý</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {suggestedProducts.map(renderProduct)}
                        </ScrollView>
                    </View>
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={chatbotStyles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FBBC05" />
                        <Text style={chatbotStyles.loadingText}>Đang suy nghĩ...</Text>
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* Quick Reply Buttons */}
            {messages.length <= 1 && !isLoading && (
                <View style={chatbotStyles.quickRepliesContainer}>
                    <Text style={chatbotStyles.quickRepliesTitle}>Câu hỏi nhanh:</Text>
                    <View style={chatbotStyles.quickRepliesList}>
                        {QUICK_REPLIES.map((reply, index) => (
                            <TouchableOpacity
                                key={index}
                                style={chatbotStyles.quickReplyButton}
                                onPress={() => handleQuickReply(reply.query)}
                                activeOpacity={0.7}
                            >
                                <Text style={chatbotStyles.quickReplyText}>{reply.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Input Area */}
            <View style={chatbotStyles.inputContainer}>
                <TextInput
                    style={chatbotStyles.input}
                    placeholder="Nhập câu hỏi của bạn..."
                    placeholderTextColor="#999"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[
                        chatbotStyles.sendButton,
                        (!inputText.trim() || isLoading) && chatbotStyles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <MaterialIcons name="send" size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
