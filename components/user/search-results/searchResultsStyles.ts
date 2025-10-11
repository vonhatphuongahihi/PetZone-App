import { StyleSheet } from 'react-native';

export const SearchResultsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        paddingLeft: 16,
    },
    headerTitle: { fontSize: 16, fontWeight: "600", marginLeft: 16 },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#DADCE0",
        marginLeft: 16,
        height: 36,
    },
    
    searchIcon: {
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: "#FBBC05",
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        paddingHorizontal: 10,
        paddingVertical: 0,
    },

    card: {
        backgroundColor: "#FFFAE8",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 12,
        overflow: "hidden",
        width: "48%",
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

    image: { width: "100%", height: 130, resizeMode: "contain" },

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
        fontSize: 10,
        fontWeight: "500",
        textTransform: "uppercase",
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

    productName: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
    tagline: { fontSize: 11, color: "gray", marginBottom: 4 },

    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { fontSize: 16, fontWeight: "600", color: "red", marginRight: 6 },
    oldPrice: {
        fontSize: 11,
        color: "#888",
        textDecorationLine: "line-through",
    },
});