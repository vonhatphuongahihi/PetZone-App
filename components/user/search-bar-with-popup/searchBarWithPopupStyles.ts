import { StyleSheet } from 'react-native';

export const SearchBarWithPopupStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        height: 36,
        marginLeft: 16,
    },
    Searchcontainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#DADCE0",
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
    input: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        paddingHorizontal: 10,
        paddingVertical: 0,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-start",
        zIndex: 1000,
    },
    popup: {
        position: "absolute",
        top: 46,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "#fff",
        borderRadius: 6,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ddd",
        maxHeight: 400,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#FBBC05",
        marginBottom: 10,
    },
    recentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    recentText: {
        fontSize: 14,
        color: "#000",
    },
    removeIcon: {
        fontSize: 16,
        color: "#666",
    },
    productRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    productImage: {
        width: 60,
        height: 60,
        marginRight: 8,
        resizeMode: "contain",
    },
    productName: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "600",
        color: "red",
    },
    oldPrice: {
        fontSize: 12,
        color: "#999",
        textDecorationLine: "line-through",
        marginLeft: 8,
    },
});