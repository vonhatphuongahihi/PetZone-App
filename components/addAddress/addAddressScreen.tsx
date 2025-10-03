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
import styles from "./addAddressStyle";

export default function AddAddressScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [street, setStreet] = useState("");

  // dropdown loại địa chỉ
  const [type, setType] = useState("Nhà riêng");
  const [showDropdown, setShowDropdown] = useState(false);
  const addressTypes = ["Nhà riêng", "Văn phòng"];

  // popup state
  const [showCancel, setShowCancel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ mới</Text>
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

        {/* Loại địa chỉ */}
        <Text style={styles.label}>Loại địa chỉ</Text>
        <View style={{ zIndex: 10 }}>
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
            <View style={[styles.dropdown, { position: 'absolute', top: 45, left: 0, right: 0 }]}>
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
          style={styles.cancelBtn}
          onPress={() => setShowCancel(true)}
        >
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setShowSuccess(true)}
        >
          <Text style={styles.saveText}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP HỦY */}
      <Modal transparent visible={showCancel} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <View style={[styles.alertHeader, { backgroundColor: "#F44336" }]}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="error-outline" size={28} color="#F44336" />
              </View>
              <Text style={styles.alertHeaderText}>
                Bạn có chắc chắn muốn hủy thêm địa chỉ?
              </Text>
            </View>

            <View style={styles.alertBody}>
              <TouchableOpacity
                style={[styles.alertPrimaryBtn, { backgroundColor: "#F44336" }]}
                onPress={() => {
                  setShowCancel(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.alertPrimaryBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertSecondaryBtn}
                onPress={() => setShowCancel(false)}
              >
                <Text style={styles.alertSecondaryBtnText}>Tiếp tục</Text>
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
                Thêm địa chỉ thành công!
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
