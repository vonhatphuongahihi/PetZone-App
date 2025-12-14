import ReviewItem from "@/app/review-item";
import { userInfoService } from "@/services/userInfoService";
import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Product, ProductDetail, productService } from '../../../services/productService';
import { Review, reviewService } from '../../../services/reviewService';
import { tokenService } from '../../../services/tokenService';
import { ProductCard } from '../product-card/ProductCard';
import { productStyles } from './productStyles';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
    const { productId, orderId, rating, tab } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>(tab === 'reviews' ? 'reviews' : 'info');
    const [addingToCart, setAddingToCart] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const imageCarouselRef = useRef<FlatList>(null);
    const [otherProducts, setOtherProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);


    // Review form state (khi có orderId và rating từ params)
    const [userRating, setUserRating] = useState<number>(0);
    const [reviewContent, setReviewContent] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const token = await tokenService.getToken();

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem sản phẩm');
                router.back();
                return;
            }

            // Fetch current user avatar
            const userResponse = await userInfoService.getUserInfo(token);
            setAvatarUrl(userResponse.user.avatarUrl || null);
            setUserRole(userResponse.user.role || null);

            const response = await productService.getProductById(
                parseInt(productId as string),
                token
            );

            if (response.success) {
                setProduct(response.data);
            } else {
                Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
                router.back();
            }
        } catch (error: any) {
            console.error('Error fetching product:', error);
            Alert.alert('Lỗi', error.message || 'Không thể kết nối đến server');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [productId, router]);

    const fetchOtherProducts = useCallback(async () => {
        try {
            setLoading(true);
            const token = await tokenService.getToken();

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để xem sản phẩm');
                return;
            }

            if (!product?.categoryId) {
                Alert.alert('Lỗi', 'Không tìm thấy danh mục');
                return;
            }

            const response = await productService.getProductsByCategory(
                parseInt(String(product?.categoryId)),
                token
            );

            if (response.success) {
                const filteredProducts = response.data.filter(p => p.id !== product?.id);

                const sortedProducts = filteredProducts.sort((a, b) => {
                    const isSameStoreA = a.storeId === product?.storeId;
                    const isSameStoreB = b.storeId === product?.storeId;

                    if (isSameStoreA && !isSameStoreB) return -1;
                    if (!isSameStoreA && isSameStoreB) return 1;
                    return Math.random() - 0.5;
                }).slice(0, 10);

                setOtherProducts(sortedProducts);
            } else {
                Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            Alert.alert('Lỗi', error.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    }, [product?.categoryId, product?.id, product?.storeId]);

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
            setQuantity(newQuantity);
        }
    };

    const handleThumbnailPress = (index: number) => {
        setCurrentImageIndex(index);
        // Scroll FlatList tới vị trí tương ứng
        try {
            imageCarouselRef.current?.scrollToIndex({
                index: index,
                animated: true,
            });
        } catch {
            // Nếu scrollToIndex fail, thử scroll tới offset
            const scrollOffset = index * width;
            imageCarouselRef.current?.scrollToOffset({
                offset: scrollOffset,
                animated: true,
            });
        }
    };

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isStoreOwner, setIsStoreOwner] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = await tokenService.getToken();
            if (!token) return;
            const userResponse = await userInfoService.getUserInfo(token);
            setCurrentUserId(userResponse.user.id);
            if (product?.store?.userId === userResponse.user.id) {
                setIsStoreOwner(true);
            }
        };
        fetchCurrentUser();
    }, [product]);

    // UseEffect hooks
    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId, fetchProduct]);

    
    const fetchReviews = useCallback(async () => {
        if (!productId) return;

        try {
            setLoadingReviews(true);
            const response = await reviewService.getProductReviews(parseInt(productId as string));
            if (response.success) {
                setReviews(response.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            fetchOtherProducts();
            fetchReviews();
        }
    }, [product, fetchOtherProducts, fetchReviews]);

    // Set initial rating nếu có từ params
    useEffect(() => {
        if (rating) {
            setUserRating(parseInt(rating as string));
        }
    }, [rating]);

    const handleSubmitReview = async () => {
        if (!productId || !orderId || userRating === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setSubmittingReview(true);
            const token = await AsyncStorage.getItem('jwt_token');
            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập');
                router.replace('/login');
                return;
            }

            await reviewService.createReview({
                productId: parseInt(productId as string),
                orderId: orderId as string,
                rating: userRating,
                content: reviewContent.trim() || undefined,
                images: [] // Có thể thêm upload ảnh sau
            }, token);

            // Reload reviews và product để cập nhật avgRating
            await fetchReviews();
            await fetchProduct();

            // Reset form
            setUserRating(0);
            setReviewContent('');

            // Remove params từ URL
            router.replace(`/product?productId=${productId}&tab=reviews`);

            Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi!');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            Alert.alert('Lỗi', error.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleAddToCart = async () => {
        if (addingToCart) return;

        try {
            setAddingToCart(true);
            const finalQuantity = quantity || 1;
            const token = await AsyncStorage.getItem('jwt_token');

            if (!token) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng nhập', onPress: () => router.replace('/login') }
                ]);
                return;
            }

            if (!product?.id) {
                Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
                return;
            }

            // Validate quantity
            if (finalQuantity < 1) {
                Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
                return;
            }

            if (product.quantity && finalQuantity > product.quantity) {
                Alert.alert('Lỗi', `Số lượng vượt quá số lượng còn lại (${product.quantity})`);
                return;
            }

            console.log('Adding to cart:', { productId: product.id, quantity: finalQuantity });
            const { cartService } = await import('../../../services/cartService');
            const result = await cartService.addToCart(token, Number(product.id), finalQuantity);

            console.log('Add to cart result:', result);

            // Hiển thị modal thành công
            setSuccessMessage(`Đã thêm ${finalQuantity} sản phẩm vào giỏ hàng!`);
            setShowSuccessModal(true);

            // Tự động ẩn sau 2.5 giây
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2500);
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            const errorMessage = error.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        const finalQuantity = quantity || 1;
        Alert.alert('Thông báo', `Mua ngay ${finalQuantity} sản phẩm`);
    };

    const renderImagePagination = () => {
        if (!product?.images || product.images.length <= 1) return null;

        return (
            <View
                style={productStyles.imagePagination}
                accessible={false}
                importantForAccessibility="no-hide-descendants"
            >
                {product.images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            productStyles.paginationDot,
                            index === currentImageIndex && productStyles.paginationDotActive
                        ]}
                        accessible={false}
                    />
                ))}
            </View>
        );
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FontAwesome5 key={i} name="star" size={16} color="#FFD700" solid />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <FontAwesome5 key="half" name="star-half-alt" size={16} color="#FFD700" solid />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FontAwesome5 key={`empty-${i}`} name="star" size={16} color="#E0E0E0" />
            );
        }

        return stars;
    };

    const renderReviewItem = ({ item }: { item: Review }) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        return (
            <View style={productStyles.reviewItem}>
                <View style={productStyles.reviewHeader}>
                    <Image
                        source={
                            item.user?.avatarUrl
                                ? { uri: item.user.avatarUrl }
                                : require('../../../assets/images/icon.png')
                        }
                        style={productStyles.reviewUserAvatar}
                    />
                    <View style={productStyles.reviewUserInfo}>
                        <Text style={productStyles.reviewUserName}>{item.user?.username || 'Người dùng'}</Text>
                        <View style={productStyles.reviewRating}>
                            {renderStars(item.rating)}
                            <Text style={productStyles.reviewDate}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>
                </View>
                {item.content && <Text style={productStyles.reviewContent}>{item.content}</Text>}
                {item.images && item.images.length > 0 && (
                    <View style={productStyles.reviewImages}>
                        {item.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={productStyles.reviewImage} />
                        ))}
                    </View>
                )}
                {item.sellerReply && (
                    <View style={productStyles.sellerReplyContainer}>
                        <Text style={productStyles.sellerReplyTitle}>Trả lời từ cửa hàng:</Text>
                        <Text style={productStyles.sellerReplyText}>{item.sellerReply}</Text>
                        {item.replyAt && (
                            <Text style={productStyles.sellerReplyDate}>
                                {new Date(item.replyAt).toLocaleDateString('vi-VN')}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderRatingStars = (rating: number, size: number = 20, onPress?: (rating: number) => void) => {
        return (
            <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onPress && onPress(star)}
                        disabled={!onPress}
                    >
                        <FontAwesome
                            name={star <= rating ? 'star' : 'star-o'}
                            size={size}
                            color="#FBBC05"
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderOtherProductItem = ({ item }: { item: Product }) => (
        <View style={productStyles.productWrapper}>
            <ProductCard
                product={{
                    id: item.id.toString(),
                    name: item.title,
                    shop: item.store?.storeName || item.storeId,
                    shopImage: item.store?.user?.avatarUrl ? { uri: item.store.user.avatarUrl } : require("../../../assets/images/shop.jpg"),
                    sold: item.soldCount || 0,
                    category: item.category?.name || 'Không có danh mục',
                    rating: Number(item.avgRating) || 0,
                    image: item.images?.[0]?.url ? { uri: item.images[0].url } : require("../../../assets/images/cat.png"),
                    price: Number(item.price) || 0,
                    oldPrice: Number(item.oldPrice) || 0,
                    discount: item.oldPrice ? `-${Math.round((1 - Number(item.price) / Number(item.oldPrice)) * 100)}%` : "",
                    tag: item.tag || undefined,
                }}
                onPress={() => router.push(`/product?productId=${item.id}`)}
                layout="horizontal"
            />
        </View>
    );

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={productStyles.container}>
                    <View style={productStyles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                        </TouchableOpacity>
                        <Text style={productStyles.headerTitle}>Chi tiết sản phẩm</Text>
                    </View>
                    <View style={[productStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size="large" color="#FBBC05" />
                        <Text style={{ marginTop: 10 }}>Đang tải sản phẩm...</Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={productStyles.container}>
                    <View style={productStyles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                        </TouchableOpacity>
                        <Text style={productStyles.headerTitle}>Chi tiết sản phẩm</Text>
                    </View>
                    <View style={[productStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 16, color: '#666' }}>Không tìm thấy sản phẩm</Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={productStyles.container}>
                {/* Header */}
                <View style={productStyles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="chevron-left" size={20} color="#FBBC05" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/cart')} style={productStyles.cartButton}>
                        <MaterialIcons name="shopping-cart" size={28} color="#FBBC05" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={productStyles.scrollView}>
                    {/* Product Images */}
                    <View style={productStyles.imageContainer}>
                        <FlatList
                            ref={imageCarouselRef}
                            data={product.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            accessible={true}
                            accessibilityLabel="Hình ảnh sản phẩm"
                            getItemLayout={(_, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                            onMomentumScrollEnd={(event) => {
                                const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(newIndex);
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item.url }}
                                    style={productStyles.productImage}
                                    resizeMode="cover"
                                    accessible={true}
                                    accessibilityLabel={`Hình ảnh sản phẩm ${product.title}`}
                                />
                            )}
                            keyExtractor={(item) => item.id.toString()}
                        />
                        {renderImagePagination()}
                    </View>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                        <View style={productStyles.thumbnailContainer}>
                            {product.images.slice(0, 5).map((image, index) => (
                                <TouchableOpacity
                                    key={image.id}
                                    style={[
                                        productStyles.thumbnail,
                                        index === currentImageIndex && productStyles.thumbnailActive
                                    ]}
                                    onPress={() => handleThumbnailPress(index)}
                                    accessible={true}
                                    accessibilityLabel={`Xem ảnh ${index + 1}`}
                                    accessibilityRole="button"
                                >
                                    <Image source={{ uri: image.url }} style={productStyles.thumbnailImage} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Product Info */}
                    <View style={productStyles.productInfo}>
                        <Text style={productStyles.productTitle}>{product.title}</Text>

                        {/* Rating */}
                        <View style={productStyles.ratingContainer}>
                            <View style={productStyles.ratingStars}>
                                {renderStars(Number(product.avgRating) || 0)}
                            </View>
                            <Text style={productStyles.ratingText}>
                                {(Number(product.avgRating) || 0).toFixed(1)}
                            </Text>
                        </View>

                        {/* Price */}
                        <View style={productStyles.priceContainer}>
                            <Text style={productStyles.currentPrice}>
                                {(Number(product.price) || 0).toLocaleString('vi-VN')}đ
                            </Text>
                            {product.oldPrice && (
                                <Text style={productStyles.oldPrice}>
                                    {(Number(product.oldPrice) || 0).toLocaleString('vi-VN')}đ
                                </Text>
                            )}
                        </View>

                        <View style={productStyles.storeContainer}>
                            <View style={productStyles.storeHeader}>
                                <Image
                                    source={ product.store?.user?.avatarUrl
                                        ? { uri: product.store.user.avatarUrl }
                                            : require("../../../assets/images/shop.jpg")
                                    }
                                    style={productStyles.storeAvatar}
                                />
                                <Text style={productStyles.storeName}>{product.store?.storeName || product.storeId}</Text>
                                {userRole !== 'SELLER' && (
                                    <TouchableOpacity
                                        style={productStyles.followButton}
                                        accessible={true}
                                        accessibilityLabel="Xem shop"
                                        accessibilityRole="button"
                                        onPress={() => {
                                            // Sử dụng store.id nếu có, nếu không thì dùng storeId từ product
                                            const storeIdToNavigate = product.store?.id || product.storeId;
                                            if (storeIdToNavigate) {
                                                router.push({
                                                    pathname: "/shop",
                                                    params: { storeId: storeIdToNavigate }
                                                });
                                            } else {
                                                Alert.alert("Lỗi", "Không thể tìm thấy thông tin cửa hàng");
                                            }
                                        }}
                                    >
                                        <Text style={productStyles.followButtonText}>Xem shop</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={productStyles.storeInfo}>
                                <View style={productStyles.storeStats}>
                                    <Text style={productStyles.storeStatText}>{product.store?.rating || 0}</Text>
                                    <Text style={productStyles.storeStatTextLabel}>Đánh giá</Text>
                                </View>
                                <View style={productStyles.storeStats}>
                                    <Text style={productStyles.storeStatText}>
                                        {product.store?.totalProducts || 0}
                                    </Text>
                                    <Text style={productStyles.storeStatTextLabel}>Sản phẩm</Text>
                                </View>
                                <View style={productStyles.storeStats}>
                                    <Text style={productStyles.storeStatText}>
                                        {product.store?.followersCount || 0}
                                    </Text>
                                    <Text style={productStyles.storeStatTextLabel}>Theo dõi</Text>
                                </View>
                            </View>
                        </View>

                        {/* Quantity Selector */}
                        <View style={productStyles.quantityContainer}>
                            <Text style={productStyles.quantityLabel}>Số lượng</Text>
                            <View style={productStyles.quantitySelector}>
                                <TouchableOpacity
                                    style={productStyles.quantityButton}
                                    onPress={() => handleQuantityChange(-1)}
                                    accessible={true}
                                    accessibilityLabel="Giảm số lượng"
                                    accessibilityRole="button"
                                >
                                    <Text style={productStyles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <TextInput
                                    style={productStyles.quantityInput}
                                    value={quantity.toString()}
                                    onChangeText={(text) => {
                                        if (text === '') {
                                            setQuantity(0);
                                            return;
                                        }

                                        const num = parseInt(text);
                                        if (!isNaN(num) && num >= 1 && num <= (product.quantity || 1)) {
                                            setQuantity(num);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === 0) {
                                            setQuantity(1);
                                        }
                                    }}
                                    keyboardType="numeric"
                                    selectTextOnFocus={true}
                                    accessible={true}
                                    accessibilityLabel="Số lượng sản phẩm"
                                    accessibilityHint={`Nhập số lượng từ 1 đến ${product.quantity || 1}`}
                                />
                                <TouchableOpacity
                                    style={productStyles.quantityButton}
                                    onPress={() => handleQuantityChange(1)}
                                    accessible={true}
                                    accessibilityLabel="Tăng số lượng"
                                    accessibilityRole="button"
                                >
                                    <Text style={productStyles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={productStyles.totalPrice}>
                            Tạm tính: {((quantity || 1) * (Number(product.price) || 0)).toLocaleString('vi-VN')}đ
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={productStyles.actionContainer}>
                        <TouchableOpacity
                            style={[productStyles.addToCartButton, addingToCart && { opacity: 0.6 }]}
                            onPress={handleAddToCart}
                            disabled={addingToCart}
                            accessible={true}
                            accessibilityLabel="Thêm vào giỏ hàng"
                            accessibilityRole="button"
                            accessibilityHint={`Thêm ${quantity || 1} sản phẩm vào giỏ hàng`}
                        >
                            {addingToCart ? (
                                <ActivityIndicator size="small" color="#FBBC05" />
                            ) : (
                                <Ionicons name="cart-outline" size={24} color="#FBBC05" />
                            )}
                            <Text style={productStyles.addToCartText}>
                                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={productStyles.buyNowButton}
                            onPress={handleBuyNow}
                            accessible={true}
                            accessibilityLabel="Mua ngay"
                            accessibilityRole="button"
                            accessibilityHint={`Mua ngay ${quantity || 1} sản phẩm`}
                        >
                            <Text style={productStyles.buyNowText}>Mua ngay</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={productStyles.tabContainer}>
                        <TouchableOpacity
                            style={[productStyles.tab, activeTab === 'info' && productStyles.activeTab]}
                            onPress={() => setActiveTab('info')}
                            accessible={true}
                            accessibilityLabel="Tab thông tin chi tiết"
                            accessibilityRole="tab"
                            accessibilityState={{ selected: activeTab === 'info' }}
                        >
                            <Text style={[productStyles.tabText, activeTab === 'info' && productStyles.activeTabText]}>
                                Thông tin chi tiết
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[productStyles.tab, activeTab === 'reviews' && productStyles.activeTab]}
                            onPress={() => setActiveTab('reviews')}
                            accessible={true}
                            accessibilityLabel={`Tab đánh giá, ${product.totalReviews} đánh giá`}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: activeTab === 'reviews' }}
                        >
                            <Text style={[productStyles.tabText, activeTab === 'reviews' && productStyles.activeTabText]}>
                                Đánh giá ({product.totalReviews})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    <View style={productStyles.tabContent}>
                        {activeTab === 'info' ? (
                            <View>
                                <Text style={productStyles.detailTitle}>Mô tả sản phẩm</Text>
                                <Text style={productStyles.detailText}>
                                    {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                                </Text>

                                <Text style={productStyles.detailTitle}>Thông tin sản phẩm</Text>
                                <View style={productStyles.detailRow}>
                                    <Text style={productStyles.detailLabel}>Danh mục</Text>
                                    <Text style={productStyles.detailValue}>{product.category?.name || 'Chưa rõ'}</Text>
                                </View>
                                <View style={productStyles.detailRow}>
                                    <Text style={productStyles.detailLabel}>Tình trạng</Text>
                                    <Text style={productStyles.detailValue}>
                                        {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                                    </Text>
                                </View>
                                {product.tag && (
                                    <View style={productStyles.detailRow}>
                                        <Text style={productStyles.detailLabel}>Loại</Text>
                                        <Text style={productStyles.detailValue}>
                                            {product.tag === 'hot' && 'Hàng hot'}
                                            {product.tag === 'new' && 'Hàng mới'}
                                            {product.tag === 'bestseller' && 'Bán chạy'}
                                            {product.tag === 'sale' && 'Giảm giá'}
                                            {product.tag === 'normal' && 'Sản phẩm phổ biến'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View>
                                <View style={productStyles.reviewSummary}>
                                    <View style={productStyles.reviewSummaryStats}>
                                        <Text style={productStyles.overallRating}>
                                            {(Number(product.avgRating) || 0).toFixed(1)}
                                        </Text>
                                        <View style={productStyles.overallStars}>
                                            {renderStars(Number(product.avgRating) || 0)}
                                        </View>
                                    </View>
                                    <Text style={productStyles.reviewCount}>
                                        ({product.totalReviews} đánh giá)
                                    </Text>
                                </View>

                                {/* Review Form - Hiển thị nếu có orderId và rating từ params */}
                                {orderId && rating && (
                                    <View style={productStyles.reviewFormContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                            <Image
                                                source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/icon.png')}
                                                style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
                                            />
                                            <Text style={productStyles.reviewFormTitle}>Đánh giá sản phẩm của bạn</Text>
                                        </View>

                                        <View style={productStyles.reviewFormRating}>
                                            <Text style={productStyles.reviewFormLabel}>Số sao:</Text>
                                            {renderRatingStars(userRating, 28, setUserRating)}
                                        </View>

                                        <Text style={productStyles.reviewFormLabel}>Nhận xét:</Text>
                                        <TextInput
                                            style={productStyles.reviewFormInput}
                                            placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm..."
                                            placeholderTextColor="#999"
                                            multiline
                                            numberOfLines={4}
                                            value={reviewContent}
                                            onChangeText={setReviewContent}
                                            textAlignVertical="top"
                                        />

                                        <TouchableOpacity
                                            style={[
                                                productStyles.reviewFormSubmitButton,
                                                (userRating === 0 || submittingReview) && productStyles.reviewFormSubmitButtonDisabled
                                            ]}
                                            onPress={handleSubmitReview}
                                            disabled={userRating === 0 || submittingReview}
                                        >
                                            {submittingReview ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={productStyles.reviewFormSubmitText}>Gửi đánh giá</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Reviews List */}
                                {loadingReviews ? (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color="#FBBC05" />
                                        <Text style={{ marginTop: 8, color: '#666' }}>Đang tải đánh giá...</Text>
                                    </View>
                                ) : reviews.length === 0 ? (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: '#999' }}>Chưa có đánh giá nào</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={reviews}
                                        renderItem={({ item }) => (
                                            <ReviewItem
                                                item={item}
                                                isStoreOwner={isStoreOwner}
                                                onReplySuccess={fetchReviews}
                                            />
                                        )}
                                        keyExtractor={(item) => item.id.toString()}
                                        scrollEnabled={false}
                                        ListEmptyComponent={
                                            <View style={{ padding: 40, alignItems: 'center' }}>
                                                <Text style={{ color: '#999', fontSize: 16 }}>Chưa có đánh giá nào</Text>
                                            </View>
                                        }
                                    />
                                )}
                            </View>
                        )}
                    </View>

                    <View style={productStyles.section}>
                        <Text style={productStyles.sectionTitle}>Xem các sản phẩm gợi ý khác</Text>
                        <FlatList
                            data={otherProducts}
                            renderItem={renderOtherProductItem}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            scrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={productStyles.productsList}
                            accessible={true}
                            accessibilityLabel="Danh sách sản phẩm gợi ý"
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <TouchableOpacity
                    style={productStyles.successModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSuccessModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={productStyles.successModalContainer}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={productStyles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                        </View>
                        <Text style={productStyles.successTitle}>Thành công!</Text>
                        <Text style={productStyles.successMessage}>{successMessage}</Text>
                        <TouchableOpacity
                            style={productStyles.successButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={productStyles.successButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}