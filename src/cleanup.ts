import { deleteConfig } from './config';

(async () => {
  try {
    await deleteConfig();
    console.log('✅ Removed all DeepReview configuration');
  } catch (error) {
    console.error('⚠️ Cleanup failed:', error instanceof Error ? error.message : 'Unknown error');
  }
})(); 