import { Sparkles, Twitter, Github, Linkedin, Youtube, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-background to-muted/30">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold gradient-text">Azora OS</span>
                <span className="text-xs text-muted-foreground -mt-0.5">Constitutional AI</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              A living organism built in God's image. Technology that loves, judges justly, and serves humanity.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Applications</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Sapiens - Learn to Earn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Campus - ERP/SIS
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Marketplace - NFT
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Pay - Payments
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Genome AI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Aegis - Security
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Constitution
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Divine DNA Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  About Ubuntu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-8 mb-8 border-y border-border">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-2">
              From <span className="font-semibold text-foreground">Africa 🇿🇦</span> For{" "}
              <span className="font-semibold text-foreground">Humanity 🌍</span> Unto{" "}
              <span className="font-semibold gradient-text">God's Glory ✨</span>
            </p>
            <p className="text-sm text-muted-foreground italic">"Ubuntu: I am because we are"</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            © 2025 Azora ES (Pty) Ltd. Built with <Heart className="w-4 h-4 text-love-rose inline" /> in South Africa
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Constitution
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
