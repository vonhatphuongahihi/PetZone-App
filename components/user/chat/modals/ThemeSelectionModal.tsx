import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ThemeOption {
    name: string;
    color: string;
}

interface ThemeSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    currentTheme: string;
    onSelectTheme: (theme: string) => void;
}

const THEME_OPTIONS: ThemeOption[] = [
    { name: 'Xanh lá', color: '#0ED3AF' },
    { name: 'Xanh dương', color: '#007AFF' },
    { name: 'Tím', color: '#AF52DE' },
    { name: 'Hồng', color: '#FF2D92' },
    { name: 'Vàng', color: '#FBBC05' },
    { name: 'Đỏ', color: '#FF3B30' },
];

export default function ThemeSelectionModal({ 
    visible, 
    onClose, 
    currentTheme, 
    onSelectTheme 
}: ThemeSelectionModalProps) {
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
                    padding: 24,
                    width: '80%',
                    maxWidth: 320
                }}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: 20,
                        color: '#333'
                    }}>
                        Chọn màu chat
                    </Text>
                    
                    {THEME_OPTIONS.map((theme, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                paddingHorizontal: 8,
                                borderRadius: 8,
                                marginBottom: 4
                            }}
                            onPress={() => onSelectTheme(theme.color)}
                        >
                            <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: theme.color,
                                marginRight: 16,
                                borderWidth: currentTheme === theme.color ? 3 : 0,
                                borderColor: '#333'
                            }} />
                            <Text style={{
                                fontSize: 16,
                                color: '#333',
                                fontWeight: currentTheme === theme.color ? '600' : '400'
                            }}>
                                {theme.name}
                            </Text>
                            {currentTheme === theme.color && (
                                <View style={{ marginLeft: 'auto' }}>
                                    <Feather name="check" size={20} color="#333" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity 
                        style={{
                            marginTop: 16,
                            paddingVertical: 12,
                            alignItems: 'center',
                            backgroundColor: '#0000000F',
                            borderRadius: 8
                        }}
                        onPress={onClose}
                    >
                        <Text style={{ fontSize: 16, color: '#666' }}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}