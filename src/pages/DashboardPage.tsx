import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Upload, Link, FileText, Bot, Settings, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/blink/client'
import { KnowledgeBaseManager } from '@/components/dashboard/KnowledgeBaseManager'
import { ChatbotBuilder } from '@/components/dashboard/ChatbotBuilder'
import { IntegrationsPanel } from '@/components/dashboard/IntegrationsPanel'
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard'

interface KnowledgeBase {
  id: string
  name: string
  description: string
  file_count: number
  total_size: number
  auto_retrain: number
  retrain_schedule: string
  created_at: string
}

interface Chatbot {
  id: string
  knowledge_base_id: string
  name: string
  description: string
  is_public: number
  created_at: string
}

export function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [kbData, chatbotData] = await Promise.all([
        blink.db.knowledgeBases.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.chatbots.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
      ])
      setKnowledgeBases(kbData)
      setChatbots(chatbotData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }, [user?.id])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id, loadDashboardData])



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Chatbase Unlimited</CardTitle>
            <CardDescription>Sign in to access your AI knowledge base platform</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalDocuments = knowledgeBases.reduce((sum, kb) => sum + kb.file_count, 0)
  const totalSize = knowledgeBases.reduce((sum, kb) => sum + kb.total_size, 0)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Chatbase Unlimited</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Unlimited Plan
              </Badge>
              <Button variant="outline" size="sm" onClick={() => blink.auth.logout()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="chatbots" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>Chatbots</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Knowledge Bases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{knowledgeBases.length}</div>
                  <p className="text-xs text-muted-foreground">Active knowledge bases</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">Files and URLs processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
                  <p className="text-xs text-muted-foreground">Unlimited storage available</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{chatbots.length}</div>
                  <p className="text-xs text-muted-foreground">AI assistants deployed</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your AI knowledge base platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('knowledge')} 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Knowledge Base</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('chatbots')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Bot className="w-6 h-6" />
                    <span>Build Chatbot</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('integrations')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Zap className="w-6 h-6" />
                    <span>Setup Integrations</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Knowledge Bases</CardTitle>
                </CardHeader>
                <CardContent>
                  {knowledgeBases.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No knowledge bases yet. Create your first one to get started!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {knowledgeBases.slice(0, 3).map((kb) => (
                        <div key={kb.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{kb.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {kb.file_count} documents • {formatSize(kb.total_size)}
                            </p>
                          </div>
                          <Badge variant={Number(kb.auto_retrain) > 0 ? "default" : "secondary"}>
                            {Number(kb.auto_retrain) > 0 ? "Auto-retrain" : "Manual"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Chatbots</CardTitle>
                </CardHeader>
                <CardContent>
                  {chatbots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No chatbots yet. Build your first AI assistant!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {chatbots.slice(0, 3).map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{bot.name}</h4>
                            <p className="text-sm text-muted-foreground">{bot.description}</p>
                          </div>
                          <Badge variant={Number(bot.is_public) > 0 ? "default" : "secondary"}>
                            {Number(bot.is_public) > 0 ? "Public" : "Private"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBaseManager 
              knowledgeBases={knowledgeBases} 
              onUpdate={loadDashboardData}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="chatbots">
            <ChatbotBuilder 
              chatbots={chatbots}
              knowledgeBases={knowledgeBases}
              onUpdate={loadDashboardData}
              userId={user.id}
            />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsPanel userId={user.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}