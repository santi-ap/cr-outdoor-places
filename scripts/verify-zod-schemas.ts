// Quick script for Issue #3's acceptance criteria: confirms the zod schemas
// reject an invalid enum value and accept a valid payload.
import { placeInsertSchema } from '../src/lib/validation/schemas';

const validPlace = {
  name: 'Test Park',
  category: 'national_park',
  lat: 9.9,
  lng: -84.1,
  difficulty: 'moderate',
};

const invalidPlace = {
  ...validPlace,
  difficulty: 'extreme',
};

const validResult = placeInsertSchema.safeParse(validPlace);
const invalidResult = placeInsertSchema.safeParse(invalidPlace);

if (!validResult.success) {
  console.error('expected valid payload to parse:', validResult.error.message);
  process.exit(1);
}
console.log('valid payload accepted');

if (invalidResult.success) {
  console.error('expected invalid difficulty enum to be rejected, but it parsed');
  process.exit(1);
}
console.log('invalid enum correctly rejected:', invalidResult.error.issues[0].message);
