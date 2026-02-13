import { Platform } from "react-native";
import Constants from "expo-constants";

export const PRODUCT_IDS = {
  STAR_POINTS_5000: "com.feudfusion.starpoints",
  AD_FREE: "com.feudfusion.adsfree",
  SUPPORT_DEVELOPER: "com.feudfusion.supportus",
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

export interface IAPItemDetails {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

const isExpoGo = Constants.appOwnership === "expo";
const isNative = Platform.OS === "ios" || Platform.OS === "android";

let RNIap: any = null;

if (isNative && !isExpoGo) {
  try {
    RNIap = require("react-native-iap");
  } catch (e) {
    console.log("react-native-iap not available:", e);
  }
}

class InAppPurchaseService {
  private connected = false;
  private products: IAPItemDetails[] = [];
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private pendingPurchaseResolve: ((result: PurchaseResult) => void) | null =
    null;

  isAvailable(): boolean {
    return isNative && !isExpoGo && RNIap !== null;
  }

  getStoreName(): string {
    return Platform.OS === "ios" ? "App Store" : "Play Store";
  }

  async connect(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log("In-app purchases not available (Expo Go or web)");
      return false;
    }

    if (this.connected) {
      return true;
    }

    try {
      const result = await RNIap.initConnection();
      console.log("IAP connection result:", result);
      this.connected = true;

      if (Platform.OS === "android") {
        try {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        } catch (e) {
          console.log("No failed purchases to flush");
        }
      }

      this.setupListeners();
      console.log(`Connected to ${this.getStoreName()}`);
      return true;
    } catch (error) {
      console.error("Failed to connect to store:", error);
      return false;
    }
  }

  private setupListeners(): void {
    if (!RNIap) return;

    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
      }
    } catch (e) {
      console.log("Error removing old listeners:", e);
    }

    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase: any) => {
        console.log("Purchase updated:", purchase?.productId);
        const receipt =
          purchase?.transactionReceipt || purchase?.purchaseToken;

        if (receipt) {
          try {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log("Transaction finished for:", purchase.productId);
          } catch (finishError) {
            console.error("Error finishing transaction:", finishError);
          }
        }

        if (this.pendingPurchaseResolve) {
          this.pendingPurchaseResolve({
            success: true,
            productId: purchase?.productId,
          });
          this.pendingPurchaseResolve = null;
        }
      }
    );

    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: any) => {
        console.log("Purchase error:", error?.code, error?.message);
        if (this.pendingPurchaseResolve) {
          const isCancelled =
            error?.code === "E_USER_CANCELLED" ||
            error?.code === "E_ITEM_UNAVAILABLE" ||
            error?.responseCode === 1 ||
            error?.message?.toLowerCase()?.includes("cancel");
          this.pendingPurchaseResolve({
            success: false,
            error: isCancelled
              ? "Purchase was cancelled"
              : error?.message || "Purchase failed",
          });
          this.pendingPurchaseResolve = null;
        }
      }
    );
  }

  async loadProducts(): Promise<IAPItemDetails[]> {
    if (!this.connected || !RNIap) {
      return [];
    }

    try {
      const productIds = Object.values(PRODUCT_IDS);
      const products = await RNIap.getProducts({ skus: productIds });

      if (!products || products.length === 0) {
        console.log(
          "No products returned from store. Verify product IDs are configured in App Store Connect / Google Play Console."
        );
        return [];
      }

      this.products = products.map((product: any) => ({
        productId: product.productId,
        title: product.title || product.name || "",
        description: product.description || "",
        price: product.localizedPrice || product.price || "0",
        priceAmountMicros: product.price
          ? Math.round(parseFloat(String(product.price)) * 1000000)
          : 0,
        priceCurrencyCode: product.currency || "USD",
      }));
      console.log(
        `Loaded ${this.products.length} products from ${this.getStoreName()}`
      );
      return this.products;
    } catch (error) {
      console.error("Failed to load products:", error);
      return [];
    }
  }

  getProduct(productId: ProductId): IAPItemDetails | undefined {
    return this.products.find((p) => p.productId === productId);
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.connected || !RNIap) {
      return {
        success: false,
        error: "Store not connected",
      };
    }

    return new Promise(async (resolve) => {
      this.pendingPurchaseResolve = resolve;

      const timeout = setTimeout(() => {
        if (this.pendingPurchaseResolve === resolve) {
          this.pendingPurchaseResolve = null;
          resolve({ success: false, error: "Purchase timed out" });
        }
      }, 120000);

      try {
        if (Platform.OS === "ios") {
          await RNIap.requestPurchase({ sku: productId });
        } else {
          await RNIap.requestPurchase({ skus: [productId] });
        }
      } catch (error: any) {
        clearTimeout(timeout);
        if (this.pendingPurchaseResolve === resolve) {
          this.pendingPurchaseResolve = null;
          const isCancelled =
            error?.code === "E_USER_CANCELLED" ||
            error?.message?.toLowerCase()?.includes("cancel");
          resolve({
            success: false,
            error: isCancelled
              ? "Purchase was cancelled"
              : error?.message || "Purchase failed",
          });
        }
      }
    });
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.connected || !RNIap) {
      return [{ success: false, error: "Store not connected" }];
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();

      if (purchases && purchases.length > 0) {
        return purchases.map((purchase: any) => ({
          success: true,
          productId: purchase.productId,
        }));
      }

      return [{ success: false, error: "No purchases to restore" }];
    } catch (error: any) {
      return [{ success: false, error: error?.message || "Restore failed" }];
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected && RNIap) {
      try {
        if (this.purchaseUpdateSubscription) {
          this.purchaseUpdateSubscription.remove();
          this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
          this.purchaseErrorSubscription.remove();
          this.purchaseErrorSubscription = null;
        }
        await RNIap.endConnection();
        this.connected = false;
        console.log("Disconnected from store");
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }
  }
}

export const inAppPurchaseService = new InAppPurchaseService();
export const storeKitService = inAppPurchaseService;
