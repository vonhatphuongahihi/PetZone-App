import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingTop: 20,
    },
    headerTitle: { marginLeft: 8, fontSize: 20, fontWeight: "500", color: "#000" },

    // Card
    card: {
        borderWidth: 1,
        borderColor: "#FBBC05",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#fff",
    },

    bold: { fontWeight: "bold" },
    boldRed: { fontWeight: "bold", color: "red", marginTop: 5 },

    // Product
    image: { width: 80, height: 80, borderRadius: 8 },
    productName: { fontSize: 14, fontWeight: "500" },
    price: { color: "red", fontWeight: "bold", fontSize: 15 },

    // Radio button
    radioRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "gray",
        alignItems: "center",
        justifyContent: "center",
    },
    radioOuterActive: { borderColor: "#FBBC05" },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FBBC05",
    },

    // Chi tiết thanh toán
    row: { flexDirection: "row", alignItems: "center" },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    footerPrice: { fontWeight: "bold", color: "red", fontSize: 16 },
    buyBtn: {
        backgroundColor: "#FBBC05",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 6,
    },
    buyBtnDisabled: {
        backgroundColor: "#CCCCCC",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 6,
    },
    buyBtnText: { color: "#fff", fontWeight: "bold" },

    // Note
    note: {
        fontSize: 12,
        color: "gray",
        marginTop: 10,
        marginBottom: 20,
        lineHeight: 18,
        textAlign: 'center',
    },

    // Popup
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        elevation: 5,
    },
    popupHeader: {
        padding: 20,
        alignItems: "center",
    },
    popupHeaderText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
    },
    popupBtnSuccess: {
        backgroundColor: "#FBBC05",
        padding: 15,
        margin: 20,
        borderRadius: 6,
        alignItems: "center",
    },
    popupBtnWarning: {
        backgroundColor: "#AF0000",
        padding: 15,
        margin: 20,
        borderRadius: 6,
        alignItems: "center",
    },
    popupBtnText: { color: "#fff", fontWeight: "bold" },
});

export default styles;
