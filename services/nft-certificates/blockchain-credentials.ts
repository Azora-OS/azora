import { createHash } from 'crypto';

interface NFTCertificate {
  id: string;
  studentId: string;
  courseId: string;
  completionDate: Date;
  skills: string[];
  hash: string;
}

export class NFTCertificateSystem {
  private certificates = new Map<string, NFTCertificate>();

  mint(studentId: string, courseId: string, skills: string[]): NFTCertificate {
    const id = `CERT-${Date.now()}-${studentId}`;
    const data = `${studentId}:${courseId}:${Date.now()}`;
    const hash = createHash('sha256').update(data).digest('hex');
    
    const cert: NFTCertificate = {
      id,
      studentId,
      courseId,
      completionDate: new Date(),
      skills,
      hash
    };
    
    this.certificates.set(id, cert);
    return cert;
  }

  verify(certId: string): NFTCertificate | null {
    return this.certificates.get(certId) || null;
  }

  getStudentCertificates(studentId: string): NFTCertificate[] {
    return Array.from(this.certificates.values())
      .filter(cert => cert.studentId === studentId);
  }
}
