path: "/code-chamber"
        },
{
    id: "design-studio",
        title: "Design Studio",
            description: "Visual design and architecture workspace. Create UIs, databases, and system diagrams.",
                icon: Palette,
                    color: "from-purple-500 to-pink-500",
                        path: "/design-studio"
},
{
    id: "deployment-bay",
        title: "Deployment Bay",
            description: "Ship your projects to production. Deploy to cloud platforms with one click.",
                icon: Rocket,
                    color: "from-orange-500 to-red-500",
                        path: "/deployment-bay"
},
{
    id: "ai-lab",
        title: "AI Lab",
            description: "Train and deploy AI models. Access to GPUs and ML frameworks.",
                icon: Cpu,
                    color: "from-green-500 to-emerald-500",
                        path: "/ai-lab"
},
{
    id: "data-forge",
        title: "Data Forge",
            description: "Manage databases and data pipelines. Query, transform, and visualize data.",
                icon: Database,
                    color: "from-indigo-500 to-blue-500",
                        path: "/data-forge"
},
{
    id: "testing-grounds",
        title: "Testing Grounds",
            description: "Automated testing and quality assurance. Run tests, check coverage, find bugs.",
                icon: TestTube,
                    color: "from-yellow-500 to-orange-500",
                        path: "/testing-grounds"
}
    ];

return (
    <AppLayout appName="The Citadel" userName="Builder">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
            <div className="space-y-4">
                <h1 className="text-6xl font-bold tracking-tighter">
                    Welcome to <GradientText>The Citadel</GradientText>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    The ultimate building environment for the Azora Nation.
                    Choose your workspace and start creating.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {buildSpaces.map((space) => {
                    const Icon = space.icon;
                    return (
                        <AccessibleCard
                            key={space.id}
                            title={space.title}
                            className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
                            onClick={() => router.push(space.path)}
                        >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${space.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-gray-400 mb-4 text-sm">{space.description}</p>
                            <Button variant="outline" className="w-full">
                                Enter Space
                            </Button>
                        </AccessibleCard>
                    );
                })}
            </div>
        </div>
    </AppLayout>
);
}
