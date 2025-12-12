import Utils from '../src/utils/Utils';

describe('Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(Utils.isValidEmail('test@example.com')).toBe(true);
      expect(Utils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(Utils.isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(Utils.isValidEmail('invalid-email')).toBe(false);
      expect(Utils.isValidEmail('test@')).toBe(false);
      expect(Utils.isValidEmail('@example.com')).toBe(false);
      expect(Utils.isValidEmail('test@example')).toBe(false);
      expect(Utils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(Utils.isValidPassword('Password123!')).toBe(true);
      expect(Utils.isValidPassword('MyPass1@')).toBe(true);
      expect(Utils.isValidPassword('Secure123$')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(Utils.isValidPassword('password')).toBe(false); // no uppercase, no number, no special char
      expect(Utils.isValidPassword('PASSWORD123!')).toBe(false); // no lowercase
      expect(Utils.isValidPassword('Password!')).toBe(false); // no number
      expect(Utils.isValidPassword('Password123')).toBe(false); // no special char
      expect(Utils.isValidPassword('Pass1!')).toBe(false); // too short
      expect(Utils.isValidPassword('')).toBe(false);
    });
  });

  describe('getImageSize', () => {
    it('should calculate image size correctly', () => {
      const base64String = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const result = Utils.getImageSize(base64String);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should handle base64 strings with different padding', () => {
      const noPadding = 'SGVsbG8gV29ybGQ';
      const onePadding = 'SGVsbG8gV29ybGQ=';
      const twoPadding = 'SGVsbG8gV29ybGQ==';

      expect(Utils.getImageSize(noPadding)).toBeGreaterThan(0);
      expect(Utils.getImageSize(onePadding)).toBeGreaterThan(0);
      expect(Utils.getImageSize(twoPadding)).toBeGreaterThan(0);
    });
  });

  describe('getLast4Digits', () => {
    it('should return last 4 digits from card number', () => {
      expect(Utils.getLast4Digits('1234567890123456')).toBe('3456');
      expect(Utils.getLast4Digits('4111-1111-1111-1111')).toBe('1111');
      expect(Utils.getLast4Digits('4111 1111 1111 1111')).toBe('1111');
    });

    it('should handle short numbers', () => {
      expect(Utils.getLast4Digits('123')).toBe('123');
      expect(Utils.getLast4Digits('12')).toBe('12');
    });

    it('should handle empty string', () => {
      expect(Utils.getLast4Digits('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      const date = new Date('2023-12-25T10:30:00');
      const result = Utils.formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format date strings correctly', () => {
      const result = Utils.formatDate('2023-12-25T10:30:00');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should return "N/A" for invalid dates', () => {
      expect(Utils.formatDate('invalid-date')).toBe('N/A');
      expect(Utils.formatDate('')).toBe('N/A');
    });

    it('should return "N/A" for null/undefined', () => {
      expect(Utils.formatDate(null as any)).toBe('N/A');
      expect(Utils.formatDate(undefined as any)).toBe('N/A');
    });
  });

  describe('detectCardType', () => {
    it('should detect Visa cards', () => {
      expect(Utils.detectCardType('4111111111111111')).toBe('Visa');
      expect(Utils.detectCardType('4111-1111-1111-1111')).toBe('Visa');
      expect(Utils.detectCardType('4000 0000 0000 0000')).toBe('Visa');
    });

    it('should detect Mastercard', () => {
      expect(Utils.detectCardType('5555555555554444')).toBe('Mastercard');
      expect(Utils.detectCardType('5105-1051-0510-5100')).toBe('Mastercard');
    });

    it('should detect Amex', () => {
      expect(Utils.detectCardType('378282246310005')).toBe('Amex');
      expect(Utils.detectCardType('371449635398431')).toBe('Amex');
    });

    it('should default to Visa for unknown card types', () => {
      expect(Utils.detectCardType('123456789')).toBe('Visa');
      expect(Utils.detectCardType('0000000000000000')).toBe('Visa');
    });
  });

  describe('formatPrice', () => {
    it('should format price in USD by default', () => {
      expect(Utils.formatPrice(29.99)).toMatch(/\$29\.99/);
      expect(Utils.formatPrice(100)).toMatch(/\$100\.00/);
    });

    it('should format price in EUR for French locale', () => {
      expect(Utils.formatPrice(29.99, 'fr')).toMatch(/29,99\s*€/);
    });

    it('should use custom currency when provided', () => {
      const result = Utils.formatPrice(29.99, 'en', 'GBP');
      expect(result).toMatch(/£29\.99/);
    });

    it('should handle zero and negative amounts', () => {
      expect(Utils.formatPrice(0)).toMatch(/\$0\.00/);
      expect(Utils.formatPrice(-10.5)).toMatch(/-\$10\.50/);
    });
  });
});
