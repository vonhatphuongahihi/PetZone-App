import NotificationScreen from "@/components/user/notifications/NotificationScreen";
import { Stack } from "expo-router";

export default function NotificationsPage() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <NotificationScreen />
        </>
    );
}

