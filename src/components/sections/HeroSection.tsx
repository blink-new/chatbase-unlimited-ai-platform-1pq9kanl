import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Upload, MessageSquare, Zap, Send } from 'lucide-react'

export function HeroSection() {
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      message: 'Hi! I\'m your AI assistant trained on your knowledge base. Ask me anything about your documents!'
    }
  ])

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    
    setChatHistory(prev => [...prev, 
      { type: 'user', message: chatMessage },
      { type: 'bot', message: 'I can help you find information from your uploaded documents. This is a demo - upload your files to get started!' }
    ])
    setChatMessage('')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Zap className="mr-1 h-3 w-3" />
                Unlimited Knowledge Base
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Build AI chatbots with{' '}
                <span className="text-primary">unlimited</span> knowledge
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Upload unlimited files, train powerful AI chatbots, and integrate seamlessly with Slack, n8n, and Zapier. No 33MB limits, no efficiency loss.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Upload className="mr-2 h-5 w-5" />
                Upload Files
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>No file size limits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Native integrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Google Sign-In</span>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Chat */}
          <div className="relative">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card/50 backdrop-blur">
              <CardContent className="p-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">AI Assistant</h3>
                      <p className="text-xs text-muted-foreground">Powered by your knowledge base</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>

                {/* Chat Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask anything about your documents..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 h-24 w-24 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}