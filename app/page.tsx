import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Database, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-500 selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
              v2.0 Beta Released
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Chemical Industry <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                AI Decision Engine
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Empower your chemists and formulation engineers with context-aware AI. Synthesize parameters, enforce safety limits, and recommend optimal chemical compositions in milliseconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]">
                  Launch Engine <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com/the-niresh/chem-laxx" target="_blank">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-slate-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
              Built for industrial scale precision
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Open-source architecture combining Next.js performance with real-time Convex synchronization and enterprise-grade LLM context handling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Context-Aware Chat</h3>
              <p className="text-slate-600 leading-relaxed">
                Persistent threads with continuous conversation history, streaming UI, and auto-generated titles powered by Convex streaming primitives.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-Time Sync</h3>
              <p className="text-slate-600 leading-relaxed">
                Zero-latency reactivity across clients. When the model streams tokens or thread metadata updates, all active windows sync instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Isolated Workspaces</h3>
              <p className="text-slate-600 leading-relaxed">
                Convex Auth natively isolates organizational data. Your chemical IP and proprietary queries remain locked to your tenant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Chemical Industry AI. Open-sourced by the-niresh.
          </p>
        </div>
      </footer>
    </div>
  );
}