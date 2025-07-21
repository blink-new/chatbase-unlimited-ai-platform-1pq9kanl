import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, MessageSquare, Users, Clock, Download, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AnalyticsDashboardProps {
  userId: string
}

interface AnalyticsData {
  totalMessages: number
  totalUsers: number
  avgResponseTime: number
  satisfactionScore: number
  topQuestions: Array<{ question: string; count: number }>
  messagesByDay: Array<{ date: string; messages: number }>
  responseTimesByHour: Array<{ hour: number; avgTime: number }>
  chatbotPerformance: Array<{ name: string; messages: number; satisfaction: number }>
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMessages: 1247,
    totalUsers: 89,
    avgResponseTime: 1.2,
    satisfactionScore: 4.6,
    topQuestions: [
      { question: "How do I reset my password?", count: 45 },
      { question: "What are your business hours?", count: 38 },
      { question: "How can I contact support?", count: 32 },
      { question: "Where can I find my order status?", count: 28 },
      { question: "Do you offer refunds?", count: 24 }
    ],
    messagesByDay: [
      { date: '2024-01-15', messages: 156 },
      { date: '2024-01-16', messages: 189 },
      { date: '2024-01-17', messages: 234 },
      { date: '2024-01-18', messages: 198 },
      { date: '2024-01-19', messages: 267 },
      { date: '2024-01-20', messages: 203 },
      { date: '2024-01-21', messages: 178 }
    ],
    responseTimesByHour: [
      { hour: 9, avgTime: 0.8 },
      { hour: 10, avgTime: 1.1 },
      { hour: 11, avgTime: 1.4 },
      { hour: 12, avgTime: 1.8 },
      { hour: 13, avgTime: 2.1 },
      { hour: 14, avgTime: 1.6 },
      { hour: 15, avgTime: 1.3 },
      { hour: 16, avgTime: 1.0 },
      { hour: 17, avgTime: 0.9 }
    ],
    chatbotPerformance: [
      { name: "Support Assistant", messages: 456, satisfaction: 4.8 },
      { name: "Sales Bot", messages: 342, satisfaction: 4.5 },
      { name: "FAQ Helper", messages: 289, satisfaction: 4.3 },
      { name: "Product Guide", messages: 160, satisfaction: 4.7 }
    ]
  })

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }
    loadAnalytics()
  }, [timeRange])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 4.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const exportData = () => {
    // Simulate data export
    const csvData = analytics.messagesByDay
      .map(day => `${day.date},${day.messages}`)
      .join('\n')
    
    const blob = new Blob([`Date,Messages\n${csvData}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chatbot-analytics-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your chatbot performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalMessages)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3s</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Volume</CardTitle>
            <CardDescription>Daily message count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.messagesByDay.map((day, index) => {
                const maxMessages = Math.max(...analytics.messagesByDay.map(d => d.messages))
                const percentage = (day.messages / maxMessages) * 100
                
                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="font-medium">{day.messages}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card>
          <CardHeader>
            <CardTitle>Response Times by Hour</CardTitle>
            <CardDescription>Average response time throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.responseTimesByHour.map((hour) => {
                const maxTime = Math.max(...analytics.responseTimesByHour.map(h => h.avgTime))
                const percentage = (hour.avgTime / maxTime) * 100
                
                return (
                  <div key={hour.hour} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{hour.hour}:00</span>
                      <span className="font-medium">{hour.avgTime}s</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Most Asked Questions</CardTitle>
            <CardDescription>Popular questions from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topQuestions.map((question, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{question.question}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {question.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Performance</CardTitle>
            <CardDescription>Individual chatbot metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.chatbotPerformance.map((bot, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{bot.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{bot.messages} msgs</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(bot.satisfaction)}`}>
                        {bot.satisfaction}/5
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Messages</span>
                      <span>Satisfaction</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress 
                        value={(bot.messages / Math.max(...analytics.chatbotPerformance.map(b => b.messages))) * 100} 
                        className="h-2" 
                      />
                      <Progress 
                        value={(bot.satisfaction / 5) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered insights to improve your chatbot performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Peak Usage Hours</h4>
                <p className="text-sm text-blue-800">
                  Your chatbots receive the most messages between 12-2 PM. Consider optimizing response times during these hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">High Satisfaction</h4>
                <p className="text-sm text-green-800">
                  Your Support Assistant has the highest satisfaction score (4.8/5). Consider using its configuration for other bots.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Filter className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Knowledge Gap</h4>
                <p className="text-sm text-yellow-800">
                  "How do I reset my password?" is asked frequently. Consider adding more detailed password reset documentation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}