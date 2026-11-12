import 'server-only';
import { careersStore } from './store';
import { DEFAULT_CAREERS, type CareersSettings, type Job } from './types';

/** Careers data for the public pages. Without a database (e.g. a build machine) careers is off. */
export async function publicCareers(): Promise<{ settings: CareersSettings; jobs: Job[] }> {
  if (!process.env.DATABASE_URL) return { settings: DEFAULT_CAREERS, jobs: [] };
  const [settings, jobs] = await Promise.all([careersStore.settings(), careersStore.jobs(true)]);
  return { settings, jobs };
}
