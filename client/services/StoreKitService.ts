import { Platform, Alert } from "react-native";
import * as InAppPurchases from "expo-in-app-purchases";

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

class StoreKitService {
  private isConnected = false;
  private products: InAppPurchases.IAPItemDetails[] = [];
  private purchaseListenerSet = false;
  private pendingPurchaseResolve: ((result: PurchaseResult) => void) | null = null;

  isAvailable(): boolean {
    return Platform.OS === "ios";
  }

  async connect(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log("StoreKit is only available on iOS");
      return false;
    }

    if (this.isConnected) {
      return true;
    }

    try {
      await InAppPurchases.connectAsync();
      this.isConnected = true;
      this.setupPurchaseListener();
      console.log("StoreKit connected successfully");
      return true;
    } catch (error) {
      console.error("Failed to connect to StoreKit:", error);
      return false;
    }
  }

  private setupPurchaseListener() {
    InAppPurchases.setPurchaseListener(
      ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results?.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              await InAppPurchases.finishTransactionAsync(purchase, true);
            }
            
            if (this.pendingPurchaseResolve) {
              this.pendingPurchaseResolve({
                success: true,
                productId: purchase.productId,
              });
              this.pendingPurchaseResolve = null;
            }
          });
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          if (this.pendingPurchaseResolve) {
            this.pendingPurchaseResolve({
              success: false,
              error: "Purchase was cancelled",
            });
            this.pendingPurchaseResolve = null;
          }
        } else {
          if (this.pendingPurchaseResolve) {
            this.pendingPurchaseResolve({
              success: false,
              error: `Purchase failed with code: ${errorCode}`,
            });
            this.pendingPurchaseResolve = null;
          }
        }
      }
    );
  }

  async loadProducts(): Promise<InAppPurchases.IAPItemDetails[]> {
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) return [];
    }

    try {
      const productIds = Object.values(PRODUCT_IDS);
      const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        this.products = results;
        console.log("Loaded products:", results.map(p => p.productId));
        return results;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to load products:", error);
      return [];
    }
  }

  getProduct(productId: ProductId): InAppPurchases.IAPItemDetails | undefined {
    return this.products.find((p) => p.productId === productId);
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        return {
          success: false,
          error: "Could not connect to App Store",
        };
      }
    }

    try {
      return new Promise((resolve) => {
        this.pendingPurchaseResolve = resolve;
        
        InAppPurchases.purchaseItemAsync(productId).catch((error) => {
          resolve({
            success: false,
            error: error.message || "Purchase failed",
          });
          this.pendingPurchaseResolve = null;
        });
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Purchase failed",
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        return [{ success: false, error: "Could not connect to App Store" }];
      }
    }

    try {
      const { results, responseCode } = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        return results.map((purchase) => ({
          success: true,
          productId: purchase.productId,
        }));
      }
      
      return [];
    } catch (error: any) {
      return [{ success: false, error: error.message || "Restore failed" }];
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await InAppPurchases.disconnectAsync();
        this.isConnected = false;
        this.purchaseListenerSet = false;
        console.log("StoreKit disconnected");
      } catch (error) {
        console.error("Failed to disconnect from StoreKit:", error);
      }
    }
  }
}

export const storeKitService = new StoreKitService();
