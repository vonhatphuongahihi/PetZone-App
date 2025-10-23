import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ChatOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onChangeTheme: () => void;
    onDeleteChat: () => void;
}

export default function ChatOptionsModal({ visible, onClose, onChangeTheme, onDeleteChat }: ChatOptionsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={{
                    flex: 1,
                    backgroundColor: 'transparent'
                }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={{
                    position: 'absolute',
                    top: 52,
                    right: 12,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    paddingVertical: 8,
                    minWidth: 170,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 8
                }}>
                    <TouchableOpacity 
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 16
                        }}
                        onPress={onChangeTheme}
                    >
                        <Feather name="edit-3" size={18} color="#666" style={{ marginRight: 12 }} />
                        <Text style={{ fontSize: 15, color: '#333' }}>Đổi màu chat</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 16
                        }}
                        onPress={onDeleteChat}
                    >
                        <Feather name="trash-2" size={18} color="#FF3B30" style={{ marginRight: 12 }} />
                        <Text style={{ fontSize: 15, color: '#FF3B30' }}>Xóa đoạn chat</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}