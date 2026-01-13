const dns = require('dns');
const https = require('https');

console.log('----------------------------------------');
console.log('   Network Connectivity Test');
console.log('----------------------------------------');

const domain = 'eutils.ncbi.nlm.nih.gov';

console.log(`1. Testing DNS resolution for: ${domain}`);
dns.lookup(domain, (err, address, family) => {
    if (err) {
        console.error('❌ DNS Lookup FAILED:');
        console.error(err);
        console.log('\nPossible causes:');
        console.log('- No internet connection.');
        console.log('- DNS server issues.');
        console.log('- Corporate firewall/proxy blocking this domain.');
    } else {
        console.log(`✅ DNS Lookup SUCCESS: ${address} (IPv${family})`);

        console.log('\n2. Testing HTTPS connection to PubMed...');
        const options = {
            hostname: domain,
            port: 443,
            path: '/entrez/eutils/esearch.fcgi?db=pubmed&term=test',
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            console.log(`✅ HTTPS Connection SUCCESS. Status Code: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('   (PubMed API is reachable)');
            } else {
                console.log('   (Connected, but received unexpected status)');
            }
        });

        req.on('error', (e) => {
            console.error('❌ HTTPS Connection FAILED:');
            console.error(e);
        });

        req.end();
    }
});
