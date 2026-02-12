import type { Rule } from 'antd/es/form';

/**
 * Validates that the input contains only numeric characters
 */
export const validateNumericOnly = (message: string = 'Please enter only numbers'): Rule => ({
    pattern: /^[0-9]*$/,
    message
});

/**
 * Validates that the input is a positive number greater than 0
 */
export const validatePositiveNumber = (message: string = 'Value must be greater than 0'): Rule => ({
    validator: (_, value) => {
        if (value && value <= 0) {
            return Promise.reject(new Error(message));
        }
        return Promise.resolve();
    }
});

/**
 * Validates GST number format (15 alphanumeric characters)
 */
export const validateGST = (): Rule[] => [
    { required: true, message: 'Please enter GST number' },
    { len: 15, message: 'GST number must be 15 characters' },
    { pattern: /^[0-9A-Z]{15}$/, message: 'GST number must contain only uppercase letters and numbers' }
];

/**
 * Validates phone number (10 digits)
 */
export const validatePhone = (): Rule[] => [
    { required: true, message: 'Please enter phone number' },
    validateNumericOnly('Phone number must contain only digits'),
    { len: 10, message: 'Phone number must be 10 digits' }
];

/**
 * Validates pincode (6 digits)
 */
export const validatePincode = (): Rule[] => [
    { required: true, message: 'Please enter pincode' },
    validateNumericOnly('Pincode must contain only digits'),
    { len: 6, message: 'Pincode must be 6 digits' }
];

/**
 * Validates HSN code (numeric only, typically 4-8 digits)
 */
export const validateHSN = (): Rule[] => [
    { required: true, message: 'Please enter HSN code' },
    validateNumericOnly('HSN code must contain only digits'),
    { min: 4, max: 8, message: 'HSN code must be 4-8 digits' }
];

/**
 * Validates amount fields (positive numbers only via InputNumber component)
 */
export const validateAmount = (): Rule[] => [
    { required: true, message: 'Please enter amount' },
    validatePositiveNumber()
];

/**
 * Validates quantity fields (positive numbers only)
 */
export const validateQuantity = (): Rule[] => [
    { required: true, message: 'Please enter quantity' },
    validatePositiveNumber('Quantity must be greater than 0')
];

/**
 * Validates rate fields (positive numbers only)
 */
export const validateRate = (): Rule[] => [
    { required: true, message: 'Please enter rate' },
    validatePositiveNumber('Rate must be greater than 0')
];
