import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'

const integrations = [
  {
    name: 'Slack',
    description: 'Deploy your AI chatbot directly to Slack channels for instant team access.',
    logo: (
      <div className="h-12 w-12 rounded-lg bg-[#4A154B] flex items-center justify-center">
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      </div>
    ),
    features: ['Direct channel deployment', 'Slash commands', 'Thread responses', 'User permissions'],
    status: 'Available'
  },
  {
    name: 'n8n',
    description: 'Connect your chatbot to powerful workflow automation with n8n\'s visual editor.',
    logo: (
      <div className="h-12 w-12 rounded-lg bg-[#EA4B71] flex items-center justify-center">
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm0 3.6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z"/>
        </svg>
      </div>
    ),
    features: ['Visual workflow builder', 'Trigger automation', 'Data transformation', 'Multi-step flows'],
    status: 'Available'
  },
  {
    name: 'Zapier',
    description: 'Integrate with 5000+ apps through Zapier\'s extensive automation platform.',
    logo: (
      <div className="h-12 w-12 rounded-lg bg-[#FF4A00] flex items-center justify-center">
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.5 8.5h-5v-5c0-.276-.224-.5-.5-.5s-.5.224-.5.5v5h-5c-.276 0-.5.224-.5.5s.224.5.5.5h5v5c0 .276.224.5.5.5s.5-.224.5-.5v-5h5c.276 0 .5-.224.5-.5s-.224-.5-.5-.5z"/>
        </svg>
      </div>
    ),
    features: ['5000+ app connections', 'Multi-step zaps', 'Conditional logic', 'Real-time triggers'],
    status: 'Available'
  }
]

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20 lg:py-32 bg-muted/30">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Zap className="mr-1 h-3 w-3" />
            Native Integrations
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
            Connect with your{' '}
            <span className="text-primary">favorite tools</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Seamlessly integrate your AI chatbots with the tools your team already uses. 
            No complex setup, just native connections that work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {integrations.map((integration, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  {integration.logo}
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {integration.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{integration.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {integration.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {integration.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-muted-foreground flex items-center">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Connect {integration.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need a custom integration?</h3>
              <p className="text-muted-foreground mb-6">
                Our robust API and webhook system makes it easy to connect with any platform. 
                Build custom integrations or request new native connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  View API Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline">
                  Request Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}