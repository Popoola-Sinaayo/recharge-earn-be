import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get template directory path
const getTemplatePath = (templateName: string): string => {
  // Templates are always in ../templates/email relative to utils folder
  // In development: src/utils -> src/templates/email
  // In production: dist/utils -> dist/templates/email (after copy)
  const basePath = path.join(__dirname, '../templates/email');
  return path.join(basePath, `${templateName}.html`);
};

// Read template file
export const readTemplate = (templateName: string): string => {
  try {
    const templatePath = getTemplatePath(templateName);
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Template ${templateName} not found: ${error}`);
  }
};

// Replace placeholders in template
export const renderTemplate = (templateName: string, variables: Record<string, string>): string => {
  let template = readTemplate(templateName);
  
  // Replace all placeholders
  Object.keys(variables).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = variables[key];
    template = template.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return template;
};

