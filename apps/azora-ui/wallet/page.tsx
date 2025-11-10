import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, ArrowLeft, TrendingUp, History, Send, Receive, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useWalletBalance } from "@/hooks/useApi"
import { useState } from "react"
import { useMutation } from "@azora/shared-api/hooks"
import { getAPIClient } from "@azora/shared-api/client"
import { Navigation } from "@/components/navigation"

export default function WalletPage() {
  const { data: walletData, loading: walletLoading, error: walletError } = useWalletBalance("student-123")
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [sendLoading, setSendLoading] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const sendMutation = useMutation(async (client, variables: { amount: string; address: string }) => {
    // TODO: Connect to real wallet service
    return { success: true, txHash: "0x" + Math.random().toString(16).substr(2, 64) }
  })

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) return
    setSendLoading(true)
    try {
      await sendMutation.mutate({ amount: sendAmount, address: sendAddress })
      setSendSuccess(true)
      setTimeout(() => {
        setSendDialogOpen(false)
        setSendSuccess(false)
        setSendAmount("")
        setSendAddress("")
      }, 2000)
    } catch (error) {
      console.error("Send failed:", error)
    } finally {
      setSendLoading(false)
    }
  }

  // Mock transaction history - TODO: Connect to real API
  const transactions = [
    { id: 1, type: "earned", amount: 25.50, description: "Completed Module 4", date: new Date(), status: "completed" },
    { id: 2, type: "earned", amount: 15.00, description: "Assignment graded", date: new Date(Date.now() - 86400000), status: "completed" },
    { id: 3, type: "spent", amount: -10.00, description: "Course enrollment", date: new Date(Date.now() - 172800000), status: "completed" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/wallet" />
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

        <Card className="p-6 mb-6">
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
                <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send {walletData.currency}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Recipient Address</Label>
                        <Input
                          id="address"
                          placeholder="0x..."
                          value={sendAddress}
                          onChange={(e) => setSendAddress(e.target.value)}
                        />
                      </div>
                      {sendSuccess ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span>Transaction sent successfully!</span>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={handleSend}
                          disabled={sendLoading || !sendAmount || !sendAddress}
                        >
                          {sendLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send"
                          )}
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Receive className="mr-2 h-4 w-4" />
                      Receive
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Receive {walletData.currency}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Your Wallet Address</Label>
                        <div className="p-3 bg-secondary rounded-md font-mono text-sm break-all">
                          0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
                        }}
                      >
                        Copy Address
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Transaction History</h2>
                </div>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{tx.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`font-bold ${tx.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                        {tx.type === 'earned' ? '+' : ''}{tx.amount.toFixed(2)} {walletData.currency}
                      </div>
                      {tx.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-success ml-2" />
                      )}
                    </div>
                  ))}
                </div>
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
