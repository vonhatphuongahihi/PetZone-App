import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
                    headerRight: () => (
                        <TouchableOpacity 
                            onPress={() => router.push('/profile')}
                            style={{ marginRight: 16 }}
                        >
                            <FontAwesome5 name="user" size={24} color="#FBBC05" />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Tabs>
    );
}
