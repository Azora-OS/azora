import Ajv from "ajv"
import YAML from "yaml"
import { z } from "zod"

export type SpecType = "component" | "api" | "workflow"

export interface Spec {
    id: string
    type: SpecType
    name: string
    version: string
    description?: string
    requirements: string[]
    schema?: any
}

const ajv = new Ajv()

export class SpecValidator {
    static validate(content: string, format: "yaml" | "json" = "yaml"): { valid: boolean; errors?: any[]; spec?: Spec } {
        try {
            const spec = format === "yaml" ? YAML.parse(content) : JSON.parse(content)

            // Basic schema validation
            const schema = {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["component", "api", "workflow"] },
                    name: { type: "string" },
                    version: { type: "string" },
                    requirements: { type: "array", items: { type: "string" } }
                },
                required: ["id", "type", "name", "version", "requirements"]
            }

            const validate = ajv.compile(schema)
            const valid = validate(spec)

            if (!valid) {
                return { valid: false, errors: validate.errors as any[] }
            }

            return { valid: true, spec: spec as any as Spec }
        } catch (error) {
            return { valid: false, errors: [error] }
        }
    }

    static generateTemplate(type: SpecType): string {
        const templates: Record<SpecType, object> = {
            component: {
                id: "comp-001",
                type: "component",
                name: "MyComponent",
                version: "1.0.0",
                description: "A reusable UI component",
                requirements: [
                    "Must be responsive",
                    "Must support dark mode",
                    "Must be accessible (WCAG 2.1)"
                ],
                props: {
                    title: "string",
                    isActive: "boolean"
                }
            },
            api: {
                id: "api-001",
                type: "api",
                name: "MyAPI",
                version: "1.0.0",
                description: "REST API endpoint",
                requirements: [
                    "Must respond in < 100ms",
                    "Must be authenticated"
                ],
                endpoints: [
                    { method: "GET", path: "/items" }
                ]
            },
            workflow: {
                id: "flow-001",
                type: "workflow",
                name: "MyWorkflow",
                version: "1.0.0",
                description: "Business process",
                requirements: [
                    "Must be atomic",
                    "Must log all steps"
                ],
                steps: [
                    "validate_input",
                    "process_data",
                    "save_result"
                ]
            }
        }

        return YAML.stringify(templates[type])
    }
}
