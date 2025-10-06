import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        backgroundColor: "#FBBC05",
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backIcon: { fontSize: 20, color: "#fff" },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginLeft: -30 },
    iconRow: { flexDirection: "row", alignItems: "center", gap: 10 },

    shopInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    avatar: { width: 80, height: 80, borderRadius: 60, backgroundColor: "#fff" },
    shopTextContainer: { marginLeft: 10 },
    shopName: { fontSize: 16, fontWeight: "600", color: "#fff", marginTop: -30, },
    subText: { fontSize: 14, color: "#fff", marginTop: 2 },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: -30,
    },
    addButton: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        marginRight: 10,
    },
    plusSign: {
        color: "#FBBC05",
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 8,
    },

    addButtonText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 14,
    },

    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
    },
    tabDivider: {
        position: "absolute",
        width: 1,
        height: "50%",
        backgroundColor: "#ddd",
        left: "50%",
        top: "25%",
    },
    tabText: { color: "#666", fontWeight: "500" },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: "#F9C332",
    },
    activeTabText: {
        color: "#F9C332",
        fontWeight: "700",
    },

    card: {
        flex: 1,
        backgroundColor: "#fff",
        margin: 6,
        borderRadius: 10,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    imageWrapper: {
        position: "relative",
        width: "100%",
        height: 150,
        borderRadius: 10,
        overflow: "hidden",
    },
    productImage: { width: "100%", height: 150, borderRadius: 8, resizeMode: "cover", },
    stockTag: {
        position: "absolute",
        top: 6,
        left: 1,
        backgroundColor: "#FBBC05",
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },

    stockTagText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
    },
    productName: { fontSize: 14, fontWeight: "500", marginTop: 6 },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    productPrice: { color: "#E53935", fontWeight: "700" },
    oldPrice: {
        textDecorationLine: "line-through",
        color: "#999",
        fontSize: 12,
    },
    discount: { color: "#F9C332", fontWeight: "700", fontSize: 12 },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    soldLabel: { fontSize: 12, color: "#666" },
    rating: { fontSize: 12, color: "#666" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    iconGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },

    icon: {
        marginLeft: 12,
    },
    stockBadge: {
        backgroundColor: "#FBBC05",
        borderRadius: 10,
        alignSelf: "flex-start",
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginTop: 6,
    },

    stockText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
    },
    categoryLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    categoryRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    categoryCount: {
        fontSize: 14,
        color: "#555",
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    categoryIcon: {
        width: 30,
        height: 30,
        marginRight: 12,
        resizeMode: "contain",
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },


});
