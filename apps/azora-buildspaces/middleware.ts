import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
})

export const config = {
    matcher: [
        "/lobby/:path*",
        "/room/:path*",
        "/api/projects/:path*",
        "/api/files/:path*",
    ],
}
