import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const splashStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 2,
    },
    topSection: {
        flex: 0.3,
        position: 'relative',
    },
    bubbleLeft: {
        position: 'absolute',
        top: -10,
        left: 0,
        width: 270,
        height: 216,
    },
    bubbleRight: {
        position: 'absolute',
        top: -5,
        right: 0,
        width: 216,
        height: 180,
    },
    dogFeet: {
        position: 'absolute',
        top: 45,
        right: 20,
        width: 50,
        height: 50,
    },
    middleSection: {
        flex: 0.5,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    splashAnimals: {
        width: width * 0.9,
        height: height * 0.4,
        maxWidth: 600,
        maxHeight: 500,
    },
    bottomSection: {
        flex: 0.2,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    logoContainer: {
        marginBottom: 10,
    },
    logoImage: {
        width: 250,
        height: 80,
    },
    taglineContainer: {
        alignItems: 'center',
    },
    taglineText: {
        fontSize: 14,
        color: '#424242',
        textAlign: 'center',
        fontWeight: '500',
        fontFamily: 'Roboto',
    }
});
