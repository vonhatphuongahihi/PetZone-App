import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backIcon: {
        fontSize: 28,
        color: "#FBBC05",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
        marginLeft: -130,
    },

    // Card sản phẩm
    productCard: {             
        height: 280,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        margin: 6,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        justifyContent: 'space-between', 
    },

    imageWrapper: {
        position: "relative",
        width: "100%",
        height: 140,
        borderRadius: 10,
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: 150,
        borderRadius: 8,
        resizeMode: "cover",
    },

    // Tag "Còn X sản phẩm"
    stockTag: {
        position: 'absolute',
        top: 6,
        left: 1,
        backgroundColor: "#FBBC05",
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 6,
        zIndex: 10,
    },
    stockTagText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
    },

    productName: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: "500",
    },

    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    productPrice: {
        color: "#E53935",
        fontWeight: "700",
    },
    oldPrice: {
        textDecorationLine: "line-through",
        color: "#999",
        fontSize: 12,
    },
    discount: {
        color: "#F9C332",
        fontWeight: "700",
        fontSize: 12,
    },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    soldLabel: {
        fontSize: 12,
        color: "#666"
    },
    rating: {
        fontSize: 12,
        color: "#666",
    },
});
