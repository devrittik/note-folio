import { certificationSchema } from './certification';
import { educationSchema } from './education';
import { journalEntrySchema } from './journalEntry';
import { projectSchema } from './project';
import { siteSettingsSchema } from './siteSettings';
import { skillGroupSchema } from './skillGroup';

export const schemaTypes = [
  projectSchema,
  journalEntrySchema,
  siteSettingsSchema,
  certificationSchema,
  educationSchema,
  skillGroupSchema
];

export {
  certificationSchema,
  educationSchema,
  journalEntrySchema,
  projectSchema,
  siteSettingsSchema,
  skillGroupSchema
};
