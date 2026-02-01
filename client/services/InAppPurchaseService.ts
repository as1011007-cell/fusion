import { Platform } from "react-native";

export const PRODUCT_IDS = {
  STAR_POINTS_5000: "com.feudfusion.starpoints5000",
  AD_FREE: "com.feudfusion.adfree",
  SUPPORT_DEVELOPER: "com.feudfusion.support",
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

interface IAPItemDetails {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

class InAppPurchaseService {
  private isConnected = false;
  private products: IAPItemDetails[] = [];

  isAvailable(): boolean {
    // In-app purchases removed - always return false
    return false;
  }

  getStoreName(): string {
    return Platform.OS === "ios" ? "App Store" : "Play Store";
  }

  async connect(): Promise<boolean> {
    console.log("In-app purchases not available");
    return false;
  }

  async loadProducts(): Promise<IAPItemDetails[]> {
    return [];
  }

  getProduct(productId: ProductId): IAPItemDetails | undefined {
    return undefined;
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    return {
      success: false,
      error: "In-app purchases not available",
    };
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    return [{ success: false, error: "In-app purchases not available" }];
  }

  async disconnect(): Promise<void> {
    // No-op
  }
}

export const inAppPurchaseService = new InAppPurchaseService();

// Keep backward compatibility with old import name
export const storeKitService = inAppPurchaseService;
