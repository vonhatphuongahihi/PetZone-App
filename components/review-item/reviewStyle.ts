import { StyleSheet } from 'react-native';

export const reviewStyle = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 6,
    borderBottomColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  userInfo: {
    marginLeft: 12,
    flex: 1,
  },

  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },

  date: {
    fontSize: 13,
    color: '#888',
  },

  content: {
    fontSize: 14.5,
    color: '#444',
    lineHeight: 22,
    marginTop: 8,
  },

  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  // Form trả lời của chủ shop
  replyForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },

  replyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FBBC05',
    marginBottom: 10,
  },

  replyInput: {
    borderWidth: 1,
    borderColor: '#FBBC05',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
  },

  replyButton: {
    marginTop: 12,
    backgroundColor: '#FBBC05',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  replyButtonDisabled: {
    backgroundColor: '#ccc',
  },

  replyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Reply đã gửi
  sellerReplyBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },

  sellerReplyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 6,
  },

  sellerReplyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },

  sellerReplyDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
});