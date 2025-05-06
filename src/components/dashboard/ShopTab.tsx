import MedicineShop from "./MedicineShop";
import MedicineOrderHistory from "./MedicineOrderHistory";

export default function ShopTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Medicine Shop</h2>
        <p className="text-muted-foreground">
          Order your prescribed medicines securely with prescription verification.
        </p>
      </div>

      <div className="grid gap-6">
        <MedicineShop />
        <MedicineOrderHistory />
      </div>
    </div>
  );
} 