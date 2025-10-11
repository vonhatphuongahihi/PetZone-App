import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./editAddressStyle";

export default function EditAddressScreen({ navigation }: any) {
    const [name, setName] = useState("Nguyễn Thu Phương");
    const [phone, setPhone] = useState("(+84) 389 144 068");
    const [province, setProvince] = useState(
        "Bình Dương\nThành phố Dĩ An\nPhường Đông Hòa"
    );
    const [street, setStreet] = useState("Kí túc xá Khu A, Đường số 6");

    // dropdown loại địa chỉ
    const [type, setType] = useState("Nhà riêng");
    const [showDropdown, setShowDropdown] = useState(false);
    const addressTypes = ["Nhà riêng", "Văn phòng"];

    // popup state
    const [showDelete, setShowDelete] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("payment")}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sửa Địa chỉ</Text>
            </View>

            {/* Lưu ý */}
            <Text style={styles.noteText}>
                Địa chỉ (dùng thông tin trước sát nhập)
            </Text>

            {/* Nội dung */}
            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
                <Text style={styles.label}>Họ và Tên</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã</Text>
                <TextInput
                    style={[styles.input, { height: 70 }]}
                    value={province}
                    onChangeText={setProvince}
                    multiline
                />

                <Text style={styles.label}>Tên đường, Tòa nhà, Số nhà</Text>
                <TextInput style={styles.input} value={street} onChangeText={setStreet} />

                <Text style={styles.label}>Loại địa chỉ</Text>
                <View>
                    {/* Nút mở dropdown */}
                    <TouchableOpacity
                        style={styles.select}
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <Text>{type}</Text>
                        <MaterialIcons
                            name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
                            size={24}
                            color="#555"
                        />
                    </TouchableOpacity>

                    {/* Danh sách dropdown */}
                    {showDropdown && (
                        <View style={styles.dropdown}>
                            {addressTypes.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setType(item);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setShowDelete(true)}
                >
                    <Text style={styles.deleteText}>Xóa địa chỉ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => setShowSuccess(true)}
                >
                    <Text style={styles.saveText}>Hoàn thành</Text>
                </TouchableOpacity>
            </View>

            {/* POPUP XÓA */}
            <Modal transparent visible={showDelete} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.alertCard}>
                        <View style={[styles.alertHeader, { backgroundColor: "#F44336" }]}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="error-outline" size={28} color="#F44336" />
                            </View>
                            <Text style={styles.alertHeaderText}>
                                Bạn có chắc chắn muốn xóa địa chỉ này?
                            </Text>
                        </View>

                        <View style={styles.alertBody}>
                            <TouchableOpacity
                                style={[styles.alertPrimaryBtn, { backgroundColor: "#F44336" }]}
                                onPress={() => {
                                    setShowDelete(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={styles.alertPrimaryBtnText}>Xóa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.alertSecondaryBtn}
                                onPress={() => setShowDelete(false)}
                            >
                                <Text style={styles.alertSecondaryBtnText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* POPUP THÀNH CÔNG */}
            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.alertCard}>
                        <View style={[styles.alertHeader, { backgroundColor: "#FBBC05" }]}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="check" size={28} color="#FBBC05" />
                            </View>
                            <Text style={styles.alertHeaderText}>
                                Sửa địa chỉ thành công!
                            </Text>
                        </View>

                        <View style={styles.alertBody}>
                            <TouchableOpacity
                                style={[styles.alertPrimaryBtn, { backgroundColor: "#FBBC05" }]}
                                onPress={() => {
                                    setShowSuccess(false);
                                    navigation.navigate("HomeScreen");
                                }}
                            >
                                <Text style={styles.alertPrimaryBtnText}>Tiếp tục mua sắm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
