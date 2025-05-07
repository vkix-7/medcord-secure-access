
import { useState } from "react";
import MedicineShop from "./MedicineShop";
import MedicineOrderHistory from "./MedicineOrderHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShopTab() {
  const [balance, setBalance] = useState("10241.98");
  const [amount, setAmount] = useState("");

  const handleAddBalance = () => {
    if (amount && !isNaN(Number(amount))) {
      const newBalance = (Number(balance) + Number(amount)).toFixed(2);
      setBalance(newBalance);
      setAmount("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Medicine Shop</h2>
        <p className="text-muted-foreground">
          Order your prescribed medicines securely with prescription verification.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">${balance}</div>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  placeholder="Add funds" 
                  className="w-32"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button 
                  onClick={handleAddBalance}
                  className="bg-green-500 hover:bg-green-600"
                >
                  GO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Patient Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>
              <div className="mt-4 h-[100px] flex items-center justify-center">
                <p className="text-muted-foreground">Patient statistics will be displayed here.</p>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <MedicineShop />
      <MedicineOrderHistory />
    </div>
  );
} 
