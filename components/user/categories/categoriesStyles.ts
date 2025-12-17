import { StyleSheet } from 'react-native';

export const categoriesStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        paddingLeft: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 16,
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    categoryContainer: {
        paddingTop: 6,
    },
    categorySection: {
        marginBottom: 16,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    categoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        resizeMode: "contain",
        marginRight: 10,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FBBC05",
    },
    childContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    childCard: {
        width: "47%",
        backgroundColor: "#FFFAE8",
        borderRadius: 10,
        borderColor: "#E2C290",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignItems: "center"
    },
    childImage: {
        width: 80,
        height: 80,
        resizeMode: "contain",
        marginBottom: 8,
    },
    childText: {
        fontSize: 15,
        fontWeight: "500",
    },
});