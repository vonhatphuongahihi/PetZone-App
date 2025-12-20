import { StyleSheet } from 'react-native';

export const notificationStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginLeft: 'auto',
    },
    actionButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    markAllReadText: {
        fontSize: 14,
        color: '#FBBC05',
        fontWeight: '600',
    },
    clearAllText: {
        fontSize: 14,
        color: '#E53935',
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

