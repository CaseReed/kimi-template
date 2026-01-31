import { describe, it, expect } from 'vitest';
import { validateLogin, validateRegister } from './auth';

describe('validateLogin Server Action', () => {
  it('should return success for valid credentials', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'validpassword123');
    formData.append('locale', 'en');

    const result = await validateLogin(null, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.password).toBe('validpassword123');
      expect(result.data.locale).toBe('en');
    }
  });

  it('should return error for invalid email format', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');
    formData.append('password', 'validpassword123');
    formData.append('locale', 'en');

    const result = await validateLogin(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.email).toBeDefined();
      expect(result.state.success).toBe(false);
    }
  });

  it('should return error for missing password', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', '');
    formData.append('locale', 'en');

    const result = await validateLogin(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.password).toBeDefined();
    }
  });

  it('should return error for missing email', async () => {
    const formData = new FormData();
    formData.append('email', '');
    formData.append('password', 'validpassword123');
    formData.append('locale', 'en');

    const result = await validateLogin(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.email).toBeDefined();
    }
  });

  it('should use default locale when not provided', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'validpassword123');
    // No locale appended

    const result = await validateLogin(null, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('en');
    }
  });
});

describe('validateRegister Server Action', () => {
  it('should return success for valid registration data', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('password', 'securepassword123');
    formData.append('confirmPassword', 'securepassword123');
    formData.append('locale', 'en');

    const result = await validateRegister(null, formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
    }
  });

  it('should return error for short name', async () => {
    const formData = new FormData();
    formData.append('name', 'J');
    formData.append('email', 'john@example.com');
    formData.append('password', 'securepassword123');
    formData.append('confirmPassword', 'securepassword123');
    formData.append('locale', 'en');

    const result = await validateRegister(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.name).toBeDefined();
    }
  });

  it('should return error for short password', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('password', 'short');
    formData.append('confirmPassword', 'short');
    formData.append('locale', 'en');

    const result = await validateRegister(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.password).toBeDefined();
    }
  });

  it('should return error for mismatched passwords', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('password', 'password123');
    formData.append('confirmPassword', 'differentpassword');
    formData.append('locale', 'en');

    const result = await validateRegister(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.state.errors?.confirmPassword).toBeDefined();
    }
  });
});
