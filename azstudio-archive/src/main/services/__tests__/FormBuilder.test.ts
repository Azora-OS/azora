import { FormBuilder, FormSpec } from '../FormBuilder';

describe('FormBuilder', () => {
  let builder: FormBuilder;

  beforeEach(() => {
    builder = new FormBuilder();
  });

  describe('generateForm', () => {
    it('should generate a basic form with text inputs', () => {
      const spec: FormSpec = {
        id: 'contact-form',
        name: 'ContactForm',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Name',
            required: true,
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');

      expect(changes.length).toBeGreaterThan(0);
      const componentChange = changes.find(c => c.path.includes('components'));
      expect(componentChange).toBeDefined();
      expect(componentChange?.content).toContain('useForm');
      expect(componentChange?.content).toContain('zodResolver');
      expect(componentChange?.content).toContain('register');
    });

    it('should generate Zod schema file', () => {
      const spec: FormSpec = {
        id: 'user-form',
        name: 'UserForm',
        fields: [
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');

      const schemaChange = changes.find(c => c.path.includes('schemas'));
      expect(schemaChange).toBeDefined();
      expect(schemaChange?.content).toContain('import { z } from');
      expect(schemaChange?.content).toContain('export const userFormSchema');
      expect(schemaChange?.content).toContain('export type UserFormFormData');
    });

    it('should handle textarea fields', () => {
      const spec: FormSpec = {
        id: 'feedback-form',
        name: 'FeedbackForm',
        fields: [
          {
            name: 'message',
            type: 'textarea',
            label: 'Message',
            placeholder: 'Enter your feedback',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('<textarea');
      expect(componentChange?.content).toContain('rows={4}');
      expect(componentChange?.content).toContain('Enter your feedback');
    });

    it('should handle select fields with options', () => {
      const spec: FormSpec = {
        id: 'survey-form',
        name: 'SurveyForm',
        fields: [
          {
            name: 'country',
            type: 'select',
            label: 'Country',
            required: true,
            options: [
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'United Kingdom', value: 'uk' },
            ],
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('<select');
      expect(componentChange?.content).toContain('United States');
      expect(componentChange?.content).toContain('value="us"');
    });

    it('should handle checkbox fields', () => {
      const spec: FormSpec = {
        id: 'terms-form',
        name: 'TermsForm',
        fields: [
          {
            name: 'acceptTerms',
            type: 'checkbox',
            label: 'I accept the terms and conditions',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('type="checkbox"');
      expect(componentChange?.content).toContain('I accept the terms and conditions');
    });

    it('should handle radio button fields', () => {
      const spec: FormSpec = {
        id: 'preference-form',
        name: 'PreferenceForm',
        fields: [
          {
            name: 'theme',
            type: 'radio',
            label: 'Theme Preference',
            required: true,
            options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'Auto', value: 'auto' },
            ],
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('type="radio"');
      expect(componentChange?.content).toContain('Light');
      expect(componentChange?.content).toContain('Dark');
      expect(componentChange?.content).toContain('Auto');
    });

    it('should generate validation rules in Zod schema', () => {
      const spec: FormSpec = {
        id: 'registration-form',
        name: 'RegistrationForm',
        fields: [
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            required: true,
            validation: {
              minLength: 3,
              maxLength: 20,
            },
          },
          {
            name: 'age',
            type: 'number',
            label: 'Age',
            required: true,
            validation: {
              min: 18,
              max: 120,
            },
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const schemaChange = changes.find(c => c.path.includes('schemas'));
      
      expect(schemaChange?.content).toContain('.min(3');
      expect(schemaChange?.content).toContain('.max(20');
      expect(schemaChange?.content).toContain('.min(18');
      expect(schemaChange?.content).toContain('.max(120');
    });

    it('should handle optional fields', () => {
      const spec: FormSpec = {
        id: 'profile-form',
        name: 'ProfileForm',
        fields: [
          {
            name: 'bio',
            type: 'textarea',
            label: 'Bio',
            required: false,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const schemaChange = changes.find(c => c.path.includes('schemas'));
      
      expect(schemaChange?.content).toContain('.optional()');
    });

    it('should generate form with submit endpoint', () => {
      const spec: FormSpec = {
        id: 'contact-form',
        name: 'ContactForm',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
          },
        ],
        submitEndpoint: '/api/contact',
        submitMethod: 'POST',
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('useMutation');
      expect(componentChange?.content).toContain('/api/contact');
      expect(componentChange?.content).toContain("method: 'POST'");
    });

    it('should include success redirect', () => {
      const spec: FormSpec = {
        id: 'login-form',
        name: 'LoginForm',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
          },
        ],
        submitEndpoint: '/api/login',
        onSuccessRedirect: '/dashboard',
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('useRouter');
      expect(componentChange?.content).toContain("router.push('/dashboard')");
    });

    it('should generate error display for mutations', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'field',
            type: 'text',
            label: 'Field',
            required: true,
          },
        ],
        submitEndpoint: '/api/submit',
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('mutation.isError');
      expect(componentChange?.content).toContain('mutation.isSuccess');
      expect(componentChange?.content).toContain('bg-red-50');
      expect(componentChange?.content).toContain('bg-green-50');
    });

    it('should include reset button', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'field',
            type: 'text',
            label: 'Field',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('onClick={() => reset()}');
      expect(componentChange?.content).toContain('Reset');
    });

    it('should disable submit button while submitting', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'field',
            type: 'text',
            label: 'Field',
            required: true,
          },
        ],
        submitEndpoint: '/api/submit',
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('disabled={isSubmitting');
      expect(componentChange?.content).toContain('Submitting...');
    });

    it('should handle email validation', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const schemaChange = changes.find(c => c.path.includes('schemas'));
      
      expect(schemaChange?.content).toContain('.email(');
      expect(schemaChange?.content).toContain('Invalid email address');
    });

    it('should handle URL validation', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'website',
            type: 'url',
            label: 'Website',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const schemaChange = changes.find(c => c.path.includes('schemas'));
      
      expect(schemaChange?.content).toContain('.url(');
      expect(schemaChange?.content).toContain('Invalid URL');
    });

    it('should handle pattern validation', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'phone',
            type: 'tel',
            label: 'Phone',
            required: true,
            validation: {
              pattern: '^\\d{10}$',
            },
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const schemaChange = changes.find(c => c.path.includes('schemas'));
      
      expect(schemaChange?.content).toContain('.regex(');
      expect(schemaChange?.content).toContain('^\\d{10}$');
    });

    it('should display field errors', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('errors.username');
      expect(componentChange?.content).toContain('text-red-600');
      expect(componentChange?.content).toContain('?.message');
    });

    it('should support default values', () => {
      const spec: FormSpec = {
        id: 'form',
        name: 'Form',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Name',
            required: true,
          },
        ],
      };

      const changes = builder.generateForm(spec, '/test/output');
      const componentChange = changes.find(c => c.path.includes('components'));
      
      expect(componentChange?.content).toContain('defaultValues');
      expect(componentChange?.content).toContain('Partial<');
    });
  });
});
