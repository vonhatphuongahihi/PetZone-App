import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const aboutItems = [
    {
        id: 1,
        title: 'Giới thiệu về PetZone',
        description: 'Tìm hiểu về ứng dụng hàng đầu dành cho người yêu thú cưng',
        content: 'PetZone là ứng dụng hàng đầu dành cho những người yêu thú cưng tại Việt Nam. Chúng tôi cung cấp một nền tảng toàn diện để mua sắm, chăm sóc và kết nối cộng đồng yêu thương động vật.\n\n• Hơn 10,000 sản phẩm chất lượng cho thú cưng\n• Kết nối với hàng nghìn người yêu động vật\n• Dịch vụ tư vấn chuyên nghiệp 24/7\n• Giao hàng nhanh chóng trên toàn quốc\n• Cộng đồng chia sẻ kinh nghiệm chăm sóc\n\nChúng tôi tin rằng mỗi thú cưng đều xứng đáng được yêu thương và chăm sóc tốt nhất.',
        iconName: 'pets' as const,
    },
    {
        id: 2,
        title: 'Sứ mệnh của chúng tôi',
        description: 'Mang đến trải nghiệm tốt nhất cho thú cưng và chủ nuôi',
        content: 'Sứ mệnh của PetZone là tạo ra một thế giới tốt đẹp hơn cho các loài động vật đồng hành cùng con người.\n\n• Cung cấp sản phẩm chất lượng cao với giá cả hợp lý\n• Xây dựng cộng đồng yêu thương và chia sẻ\n• Giáo dục về cách chăm sóc thú cưng đúng cách\n• Hỗ trợ các tổ chức bảo vệ động vật\n• Phát triển bền vững và thân thiện với môi trường\n• Tạo việc làm và cơ hội kinh doanh cho cộng đồng\n\nMỗi ngày, chúng tôi nỗ lực để biến sứ mệnh này thành hiện thực.',
        iconName: 'favorite' as const,
    },
    {
        id: 3,
        title: 'Tầm nhìn phát triển',
        description: 'Trở thành nền tảng hàng đầu Việt Nam về chăm sóc thú cưng',
        content: 'Tầm nhìn của PetZone là trở thành nền tảng hàng đầu Đông Nam Á trong lĩnh vực chăm sóc và phúc lợi thú cưng.\n\n• Mở rộng ra các quốc gia trong khu vực\n• Phát triển công nghệ AI để tư vấn chăm sóc\n• Xây dựng mạng lưới bác sĩ thú y trực tuyến\n• Tạo ra các sản phẩm độc quyền cho thú cưng\n• Hợp tác với các tổ chức quốc tế về động vật\n• Đầu tư vào nghiên cứu và phát triển\n\nChúng tôi hướng tới một tương lai nơi mọi thú cưng đều được chăm sóc tốt nhất.',
        iconName: 'visibility' as const,
    },
    {
        id: 4,
        title: 'Tính năng nổi bật',
        description: 'Những tính năng độc đáo giúp chăm sóc thú cưng dễ dàng hơn',
        content: 'PetZone cung cấp nhiều tính năng tiện ích để chăm sóc thú cưng một cách toàn diện:\n\n• Mua sắm thông minh: AI gợi ý sản phẩm phù hợp\n• Lịch chăm sóc: Nhắc nhở tiêm chủng, tắm rửa\n• Cộng đồng: Chia sẻ ảnh, video và kinh nghiệm\n• Tư vấn trực tuyến: Chat với bác sĩ thú y 24/7\n• Theo dõi sức khỏe: Ghi chép chỉ số và triệu chứng\n• Giao hàng express: Nhận hàng trong 2-4 giờ\n• Ví PetZone: Thanh toán nhanh chóng, an toàn\n\nTất cả trong một ứng dụng duy nhất!',
        iconName: 'star' as const,
    },
    {
        id: 5,
        title: 'Liên hệ & Hỗ trợ',
        description: 'Thông tin liên hệ và các kênh hỗ trợ khách hàng',
        content: 'Đội ngũ PetZone luôn sẵn sàng hỗ trợ bạn:\n\n📧 Email: support@petzone.vn\n📞 Hotline: 1900 1234 (24/7)\n🏢 Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM\n💬 Chat trực tuyến: Có sẵn trong ứng dụng\n📱 Zalo: @petzonevietnam\n📘 Facebook: PetZone Vietnam\n🐦 Twitter: @petzonevn\n\nThời gian hỗ trợ:\n• Chat & Email: 24/7\n• Hotline: 24/7\n• Văn phòng: 8:00 - 18:00 (T2-T6)\n\nChúng tôi cam kết phản hồi trong vòng 30 phút!',
        iconName: 'contact-support' as const,
    },
];

export default function AboutUsScreen() {
    const [pressedItem, setPressedItem] = useState<number | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const handleGoBack = () => {
        router.replace('/profile');
    };

    const handleItemPress = (id: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handlePressIn = (id: number) => {
        setPressedItem(id);
    };

    const handlePressOut = () => {
        setPressedItem(null);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Về chúng tôi',
                    headerShown: false
                }}
            />
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleGoBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Về chúng tôi</Text>
                </View>

                {/* Background Design */}
                <View style={styles.backgroundContainer}>
                    <View style={styles.gradientBackground} />
                    <View style={styles.backgroundCircle1} />
                    <View style={styles.backgroundCircle2} />
                    <View style={styles.backgroundCircle3} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.heroIcon}>
                            <MaterialIcons name="pets" size={30} color="#FFFFFF" />
                        </View>
                        <Text style={styles.mainTitle}>Về chúng tôi</Text>
                        <Text style={styles.subtitle}>
                            Kết nối yêu thương - Chăm sóc thú cưng. Tìm hiểu về PetZone và sứ mệnh của chúng tôi.
                        </Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {/* About Items */}
                    <View style={styles.itemsContainer}>
                        {aboutItems.map((item) => {
                            const isExpanded = expandedItems.has(item.id);
                            return (
                                <View key={item.id} style={styles.termItem}>
                                    <TouchableOpacity
                                        style={[
                                            pressedItem === item.id && styles.pressableEffect
                                        ]}
                                        onPress={() => handleItemPress(item.id)}
                                        onPressIn={() => handlePressIn(item.id)}
                                        onPressOut={handlePressOut}
                                        activeOpacity={1}
                                    >
                                        <View style={styles.itemContent}>
                                            <View style={styles.iconContainer}>
                                                <MaterialIcons name={item.iconName} size={24} color="#FBBC05" />
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.itemTitle}>{item.title}</Text>
                                                <Text style={styles.itemDescription}>{item.description}</Text>
                                            </View>
                                            <View style={styles.chevronContainer}>
                                                <MaterialIcons
                                                    name={isExpanded ? "expand-less" : "expand-more"}
                                                    size={24}
                                                    color="#FBBC05"
                                                />
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.expandedContent}>
                                            <Text style={styles.contentText}>{item.content}</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#000',
        flex: 1,
    },
    backgroundContainer: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: '100%' as const,
        zIndex: 1,
    },
    gradientBackground: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: '#FBBC05',
        opacity: 0.1,
    },
    backgroundCircle1: {
        position: 'absolute' as const,
        top: -80,
        right: -120,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FBBC05',
        opacity: 0.05,
    },
    backgroundCircle2: {
        position: 'absolute' as const,
        top: 100,
        left: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#4F46E5',
        opacity: 0.03,
    },
    backgroundCircle3: {
        position: 'absolute' as const,
        bottom: -50,
        right: -80,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#10B981',
        opacity: 0.04,
    },
    scrollView: {
        flex: 1,
        zIndex: 5,
    },
    heroSection: {
        alignItems: 'flex-start' as const,
        paddingHorizontal: 20,
        paddingVertical: 30,
        marginBottom: 10,
    },
    heroIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FBBC05',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: 16,
        shadowColor: '#FBBC05',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: '#1F2937',
        textAlign: 'left' as const,
        marginBottom: 8,
        alignSelf: 'flex-start' as const,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'left' as const,
        lineHeight: 22,
        alignSelf: 'flex-start' as const,
    },
    titleUnderline: {
        width: 80,
        height: 4,
        backgroundColor: '#FBBC05',
        borderRadius: 2,
        marginTop: 12,
        alignSelf: 'flex-start' as const,
    },
    itemsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    termItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden' as const,
    },
    itemContent: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#FBBC05',
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
        alignItems: 'flex-start' as const,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#1F2937',
        lineHeight: 24,
        marginBottom: 4,
        textAlign: 'left' as const,
    },
    itemDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        textAlign: 'left' as const,
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    pressableEffect: {
        transform: [{ scale: 0.98 }],
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    contentText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#374151',
        textAlign: 'left' as const,
    },
};