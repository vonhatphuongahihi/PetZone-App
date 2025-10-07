import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { productCardStyles } from './productCardStyles';

interface Product {
    id: string;
    name: string;
    shop: string;
    shopImage: ImageSourcePropType;
    sold: number;
    category: string;
    rating: number;
    image: ImageSourcePropType;
    price: number;
    oldPrice: number;
    discount: string;
}

interface ProductCardProps {
    product: Product;
    onPress?: (product: Product) => void;
    layout?: 'grid' | 'horizontal';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, layout = 'grid' }) => {
    const cardStyle = layout === 'horizontal' 
        ? [productCardStyles.card, productCardStyles.horizontalCard]
        : productCardStyles.card;

    return (
        <TouchableOpacity
            style={cardStyle}
            onPress={() => onPress?.(product)}
        >
            {/* Badge giảm giá */}
            <View style={productCardStyles.discountBadge}>
                <Text style={productCardStyles.discountText}>{product.discount}</Text>
            </View>

            {/* Ảnh sản phẩm */}
            <Image source={product.image} style={productCardStyles.image} />

            {/* Thông tin sản phẩm */}
            <View style={productCardStyles.info}>
                {/* Shop */}
                <View style={productCardStyles.shopRow}>
                    <Image
                        source={product.shopImage}
                        style={productCardStyles.shopAvatar}
                    />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={productCardStyles.shopName}>{product.shop}</Text>
                        <Text style={productCardStyles.sold}>{product.sold} đã bán</Text>
                    </View>
                </View>

                {/* Danh mục + Rating */}
                <View style={productCardStyles.metaRow}>
                    <Text style={productCardStyles.categoryText}>{product.category}</Text>
                    <View style={productCardStyles.ratingRow}>
                        <FontAwesome5 name="star" size={10} color="#FFD700" solid/>
                        <Text style={productCardStyles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>
                </View>

                {/* Tên sản phẩm */}
                <Text style={productCardStyles.productName} numberOfLines={2}>
                    {product.name}
                </Text>

                <Text style={productCardStyles.tagline}>Hàng cực hot</Text>

                {/* Giá */}
                <View style={productCardStyles.priceRow}>
                    <Text style={productCardStyles.price}>
                        {product.price.toLocaleString("vi-VN")}đ
                    </Text>
                    <Text style={productCardStyles.oldPrice}>
                        {product.oldPrice.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};