import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { AfricanAgentAvatar } from "@/components/ui/african-agent-avatar"
import {
  ArrowRight,
  Wrench,
  Database,
  Globe,
  CreditCard,
  Mail,
  Cloud,
  Server,
  Rocket,
  Check,
  ChevronRight,
} from "lucide-react"

const scaffoldOptions = [
  { icon: Globe, title: "Next.js App", desc: "Full-stack React with App Router" },
  { icon: Server, title: "API Backend", desc: "Node.js with Express or Fastify" },
  { icon: Database, title: "Database", desc: "PostgreSQL, MongoDB, or Supabase" },
  { icon: CreditCard, title: "Payments", desc: "Stripe integration ready" },
  { icon: Mail, title: "Email", desc: "Transactional email setup" },
  { icon: Cloud, title: "Storage", desc: "File uploads with S3 or Cloudflare" },
]

export default function MakerLabPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-4 py-2 mb-6">
              <Wrench className="h-4 w-4 text-rose-400" />
              <span className="text-sm text-rose-400">Maker Lab</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Build full-stack</span>
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
                in minutes
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Scaffold complete applications with database, auth, payments, and deployment. From zero to production in
              one click.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3">
                Open Maker Lab <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 hover:bg-white/5 px-6 py-3 bg-transparent">
                Browse Templates
              </Button>
            </div>
          </div>
        </section>

        {/* Scaffold Builder */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-rose-400" />
                  <span className="font-medium">Project Scaffolder</span>
                </div>
                <div className="flex items-center gap-2">
                  <AfricanAgentAvatar agent="themba" size="sm" />
                  <span className="text-sm text-gray-400">Themba ready to build</span>
                </div>
              </div>

              <div className="p-6">
                {/* Project Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                  <input
                    type="text"
                    defaultValue="my-saas-app"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-rose-500/50 focus:outline-none"
                  />
                </div>

                {/* Stack Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">Select Your Stack</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {scaffoldOptions.map((opt, i) => (
                      <button
                        key={i}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${i < 3 ? "bg-rose-500/10 border-rose-500/30" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                      >
                        <opt.icon className={`h-5 w-5 ${i < 3 ? "text-rose-400" : "text-gray-400"}`} />
                        <div>
                          <p className="font-medium text-sm">{opt.title}</p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </div>
                        {i < 3 && <Check className="h-4 w-4 text-rose-400 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Structure Preview */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-3">Project Structure Preview</label>
                  <div className="bg-[#1e2228] rounded-lg p-4 font-mono text-sm">
                    {[
                      "my-saas-app/",
                      "├── app/",
                      "│   ├── api/",
                      "│   ├── auth/",
                      "│   └── dashboard/",
                      "├── components/",
                      "├── lib/",
                      "│   ├── db.ts",
                      "│   └── stripe.ts",
                      "├── prisma/",
                      "│   └── schema.prisma",
                      "└── package.json",
                    ].map((line, i) => (
                      <div key={i} className="text-gray-400">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-rose-500 hover:bg-rose-600">
                    <Rocket className="h-4 w-4 mr-2" /> Generate Project
                  </Button>
                  <Button variant="outline" className="border-white/20 hover:bg-white/5 bg-transparent">
                    <Cloud className="h-4 w-4 mr-2" /> Deploy to Vercel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-4">Start from a Template</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Production-ready templates with best practices built in. Clone and customize in seconds.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "SaaS Starter",
                  desc: "Auth, billing, dashboard, and landing page",
                  tags: ["Next.js", "Stripe", "Prisma"],
                },
                {
                  title: "E-commerce",
                  desc: "Product catalog, cart, checkout, and admin",
                  tags: ["Next.js", "Stripe", "Supabase"],
                },
                { title: "Blog Platform", desc: "MDX blog with CMS and comments", tags: ["Next.js", "MDX", "Vercel"] },
                {
                  title: "AI Chat App",
                  desc: "OpenAI integration with streaming",
                  tags: ["Next.js", "AI SDK", "Vercel"],
                },
                {
                  title: "Dashboard",
                  desc: "Analytics dashboard with charts",
                  tags: ["Next.js", "Recharts", "Prisma"],
                },
                {
                  title: "API Backend",
                  desc: "REST API with authentication",
                  tags: ["Node.js", "Express", "PostgreSQL"],
                },
              ].map((template, i) => (
                <div
                  key={i}
                  className="group rounded-xl bg-white/5 border border-white/10 p-6 hover:border-rose-500/50 transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{template.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-rose-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use template <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
