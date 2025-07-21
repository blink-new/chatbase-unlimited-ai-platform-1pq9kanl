import React, { useState } from 'react'
import { Zap, Slack, Webhook, Settings, CheckCircle, AlertCircle, ExternalLink, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface IntegrationsPanelProps {
  userId: string
}

interface Integration {
  id: string
  name: string
  type: 'slack' | 'n8n' | 'zapier' | 'webhook'
  status: 'connected' | 'disconnected' | 'error'
  config: Record<string, any>
  lastSync?: string
}

export function IntegrationsPanel({ userId }: IntegrationsPanelProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack_1',
      name: 'Customer Support Slack',
      type: 'slack',
      status: 'disconnected',
      config: {},
    },
    {
      id: 'n8n_1',
      name: 'Workflow Automation',
      type: 'n8n',
      status: 'disconnected',
      config: {},
    },
    {
      id: 'zapier_1',
      name: 'Zapier Workflows',
      type: 'zapier',
      status: 'disconnected',
      config: {},
    }
  ])

  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const integrationTypes = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your chatbots to Slack channels for team collaboration',
      icon: Slack,
      color: 'bg-purple-100 text-purple-600',
      features: ['Channel integration', 'Direct messages', 'Bot commands', 'File sharing']
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Automate workflows with powerful no-code automation',
      icon: Zap,
      color: 'bg-blue-100 text-blue-600',
      features: ['Workflow triggers', 'Data processing', 'API integrations', 'Custom logic']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps through Zapier automation',
      icon: Zap,
      color: 'bg-orange-100 text-orange-600',
      features: ['App connections', 'Trigger events', 'Data sync', 'Multi-step workflows']
    },
    {
      id: 'webhook',
      name: 'Custom Webhooks',
      description: 'Create custom integrations with webhook endpoints',
      icon: Webhook,
      color: 'bg-green-100 text-green-600',
      features: ['Real-time events', 'Custom payloads', 'HTTP callbacks', 'API integration']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle
      case 'error': return AlertCircle
      default: return Settings
    }
  }

  const setupIntegration = async (type: string) => {
    setLoading(true)
    try {
      // Simulate integration setup
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newIntegration: Integration = {
        id: `${type}_${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Integration`,
        type: type as any,
        status: 'connected',
        config: { webhook_url: `https://api.chatbase-unlimited.com/webhooks/${type}/${userId}` },
        lastSync: new Date().toISOString()
      }

      setIntegrations(prev => [...prev, newIntegration])
      setIsSetupOpen(false)
    } catch (error) {
      console.error('Failed to setup integration:', error)
    } finally {
      setLoading(false)
    }
  }

  const disconnectIntegration = async (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'disconnected' as const }
          : integration
      )
    )
  }

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-muted-foreground">Connect your chatbots with Slack, n8n, Zapier, and custom webhooks</p>
        </div>
        <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Choose an integration type to connect your chatbots with external services
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {integrationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedIntegrationType === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedIntegrationType(type.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                          <CardDescription className="text-sm">{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {selectedIntegrationType && (
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => setupIntegration(selectedIntegrationType)} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Setting up...' : `Setup ${integrationTypes.find(t => t.id === selectedIntegrationType)?.name}`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slack">Slack</TabsTrigger>
          <TabsTrigger value="n8n">n8n</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>Manage your connected services and automations</CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No integrations configured yet. Add your first integration to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const StatusIcon = getStatusIcon(integration.status)
                    const typeConfig = integrationTypes.find(t => t.id === integration.type)
                    const TypeIcon = typeConfig?.icon || Settings
                    
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig?.color || 'bg-gray-100'}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {typeConfig?.description}
                            </p>
                            {integration.lastSync && (
                              <p className="text-xs text-muted-foreground">
                                Last sync: {new Date(integration.lastSync).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(integration.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {integration.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectIntegration(integration.id)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <p className="text-xs text-muted-foreground">Active connections</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.filter(i => i.status === 'connected').length}
                </div>
                <p className="text-xs text-muted-foreground">Working properly</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">Webhook calls processed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slack" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Slack className="w-5 h-5" />
                <span>Slack Integration</span>
              </CardTitle>
              <CardDescription>
                Connect your chatbots to Slack channels for seamless team collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to your Slack workspace settings</li>
                  <li>Navigate to "Apps" and click "Build"</li>
                  <li>Create a new app and add bot permissions</li>
                  <li>Copy the Bot User OAuth Token</li>
                  <li>Paste the token below to connect</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="slack-token">Bot User OAuth Token</Label>
                  <Input
                    id="slack-token"
                    placeholder="xoxb-your-slack-bot-token"
                    type="password"
                  />
                </div>
                <div>
                  <Label htmlFor="slack-channel">Default Channel</Label>
                  <Input
                    id="slack-channel"
                    placeholder="#general"
                  />
                </div>
                <Button className="w-full">
                  <Slack className="w-4 h-4 mr-2" />
                  Connect Slack
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="n8n" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>n8n Integration</span>
              </CardTitle>
              <CardDescription>
                Automate complex workflows with n8n's powerful automation platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Webhook Endpoint</h4>
                <p className="text-sm text-green-800 mb-3">
                  Use this webhook URL in your n8n workflows to receive chatbot events:
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`https://api.chatbase-unlimited.com/webhooks/n8n/${userId}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyWebhookUrl(`https://api.chatbase-unlimited.com/webhooks/n8n/${userId}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="n8n-url">n8n Instance URL</Label>
                  <Input
                    id="n8n-url"
                    placeholder="https://your-n8n-instance.com"
                  />
                </div>
                <div>
                  <Label htmlFor="n8n-token">API Token (Optional)</Label>
                  <Input
                    id="n8n-token"
                    placeholder="Your n8n API token"
                    type="password"
                  />
                </div>
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Connect n8n
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Zapier Integration</span>
              </CardTitle>
              <CardDescription>
                Connect with 5000+ apps through Zapier's automation platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">Zapier App</h4>
                <p className="text-sm text-orange-800 mb-3">
                  Search for "Chatbase Unlimited" in Zapier's app directory to get started.
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Zapier
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="zapier-webhook">Webhook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="zapier-webhook"
                      value={`https://api.chatbase-unlimited.com/webhooks/zapier/${userId}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWebhookUrl(`https://api.chatbase-unlimited.com/webhooks/zapier/${userId}`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="w-5 h-5" />
                <span>Custom Webhooks</span>
              </CardTitle>
              <CardDescription>
                Create custom integrations with webhook endpoints for real-time events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Available Events</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>message.received</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>message.sent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>chatbot.created</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>knowledge.updated</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhook"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-secret">Secret (Optional)</Label>
                  <Input
                    id="webhook-secret"
                    placeholder="webhook-secret-key"
                    type="password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="webhook-active" />
                  <Label htmlFor="webhook-active">Active</Label>
                </div>
                <Button className="w-full">
                  <Webhook className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}