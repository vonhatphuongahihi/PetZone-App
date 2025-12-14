import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerBottomNavigation } from './SellerBottomNavigation';
import { SellerTopNavigation } from './SellerTopNavigation';

interface Review {
    id: string;
    customerName: string;
    rating: number;
    date: string;
    comment: string;
    avatar: any;
}

export default function RatingSellerScreen() {
    const [selectedStarFilter, setSelectedStarFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

    const [reviews, setReviews] = useState<Review[]>([
        {
            id: '1',
            customerName: 'Le Thien Phuc',
            rating: 5,
            date: '11/04/2024',
            comment: 'Shop bán sản phẩm chất lượng, tư vấn tận tình.',
            avatar: require('@/assets/images/icon.png')
        },
        {
            id: '2',
            customerName: 'Le Thien Phuc',
            rating: 5,
            date: '11/04/2024',
            comment: 'Shop bán sản phẩm chất lượng, tư vấn tận tình.',
            avatar: require('@/assets/images/icon.png')
        },
        {
            id: '3',
            customerName: 'Le Thien Phuc',
            rating: 5,
            date: '11/04/2024',
            comment: 'Shop bán sản phẩm chất lượng, tư vấn tận tình.',
            avatar: require('@/assets/images/icon.png')
        },
        {
            id: '4',
            customerName: 'Le Thien Phuc',
            rating: 5,
            date: '11/04/2024',
            comment: 'Shop bán sản phẩm chất lượng, tư vấn tận tình.',
            avatar: require('@/assets/images/icon.png')
        }
    ]);

    const averageRating = 4.8;
    const totalReviews = reviews.length;

    const getFilteredReviews = () => {
        if (selectedStarFilter === 'all') {
            return reviews;
        }
        return reviews.filter(review => review.rating === parseInt(selectedStarFilter));
    };

    const renderStars = (rating: number, size: number = 16) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text
                    key={i}
                    style={[
                        styles.star,
                        {
                            fontSize: size,
                            color: i <= rating ? '#FFB400' : '#E0E0E0'
                        }
                    ]}
                >
                    ★
                </Text>
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const renderReviewItem = (review: Review) => (
        <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image source={review.avatar} style={styles.customerAvatar} />
                <View style={styles.reviewInfo}>
                    <Text style={styles.customerName}>{review.customerName}</Text>
                    <View style={styles.ratingRow}>
                        {renderStars(review.rating, 14)}
                        <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <SellerTopNavigation />
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                {/* Store Rating Section */}
                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Đánh Giá Cửa Hàng</Text>
                    <Text style={styles.sectionSubtitle}>
                        Theo dõi đánh giá của khách hàng dành cho cửa hàng của bạn.
                    </Text>

                    <View style={styles.ratingDisplay}>
                        <Text style={styles.averageRating}>{averageRating}</Text>
                        <Text style={styles.outOf}>trên 5</Text>
                    </View>

                    <View style={styles.starsDisplay}>
                        {renderStars(Math.floor(averageRating), 24)}
                    </View>
                </View>

                {/* Star Filter Tabs */}
                <View style={styles.filterTabs}>
                    {['all', '1', '2', '3', '4', '5'].map((star) => (
                        <TouchableOpacity
                            key={star}
                            style={[
                                styles.filterTab,
                                selectedStarFilter === star && styles.filterTabActive
                            ]}
                            onPress={() => setSelectedStarFilter(star as any)}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    selectedStarFilter === star && styles.filterTabTextActive
                                ]}
                            >
                                {star === 'all' ? 'All' : `${star} sao`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Reviews List */}
                <View style={{ paddingHorizontal: 16 }}>
                    {getFilteredReviews().map(renderReviewItem)}
                </View>
            </ScrollView>
            <SellerBottomNavigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    ratingSection: {
        backgroundColor: '#FFF',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    ratingDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    averageRating: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFB400',
    },
    outOf: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    starsDisplay: {
        marginBottom: 8,
    },

    starsContainer: {
        flexDirection: 'row',
    },
    star: {
        marginRight: 2,
    },

    filterTabs: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    filterTabActive: {
        backgroundColor: '#FFB400',
    },
    filterTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },

    reviewsList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    reviewCard: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    reviewHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    reviewInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    reviewComment: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
