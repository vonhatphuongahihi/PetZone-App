import { StyleSheet } from 'react-native';

export const notificationStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A202C',
        flex: 1,
        textAlign: 'center',
    },
    markAllReadText: {
        fontSize: 14,
        color: '#FBBC05',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'flex-start',
    },
    notificationItemUnread: {
        backgroundColor: '#FFFBF0',
        borderLeftWidth: 3,
        borderLeftColor: '#FBBC05',
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF9E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 4,
    },
    notificationTitleUnread: {
        fontWeight: '700',
        color: '#2D3748',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#718096',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FBBC05',
        marginTop: 4,
    },
    deleteButton: {
        padding: 4,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#718096',
        marginTop: 16,
    },
});

