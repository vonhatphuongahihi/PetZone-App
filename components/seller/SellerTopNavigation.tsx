import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { sellerTopNavStyles } from './sellerTopNavStyles';

export const SellerTopNavigation: React.FC = () => {
    return (
        <View style={sellerTopNavStyles.container}>
            {/* Left side - Logo and Title */}
            <View style={sellerTopNavStyles.leftSection}>
                <View style={sellerTopNavStyles.storeIcon}>
                    <Image
                        source={require('@/assets/images/seller-home-icon.png')}
                        style={sellerTopNavStyles.homeIconImage}
                        contentFit="contain"
                    />
                </View>
                <View style={sellerTopNavStyles.titleContainer}>
                    <Text style={sellerTopNavStyles.petZoneText}>PetZone</Text>
                    <Text style={sellerTopNavStyles.sellerText}>Seller</Text>
                </View>
            </View>

            {/* Right side - Icons */}
            <View style={sellerTopNavStyles.rightSection}>
                <TouchableOpacity style={sellerTopNavStyles.iconButton}>
                    <Image
                        source={require('@/assets/images/seller-bell-icon.png')}
                        style={sellerTopNavStyles.iconImage}
                        contentFit="contain"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={sellerTopNavStyles.iconButton}>
                    <Image
                        source={require('@/assets/images/seller-mess-icon.png')}
                        style={sellerTopNavStyles.iconImage}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};
