import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { supportService } from "../../services/supportService";

export default function SupportScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate form
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      
      // Gửi request thông qua supportService
      const supportData = {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };

      const result = await supportService.submitSupport(supportData);
      
      Alert.alert(
        'Thành công', 
        result.message || 'Đã gửi thông tin trợ giúp. Chúng tôi sẽ phản hồi qua email trong vòng 24h.',
        [
          {
            text: 'OK',
            onPress: () => {
              setName("");
              setEmail("");
              setSubject("");
              setMessage("");
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#FCCB05" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.description}>
            Gửi thông tin để nhận được hỗ trợ từ đội ngũ chăm sóc khách hàng của chúng tôi
          </Text>

          {/* Họ và tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ và tên của bạn"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập địa chỉ email của bạn"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Chủ đề */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chủ đề *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Nhập chủ đề cần hỗ trợ"
              placeholderTextColor="#999"
            />
          </View>

          {/* Nội dung */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nội dung *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Ghi chú */}
          <View style={styles.noteContainer}>
            <MaterialIcons name="info-outline" size={16} color="#666" />
            <Text style={styles.noteText}>
              Chúng tôi sẽ phản hồi qua email trong vòng 24 giờ làm việc
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Gửi yêu cầu hỗ trợ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // Content
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    lineHeight: 20,
  },

  // Input
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },

  // Note
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: '#FBBC05',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});