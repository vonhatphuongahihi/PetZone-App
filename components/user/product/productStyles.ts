import { StyleSheet } from 'react-native';

export const productStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        paddingLeft: 16,
    },
    headerTitle: { fontSize: 16, fontWeight: "600", marginLeft: 16 },
});
