import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Scale, Calculator, DollarSign, Swords } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BarChart3,
    title: "Data Explorer",
    description: "Analyze comprehensive UFC data within our extensive database.",
    link: "/data-explorer",
  },
  {
    icon: Scale,
    title: "Tale of the Tape",
    description: "Compare fighters for upcoming matches with detailed statistics.",
    link: "/tale-of-the-tape",
  },
  {
    icon: Calculator,
    title: "Match Predictor",
    description: "Recalculate match outcomes based on the latest data and insights.",
    link: "/match-predictor",
  },
  {
    icon: DollarSign,
    title: "Parlay Generator",
    description: "Identify high-value bets and generate optimal parlay combinations.",
    link: "/parlay-generator",
  },
  {
    icon: Swords,
    title: "Dream Match Simulator",
    description: "Create and simulate hypothetical fight scenarios between any fighters.",
    link: "/dream-match",
  },
];

export default function LandingPage() {
  return (
    <div>
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">UFC Analytics</h1>
          <div className="space-x-4">
            <Button variant="ghost">Login</Button>
            <Button variant="outline">Sign Up</Button>
          </div>
        </nav>
        <div className="text-center">
          <h2 className="text-5xl font-extrabold mb-4">UFC Analytical Web App</h2>
          <p className="text-xl text-gray-300 mb-8">
            Dive deep into UFC data, predict outcomes, and create dream matchups.
          </p>
          <Button size="lg">Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <feature.icon className="h-12 w-12 mb-4 text-red-500" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.link}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Explore {feature.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2023 UFC Analytics. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
