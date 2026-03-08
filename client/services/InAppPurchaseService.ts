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

const ANDROID_PURCHASE_STATE_PURCHASED = 1;
const ANDROID_PURCHASE_STATE_PENDING = 2;

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
  private purchaseTimeout: ReturnType<typeof setTimeout> | null = null;

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

  private clearPurchaseTimeout(): void {
    if (this.purchaseTimeout) {
      clearTimeout(this.purchaseTimeout);
      this.purchaseTimeout = null;
    }
  }

  private resolvePurchase(result: PurchaseResult): void {
    this.clearPurchaseTimeout();
    if (this.pendingPurchaseResolve) {
      this.pendingPurchaseResolve(result);
      this.pendingPurchaseResolve = null;
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
        console.log(
          "Purchase updated:",
          purchase?.productId,
          "state:",
          purchase?.purchaseStateAndroid
        );

        if (Platform.OS === "android") {
          if (
            purchase?.purchaseStateAndroid === ANDROID_PURCHASE_STATE_PENDING
          ) {
            console.log(
              "Purchase is pending (deferred payment):",
              purchase?.productId
            );
            this.resolvePurchase({
              success: false,
              productId: purchase?.productId,
              error:
                "Your purchase is pending. You'll receive your items once the payment is confirmed.",
            });
            return;
          }
        }

        const receipt =
          purchase?.transactionReceipt || purchase?.purchaseToken;

        if (receipt) {
          try {
            if (Platform.OS === "android") {
              if (purchase?.purchaseToken) {
                const isConsumable =
                  purchase?.productId === PRODUCT_IDS.STAR_POINTS_5000;
                await RNIap.finishTransaction({
                  purchase,
                  isConsumable,
                });
                console.log(
                  `Android transaction ${isConsumable ? "consumed" : "acknowledged"} for:`,
                  purchase.productId
                );
              }
            } else {
              await RNIap.finishTransaction({
                purchase,
                isConsumable: false,
              });
              console.log("iOS transaction finished for:", purchase.productId);
            }

            this.resolvePurchase({
              success: true,
              productId: purchase?.productId,
            });
          } catch (finishError: any) {
            console.error("Error finishing transaction:", finishError);
            this.resolvePurchase({
              success: false,
              productId: purchase?.productId,
              error:
                "Purchase could not be confirmed with the store. Please try again or contact support.",
            });
          }
        } else {
          this.resolvePurchase({
            success: false,
            error: "No receipt received from the store. Please try again.",
          });
        }
      }
    );

    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: any) => {
        console.log("Purchase error:", error?.code, error?.message);
        const isCancelled =
          error?.code === "E_USER_CANCELLED" ||
          error?.responseCode === 1 ||
          error?.message?.toLowerCase()?.includes("cancel");
        this.resolvePurchase({
          success: false,
          error: isCancelled
            ? "Purchase was cancelled"
            : error?.message || "Purchase failed",
        });
      }
    );
  }

  private mapProduct(product: any): IAPItemDetails {
    return {
      productId: product.productId,
      title: product.title || product.name || "",
      description: product.description || "",
      price: product.localizedPrice || product.price || "0",
      priceAmountMicros: product.price
        ? Math.round(parseFloat(String(product.price)) * 1000000)
        : 0,
      priceCurrencyCode: product.currency || "USD",
    };
  }

  async loadProducts(): Promise<IAPItemDetails[]> {
    if (!this.connected || !RNIap) {
      return [];
    }

    try {
      const productIds = Object.values(PRODUCT_IDS);
      let allProducts: any[] = [];

      try {
        const products = await RNIap.getProducts({ skus: productIds });
        if (products && products.length > 0) {
          allProducts = [...products];
          console.log(
            `getProducts returned ${products.length} items:`,
            products.map((p: any) => p.productId)
          );
        }
      } catch (e) {
        console.log("getProducts failed:", e);
      }

      const loadedIds = new Set(allProducts.map((p: any) => p.productId));
      const missingIds = productIds.filter((id) => !loadedIds.has(id));

      if (missingIds.length > 0) {
        console.log(
          "Products not found via getProducts, trying getSubscriptions:",
          missingIds
        );
        try {
          const subs = await RNIap.getSubscriptions({ skus: missingIds });
          if (subs && subs.length > 0) {
            allProducts = [...allProducts, ...subs];
            console.log(
              `getSubscriptions returned ${subs.length} items:`,
              subs.map((s: any) => s.productId)
            );
          }
        } catch (e) {
          console.log("getSubscriptions failed:", e);
        }
      }

      if (allProducts.length === 0) {
        console.log(
          "No products returned from store. Verify product IDs are configured in App Store Connect / Google Play Console.",
          "Requested IDs:",
          productIds
        );
        return [];
      }

      this.products = allProducts.map((product: any) => this.mapProduct(product));

      const stillMissing = productIds.filter(
        (id) => !this.products.some((p) => p.productId === id)
      );
      if (stillMissing.length > 0) {
        console.log(
          "WARNING: The following product IDs were not found in the store:",
          stillMissing
        );
      }

      console.log(
        `Loaded ${this.products.length} of ${productIds.length} products from ${this.getStoreName()}`
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

  hasProduct(productId: ProductId): boolean {
    return this.products.some((p) => p.productId === productId);
  }

  hasAnyProducts(): boolean {
    return this.products.length > 0;
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.connected || !RNIap) {
      return {
        success: false,
        error: "Store not connected. Please try again later.",
      };
    }

    if (!this.hasProduct(productId)) {
      return {
        success: false,
        error:
          "This product is currently unavailable. Please try again later.",
      };
    }

    return new Promise(async (resolve) => {
      this.pendingPurchaseResolve = resolve;

      this.clearPurchaseTimeout();
      this.purchaseTimeout = setTimeout(() => {
        if (this.pendingPurchaseResolve === resolve) {
          this.pendingPurchaseResolve = null;
          this.purchaseTimeout = null;
          resolve({ success: false, error: "Purchase timed out" });
        }
      }, 120000);

      try {
        if (Platform.OS === "android") {
          await RNIap.requestPurchase({
            skus: [productId],
          });
        } else {
          await RNIap.requestPurchase({
            sku: productId,
            andDangerouslyFinishTransactionAutomaticallyIOS: false,
          });
        }
      } catch (error: any) {
        if (this.pendingPurchaseResolve === resolve) {
          const isCancelled =
            error?.code === "E_USER_CANCELLED" ||
            error?.message?.toLowerCase()?.includes("cancel");
          this.resolvePurchase({
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
        this.clearPurchaseTimeout();
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
