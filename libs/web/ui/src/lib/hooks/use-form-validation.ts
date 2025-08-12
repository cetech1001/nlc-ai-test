import { useState } from 'react';

export type ValidationRule<T = any> = (value: T) => string | undefined;

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule[]>>;
}

export function useFormValidation<T extends Record<string, any>>({
 initialValues,
 validationRules = {},
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: keyof T, value: any): string | undefined => {
    const rules = validationRules[field];
    if (!rules) return undefined;

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
  };
}

export const validationRules = {
  required: (message = "This field is required"): ValidationRule =>
    (value) => !value || (typeof value === 'string' && !value.trim()) ? message : undefined,

  email: (message = "Please enter a valid email"): ValidationRule =>
    (value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : undefined,

  minLength: (min: number, message?: string): ValidationRule =>
    (value) => value && value.length < min ? message || `Must be at least ${min} characters` : undefined,

  password: (message = "Password must contain uppercase, lowercase, number, and special character"): ValidationRule =>
    (value) => value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(value) ? message : undefined,

  positiveNumber: (message = "Must be a positive number"): ValidationRule =>
    (value) => value && (isNaN(Number(value)) || Number(value) <= 0) ? message : undefined,
};
