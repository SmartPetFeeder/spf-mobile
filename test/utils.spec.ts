import Utils from '../src/utils/Utils';

describe('Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(Utils.isValidEmail('test@example.com')).toBe(true);
      expect(Utils.isValidEmail('user.name+tag@domain.co')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(Utils.isValidEmail('invalid-email')).toBe(false);
      expect(Utils.isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(Utils.isValidPassword('Password1!')).toBe(true);
      expect(Utils.isValidPassword('Abcdefg1@')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(Utils.isValidPassword('short1!')).toBe(false); // too short
      expect(Utils.isValidPassword('NoNumber!')).toBe(false); // no number
      expect(Utils.isValidPassword('nonumber1')).toBe(false); // no special character
    });
  });

  describe('getImageSize', () => {
    it('should return the correct size in KB for a base64 string', () => {
      // "hello" in base64 = aGVsbG8=
      const base64 = 'aGVsbG8=';
      // The size depends on Constants.MAX_SIZE_KB, here we just verify it returns a number
      expect(typeof Utils.getImageSize(base64)).toBe('number');
    });
  });

  describe('getLast4Digits', () => {
    it('should return the last 4 digits of a card number', () => {
      expect(Utils.getLast4Digits('1234567890123456')).toBe('3456');
      expect(Utils.getLast4Digits('1234-5678-9012-3456')).toBe('3456');
      expect(Utils.getLast4Digits('1234 5678 9012 3456')).toBe('3456');
    });

    it('should return an empty string for invalid input', () => {
      expect(Utils.getLast4Digits('')).toBe('');
      expect(Utils.getLast4Digits('abcd')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format a Date object to string', () => {
      const date = new Date('2024-05-20T15:30:00Z');
      const formatted = Utils.formatDate(date);
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/); // format day/month/year
    });

    it('should format an ISO string to string', () => {
      const formatted = Utils.formatDate('2024-05-20T15:30:00Z');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should return 'N/A' for invalid date", () => {
      expect(Utils.formatDate('not-a-date')).toBe('N/A');
      expect(Utils.formatDate(undefined as any)).toBe('N/A');
      expect(Utils.formatDate(null as any)).toBe('N/A');
      expect(Utils.formatDate('')).toBe('N/A');
    });
  });

  describe('detectCardType', () => {
    it('should detect Visa cards', () => {
      expect(Utils.detectCardType('4111111111111111')).toBe('Visa');
      expect(Utils.detectCardType('4000 1234 5678 9010')).toBe('Visa');
    });

    it('should detect Mastercard cards', () => {
      expect(Utils.detectCardType('5105105105105100')).toBe('Mastercard');
      expect(Utils.detectCardType('5500 0000 0000 0004')).toBe('Mastercard');
    });

    it('should detect Amex cards', () => {
      expect(Utils.detectCardType('340000000000009')).toBe('Amex');
      expect(Utils.detectCardType('370000000000002')).toBe('Amex');
    });

    it('should default to Visa for unknown card types', () => {
      expect(Utils.detectCardType('6011000990139424')).toBe('Visa'); // Discover
      expect(Utils.detectCardType('')).toBe('Visa');
      expect(Utils.detectCardType('abcd')).toBe('Visa');
    });

    describe('formatPrice', () => {
      it('should format price in USD for en locale', () => {
        expect(Utils.formatPrice(1234.56, 'en', 'USD')).toMatch(/\$\s?1,234\.56/);
      });

      it('should format price in EUR for fr locale', () => {
        expect(Utils.formatPrice(1234.56, 'fr', 'EUR')).toMatch(/1\s?234,56\s?€/);
      });

      it('should use default currency USD for en locale if not provided', () => {
        expect(Utils.formatPrice(100, 'en')).toMatch(/\$\s?100\.00/);
      });

      it('should use default currency EUR for fr locale if not provided', () => {
        expect(Utils.formatPrice(100, 'fr')).toMatch(/100,00\s?€/);
      });

      it('should format zero correctly', () => {
        expect(Utils.formatPrice(0, 'en', 'USD')).toMatch(/\$\s?0\.00/);
        expect(Utils.formatPrice(0, 'fr', 'EUR')).toMatch(/0,00\s?€/);
      });
    });
  });
});
