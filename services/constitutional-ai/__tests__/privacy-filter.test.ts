/**
 * Privacy Filter Tests
 */

import { PrivacyFilter } from '../validators/privacy-filter';
import { PrivacyFilterService } from '../services/privacy-filter-service';
import { PIIType } from '../types';

describe('PrivacyFilter', () => {
  let filter: PrivacyFilter;

  beforeEach(() => {
    filter = new PrivacyFilter();
  });

  describe('Email Detection', () => {
    it('should detect email addresses', async () => {
      const text = 'Contact me at john.doe@example.com for more info';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe(PIIType.EMAIL);
      expect(matches[0].value).toBe('john.doe@example.com');
    });

    it('should redact email addresses', async () => {
      const text = 'Email: user@domain.com';
      const result = await filter.filterPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.filteredOutput).not.toContain('user@domain.com');
      expect(result.redactionCount).toBe(1);
    });
  });

  describe('Phone Number Detection', () => {
    it('should detect phone numbers', async () => {
      const text = 'Call me at 555-123-4567';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(0);
      const phoneMatch = matches.find(m => m.type === PIIType.PHONE);
      expect(phoneMatch).toBeDefined();
    });

    it('should redact phone numbers', async () => {
      const text = 'Phone: (555) 123-4567';
      const result = await filter.filterPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.filteredOutput).not.toContain('555');
    });
  });

  describe('SSN Detection', () => {
    it('should detect SSN', async () => {
      const text = 'SSN: 123-45-6789';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe(PIIType.SSN);
    });

    it('should redact SSN', async () => {
      const text = 'My SSN is 123-45-6789';
      const result = await filter.filterPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.filteredOutput).not.toContain('123-45-6789');
    });
  });

  describe('Credit Card Detection', () => {
    it('should detect credit card numbers', async () => {
      const text = 'Card: 4532-1234-5678-9010';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(0);
      const ccMatch = matches.find(m => m.type === PIIType.CREDIT_CARD);
      expect(ccMatch).toBeDefined();
    });
  });

  describe('IP Address Detection', () => {
    it('should detect IP addresses', async () => {
      const text = 'Server IP: 192.168.1.1';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe(PIIType.IP_ADDRESS);
    });
  });

  describe('Multiple PII Types', () => {
    it('should detect multiple PII types in one text', async () => {
      const text = 'Contact John at john@example.com or call 555-1234';
      const matches = await filter.detectPII(text);
      
      expect(matches.length).toBeGreaterThan(1);
    });

    it('should redact all PII instances', async () => {
      const text = 'Email: test@test.com, Phone: 555-0000, SSN: 123-45-6789';
      const result = await filter.filterPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.redactionCount).toBeGreaterThanOrEqual(2);
      expect(result.filteredOutput).not.toContain('test@test.com');
      expect(result.filteredOutput).not.toContain('123-45-6789');
    });
  });

  describe('No PII', () => {
    it('should return original text when no PII detected', async () => {
      const text = 'This is a clean text with no personal information';
      const result = await filter.filterPII(text);
      
      expect(result.hasPII).toBe(false);
      expect(result.filteredOutput).toBe(text);
      expect(result.redactionCount).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should respect custom redaction pattern', async () => {
      const customFilter = new PrivacyFilter({
        redactionPattern: '***HIDDEN***'
      });
      
      const text = 'Email: test@example.com';
      const result = await customFilter.filterPII(text);
      
      expect(result.filteredOutput).toContain('***HIDDEN***');
    });

    it('should allow selective PII type detection', async () => {
      const selectiveFilter = new PrivacyFilter({
        piiTypesToDetect: [PIIType.EMAIL]
      });
      
      const text = 'Email: test@test.com, Phone: 555-1234';
      const matches = await selectiveFilter.detectPII(text);
      
      expect(matches.every(m => m.type === PIIType.EMAIL)).toBe(true);
    });
  });
});

describe('PrivacyFilterService', () => {
  let service: PrivacyFilterService;

  beforeEach(() => {
    service = new PrivacyFilterService();
    service.resetStats();
  });

  describe('Filter Method', () => {
    it('should filter text and update stats', async () => {
      const text = 'Contact: user@example.com';
      const result = await service.filter(text);
      
      expect(result.hasPII).toBe(true);
      
      const stats = service.getStats();
      expect(stats.totalFiltered).toBe(1);
      expect(stats.totalPIIDetected).toBeGreaterThan(0);
    });

    it('should handle empty text', async () => {
      const result = await service.filter('');
      
      expect(result.hasPII).toBe(false);
      expect(result.filteredOutput).toBe('');
    });
  });

  describe('Statistics', () => {
    it('should track PII by type', async () => {
      await service.filter('Email: test@test.com');
      await service.filter('Phone: 555-1234');
      
      const stats = service.getStats();
      expect(stats.totalFiltered).toBe(2);
      expect(stats.piiByType[PIIType.EMAIL]).toBeGreaterThan(0);
    });

    it('should calculate average processing time', async () => {
      await service.filter('Test text with email@test.com');
      
      const stats = service.getStats();
      expect(stats.averageProcessingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Custom Redaction Patterns', () => {
    it('should apply custom redaction patterns', async () => {
      service.addCustomRedactionPattern(PIIType.EMAIL, '[EMAIL_REMOVED]');
      
      const text = 'Contact: user@example.com';
      const result = await service.filter(text);
      
      expect(result.filteredOutput).toContain('[EMAIL_REMOVED]');
    });
  });

  describe('Configuration Management', () => {
    it('should allow enabling/disabling PII types', async () => {
      service.setPIITypeEnabled(PIIType.PHONE, false);
      
      const text = 'Email: test@test.com, Phone: 555-1234';
      const result = await service.filter(text);
      
      const phoneMatch = result.matches.find(m => m.type === PIIType.PHONE);
      expect(phoneMatch).toBeUndefined();
    });

    it('should allow enabling/disabling service', () => {
      service.setEnabled(false);
      expect(service.isEnabled()).toBe(false);
      
      service.setEnabled(true);
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('Detect Method', () => {
    it('should detect PII without redaction', async () => {
      const text = 'Email: test@example.com';
      const matches = await service.detect(text);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].type).toBe(PIIType.EMAIL);
    });
  });
});
