import React, { useState, useRef, useEffect } from 'react'
import { Bot, Plus, Settings, MessageSquare, Send, User, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { blink } from '@/blink/client'

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
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  is_public: number
  created_at: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatbotBuilderProps {
  chatbots: Chatbot[]
  knowledgeBases: KnowledgeBase[]
  onUpdate: () => void
  userId: string
}

export function ChatbotBuilder({ chatbots, knowledgeBases, onUpdate, userId }: ChatbotBuilderProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedBot, setSelectedBot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(false)
  const [testMessages, setTestMessages] = useState<ChatMessage[]>([])
  const [testInput, setTestInput] = useState('')
  const [isTestingChat, setIsTestingChat] = useState(false)
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    knowledge_base_id: '',
    system_prompt: 'You are a helpful AI assistant. Use the provided knowledge base to answer questions accurately and helpfully.',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
    is_public: false
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [testMessages])

  const createChatbot = async () => {
    if (!newBot.name.trim() || !newBot.knowledge_base_id) return
    
    setLoading(true)
    try {
      await blink.db.chatbots.create({
        id: `bot_${Date.now()}`,
        knowledgeBaseId: newBot.knowledge_base_id,
        userId,
        name: newBot.name,
        description: newBot.description,
        systemPrompt: newBot.system_prompt,
        model: newBot.model,
        temperature: newBot.temperature,
        maxTokens: newBot.max_tokens,
        isPublic: newBot.is_public ? 1 : 0
      })
      
      setNewBot({
        name: '',
        description: '',
        knowledge_base_id: '',
        system_prompt: 'You are a helpful AI assistant. Use the provided knowledge base to answer questions accurately and helpfully.',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
        is_public: false
      })
      setIsCreateOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to create chatbot:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testInput.trim() || !selectedBot || isTestingChat) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: testInput,
      timestamp: Date.now()
    }

    setTestMessages(prev => [...prev, userMessage])
    setTestInput('')
    setIsTestingChat(true)

    try {
      // Get knowledge base documents for context
      const documents = await blink.db.documents.list({
        where: { knowledgeBaseId: selectedBot.knowledge_base_id },
        limit: 10
      })

      const context = documents.map(doc => doc.content).join('\n\n')
      
      // Generate AI response using the knowledge base context
      const { text } = await blink.ai.generateText({
        prompt: `${selectedBot.system_prompt}\n\nKnowledge Base Context:\n${context}\n\nUser Question: ${testInput}`,
        model: selectedBot.model as any,
        maxTokens: selectedBot.max_tokens,
        temperature: selectedBot.temperature
      })

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      }

      setTestMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to generate response:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: Date.now()
      }
      setTestMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTestingChat(false)
    }
  }

  const deleteChatbot = async (botId: string) => {
    try {
      await blink.db.chatbots.delete(botId)
      if (selectedBot?.id === botId) {
        setSelectedBot(null)
        setTestMessages([])
      }
      onUpdate()
    } catch (error) {
      console.error('Failed to delete chatbot:', error)
    }
  }

  const copyEmbedCode = (botId: string) => {
    const embedCode = `<iframe
  src="${window.location.origin}/embed/chatbot/${botId}"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`
    
    navigator.clipboard.writeText(embedCode)
  }

  const getKnowledgeBaseName = (kbId: string) => {
    const kb = knowledgeBases.find(kb => kb.id === kbId)
    return kb?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chatbot Builder</h2>
          <p className="text-muted-foreground">Create and test AI chatbots powered by your knowledge bases</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Chatbot</DialogTitle>
              <DialogDescription>
                Build an AI assistant powered by your knowledge base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bot-name">Chatbot Name</Label>
                  <Input
                    id="bot-name"
                    value={newBot.name}
                    onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                    placeholder="e.g., Support Assistant"
                  />
                </div>
                <div>
                  <Label htmlFor="knowledge-base">Knowledge Base</Label>
                  <Select
                    value={newBot.knowledge_base_id}
                    onValueChange={(value) => setNewBot({ ...newBot, knowledge_base_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeBases.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name} ({kb.file_count} docs)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bot-description">Description</Label>
                <Textarea
                  id="bot-description"
                  value={newBot.description}
                  onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  placeholder="Describe what this chatbot does..."
                />
              </div>

              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={newBot.system_prompt}
                  onChange={(e) => setNewBot({ ...newBot, system_prompt: e.target.value })}
                  rows={4}
                  placeholder="Define how the chatbot should behave..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">AI Model</Label>
                  <Select
                    value={newBot.model}
                    onValueChange={(value) => setNewBot({ ...newBot, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Balanced)</SelectItem>
                      <SelectItem value="gpt-4.1">GPT-4.1 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-tokens">Max Response Length</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={newBot.max_tokens}
                    onChange={(e) => setNewBot({ ...newBot, max_tokens: parseInt(e.target.value) || 1000 })}
                    min={100}
                    max={4000}
                  />
                </div>
              </div>

              <div>
                <Label>Temperature: {newBot.temperature}</Label>
                <Slider
                  value={[newBot.temperature]}
                  onValueChange={([value]) => setNewBot({ ...newBot, temperature: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={newBot.is_public}
                  onCheckedChange={(checked) => setNewBot({ ...newBot, is_public: checked })}
                />
                <Label htmlFor="is-public">Make chatbot publicly accessible</Label>
              </div>

              <Button onClick={createChatbot} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Chatbot'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chatbots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbots List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Chatbots</CardTitle>
              <CardDescription>Select a chatbot to test and configure</CardDescription>
            </CardHeader>
            <CardContent>
              {chatbots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No chatbots yet. Create your first AI assistant!
                </p>
              ) : (
                <div className="space-y-3">
                  {chatbots.map((bot) => (
                    <div
                      key={bot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBot?.id === bot.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedBot(bot)
                        setTestMessages([])
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{bot.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getKnowledgeBaseName(bot.knowledge_base_id)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={Number(bot.is_public) > 0 ? "default" : "secondary"}>
                            {Number(bot.is_public) > 0 ? "Public" : "Private"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteChatbot(bot.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chatbot Testing */}
        <div className="lg:col-span-2">
          {selectedBot ? (
            <div className="space-y-6">
              {/* Bot Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Bot className="w-5 h-5" />
                        <span>{selectedBot.name}</span>
                      </CardTitle>
                      <CardDescription>{selectedBot.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyEmbedCode(selectedBot.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Embed Code
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Test Chat</span>
                  </CardTitle>
                  <CardDescription>
                    Test your chatbot with real questions from your knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <ScrollArea className="h-96 border rounded-lg p-4">
                      {testMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Bot className="w-8 h-8 mx-auto mb-2" />
                            <p>Start a conversation to test your chatbot</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {testMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  {message.role === 'assistant' && (
                                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  )}
                                  {message.role === 'user' && (
                                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div>
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {isTestingChat && (
                            <div className="flex justify-start">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Bot className="w-4 h-4" />
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    {/* Chat Input */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask a question about your knowledge base..."
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                        disabled={isTestingChat}
                      />
                      <Button onClick={sendTestMessage} disabled={isTestingChat || !testInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bot Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>Current chatbot settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Model</Label>
                      <p className="font-medium">{selectedBot.model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Temperature</Label>
                      <p className="font-medium">{selectedBot.temperature}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Tokens</Label>
                      <p className="font-medium">{selectedBot.max_tokens}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Visibility</Label>
                      <p className="font-medium">{Number(selectedBot.is_public) > 0 ? 'Public' : 'Private'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-muted-foreground">System Prompt</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedBot.system_prompt}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a Chatbot</h3>
                  <p className="text-muted-foreground">
                    Choose a chatbot from the left to test and configure it
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}