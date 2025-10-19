import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesIcon } from '../../assets/svg/CategoriesIcon';
import { HomeIcon } from '../../assets/svg/HomeIcon';
import { MessagesIcon } from '../../assets/svg/MessagesIcon';
import { ProfileUserIcon } from '../../assets/svg/ProfileUserIcon';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FBBC05',
                tabBarInactiveTintColor: '#8D93A5',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 6,
                    marginTop: -23,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="categories"
                options={{
                    title: 'Danh mục',
                    tabBarIcon: ({ color }) => <CategoriesIcon color={color} size={22} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Nhắn tin',
                    tabBarIcon: ({ color }) => <MessagesIcon color={color} size={28} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tôi',
                    tabBarIcon: ({ color }) => <ProfileUserIcon color={color} size={28} />,
                }}
            />
        </Tabs>
    );
}
