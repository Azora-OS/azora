// import { useParams } from "next/navigation"
import { CodeChamber } from "@/components/workspace/code-chamber"
import MakerLab from "@/components/rooms/maker-lab"
// import AIStudio from "@/components/rooms/ai-studio"
import DesignStudio from "@/components/rooms/design-studio"
import CollaborationPod from "@/components/rooms/collaboration-pod"
import DeepFocus from "@/components/rooms/deep-focus"
import InnovationTheater from "@/components/rooms/innovation-theater"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RoomPage({ params }: { params: { type: string, id: string } }) {
    const { type, id } = params

    // Dynamic Room Rendering
    const renderRoom = () => {
        switch (type) {
            case 'code-chamber':
                return <CodeChamber id={id} />
            case 'maker-lab':
                return <MakerLab />
            // case 'ai-studio':
            //     return <AIStudio />
            case 'design-studio':
                return <DesignStudio />
            case 'collaboration-pod':
                return <CollaborationPod />
            case 'deep-focus':
                return <DeepFocus />
            case 'innovation-theater':
                return <InnovationTheater />
            default:
                return <div>Unknown Room Type</div>
        }
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Room Header / Navigation */}
            <header className="border-b p-2 flex items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Link href="/lobby">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="font-semibold capitalize">{type.replace('-', ' ')}</div>
                <div className="ml-auto text-xs text-muted-foreground">Session: {id}</div>
            </header>

            {/* Room Content */}
            <main className="flex-1 overflow-hidden relative">
                {renderRoom()}
            </main>
        </div>
    )
}
