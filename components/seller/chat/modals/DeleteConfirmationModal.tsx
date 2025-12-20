import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface DeleteConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmationModal({ 
    visible, 
    onClose, 
    onConfirm 
}: DeleteConfirmationModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 20,
                    width: '85%',
                    maxWidth: 340
                }}>
                    <View style={{
                        alignItems: 'center',
                        marginBottom: 20
                    }}>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: '600',
                            textAlign: 'center',
                            color: '#333',
                            marginBottom: 16
                        }}>
                            Xóa đoạn chat
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            textAlign: 'center',
                            color: '#666',
                            lineHeight: 22
                        }}>
                            Bạn có chắc chắn muốn xóa đoạn chat này?
                        </Text>
                    </View>
                    
                    <View style={{
                        flexDirection: 'row',
                        gap: 12
                    }}>
                        <TouchableOpacity 
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                alignItems: 'center',
                                backgroundColor: '#0000000F',
                                borderRadius: 8
                            }}
                            onPress={onClose}
                        >
                            <Text style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>Hủy</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                alignItems: 'center',
                                backgroundColor: '#FF3B30',
                                borderRadius: 8
                            }}
                            onPress={onConfirm}
                        >
                            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}