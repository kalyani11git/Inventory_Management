export enum ProductStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
}

export const LOW_STOCK_LIMIT = 10;

export function getStockStatus(quantity: number): ProductStatus {
  if (quantity <= 0) {
    return ProductStatus.OUT_OF_STOCK;
  }
  if (quantity <= LOW_STOCK_LIMIT) {
    return ProductStatus.LOW_STOCK;
  }
  return ProductStatus.IN_STOCK;
}
