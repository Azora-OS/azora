/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

NFT CERTIFICATE SERVICE - Blockchain-Verified Educational Credentials
*/

import { AzoraBlockchain, NFTMetadata } from './blockchain-core';

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  courseId: string;
  completionDate: Date;
  grade: number;
  skills: string[];
  instructorName: string;
  nftTokenId?: string;
  blockchainHash?: string;
  constitutionalHash: string;
  verified: boolean;
}

export class NFTCertificateService {
  private blockchain: AzoraBlockchain;

  constructor(blockchain: AzoraBlockchain) {
    this.blockchain = blockchain;
  }

  async mintCertificate(certificate: Certificate, privateKey: string): Promise<string> {
    const metadata: NFTMetadata = {
      studentId: certificate.studentId,
      courseName: certificate.courseName,
      completionDate: certificate.completionDate,
      grade: certificate.grade,
      skills: certificate.skills,
      constitutionalHash: this.blockchain.createConstitutionalHash(certificate)
    };

    const txHash = await this.blockchain.mintNFTCertificate(metadata, privateKey);
    return txHash;
  }

  async verifyCertificate(tokenId: string): Promise<boolean> {
    const metadata = await this.blockchain.verifyCertificate(tokenId);
    return metadata !== null;
  }

  async createCertificate(data: Omit<Certificate, 'id' | 'constitutionalHash' | 'verified'>): Promise<Certificate> {
    const certificate: Certificate = {
      ...data,
      id: `cert-${data.studentId}-${data.courseId}-${Date.now()}`,
      constitutionalHash: this.blockchain.createConstitutionalHash(data),
      verified: false
    };
    return certificate;
  }

  async getCertificateMetadata(tokenId: string): Promise<NFTMetadata | null> {
    return await this.blockchain.verifyCertificate(tokenId);
  }
}
