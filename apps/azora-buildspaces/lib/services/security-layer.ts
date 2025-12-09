import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// AES-256-GCM Encryption
const ALGORITHM = 'aes-256-gcm'

export class SecurityLayer {
    private static instance: SecurityLayer
    private key: Buffer

    private constructor() {
        // In production, this key should come from a secure KMS or ENV
        // For demo, we generate a random key if not present
        const envKey = process.env.AZORA_ENCRYPTION_KEY
        this.key = envKey ? Buffer.from(envKey, 'hex') : randomBytes(32)
    }

    public static getInstance(): SecurityLayer {
        if (!SecurityLayer.instance) {
            SecurityLayer.instance = new SecurityLayer()
        }
        return SecurityLayer.instance
    }

    public encrypt(text: string): string {
        const iv = randomBytes(16)
        const cipher = createCipheriv(ALGORITHM, this.key, iv)
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        const authTag = cipher.getAuthTag().toString('hex')
        return `${iv.toString('hex')}:${authTag}:${encrypted}`
    }

    public decrypt(text: string): string {
        const [ivHex, authTagHex, encryptedHex] = text.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const authTag = Buffer.from(authTagHex, 'hex')
        const decipher = createDecipheriv(ALGORITHM, this.key, iv)
        decipher.setAuthTag(authTag)
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }
}
