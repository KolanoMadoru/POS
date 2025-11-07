export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  return errors;
};

export const validateRequiredField = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export const validateSku = (sku: string): boolean => {
  return /^[A-Z0-9-]+$/.test(sku);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^(\+62|62|0)[0-9]{9,12}$/;
  return re.test(phone.replace(/\s+/g, ''));
};
