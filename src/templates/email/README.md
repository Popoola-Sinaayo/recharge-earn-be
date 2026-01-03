# Email Templates

This folder contains HTML email templates used by the application.

## Available Templates

- `otp.html` - Email verification OTP template
- `welcome.html` - Welcome email template

## Template Variables

Templates use `{{VARIABLE_NAME}}` syntax for placeholders that are replaced at runtime.

### OTP Template Variables
- `{{OTP}}` - The 6-digit OTP code
- `{{YEAR}}` - Current year

### Welcome Template Variables
- `{{FIRST_NAME}}` - User's first name
- `{{YEAR}}` - Current year

## Adding New Templates

1. Create a new `.html` file in this folder
2. Use `{{VARIABLE_NAME}}` for dynamic content
3. Update `emailService.ts` to add a function that uses `renderTemplate()`
4. Templates are automatically copied to `dist/templates/email` during build

## Build Process

Templates are automatically copied to the `dist` folder during the build process using the `copy:templates` script in `package.json`.

