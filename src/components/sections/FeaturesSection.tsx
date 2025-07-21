import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  MessageSquare, 
  Zap, 
  Shield, 
  BarChart3, 
  Palette,
  FileText,
  Search,
  Globe
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Unlimited File Uploads',
    description: 'Upload files of any size without the 33MB limitation. Our intelligent chunking system maintains efficiency.',
    badge: 'No Limits'
  },
  {
    icon: MessageSquare,
    title: 'AI-Powered Chatbots',
    description: 'Create intelligent chatbots trained on your knowledge base with advanced natural language understanding.',
    badge: 'Smart AI'
  },
  {
    icon: Zap,
    title: 'Native Integrations',
    description: 'Seamlessly connect with Slack, n8n, and Zapier for powerful workflow automation.',
    badge: 'Workflow Ready'
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Google Sign-In and email authentication with enterprise-grade security.',
    badge: 'Secure'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track chatbot performance, user interactions, and knowledge base effectiveness.',
    badge: 'Insights'
  },
  {
    icon: Palette,
    title: 'Customizable Design',
    description: 'Brand your chatbots with custom colors, logos, and styling to match your brand.',
    badge: 'Branded'
  },
  {
    icon: FileText,
    title: 'Multi-Format Support',
    description: 'Support for PDF, DOC, TXT, CSV, and more file formats with intelligent text extraction.',
    badge: 'Versatile'
  },
  {
    icon: Search,
    title: 'Intelligent Search',
    description: 'Advanced semantic search across your entire knowledge base for accurate responses.',
    badge: 'Semantic'
  },
  {
    icon: Globe,
    title: 'API & Webhooks',
    description: 'Robust API and webhook support for custom integrations and automation.',
    badge: 'Developer Ready'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Zap className="mr-1 h-3 w-3" />
            Powerful Features
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
            Everything you need for{' '}
            <span className="text-primary">unlimited</span> AI knowledge
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build, deploy, and scale AI chatbots with our comprehensive platform. 
            No limitations, maximum efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}