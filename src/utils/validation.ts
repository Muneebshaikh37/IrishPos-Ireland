type Errors = Record<string, string[]>;

class FormErrors {
  private errors: Errors;

  constructor() {
    this.errors = {};
  }

  setErrors(errors?: Errors): void {
    this.errors = errors || {};
  }

  getError(field: string): string {
    return this.errors[field][0] || null;
    // return (this.errors[field] && this.errors[field][0]) || '';  // Return an empty string if no error exists

  }

  invalid(field: string): boolean {
    return !!this.errors[field];
  }

  valid(field: string): boolean {
    return !this.invalid(field);
  }

  clear(): void {
    this.errors = {};
  }
}

export default FormErrors;
