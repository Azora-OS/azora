import { isPremiumEntitled } from '../../src/vs/workbench/contrib/azstudio/browser/premiumGate.ts';

console.log('About to call isPremiumEntitled()');
isPremiumEntitled().then(res => { console.log('isPremiumEntitled =>', res); }).catch(e => { console.error('isPremiumEntitled threw', e); process.exit(1); });
