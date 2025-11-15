import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from './privacyPoliciesStyles';

const privacyItems = [
  {
    id: 1,
    title: 'Mục đích thu thập thông tin',
    description: 'Tìm hiểu lý do và cách thức PetZone thu thập dữ liệu',
    content: 'PetZone thu thập thông tin cá nhân của bạn để:\n\n• Tạo và quản lý tài khoản người dùng\n• Xử lý đơn hàng và thanh toán\n• Liên hệ với bạn về các dịch vụ\n• Cải thiện trải nghiệm người dùng\n• Tuân thủ các quy định pháp luật\n\nChúng tôi chỉ thu thập thông tin cần thiết cho việc cung cấp dịch vụ và sẽ thông báo rõ ràng về mục đích sử dụng.',
    icon: require('../../../assets/images/icon.png'),
    iconName: 'info-outline' as const,
  },
  {
    id: 2,
    title: 'Phạm vi sử dụng thông tin',
    description: 'Cách PetZone sử dụng thông tin cá nhân của bạn',
    content: 'Thông tin cá nhân của bạn được sử dụng trong các trường hợp sau:\n\n• Xác thực danh tính và bảo mật tài khoản\n• Xử lý và giao hàng đơn hàng\n• Gửi thông báo về tình trạng đơn hàng\n• Hỗ trợ khách hàng qua chat và email\n• Gửi thông tin khuyến mãi (nếu đồng ý)\n• Phân tích và cải thiện dịch vụ\n• Ngăn chặn gian lận và vi phạm\n\nChúng tôi cam kết không bán, cho thuê hay chia sẻ thông tin cho bên thứ ba không có sự đồng ý của bạn.',
    icon: require('../../../assets/images/icon.png'),
    iconName: 'security' as const,
  },
  {
    id: 3,
    title: 'Quản lý và lưu trữ thông tin',
    description: 'Quy trình quản lý và bảo quản dữ liệu người dùng',
    content: 'Hệ thống quản lý dữ liệu của PetZone:\n\n• Lưu trữ trên máy chủ bảo mật với mã hóa SSL\n• Sao lưu dữ liệu định kỳ để đảm bảo an toàn\n• Kiểm soát truy cập nghiêm ngặt cho nhân viên\n• Thời gian lưu trữ theo quy định pháp luật\n• Quyền yêu cầu xóa dữ liệu cá nhân\n• Thông báo khi có thay đổi chính sách\n• Kiểm tra bảo mật định kỳ\n\nBạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào.',
    icon: require('../../../assets/images/icon.png'),
    iconName: 'storage' as const,
  },
  {
    id: 4,
    title: 'Cam kết bảo mật thông tin',
    description: 'Các biện pháp đảm bảo an toàn thông tin cá nhân',
    content: 'PetZone cam kết bảo vệ thông tin của bạn bằng:\n\n• Mã hóa dữ liệu khi truyền và lưu trữ\n• Xác thực hai yếu tố cho tài khoản quan trọng\n• Giám sát hệ thống 24/7 để phát hiện xâm nhập\n• Đào tạo nhân viên về bảo mật thông tin\n• Tuân thủ các tiêu chuẩn bảo mật quốc tế\n• Báo cáo ngay lập tức nếu có vi phạm bảo mật\n• Cập nhật thường xuyên các biện pháp bảo vệ\n\nTrong trường hợp xảy ra sự cố, chúng tôi sẽ thông báo ngay lập tức và hỗ trợ khắc phục.',
    icon: require('../../../assets/images/icon.png'),
    iconName: 'lock' as const,
  },
];

export default function PrivacyPoliciesScreen() {
  const [pressedItem, setPressedItem] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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
    <SafeAreaView style={styles.container}>
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
            <MaterialIcons name="shield" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.mainTitle}>Chính sách bảo mật</Text>
          <Text style={styles.subtitle}>
            Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn trên PetZone
          </Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Privacy Items */}
        <View style={styles.itemsContainer}>
          {privacyItems.map((item) => {
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
  );
}