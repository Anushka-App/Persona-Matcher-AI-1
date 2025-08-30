import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StyleAdvisor from "./StyleAdvisor";
import VisualMatch from "./VisualMatch";

const AnuschkaStylist = () => {
  const [activeTab, setActiveTab] = useState("style-advisor");

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-8 text-center bg-gradient-to-b from-cream to-cream/80">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
          Anuschka Style Assistant
        </h1>
        <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Discover your perfect hand-painted leather handbag through AI-powered styling
        </p>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-card border border-border">
            <TabsTrigger 
              value="style-advisor" 
              className="font-body text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              🔮 Style Advisor
            </TabsTrigger>
            <TabsTrigger 
              value="visual-match" 
              className="font-body text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              🖼️ Visual Match
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style-advisor" className="mt-0">
            <StyleAdvisor />
          </TabsContent>

          <TabsContent value="visual-match" className="mt-0">
            <VisualMatch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnuschkaStylist;