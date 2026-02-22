/**
 * Client-side RSVP form validation tests.
 * Reads test cases from test/test_validation.csv.
 *
 * - "expect: reject" tests intercept fetch (nothing sent to Google)
 * - "expect: accept" tests let the real fetch through (appears in your Google Sheet)
 *
 * Usage: Open your site in a browser, open DevTools console, paste this script and hit Enter.
 */
(async function runValidationTests() {
    // ── Load CSV ──
    const csvUrl = 'test/test_validation.csv';
    const resp = await fetch(csvUrl);
    if (!resp.ok) {
        console.error(`Failed to load ${csvUrl} (${resp.status}). Make sure you're running from the site root.`);
        return;
    }

    const csvText = await resp.text();
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const tests = lines.slice(1).map(line => {
        const vals = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
        return obj;
    });

    // ── Simple CSV parser (handles quoted commas) ──
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    // ── Intercept fetch for reject tests, allow through for accept tests ──
    let fetchCalled = false;
    let allowReal = false;
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('formResponse')) {
            fetchCalled = true;
            if (allowReal) {
                return originalFetch.apply(this, args);
            }
            return Promise.resolve(new Response('', { status: 200 }));
        }
        return originalFetch.apply(this, args);
    };

    const form = document.getElementById('rsvpForm');
    const successMessage = document.getElementById('successMessage');
    let passed = 0;
    let failed = 0;

    console.log(`%cRunning ${tests.length} client-side validation tests...\n`, 'font-weight: bold; font-size: 14px');

    for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const expect = t.expect || 'reject';

        // Reset form state
        form.reset();
        form.style.display = '';
        successMessage.classList.remove('visible');
        // Clear any red borders from previous test
        form.querySelectorAll('[style]').forEach(el => el.style.borderColor = '');

        // Fill in fields
        document.getElementById('name').value = t.name || '';
        document.getElementById('email').value = t.email || '';

        // Set attending radio
        const yesRadio = document.getElementById('attending-yes');
        const noRadio = document.getElementById('attending-no');
        const attending = (t.attending || '').toLowerCase();
        yesRadio.checked = attending === 'yes';
        noRadio.checked = attending === 'no';
        if (attending) {
            const radio = attending === 'yes' ? yesRadio : noRadio;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Wait for conditional fields
        await new Promise(r => setTimeout(r, 150));

        // Fill conditional fields
        document.getElementById('guestnames').value = t.guestnames || '';
        document.getElementById('dietary').value = t.dietary || '';
        document.getElementById('song').value = t.song || '';
        document.getElementById('advice').value = t.advice || '';
        document.getElementById('funfact').value = t.funfact || '';
        document.getElementById('otherquestion').value = t.otherquestion || '';

        // Set taxi radio
        const taxi = (t.taxi || '').toLowerCase();
        document.getElementById('taxi-yes').checked = taxi === 'yes';
        document.getElementById('taxi-no').checked = taxi === 'no';

        // Submit - allow real fetch for accept tests
        fetchCalled = false;
        allowReal = expect === 'accept';
        form.requestSubmit();

        // Wait for submission
        await new Promise(r => setTimeout(r, 300));

        const submitted = fetchCalled;
        const actual = submitted ? 'accept' : 'reject';
        const match = actual === expect;

        const sent = (submitted && expect === 'accept') ? ' (sent to Google)' : '';

        if (match) {
            passed++;
            console.log(`%c  PASS %c ${t.description}: ${actual}${sent}`, 'color: green; font-weight: bold', '');
        } else {
            failed++;
            console.log(`%c  FAIL %c ${t.description}: got ${actual}, expected ${expect}`, 'color: red; font-weight: bold', '');
        }

        // Small delay between tests
        await new Promise(r => setTimeout(r, 100));
    }

    // Restore everything
    window.fetch = originalFetch;
    form.reset();
    form.style.display = '';
    successMessage.classList.remove('visible');
    form.querySelectorAll('[style]').forEach(el => el.style.borderColor = '');

    const color = failed ? 'red' : 'green';
    console.log(`\n%cResults: ${passed} passed, ${failed} failed out of ${tests.length} tests`,
        `font-weight: bold; font-size: 14px; color: ${color}`);
    if (!failed) {
        console.log('%cValid submissions have been sent to your Google Sheet.', 'color: gray; font-style: italic');
    }
})();
