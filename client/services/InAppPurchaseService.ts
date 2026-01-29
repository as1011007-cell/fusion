import { Platform } from "react-native";

let InAppPurchases: any = null;

// Load in-app purchases for both iOS and Android
if (Platform.OS === "ios" || Platform.OS === "android") {
  try {
    InAppPurchases = require("expo-in-app-purchases");
  } catch (e) {
    console.log("expo-in-app-purchases not available (development mode)");
  }
}

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
  private purchaseListenerSet = false;
  private pendingPurchaseResolve: ((result: PurchaseResult) => void) | null = null;

  isAvailable(): boolean {
    return (Platform.OS === "ios" || Platform.OS === "android") && InAppPurchases !== null;
  }

  getStoreName(): string {
    return Platform.OS === "ios" ? "App Store" : "Play Store";
  }

  async connect(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log("In-app purchases only available on iOS/Android with native modules");
      return false;
    }

    if (this.isConnected) {
      return true;
    }

    try {
      await InAppPurchases.connectAsync();
      this.isConnected = true;
      this.setupPurchaseListener();
      console.log(`Connected to ${this.getStoreName()} successfully`);
      return true;
    } catch (error) {
      console.log(`Failed to connect to ${this.getStoreName()} (expected in development):`, error);
      return false;
    }
  }

  private setupPurchaseListener() {
    if (!InAppPurchases) return;
    
    InAppPurchases.setPurchaseListener(
      ({ responseCode, results, errorCode }: any) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results?.forEach(async (purchase: any) => {
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

  async loadProducts(): Promise<IAPItemDetails[]> {
    if (!InAppPurchases) return [];
    
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) return [];
    }

    try {
      const productIds = Object.values(PRODUCT_IDS);
      const { results, responseCode } = await InAppPurchases.getProductsAsync(productIds);
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        this.products = results;
        console.log("Loaded products:", results.map((p: any) => p.productId));
        return results;
      }
      
      return [];
    } catch (error) {
      console.log("Failed to load products (expected in development):", error);
      return [];
    }
  }

  getProduct(productId: ProductId): IAPItemDetails | undefined {
    return this.products.find((p) => p.productId === productId);
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!InAppPurchases) {
      return {
        success: false,
        error: "In-app purchases not available",
      };
    }
    
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        return {
          success: false,
          error: `Could not connect to ${this.getStoreName()}`,
        };
      }
    }

    // Ensure products are loaded before purchase (store requirement)
    if (this.products.length === 0) {
      await this.loadProducts();
    }

    // Verify the product exists in our loaded products
    const product = this.products.find((p) => p.productId === productId);
    if (!product) {
      return {
        success: false,
        error: "Product not available. Please try again later.",
      };
    }

    try {
      return new Promise((resolve) => {
        this.pendingPurchaseResolve = resolve;
        
        InAppPurchases.purchaseItemAsync(productId).catch((error: any) => {
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
    if (!InAppPurchases) {
      return [{ success: false, error: "In-app purchases not available" }];
    }
    
    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        return [{ success: false, error: `Could not connect to ${this.getStoreName()}` }];
      }
    }

    try {
      const { results, responseCode } = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        return results.map((purchase: any) => ({
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
    if (!InAppPurchases) return;
    
    if (this.isConnected) {
      try {
        await InAppPurchases.disconnectAsync();
        this.isConnected = false;
        this.purchaseListenerSet = false;
        console.log(`Disconnected from ${this.getStoreName()}`);
      } catch (error) {
        console.log(`Failed to disconnect from ${this.getStoreName()}:`, error);
      }
    }
  }
}

export const inAppPurchaseService = new InAppPurchaseService();

// Keep backward compatibility with old import name
export const storeKitService = inAppPurchaseService;
