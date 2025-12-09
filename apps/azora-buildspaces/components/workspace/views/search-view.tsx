"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchView() {
    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Search</label>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search files..." className="pl-8 h-9 text-sm" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Replace</label>
                <Input placeholder="Replace with..." className="h-9 text-sm" />
            </div>
            <div className="pt-2">
                <p className="text-xs text-muted-foreground text-center">
                    No results found.
                </p>
            </div>
        </div>
    )
}
