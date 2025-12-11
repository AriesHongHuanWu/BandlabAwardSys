
import { getEmbedUrl, detectPlatform } from './src/utils/platformDetector';

const url = 'https://www.bandlab.com/track/0070e69c-efbe-ef11-88cd-6045bd345b20?revId=ff6fe69c-efbe-ef11-88cd-6045bd345b20';

console.log('Testing URL:', url);
const platform = detectPlatform(url);
console.log('Detected Platform:', platform);

if (platform !== 'bandlab') {
    console.error('FAILURE: Platform not detected as bandlab');
    process.exit(1);
}

const result = getEmbedUrl(url, platform);
console.log('Resulting Embed URL:', result);

if (result === 'https://www.bandlab.com/embed/?id=ff6fe69c-efbe-ef11-88cd-6045bd345b20') {
    console.log('SUCCESS: Logic matches expectation.');
} else {
    console.log('FAILURE: Logic did not return expected revId embed.');
}
