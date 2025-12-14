import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { userHomeStyle } from './userHomeStyle';

// ====================== DỮ LIỆU ======================
const categories = [
  { id: '1', title: 'Thức ăn', icon: require('../../../assets/images/food-icon.png') },
  { id: '2', title: 'Đồ chơi', icon: require('../../../assets/images/toy-icon.png') },
  { id: '3', title: 'Quần áo', icon: require('../../../assets/images/clothes-icon.png') },
  { id: '4', title: 'Dụng cụ', icon: require('../../../assets/images/tool-icon.png') },
  { id: '5', title: 'Phụ kiện', icon: require('../../../assets/images/accessory-icon.png') },
];

const products = [
  { id: '1', discount: '-30%', shop: 'phuong-shop', price: '94.679đ', sold: '9.4k' },
  { id: '2', discount: '-18%', shop: 'petzone-store', price: '120.000đ', sold: '5.1k' },
  { id: '3', discount: '-25%', shop: 'happy-pet', price: '79.000đ', sold: '12.3k' },
];

const newProducts = [
  { id: '4', discount: '-10%', shop: 'petworld', price: '150.000đ', sold: '1.2k' },
  { id: '5', discount: '-15%', shop: 'doglover', price: '89.000đ', sold: '3.8k' },
  { id: '6', discount: '-20%', shop: 'meowmart', price: '110.000đ', sold: '2.4k' },
];

const hotPromotions = [
  { id: '7', discount: '-50%', shop: 'phuong-shop', price: '49.000đ', sold: '15.6k' },
  { id: '8', discount: '-45%', shop: 'petzone-store', price: '66.000đ', sold: '10.3k' },
  { id: '9', discount: '-40%', shop: 'happy-pet', price: '70.000đ', sold: '8.7k' },
];

const topStores = [
  { id: '1', name: 'phuong-shop', followers: '4 người theo dõi', sold: '1000 đã bán' },
  { id: '2', name: 'happy-pet', followers: '4 người theo dõi', sold: '1000 đã bán' },
];

// ====================== COMPONENT CON ======================
const CategoryItem = ({ item }: { item: typeof categories[0] }) => (
  <TouchableOpacity style={userHomeStyle.categoryItem}>
    <View style={userHomeStyle.categoryCircle}>
      <Image source={item.icon} style={userHomeStyle.categoryIcon} />
    </View>
    <Text style={userHomeStyle.categoryTitle}>{item.title}</Text>
  </TouchableOpacity>
);

const ProductCard = ({ item }: { item: typeof products[0] }) => (
  <TouchableOpacity style={userHomeStyle.productCard}>
    <Image
      source={require('../../../assets/images/cat1.png')}
      style={userHomeStyle.productImage}
    />
    <View style={userHomeStyle.discountBadge}>
      <Text style={userHomeStyle.discountText}>{item.discount}</Text>
    </View>

    <Text style={userHomeStyle.productTitle} numberOfLines={2}>
      Vòng cổ thú cưng sáng trong bóng tối
    </Text>

    <View style={userHomeStyle.ratingRow}>
      <Text style={userHomeStyle.rating}>★★★★★</Text>
      <Text style={userHomeStyle.sold}>Đã bán {item.sold}</Text>
    </View>

    <Text style={userHomeStyle.price}>{item.price}</Text>
  </TouchableOpacity>
);

const TopStoreCard = ({ item }: { item: typeof topStores[0] }) => {
  const [following, setFollowing] = useState(false);

  return (
    <View style={userHomeStyle.topShopCard}>
      <Image
        source={require('../../../assets/images/banner.png')}
        style={userHomeStyle.topShopCover}
      />

      <View style={userHomeStyle.topShopContent}>
        <Image
          source={require('../../../assets/images/shop.jpg')}
          style={userHomeStyle.topShopAvatar}
        />

        <View style={userHomeStyle.topShopDetails}>
          <Text style={userHomeStyle.topShopName}>{item.name}</Text>

          <View style={userHomeStyle.topShopStats}>
            <Ionicons name="people-outline" size={14} color="#555" />
            <Text style={userHomeStyle.followersText}>{item.followers}</Text>
            <Ionicons name="cart-outline" size={14} color="#555" style={{ marginLeft: 8 }} />
            <Text style={userHomeStyle.followersText}>{item.sold}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            userHomeStyle.followBtnModern,
            following ? userHomeStyle.following : null,
          ]}
          onPress={() => setFollowing(!following)}
        >
          <Text
            style={[
              userHomeStyle.followBtnText,
              following ? userHomeStyle.followingText : null,
            ]}
          >
            {following ? 'Đang theo dõi' : 'Theo dõi'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ====================== MAIN SCREEN ======================
export default function UserHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={userHomeStyle.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={userHomeStyle.header}>
          <View style={userHomeStyle.searchContainer}>
            <View style={userHomeStyle.searchInputWrapper}>
              <TextInput
                placeholder="Bạn tìm gì..."
                placeholderTextColor="#999"
                style={userHomeStyle.searchInput}
              />
            </View>
            <TouchableOpacity style={userHomeStyle.searchButton}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={userHomeStyle.cartButton}>
            <Ionicons name="cart-outline" size={28} color="#FBBC05" />
          </TouchableOpacity>
        </View>

        {/* BANNER – ĐÃ SỬA: DÙNG SELF-CLOSING */}
        <View style={userHomeStyle.banner}>
          <Image
            source={require('../../../assets/images/banner.png')}
            style={userHomeStyle.bannerDog}
          />
        </View>

        {/* CATEGORIES */}
        <FlatList
          data={categories}
          renderItem={({ item }) => <CategoryItem item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={userHomeStyle.categoryList}
        />

        {/* GỢI Ý HÔM NAY */}
        <View style={userHomeStyle.section}>
          <View style={userHomeStyle.sectionHeader}>
            <Text style={userHomeStyle.sectionTitle}>Gợi ý hôm nay</Text>
            <Text style={userHomeStyle.seeAll}>Xem tất cả</Text>
          </View>
          <FlatList
            data={products}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={userHomeStyle.productList}
          />
        </View>

        {/* SẢN PHẨM MỚI */}
        <View style={userHomeStyle.section}>
          <View style={userHomeStyle.sectionHeader}>
            <Text style={userHomeStyle.sectionTitle}>Sản phẩm mới</Text>
            <Text style={userHomeStyle.seeAll}>Xem tất cả</Text>
          </View>
          <FlatList
            data={newProducts}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={userHomeStyle.productList}
          />
        </View>

        {/* KHUYẾN MÃI HOT */}
        <View style={userHomeStyle.section}>
          <View style={userHomeStyle.sectionHeader}>
            <Text style={userHomeStyle.sectionTitle}>Khuyến mãi hot</Text>
            <Text style={userHomeStyle.seeAll}>Xem tất cả</Text>
          </View>
          <FlatList
            data={hotPromotions}
            renderItem={({ item }) => <ProductCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={userHomeStyle.productList}
          />
        </View>

        {/* TOP SHOP */}
        <View style={userHomeStyle.section}>
          <View style={userHomeStyle.sectionHeader}>
            <Text style={userHomeStyle.sectionTitle}>Top Cửa Hàng Bán Chạy</Text>
            <Text style={userHomeStyle.seeAll}>Xem tất cả</Text>
          </View>
          <FlatList
            data={topStores}
            renderItem={({ item }) => <TopStoreCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={userHomeStyle.topShopList}
          />
        </View>

        {/* FOOTER – CHỈ 3 LINK CÓ THẬT */}
        <View style={userHomeStyle.footer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 120, height: 40, resizeMode: 'contain', alignSelf: 'center', marginBottom: 12 }}
          />
          <Text style={userHomeStyle.footerSubtitle}>
            Thiên đường mua sắm dành cho thú cưng
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
            {/* Về PetZone */}
            <View>
              <Text style={[userHomeStyle.footerSectionTitle, { marginBottom: 8 }]}>Về PetZone</Text>
              <TouchableOpacity onPress={() => router.push('/terms-of-use')}>
                <Text style={userHomeStyle.footerLink}>Điều khoản chung</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/privacy-policies')}>
                <Text style={userHomeStyle.footerLink}>Chính sách bảo mật</Text>
              </TouchableOpacity>
            </View>

            {/* Hỗ trợ */}
            <View>
              <Text style={[userHomeStyle.footerSectionTitle, { marginBottom: 8 }]}>Hỗ trợ</Text>
              <TouchableOpacity onPress={() => router.push('/helpCenter')}>
                <Text style={userHomeStyle.footerLink}>Trung tâm trợ giúp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liên hệ */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={[userHomeStyle.footerSectionTitle, { marginBottom: 8 }]}>Liên hệ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="location-outline" size={16} color="#555" />
              <Text style={[userHomeStyle.contactText, { marginLeft: 6 }]}>
                123 Đường PetZone, Quận 1, TP.HCM
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="call-outline" size={16} color="#555" />
              <TouchableOpacity onPress={() => console.log('Gọi 0123 456 789')}>
                <Text style={[userHomeStyle.contactText, { marginLeft: 6 }]}>0123 456 789</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mail-outline" size={16} color="#555" />
              <TouchableOpacity onPress={() => console.log('Email support@petzone.vn')}>
                <Text style={[userHomeStyle.contactText, { marginLeft: 6 }]}>support@petzone.vn</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[userHomeStyle.copyright, { marginTop: 20, textAlign: 'center' }]}>
            © 2025 PetZone. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}