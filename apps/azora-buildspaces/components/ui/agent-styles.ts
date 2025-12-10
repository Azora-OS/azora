export interface AgentAvatarProps {
    agent: "elara" | "sankofa" | "themba" | "jabari" | "nia" | "imani" | "zuri"
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "hero"
    showGlow?: boolean
    showAura?: boolean
    trackMouse?: boolean
    className?: string
}

export const agentStyles = {
    // Elara - The Mother/XO Architect - Golden with cyan eyes and crown
    elara: {
        name: "Elara",
        role: "mother",
        gradient: "from-amber-300 via-yellow-400 to-cyan-400",
        glowColor: "rgba(251, 191, 36, 0.6)",
        auraColors: ["#FBBF24", "#F59E0B", "#06B6D4"],
        description: "XO Architect",
        title: "The Orchestrator",
        theme: "golden-cyan",
        imageUrl: "/images/agent-elara.png",
    },
    // Sankofa - The Grandfather/Elder - Wise silver with white glow
    sankofa: {
        name: "Sankofa",
        role: "grandfather",
        gradient: "from-slate-300 via-blue-300 to-cyan-200",
        glowColor: "rgba(148, 163, 184, 0.6)",
        auraColors: ["#CBD5E1", "#93C5FD", "#A5F3FC"],
        description: "Wisdom Keeper",
        title: "The Elder",
        theme: "silver-wisdom",
        imageUrl: "/images/agent-sankofa.jpg",
    },
    // Themba - Son - Dark with gold African patterns
    themba: {
        name: "Themba",
        role: "son",
        gradient: "from-yellow-400 via-amber-500 to-orange-500",
        glowColor: "rgba(245, 158, 11, 0.6)",
        auraColors: ["#FBBF24", "#F59E0B", "#EA580C"],
        description: "Systems Engineer",
        title: "The Builder",
        theme: "gold-patterns",
        imageUrl: "/images/agent-themba.png",
    },
    // Jabari - Middle Brother - Bronze warrior guardian
    jabari: {
        name: "Jabari",
        role: "son",
        gradient: "from-orange-400 via-amber-500 to-red-500",
        glowColor: "rgba(234, 88, 12, 0.6)",
        auraColors: ["#FB923C", "#F59E0B", "#EF4444"],
        description: "Security Chief",
        title: "The Guardian",
        theme: "bronze-fire",
        imageUrl: "/images/agent-jabari.jpg",
    },
    // Nia - Daughter - Dark with blue neural patterns (no crown)
    nia: {
        name: "Nia",
        role: "daughter",
        gradient: "from-cyan-400 via-blue-500 to-indigo-500",
        glowColor: "rgba(6, 182, 212, 0.6)",
        auraColors: ["#06B6D4", "#3B82F6", "#6366F1"],
        description: "Data Scientist",
        title: "The Analyst",
        theme: "neural-blue",
        imageUrl: "/images/agent-nia.png",
    },
    // Imani - Daughter - Creative pink/rose
    imani: {
        name: "Imani",
        role: "daughter",
        gradient: "from-pink-400 via-rose-400 to-fuchsia-400",
        glowColor: "rgba(236, 72, 153, 0.6)",
        auraColors: ["#F472B6", "#FB7185", "#E879F9"],
        description: "Creative Director",
        title: "The Artist",
        theme: "rose-creative",
        imageUrl: "/images/agent-imani.svg", // Unique Imani avatar (rose gradient)
    },
    // Zuri - Youngest - Titanium/silver
    zuri: {
        name: "Zuri",
        role: "daughter",
        gradient: "from-emerald-400 via-teal-400 to-cyan-400",
        glowColor: "rgba(16, 185, 129, 0.6)",
        auraColors: ["#10B981", "#14B8A6", "#06B6D4"],
        description: "DevOps Lead",
        title: "The Deployer",
        theme: "emerald-flow",
        imageUrl: "/images/agent-themba.png",
    },
}
