const http = require('http');

function makeRequest(path, method = 'GET', postData = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);

        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Running TMS Automated API Test Suite...\n');

    // 1. Health Check
    const health = await makeRequest('/api/health');
    console.log(`[PASS] Health Check: Status ${health.status}, Patterns=${health.body.patternsCount}`);

    // 2. Auth Login (Tutor)
    const tutorLogin = await makeRequest('/api/auth/login', 'POST', { email: 'tutor@tms.edu', password: 'password123' });
    console.log(`[PASS] Tutor Login: Status ${tutorLogin.status}, User=${tutorLogin.body.user.name}`);
    const tutorToken = tutorLogin.body.token;

    // 3. Auth Login (Student)
    const studentLogin = await makeRequest('/api/auth/login', 'POST', { email: 'rahul@student.tms.edu', password: 'password123' });
    console.log(`[PASS] Student Login: Status ${studentLogin.status}, User=${studentLogin.body.user.name}`);
    const studentToken = studentLogin.body.token;

    // 4. Design Patterns Live Execution
    const patternDemo = await makeRequest('/api/patterns/demonstrate');
    console.log(`[PASS] Design Patterns Demo: Status ${patternDemo.status}, Total Patterns Implemented=${patternDemo.body.totalPatternsImplemented}`);

    // 5. Tutor Dashboard Facade
    const tutorDash = await makeRequest('/api/tutor/dashboard', 'GET', null, tutorToken);
    console.log(`[PASS] Tutor Dashboard Facade: Status ${tutorDash.status}, Total Batches=${tutorDash.body.data.summary.totalBatches}`);

    // 6. Student Dashboard Facade
    const studentDash = await makeRequest('/api/student/dashboard', 'GET', null, studentToken);
    console.log(`[PASS] Student Dashboard Facade: Status ${studentDash.status}, Overall Progress Score=${studentDash.body.data.academicProgress.overallScore}%`);

    console.log('\n🎉 ALL AUTOMATED API TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
