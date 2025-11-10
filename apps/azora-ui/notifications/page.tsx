import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation } from "@azora/shared-api/hooks"
import { getAPIClient } from "@azora/shared-api/client"
import { Navigation } from "@/components/navigation"

export default function NotificationsPage() {
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  // TODO: Connect to real notifications API
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "New course available", 
      message: "AI Ethics Framework Design is now available for enrollment", 
      read: false,
      type: "course",
      timestamp: new Date(),
    },
    { 
      id: 2, 
      title: "Assignment graded", 
      message: "Your Module 4 assessment has been graded. Score: 95%", 
      read: false,
      type: "grade",
      timestamp: new Date(Date.now() - 3600000),
    },
    { 
      id: 3, 
      title: "Welcome to Azora!", 
      message: "Thank you for joining Azora Sapiens University", 
      read: true,
      type: "system",
      timestamp: new Date(Date.now() - 86400000),
    },
  ])

  const markAsRead = async (id: number) => {
    setMarkingRead(id.toString())
    try {
      // TODO: Connect to real API
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    } finally {
      setMarkingRead(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      // TODO: Connect to real API
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/notifications" />
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

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 transition-colors ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      disabled={markingRead === notification.id.toString()}
                    >
                      {markingRead === notification.id.toString() ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {notification.read && (
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-1" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
