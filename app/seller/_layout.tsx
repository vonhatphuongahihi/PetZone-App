import { Stack } from 'expo-router';

export default function SellerLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="products" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="shopAddCategories" />
            <Stack.Screen name="shopAddProduct" />
            <Stack.Screen name="shopCategories" />
            <Stack.Screen name="shopProductList" />
        </Stack>
    );
}
