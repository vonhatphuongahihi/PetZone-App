import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const userHomeStyle = StyleSheet.create({
  /** ================== CONTAINER ================== */
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },

  /** ================== HEADER ================== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  /** ================== SEARCH BAR ================== */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingLeft: 6,
  },
  searchButton: {
    backgroundColor: '#FBBC05',
    marginLeft: 0,
    padding: 8,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  /** ================== BANNER ================== */
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  bannerDog: {
    width: width * 0.92,
    height: width * 0.45,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  /** ================== CATEGORY ================== */
  categoryList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 6,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  categoryTitle: {
    fontSize: 12,
    color: '#5D4037',
    textAlign: 'center',
    fontWeight: '500',
  },

  /** ================== SECTION ================== */
  section: {
    backgroundColor: '#FDE8A5',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 12,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
  },
  seeAll: {
    color: '#FBBC05',
    fontWeight: '600',
    fontSize: 13,
  },

  /** ================== PRODUCT LIST ================== */
  productList: {
    paddingLeft: 16,
    paddingBottom: 10,
  },
  productCard: {
    width: width * 0.44,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  productImage: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FBBC05',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 6,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rating: {
    fontSize: 11,
    color: '#FFA000',
  },
  sold: {
    fontSize: 11,
    color: '#777',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 4,
  },

  /** ================== TOP SHOP ================== */
  topShopList: {
    paddingLeft: 16,
    paddingBottom: 10,
  },
  topShopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 14,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  topShopCover: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  topShopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  topShopAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    marginRight: 10,
  },
  topShopDetails: {
    flex: 1,
  },
  topShopName: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  topShopStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  followersText: {
    fontSize: 8,
    color: '#555',
    marginLeft: 1,
  },
  followBtnModern: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFB300',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  followBtnText: {
    color: '#FFB300',
    fontWeight: '600',
    fontSize: 10,
  },
  following: {
    backgroundColor: '#FFB300',
    borderColor: '#FFB300',
  },
  followingText: {
    color: '#fff',
  },

  /** ================== FOOTER ================== */
  footer: {
    backgroundColor: '#FDE8A5',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#FFECB3',
  },
  footerLogo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  footerSubtitle: {
    textAlign: 'center',
    color: '#5D4037',
    marginTop: 6,
    fontSize: 14,
  },
  footerSectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#5D4037',
    marginBottom: 6,
  },
  footerBlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  footerBlock: {
    flex: 1,
    marginHorizontal: 8,
  },
  footerLink: {
    color: '#5D4037',
    fontSize: 13,
    marginBottom: 4,
  },
  footerContactBlock: {
    alignItems: 'center',
    marginTop: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactIcon: {
    marginRight: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#5D4037',
  },
  copyright: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: '#888',
  },
});
