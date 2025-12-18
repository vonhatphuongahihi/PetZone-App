import { StyleSheet } from 'react-native';

export const userInfoStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Màu nền hiện đại hơn
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        // Loại bỏ shadow, dùng border nhẹ để ngăn cách
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#F7FAFC',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748',
        textAlign: 'center',
        marginRight: 40,
    },

    scrollView: {
        flex: 1,
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
        marginBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        // Không shadow
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120, // Tăng kích thước nhẹ
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EDF2F7',
        borderWidth: 4,
        borderColor: '#FFFFFF', // Viền trắng tạo tách biệt
        // Không shadow
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFB400',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        zIndex: 10,
        // Không shadow
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFB400',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        // Không shadow
    },

    // Typography (Profile Info)
    usernameText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3182CE', // Màu xanh dịu hơn
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
    memberSinceText: {
        fontSize: 13,
        color: '#718096',
        marginTop: 10,
    },

    // Form Section
    formSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 30,
        // Không shadow, dùng border nhẹ nếu cần hoặc để phẳng
        borderWidth: 1,
        borderColor: '#F7FAFC',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
        lineHeight: 20,
    },

    // Input Fields
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#2D3748',
        minHeight: 52,
    },
    disabledInput: {
        backgroundColor: '#F7FAFC',
        borderColor: '#EDF2F7',
        color: '#A0AEC0',
    },
    inputFocused: {
        borderColor: '#FFB400',
        backgroundColor: '#FFF',
    },

    // Status Badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FFF4', // Xanh lá rất nhạt
        borderColor: '#C6F6D5',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    statusBadgeInactive: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FED7D7',
    },
    statusText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2F855A',
        marginLeft: 8,
    },
    statusTextInactive: {
        color: '#C53030',
    },

    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
        gap: 16,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        // Không shadow
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#718096',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#FFB400',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        // Không shadow
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: '#CBD5E0',
    },

    // Loading & Error
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    loadingText: {
        marginTop: 12,
        color: '#718096',
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 24,
    },
    errorText: {
        color: '#E53E3E',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: '#FFB400',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Custom Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imagePickerModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        // Không shadow
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        width: '100%',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        backgroundColor: '#FFFBF0', // Vàng rất nhạt
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEEBC8',
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#D69E2E',
        marginTop: 10,
    },
    modalCancelButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        width: '100%',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#A0AEC0',
    },

    // Success Modal
    successModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
        // Không shadow
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D3748',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    successButton: {
        backgroundColor: '#38A169',
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 40,
        minWidth: 120,
        alignItems: 'center',
    },
    successButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});