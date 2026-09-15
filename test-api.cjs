const https = require('https');

https.get('https://feeds.behold.so/B2JdcKxvJqnrHEnhiqO3', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Status code:', res.statusCode);
      if (parsed.status === 'error') {
        console.log('API Error:', parsed.message);
      } else if (Array.isArray(parsed)) {
        console.log('Got array with length:', parsed.length);
      } else if (parsed.posts) {
        console.log('Got posts object, length:', parsed.posts.length);
      } else {
        console.log('Got unknown JSON structure:', Object.keys(parsed));
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
      console.log('Raw data snippet:', data.substring(0, 100));
    }
  });
}).on('error', (err) => {
  console.log('Network error:', err.message);
});
