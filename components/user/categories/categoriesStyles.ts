import { Dimensions, StyleSheet } from 'react-native';
const { width } = Dimensions.get('window');

const gap = 12;

export const categoriesStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },

    // Header với mũi tên quay lại
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },

    // Danh mục con
    childContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    childCard: {
        width: (width - 32 - gap) / 2, // 32 = padding container 16*2
        backgroundColor: "#FFFAE8",
        borderRadius: 10,
        borderColor: "#E2C290",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    childImage: {
        width: 80,
        height: 80,
        resizeMode: "cover", 
        marginBottom: 8,
        borderRadius: 40,     
    },
    childText: {
        fontSize: 15,
        fontWeight: "500",
        textAlign: "center",
    },
});
