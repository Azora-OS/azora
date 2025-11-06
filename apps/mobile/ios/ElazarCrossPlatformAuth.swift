//
//  ElazarCrossPlatformAuth.swift
//  Elazar OS Cross-Platform Authentication
//
//  Unified authentication system for iOS devices
//

import Foundation
import LocalAuthentication
import Security
import CryptoKit

class ElazarCrossPlatformAuth {
    // Configuration
    private let elazarServer: String
    private var authToken: String?
    private var deviceFingerprint: String?
    private var isAuthenticated: Bool = false

    // Keychain service identifier
    private let keychainService = "com.elazar.os.auth"

    init(server: String = "localhost:8080") {
        self.elazarServer = server
        self.deviceFingerprint = generateDeviceFingerprint()
    }

    // MARK: - Device Fingerprint Generation

    private func generateDeviceFingerprint() -> String? {
        var fingerprintData = [String: String]()

        // Get device information
        let device = UIDevice.current

        fingerprintData["model"] = device.model
        fingerprintData["systemName"] = device.systemName
        fingerprintData["systemVersion"] = device.systemVersion
        fingerprintData["identifierForVendor"] = device.identifierForVendor?.uuidString ?? "Unknown"

        // Get CPU info (simplified)
        fingerprintData["processorCount"] = String(ProcessInfo.processInfo.processorCount)

        // Get install date (approximate)
        if let documentsPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first,
           let attributes = try? FileManager.default.attributesOfItem(atPath: documentsPath),
           let creationDate = attributes[.creationDate] as? Date {
            fingerprintData["installDate"] = ISO8601DateFormatter().string(from: creationDate)
        }

        // Sort and combine fingerprint data
        let sortedData = fingerprintData.sorted { $0.key < $1.key }
        let fingerprintString = sortedData.map { "\($0.key):\($0.value)" }.joined(separator: "|")

        // Generate SHA256 hash
        if let data = fingerprintString.data(using: .utf8) {
            let hash = SHA256.hash(data: data)
            return hash.compactMap { String(format: "%02x", $0) }.joined()
        }

        return nil
    }

    // MARK: - Authentication Methods

    func login(username: String, password: String, useBiometrics: Bool = false) async throws -> Bool {
        guard let fingerprint = deviceFingerprint else {
            throw ElazarAuthError.fingerprintGenerationFailed
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())

        let authData: [String: Any] = [
            "username": username,
            "password": password,
            "deviceFingerprint": fingerprint,
            "platform": "ios",
            "useBiometrics": useBiometrics,
            "timestamp": timestamp
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: authData) else {
            throw ElazarAuthError.serializationFailed
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.timeoutInterval = 30

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ElazarAuthError.networkError
        }

        if httpResponse.statusCode == 200 {
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let token = json["token"] as? String {
                authToken = token
                isAuthenticated = true

                // Store token securely in Keychain
                try storeTokenInKeychain(token)

                return true
            }
        }

        throw ElazarAuthError.authenticationFailed
    }

    func validateAuthentication() async throws -> Bool {
        guard isAuthenticated, let token = authToken else {
            return false
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/validate")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ElazarAuthError.networkError
        }

        if httpResponse.statusCode == 200 {
            return true
        } else {
            isAuthenticated = false
            authToken = nil
            try? deleteTokenFromKeychain()
            return false
        }
    }

    func signData(_ data: String) async throws -> String {
        guard isAuthenticated, let token = authToken else {
            throw ElazarAuthError.notAuthenticated
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())

        let signData: [String: Any] = [
            "data": data,
            "deviceFingerprint": deviceFingerprint ?? "",
            "timestamp": timestamp
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: signData) else {
            throw ElazarAuthError.serializationFailed
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/sign")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.timeoutInterval = 30

        let (responseData, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw ElazarAuthError.signingFailed
        }

        if let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
           let signature = json["signature"] as? String {
            return signature
        }

        throw ElazarAuthError.signingFailed
    }

    func verifySignature(data: String, signature: String) async throws -> Bool {
        let timestamp = ISO8601DateFormatter().string(from: Date())

        let verifyData: [String: Any] = [
            "data": data,
            "signature": signature,
            "timestamp": timestamp
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: verifyData) else {
            throw ElazarAuthError.serializationFailed
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/verify")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.timeoutInterval = 30

        let (responseData, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            return false
        }

        if let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
           let isValid = json["isValid"] as? Bool {
            return isValid
        }

        return false
    }

    func lockAccount() async throws -> Bool {
        guard isAuthenticated, let token = authToken else {
            throw ElazarAuthError.notAuthenticated
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/lock")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw ElazarAuthError.lockFailed
        }

        isAuthenticated = false
        authToken = nil
        try? deleteTokenFromKeychain()

        return true
    }

    func checkDeviceTrust() async throws -> Bool {
        guard let fingerprint = deviceFingerprint else {
            return false
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())

        let trustData: [String: Any] = [
            "deviceFingerprint": fingerprint,
            "platform": "ios",
            "timestamp": timestamp
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: trustData) else {
            throw ElazarAuthError.serializationFailed
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/trust")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.timeoutInterval = 30

        let (responseData, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            return false
        }

        if let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any],
           let isTrusted = json["isTrusted"] as? Bool {
            return isTrusted
        }

        return false
    }

    func enableBiometrics() async throws -> Bool {
        guard isAuthenticated, let token = authToken else {
            throw ElazarAuthError.notAuthenticated
        }

        // Check if biometrics are available
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw ElazarAuthError.biometricsNotAvailable
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())

        let bioData: [String: Any] = [
            "platform": "ios",
            "biometricType": context.biometryType == .faceID ? "face_id" : "touch_id",
            "deviceFingerprint": deviceFingerprint ?? "",
            "timestamp": timestamp
        ]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: bioData) else {
            throw ElazarAuthError.serializationFailed
        }

        let url = URL(string: "http://\(elazarServer)/api/auth/biometrics/enable")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        request.timeoutInterval = 30

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw ElazarAuthError.biometricSetupFailed
        }

        return true
    }

    // MARK: - Keychain Operations

    private func storeTokenInKeychain(_ token: String) throws {
        let tokenData = token.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "auth_token",
            kSecValueData as String: tokenData
        ]

        // Delete existing token first
        SecItemDelete(query as CFDictionary)

        // Add new token
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw ElazarAuthError.keychainError
        }
    }

    private func retrieveTokenFromKeychain() throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "auth_token",
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecSuccess, let tokenData = result as? Data, let token = String(data: tokenData, encoding: .utf8) {
            return token
        }

        return nil
    }

    private func deleteTokenFromKeychain() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "auth_token"
        ]

        let status = SecItemDelete(query as CFDictionary)
        if status != errSecSuccess && status != errSecItemNotFound {
            throw ElazarAuthError.keychainError
        }
    }

    // MARK: - Properties

    var isAuthenticated: Bool {
        get { self.isAuthenticated }
        set { self.isAuthenticated = newValue }
    }

    var deviceFingerprint: String? {
        return self.deviceFingerprint
    }
}

// MARK: - Error Types

enum ElazarAuthError: Error {
    case fingerprintGenerationFailed
    case serializationFailed
    case networkError
    case authenticationFailed
    case notAuthenticated
    case signingFailed
    case lockFailed
    case biometricsNotAvailable
    case biometricSetupFailed
    case keychainError
}