import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { IntegrationsSection } from '@/components/sections/IntegrationsSection'
import { PricingSection } from '@/components/sections/PricingSection'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}

export default App