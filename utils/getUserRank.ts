/**
 * Tính rank của user dựa trên totalSpent
 * @param totalSpent - Tổng số tiền đã chi tiêu
 * @returns Rank của user (Thân thiết, Hạng đồng, Hạng bạc, Hạng vàng)
 */
export function getUserRank(totalSpent: number | null | undefined): string {
  const spent = totalSpent || 0;

  if (spent >= 500001) {
    return 'Hạng vàng';
  } else if (spent >= 300100) {
    return 'Hạng bạc';
  } else if (spent >= 100100) {
    return 'Hạng đồng';
  } else {
    return 'Thân thiết';
  }
}
