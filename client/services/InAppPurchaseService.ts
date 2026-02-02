import { Platform } from "react-native";
import Constants from "expo-constants";

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

const isExpoGo = Constants.appOwnership === 'expo';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

let IAPModule: any = null;

if (isNative && !isExpoGo) {
  try {
    IAPModule = require('expo-in-app-purchases');
  } catch (e) {
    console.log('expo-in-app-purchases not available');
  }
}

class InAppPurchaseService {
  private isConnected = false;
  private products: IAPItemDetails[] = [];
  private purchaseListener: any = null;

  isAvailable(): boolean {
    return isNative && !isExpoGo && IAPModule !== null;
  }

  getStoreName(): string {
    return Platform.OS === "ios" ? "App Store" : "Play Store";
  }

  async connect(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log("In-app purchases not available (Expo Go or web)");
      return false;
    }

    try {
      await IAPModule.connectAsync();
      this.isConnected = true;
      console.log(`Connected to ${this.getStoreName()}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to store:", error);
      return false;
    }
  }

  async loadProducts(): Promise<IAPItemDetails[]> {
    if (!this.isConnected || !IAPModule) {
      return [];
    }

    try {
      const productIds = Object.values(PRODUCT_IDS);
      const { responseCode, results } = await IAPModule.getProductsAsync(productIds);
      
      if (responseCode === IAPModule.IAPResponseCode.OK && results) {
        this.products = results.map((product: any) => ({
          productId: product.productId,
          title: product.title,
          description: product.description,
          price: product.price,
          priceAmountMicros: product.priceAmountMicros || 0,
          priceCurrencyCode: product.priceCurrencyCode || 'USD',
        }));
        console.log(`Loaded ${this.products.length} products`);
        return this.products;
      }
      return [];
    } catch (error) {
      console.error("Failed to load products:", error);
      return [];
    }
  }

  getProduct(productId: ProductId): IAPItemDetails | undefined {
    return this.products.find(p => p.productId === productId);
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isConnected || !IAPModule) {
      return {
        success: false,
        error: "Store not connected",
      };
    }

    return new Promise(async (resolve) => {
      try {
        this.purchaseListener = IAPModule.setPurchaseListener(({ responseCode, results, errorCode }: any) => {
          if (responseCode === IAPModule.IAPResponseCode.OK) {
            const purchase = results?.find((r: any) => r.productId === productId);
            if (purchase) {
              IAPModule.finishTransactionAsync(purchase, true);
              resolve({
                success: true,
                productId: purchase.productId,
              });
            }
          } else if (responseCode === IAPModule.IAPResponseCode.USER_CANCELED) {
            resolve({
              success: false,
              error: "Purchase was cancelled",
            });
          } else {
            resolve({
              success: false,
              error: `Purchase failed with code: ${errorCode || responseCode}`,
            });
          }
        });

        await IAPModule.purchaseItemAsync(productId);
      } catch (error: any) {
        resolve({
          success: false,
          error: error.message || "Purchase failed",
        });
      }
    });
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isConnected || !IAPModule) {
      return [{ success: false, error: "Store not connected" }];
    }

    return new Promise(async (resolve) => {
      try {
        this.purchaseListener = IAPModule.setPurchaseListener(({ responseCode, results }: any) => {
          if (responseCode === IAPModule.IAPResponseCode.OK && results) {
            const restored = results.map((purchase: any) => {
              IAPModule.finishTransactionAsync(purchase, true);
              return {
                success: true,
                productId: purchase.productId,
              };
            });
            resolve(restored.length > 0 ? restored : [{ success: false, error: "No purchases to restore" }]);
          } else {
            resolve([{ success: false, error: "Restore failed" }]);
          }
        });

        const history = await IAPModule.getPurchaseHistoryAsync();
        if (!history || history.results?.length === 0) {
          resolve([{ success: false, error: "No purchase history found" }]);
        }
      } catch (error: any) {
        resolve([{ success: false, error: error.message || "Restore failed" }]);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && IAPModule) {
      try {
        await IAPModule.disconnectAsync();
        this.isConnected = false;
        console.log("Disconnected from store");
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }
  }
}

export const inAppPurchaseService = new InAppPurchaseService();
export const storeKitService = inAppPurchaseService;
