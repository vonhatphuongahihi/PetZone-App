import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles } from './splashStyles';

export default function SplashScreen() {
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.8);
    const logoTranslateY = useSharedValue(50);
    const taglineOpacity = useSharedValue(0);
    const taglineTranslateY = useSharedValue(60);

    useEffect(() => {
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withTiming(1, { duration: 800 });
        logoTranslateY.value = withTiming(0, { duration: 800 });

        taglineOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
        taglineTranslateY.value = withDelay(400, withTiming(0, { duration: 600 }));

        const timer = setTimeout(() => {
            router.replace('/(tabs)');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }, { translateY: logoTranslateY.value }],
    }));

    const taglineAnimatedStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
        transform: [{ translateY: taglineTranslateY.value }],
    }));

    return (
        <SafeAreaView style={splashStyles.container}>
            <View style={splashStyles.topSection}>
                <Image
                    source={require('@/assets/images/bubble-left.png')}
                    style={splashStyles.bubbleLeft}
                    contentFit="contain"
                />
                <Image
                    source={require('@/assets/images/bubble-right.png')}
                    style={splashStyles.bubbleRight}
                    contentFit="contain"
                />
                <Image
                    source={require('@/assets/images/dog-feet.png')}
                    style={splashStyles.dogFeet}
                    contentFit="contain"
                />
            </View>

            <View style={splashStyles.middleSection}>
                <Image
                    source={require('@/assets/images/splash-animals.png')}
                    style={splashStyles.splashAnimals}
                    contentFit="contain"
                />
            </View>

            <View style={splashStyles.bottomSection}>
                <Animated.View style={[splashStyles.logoContainer, logoAnimatedStyle]}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={splashStyles.logoImage}
                        contentFit="contain"
                    />
                </Animated.View>

                <Animated.View style={[splashStyles.taglineContainer, taglineAnimatedStyle]}>
                    <Text style={splashStyles.taglineText}>
                        Thiên đường mua sắm dành cho thú cưng
                    </Text>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
