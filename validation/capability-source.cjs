/* Source-only checks for visually verified PDF pages 8–11. No browser or DOM. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const target = path.resolve(process.argv[2] || root);
const baseline = path.join(__dirname, 'baseline-v35');
const failures = [];
let passed = 0;
function check(name, fn) {
  try { fn(); passed++; }
  catch (error) { failures.push({name, message:error.message}); }
}
function cinemaCopy(dir) {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(dir, 'content/cinema.js'), 'utf8'), context, {timeout:1000});
  return JSON.parse(JSON.stringify(context.window.MOD_CINEMA_COPY));
}
function capabilityCopy(dir) {
  const source = fs.readFileSync(path.join(dir, 'scripts/capability-film.js'), 'utf8');
  const start = source.indexOf('const copy=') + 'const copy='.length;
  const end = source.indexOf('\ncopy.en.ai=', start);
  assert.ok(start >= 'const copy='.length && end > start, 'Active copy data boundary exists');
  const expression = source.slice(start, end).trim().replace(/;$/, '');
  return JSON.parse(JSON.stringify(vm.runInNewContext('('+expression+')', {}, {timeout:1000})));
}
function includesAll(value, patterns, name) {
  patterns.forEach(pattern => assert.match(value, pattern, name+' must preserve '+pattern));
}
const cinema = cinemaCopy(target), cap = capabilityCopy(target);
const originalCinema = cinemaCopy(baseline), originalCap = capabilityCopy(baseline);

// Independent facts manually transcribed from PDF page 8, not generated from current copy.
check('PDF8 EN resource scope', () => includesAll(JSON.stringify(cap.en.dispatch), [/personnel/i,/vehicles/i,/drones/i,/teams/i], 'Tactical resources'));
check('PDF8 AR resource scope', () => includesAll(JSON.stringify(cap.ar.dispatch), [/الأفراد/,/المركبات/,/الطائرات المسيّرة/,/الفرق/], 'الموارد التكتيكية'));
check('PDF8 EN monitored data and command platform', () => includesAll(JSON.stringify(cap.en.dispatch), [/real-time/i,/location/i,/status/i,/operational data/i,/GINA/,/centralized/i], 'Resource monitoring'));
check('PDF8 AR monitored data and command platform', () => includesAll(JSON.stringify(cap.ar.dispatch), [/الوقت الفعلي/,/الموقع/,/الحالة/,/العمليات/,/GINA/,/المركزي/], 'مراقبة الموارد'));

// PDF page 9 explicitly contains BOTH coordinate and mission assignment, and three GINA views.
check('PDF9 EN operator mission and coordinate assignment', () => includesAll(cinema.en.drone.stages[0][2], [/operator/i,/assign/i,/coordinates/i,/mission/i], 'Drone assignment'));
check('PDF9 AR operator mission and coordinate assignment', () => includesAll(cinema.ar.drone.stages[0][2], [/المشغّل/,/إحداثيات/,/المهمة/], 'تكليف الطائرة'));
check('PDF9 EN receives mission and flies to coordinate', () => includesAll(cinema.en.drone.stages[2][2], [/receives.*mission/i,/flies.*coordinates/i], 'Drone navigation'));
check('PDF9 AR receives mission and flies to coordinate', () => includesAll(cinema.ar.drone.stages[2][2], [/تستقبل.*المهمة/,/تطير.*الإحداثيات/], 'طيران الطائرة'));
check('PDF9 EN GINA location, live video, flight view', () => includesAll(cinema.en.drone.stages[5][2], [/GINA/,/drone location/i,/live video/i,/flight view/i], 'Drone command view'));
check('PDF9 AR GINA location, live video, flight view', () => includesAll(cinema.ar.drone.stages[5][2], [/GINA/,/موقع الطائرة/,/الفيديو المباشر/,/مشهد الطيران/], 'عرض القيادة للطائرة'));

// PDF page 10 names processing and secure transmission, but does not validate object detection.
check('PDF10 EN video/AI processing and secure transmission', () => includesAll(cinema.en.ai.stages[4][2], [/video\s*\/\s*AI workflow/i,/video processing/i,/secure transmission/i,/GINA/], 'Video workflow'));
check('PDF10 AR video/AI processing and secure transmission', () => includesAll(cinema.ar.ai.stages[4][2], [/مسار عمل الفيديو والذكاء الاصطناعي/,/معالجة الفيديو/,/نقله بأمان/,/GINA/], 'مسار عمل الفيديو'));
check('PDF10 illustrative detection caveat retained', () => {
  assert.match(cinema.en.ai.stages[3][2], /highlight is illustrative/);
  assert.match(cinema.ar.ai.stages[3][2], /توضيحي/);
});

// PDF page 11 explicitly describes bidirectional calls and GINA location context.
check('PDF11 EN bidirectional video call', () => includesAll(cinema.en.body.stages[4][2], [/bidirectional/i,/video.call/i,/GINA/,/Pulse 5G/], 'Body camera call'));
check('PDF11 AR bidirectional video call', () => includesAll(cinema.ar.body.stages[4][2], [/مكالمة فيديو/,/ثنائية الاتجاه/,/GINA/,/نبض 5G/], 'مكالمة كاميرا الجسم'));
check('PDF11 EN GINA live video, video calls, location context', () => includesAll(cinema.en.body.stages[5][2], [/GINA/,/live video/i,/video calls/i,/location context/i], 'Body camera command view'));
check('PDF11 AR GINA live video, video calls, location context', () => includesAll(cinema.ar.body.stages[5][2], [/GINA/,/الفيديو المباشر/,/مكالمات الفيديو/,/سياق الموقع/], 'عرض القيادة لكاميرا الجسم'));

check('Global illustrative/no-live-data caveats preserved in both languages', () => {
  for(const lang of ['en','ar']) {
    assert.equal(cinema[lang].note, originalCinema[lang].note);
    assert.equal(cap[lang].note, originalCap[lang].note);
    assert.equal(cinema[lang].ginaNote, originalCinema[lang].ginaNote);
  }
});
check('Only assigned copy fields change; stage labels and structure are preserved', () => {
  for(const lang of ['en','ar']) {
    for(const [kind, indexes] of [['drone',[0,2,5]],['ai',[4]],['body',[4,5]]]) {
      assert.equal(cinema[lang][kind].stages.length, 6);
      for(const index of indexes) {
        assert.ok(cinema[lang][kind].stages[index][2].length <= 120, 'Concise '+lang+' '+kind+' stage '+index);
        cinema[lang][kind].stages[index][2] = originalCinema[lang][kind].stages[index][2];
      }
    }
    assert.equal(cap[lang].dispatch.steps.length, 6);
    assert.ok(cap[lang].dispatch.captions[0].length <= 120, 'Concise dispatch caption');
    assert.ok(cap[lang].dispatch.details[0][1].length <= 120, 'Concise dispatch detail');
    cap[lang].dispatch.captions[0] = originalCap[lang].dispatch.captions[0];
    cap[lang].dispatch.details[0][1] = originalCap[lang].dispatch.details[0][1];
  }
  assert.deepEqual(cinema, originalCinema);
  assert.deepEqual(cap, originalCap);
});

const report = {source:'MOD POC OVER 5G PULSE NETWORK 02-10-2026.pdf', pages:[8,9,10,11], mode:'source-only; no browser', target:path.basename(target), passed, failures};
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
