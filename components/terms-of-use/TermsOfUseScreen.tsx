import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from './termsOfUseStyles';

const termsItems = [
  {
    id: 1,
    title: 'Hướng dẫn sử dụng PetZone',
    description: 'Tìm hiểu cách sử dụng ứng dụng một cách hiệu quả',
    content: 'Hướng dẫn chi tiết về cách sử dụng ứng dụng PetZone:\n\n• Đăng ký tài khoản: Sử dụng email hoặc số điện thoại để tạo tài khoản mới\n• Xác thực tài khoản: Kiểm tra email/SMS để xác nhận tài khoản\n• Tìm kiếm sản phẩm: Sử dụng thanh tìm kiếm hoặc duyệt theo danh mục\n• Đặt hàng: Thêm sản phẩm vào giỏ hàng và tiến hành thanh toán\n• Theo dõi đơn hàng: Kiểm tra trạng thái đơn hàng trong mục "Đơn hàng"\n• Chat với người bán: Liên hệ trực tiếp để tư vấn sản phẩm\n• Đánh giá sản phẩm: Chia sẻ trải nghiệm sau khi mua hàng\n\nLiên hệ hỗ trợ nếu bạn gặp khó khăn trong quá trình sử dụng.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'help-outline' as const,
  },
  {
    id: 2,
    title: 'Quy định về tài khoản',
    description: 'Các quy tắc và yêu cầu về tài khoản người dùng',
    content: 'Quy định và trách nhiệm của người dùng:\n\n• Tài khoản phải được đăng ký bằng thông tin chính xác và trung thực\n• Mỗi người chỉ được tạo một tài khoản duy nhất\n• Không được chia sẻ tài khoản cho người khác sử dụng\n• Bảo mật thông tin đăng nhập và thường xuyên đổi mật khẩu\n• Không sử dụng tài khoản cho mục đích bất hợp pháp\n• Tuân thủ các quy tắc cộng đồng khi tương tác\n• Cập nhật thông tin cá nhân khi có thay đổi\n• Thông báo ngay cho PetZone nếu phát hiện tài khoản bị xâm nhập\n\nVi phạm có thể dẫn đến việc khóa tài khoản tạm thời hoặc vĩnh viễn.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'account-circle' as const,
  },
  {
    id: 3,
    title: 'Chính sách mua bán',
    description: 'Điều khoản và điều kiện mua bán trên nền tảng',
    content: 'Điều khoản mua bán trên nền tảng PetZone:\n\n• Sản phẩm phải tuân thủ quy định về thú cưng và phụ kiện\n• Thông tin sản phẩm phải chính xác, đầy đủ và trung thực\n• Giá cả phải minh bạch, không có phí ẩn\n• Người bán chịu trách nhiệm về chất lượng sản phẩm\n• Giao dịch phải được thực hiện trong ứng dụng\n• Không được bán các sản phẩm bị cấm hoặc nguy hiểm\n• Tuân thủ quy định về xuất xứ và giấy tờ thú cưng\n• Hỗ trợ khách hàng trong vòng 48h sau khi nhận hàng\n\nPetZone có quyền can thiệp để bảo vệ quyền lợi của cả hai bên.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'shopping-cart' as const,
  },
  {
    id: 4,
    title: 'Chính sách giao nhận hàng',
    description: 'Quy trình và chính sách về việc giao nhận',
    content: 'Quy trình giao nhận hàng trên PetZone:\n\n• Thời gian giao hàng: 2-7 ngày tùy theo địa điểm\n• Phí vận chuyển được tính theo khoảng cách và trọng lượng\n• Giao hàng tận nơi hoặc tại điểm tập kết gần nhất\n• Kiểm tra sản phẩm kỹ lưỡng trước khi nhận hàng\n• Ký nhận và chụp ảnh xác nhận tình trạng hàng\n• Đối với thú cưng: Có nhân viên chuyên môn hỗ trợ\n• Bảo đảm an toàn và sức khỏe trong quá trình vận chuyển\n• Hoàn tiền 100% nếu hàng bị hư hại do vận chuyển\n\nLiên hệ ngay với chúng tôi nếu có vấn đề trong quá trình giao nhận.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'local-shipping' as const,
  },
  {
    id: 5,
    title: 'Chính sách thanh toán',
    description: 'Các phương thức và quy định thanh toán',
    content: 'Phương thức thanh toán được chấp nhận:\n\n• Ví điện tử: MoMo, ZaloPay, VNPay\n• Chuyển khoản ngân hàng qua QR Code\n• Thẻ tín dụng/ghi nợ các loại\n• Thanh toán khi nhận hàng (COD)\n• Trả góp qua các đối tác tài chính\n• Điểm thưởng tích lũy từ PetZone\n\nQuy định về thanh toán:\n• Thanh toán được mã hóa bảo mật SSL\n• Tiền được giữ trong ví tạm thời cho đến khi nhận hàng\n• Hoàn tiền trong 3-5 ngày làm việc khi hủy đơn\n• Hóa đơn điện tử được gửi qua email sau khi thanh toán\n\nMọi giao dịch đều được bảo mật và có thể tra cứu.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'payment' as const,
  },
  {
    id: 6,
    title: 'Chính sách đổi trả và hoàn tiền',
    description: 'Quy trình đổi trả và chính sách hoàn tiền',
    content: 'Chính sách đổi trả linh hoạt của PetZone:\n\n• Thời hạn đổi trả: 7 ngày kể từ khi nhận hàng\n• Sản phẩm phải trong tình trạng ban đầu, chưa qua sử dụng\n• Giữ nguyên bao bì, nhãn mác và phụ kiện đi kèm\n• Có hóa đơn mua hàng và ảnh chụp sản phẩm lỗi\n• Miễn phí đổi trả nếu lỗi từ nhà sản xuất\n• Khách hàng chịu phí vận chuyển nếu đổi ý\n• Đối với thú cưng: Chỉ đổi trả khi có vấn đề sức khỏe\n• Hoàn tiền 100% trong trường hợp không thể đổi hàng\n\nQuy trình đơn giản: Tạo yêu cầu → Xác nhận → Gửi hàng → Hoàn tiền.',
    icon: require('../../assets/images/icon.png'),
    iconName: 'refresh' as const,
  },
];

export default function TermsOfUseScreen() {
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
            <MaterialIcons name="description" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.mainTitle}>Điều khoản sử dụng</Text>
          <Text style={styles.subtitle}>
            Tìm hiểu các quy định và chính sách của PetZone để có trải nghiệm tốt nhất
          </Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Terms Items */}
        <View style={styles.itemsContainer}>
          {termsItems.map((item) => {
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