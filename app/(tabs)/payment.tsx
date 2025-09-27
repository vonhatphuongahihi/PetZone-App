import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CheckoutScreen({ navigation }: any) {
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const handlePlaceOrder = () => {
        if (!paymentMethod) {
            setShowWarning(true);
            return;
        }
        setShowSuccess(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("CartScreen")}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FBBC05" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            {/* Scroll nội dung */}
            <ScrollView
                contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Địa chỉ */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.rowBetween}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialIcons
                                name="location-on"
                                size={20}
                                color="#FBBC05"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.bold}>
                                Nguyễn Thu Phương | (+84) 389 144 068
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("editAddressScreen")}>
                            <MaterialIcons
                                name="arrow-forward-ios"
                                size={14}
                                color="rgba(0,0,0,0.55)"
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginTop: 4, marginLeft: 28 }}>
                        Kí túc xá Khu A, Đường số 6{"\n"}Phường Đông Hòa, Thành phố Dĩ An,
                        Bình Dương
                    </Text>
                </View>

                {/* Sản phẩm */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="storefront"
                            size={20}
                            color="#FBBC05"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.bold}>Thuphuong.pet</Text>
                    </View>

                    <View style={[styles.row, { marginTop: 10 }]}>
                        <Image
                            source={require("../../assets/images/cat1.png")}
                            style={styles.image}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.productName}>
                                Vòng chuông bấm xinh cho mèo
                            </Text>
                            <Text style={styles.price}>125.000đ</Text>
                            <Text style={{ fontSize: 12, color: "gray" }}>x1</Text>
                        </View>
                    </View>

                    <View style={[styles.rowBetween, { marginTop: 10 }]}>
                        <Text style={{ color: "gray", fontSize: 13 }}>
                            Tổng số tiền (1 sản phẩm)
                        </Text>
                        <Text style={styles.price}>125.000đ</Text>
                    </View>
                </View>

                {/* Phương thức thanh toán */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={20}
                            color="#FBBC05"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.bold}>Phương thức thanh toán</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.radioRow}
                        onPress={() =>
                            setPaymentMethod(paymentMethod === "cash" ? "" : "cash")
                        }
                    >
                        <Text>Tiền mặt / Cash</Text>
                        <View
                            style={[
                                styles.radioOuter,
                                paymentMethod === "cash" && styles.radioOuterActive,
                            ]}
                        >
                            {paymentMethod === "cash" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioRow}
                        onPress={() =>
                            setPaymentMethod(paymentMethod === "momo" ? "" : "momo")
                        }
                    >
                        <Text>MoMo / E-wallet</Text>
                        <View
                            style={[
                                styles.radioOuter,
                                paymentMethod === "momo" && styles.radioOuterActive,
                            ]}
                        >
                            {paymentMethod === "momo" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Chi tiết thanh toán */}
                <View style={[styles.card, { paddingVertical: 8, paddingHorizontal: 14 }]}>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="receipt-long"
                            size={20}
                            color="#FBBC05"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.bold}>Chi tiết thanh toán</Text>
                    </View>

                    <View style={[styles.rowBetween, { marginTop: 10 }]}>
                        <Text>Tổng tiền hàng</Text>
                        <Text>125.000đ</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text>Tổng phí vận chuyển</Text>
                        <Text>30.000đ</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text>Tổng thanh toán</Text>
                        <Text style={styles.boldRed}>155.000đ</Text>
                    </View>
                </View>

                {/* Note */}
                <Text style={styles.note}>
                    Nhấn <Text style={{ color: "red" }}>“Đặt hàng”</Text> đồng nghĩa với
                    việc bạn đồng ý tuân theo Điều khoản PetZone.
                </Text>
            </ScrollView>

            {/* Footer (cố định) */}
            <View style={styles.footer}>
                <Text style={styles.footerPrice}>155.000đ</Text>
                <TouchableOpacity style={styles.buyBtn} onPress={handlePlaceOrder}>
                    <Text style={styles.buyBtnText}>Đặt hàng</Text>
                </TouchableOpacity>
            </View>

            {/* Popup đặt hàng thành công */}
            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <View style={[styles.popupHeader, { backgroundColor: "#FBBC05" }]}>
                            <MaterialIcons name="check-circle" size={40} color="#fff" />
                            <Text style={styles.popupHeaderText}>Đặt hàng thành công!</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.popupBtnSuccess}
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.navigate("HomeScreen"); // điều hướng tiếp tục mua sắm
                            }}
                        >
                            <Text style={styles.popupBtnText}>Tiếp tục mua sắm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Popup cảnh báo chọn phương thức thanh toán */}
            <Modal transparent visible={showWarning} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.popup}>
                        <View style={[styles.popupHeader, { backgroundColor: "#F44336" }]}>
                            <MaterialIcons name="error" size={40} color="#fff" />
                            <Text style={styles.popupHeaderText}>
                                Vui lòng chọn phương thức thanh toán
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.popupBtnWarning}
                            onPress={() => setShowWarning(false)}
                        >
                            <Text style={styles.popupBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
        paddingTop: 40,
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
    buyBtnText: { color: "#fff", fontWeight: "bold" },

    // Note
    note: {
        fontSize: 12,
        color: "gray",
        marginTop: -10,
        lineHeight: 18,
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
        backgroundColor: "#F44336",
        padding: 15,
        margin: 20,
        borderRadius: 6,
        alignItems: "center",
    },
    popupBtnText: { color: "#fff", fontWeight: "bold" },
});
