import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    childCard: {
        width: '47%',
        height: 140,
        margin: 4,
        backgroundColor: "#FFFAE8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderColor: "#E2C290",
        borderWidth: 1,
    },
    childImage: {
        width: 60,
        height: 60,
        borderRadius: 30,   
        resizeMode: "cover", 
        marginBottom: 8,
    },

    childText: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
        color: "#333",
    },
});
