import { StyleSheet } from 'react-native';

export const productCardStyles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFAE8",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 12,
        overflow: "hidden",
        width: "48%", // Default cho grid layout
    },
    horizontalCard: {
        width: "100%", // Override cho horizontal layout
    },
    discountBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#FFA000",
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        zIndex: 1,
    },
    discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },

    image: { width: "100%", height: 160, resizeMode: "cover" },

    info: { padding: 10 },
    shopRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    shopAvatar: { width: 24, height: 24, borderRadius: 12 },
    shopName: { fontSize: 12, fontWeight: "600" },
    sold: { fontSize: 10, color: "#666" },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: "500",
        width: "60%",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: 12,
        color: "#000",
        marginLeft: 4,
    },

    productName: { fontSize: 14, fontWeight: "500", marginBottom: 4, lineHeight: 20 },
    tagline: { fontSize: 11, color: "gray", marginBottom: 4 },

    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { fontSize: 16, fontWeight: "600", color: "red", marginRight: 6 },
    oldPrice: {
        fontSize: 11,
        color: "#888",
        textDecorationLine: "line-through",
    },
});
