import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wallet, ArrowLeft, TrendingUp, History, Send, Receive } from "lucide-react"
import { useWalletBalance } from "@/hooks/useApi"
import { Loader2 } from "lucide-react"

export default function WalletPage() {
  const { data: walletData, loading: walletLoading, error: walletError } = useWalletBalance("student-123")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Proof-of-Knowledge Wallet</h1>
          </div>

          {walletLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : walletError ? (
            <div className="text-destructive">Error loading wallet: {walletError.message}</div>
          ) : walletData ? (
            <>
              <div className="mb-8">
                <div className="text-sm text-muted-foreground mb-2">Total Balance</div>
                <div className="text-5xl font-bold text-primary">
                  {walletData.balance.toFixed(2)} {walletData.currency}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className={`h-4 w-4 ${walletData.change >= 0 ? 'text-success' : 'text-destructive'}`} />
                  <span className={`text-sm ${walletData.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {walletData.change >= 0 ? '+' : ''}{walletData.change.toFixed(2)} ({walletData.changePercent >= 0 ? '+' : ''}{walletData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button className="w-full" variant="outline">
                  <Receive className="mr-2 h-4 w-4" />
                  Receive
                </Button>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                <div className="text-sm text-muted-foreground">Transaction history will appear here</div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">No wallet data available</div>
          )}
        </Card>
      </div>
    </div>
  )
}
