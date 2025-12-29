'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Key, 
  Brain, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sparkles,
  Zap
} from 'lucide-react'

interface APIKeyConfig {
  openai?: string
  anthropic?: string
  elevenlabs?: string
}

interface AzoraPilotStatus {
  status: 'connected' | 'disconnected' | 'checking'
  url: string
  modelLoaded: boolean
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [useAzoraPilot, setUseAzoraPilot] = useState(true)
  const [azoraPilotUrl, setAzoraPilotUrl] = useState('http://localhost:8000')
  const [pilotStatus, setPilotStatus] = useState<AzoraPilotStatus>({
    status: 'checking',
    url: 'http://localhost:8000',
    modelLoaded: false
  })
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { status: string; message: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const testApiKey = async (provider: string, apiKey: string) => {
    if (!apiKey) return

    setTestingKeys(prev => ({ ...prev, [provider]: true }))
    setTestResults(prev => ({ ...prev, [provider]: { status: 'testing', message: 'Testing connection...' } }))

    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey
        })
      })

      const data = await response.json()

      if (data.success) {
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            status: data.data.status,
            message: data.data.message
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            status: 'error',
            message: data.error || 'Test failed'
          }
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Test failed'
        }
      }))
    } finally {
      setTestingKeys(prev => ({ ...prev, [provider]: false }))
    }
  }

  useEffect(() => {
    loadSettings()
    checkAzoraPilotStatus()
  }, [])

  const loadSettings = async () => {
    try {
      // Load from localStorage (in production, this would be secure server storage)
      const saved = localStorage.getItem('azora-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        setApiKeys(settings.apiKeys || {})
        setUseAzoraPilot(settings.useAzoraPilot ?? true)
        setAzoraPilotUrl(settings.azoraPilotUrl || 'http://localhost:8000')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const checkAzoraPilotStatus = async () => {
    try {
      setPilotStatus(prev => ({ ...prev, status: 'checking' }))
      const response = await fetch(`/api/ai-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'azora-pilot',
          url: azoraPilotUrl
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setPilotStatus({
          status: data.data.status === 'success' ? 'connected' : 'disconnected',
          url: azoraPilotUrl,
          modelLoaded: data.data.status === 'success'
        })
      } else {
        setPilotStatus({
          status: 'disconnected',
          url: azoraPilotUrl,
          modelLoaded: false
        })
      }
    } catch (error) {
      setPilotStatus({
        status: 'disconnected',
        url: azoraPilotUrl,
        modelLoaded: false
      })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      const settings = {
        apiKeys,
        useAzoraPilot,
        azoraPilotUrl,
        constitutionalSettings: {
          truthScoreThreshold: 95,
          complianceThreshold: 95,
          enableToolExecution: false,
          toolRateLimit: 5,
        }
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (data.success) {
        // Also save to localStorage for immediate UI updates
        localStorage.setItem('azora-settings', JSON.stringify({
          apiKeys,
          useAzoraPilot,
          azoraPilotUrl
        }))
        
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        console.error('Settings save failed:', data.error)
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateApiKey = (provider: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const getStatusIcon = () => {
    switch (pilotStatus.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          BuildSpaces Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your AI services and constitutional preferences
        </p>
      </div>

      <Tabs defaultValue="ai-services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-services">AI Services</TabsTrigger>
          <TabsTrigger value="constitutional">Constitutional AI</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-services" className="space-y-6">
          {/* Azora Pilot Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-500" />
                Azora Pilot (Constitutional AI)
                <Badge variant={useAzoraPilot ? "default" : "secondary"}>
                  {useAzoraPilot ? "Primary" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Your constitutional AI assistant powered by Azora's own models. 
                This ensures sovereignty and prevents external service dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use Azora Pilot as Primary AI</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, Azora Pilot will be used as your main AI service
                  </p>
                </div>
                <Switch
                  checked={useAzoraPilot}
                  onCheckedChange={setUseAzoraPilot}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pilot-url">Azora Pilot URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="pilot-url"
                    value={azoraPilotUrl}
                    onChange={(e) => setAzoraPilotUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                  />
                  <Button onClick={checkAzoraPilotStatus} variant="outline">
                    Test Connection
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {getStatusIcon()}
                <span className="text-sm">
                  Status: {pilotStatus.status}
                  {pilotStatus.modelLoaded && " • Model Loaded"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* BYOK Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Bring Your Own Keys (BYOK)
                <Badge variant="outline">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Configure external AI services as fallback options. 
                Your data remains sovereign - these are only used when Azora Pilot is unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Constitutional Principle:</strong> Your keys are stored locally and never sent to external services without your explicit consent. 
                  Azora Pilot remains your primary AI to ensure technological sovereignty.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type={showKeys.openai ? "text" : "password"}
                      value={apiKeys.openai || ''}
                      onChange={(e) => updateApiKey('openai', e.target.value)}
                      placeholder="sk-..."
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility('openai')}
                    >
                      {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testApiKey('openai', apiKeys.openai || '')}
                      disabled={testingKeys.openai || !apiKeys.openai}
                    >
                      {testingKeys.openai ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                  {testResults.openai && (
                    <div className={`text-sm ${
                      testResults.openai.status === 'success' ? 'text-green-400' : 
                      testResults.openai.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {testResults.openai.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="anthropic-key"
                      type={showKeys.anthropic ? "text" : "password"}
                      value={apiKeys.anthropic || ''}
                      onChange={(e) => updateApiKey('anthropic', e.target.value)}
                      placeholder="claude-..."
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility('anthropic')}
                    >
                      {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testApiKey('anthropic', apiKeys.anthropic || '')}
                      disabled={testingKeys.anthropic || !apiKeys.anthropic}
                    >
                      {testingKeys.anthropic ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                  {testResults.anthropic && (
                    <div className={`text-sm ${
                      testResults.anthropic.status === 'success' ? 'text-green-400' : 
                      testResults.anthropic.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {testResults.anthropic.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elevenlabs-key">ElevenLabs API Key (Voice)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="elevenlabs-key"
                      type={showKeys.elevenlabs ? "text" : "password"}
                      value={apiKeys.elevenlabs || ''}
                      onChange={(e) => updateApiKey('elevenlabs', e.target.value)}
                      placeholder="..."
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility('elevenlabs')}
                    >
                      {showKeys.elevenlabs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testApiKey('elevenlabs', apiKeys.elevenlabs || '')}
                      disabled={testingKeys.elevenlabs || !apiKeys.elevenlabs}
                    >
                      {testingKeys.elevenlabs ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                  {testResults.elevenlabs && (
                    <div className={`text-sm ${
                      testResults.elevenlabs.status === 'success' ? 'text-green-400' : 
                      testResults.elevenlabs.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {testResults.elevenlabs.message}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constitutional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Constitutional AI Settings
              </CardTitle>
              <CardDescription>
                Configure how Constitutional AI validates and governs system operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Constitutional AI ensures all operations align with Ubuntu principles, Truth as Currency, and service to humanity.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Truth Score Threshold</Label>
                  <Input type="number" min="0" max="100" defaultValue="95" />
                </div>
                <div className="space-y-2">
                  <Label>Constitutional Compliance</Label>
                  <Input type="number" min="0" max="100" defaultValue="95" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Advanced settings for power users and developers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tool Rate Limit (per minute)</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Max Context Length</Label>
                <Input type="number" defaultValue="2000" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-8">
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Settings saved successfully</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to save settings</span>
          </div>
        )}
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
