// Acceptance: replacing the slide must route to the new story, and seeking
// must reproduce causally ordered detection, inspection and response.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(root+'/config/presentation.js','utf8'),ctx);
assert.equal(ctx.window.MOD_CONFIG.slides[10].id,'land-border','slide 11 must become Land Border Tactical Operations');
assert.equal(ctx.window.MOD_CONFIG.slides[10].group,1);
assert.equal(ctx.window.MOD_CONFIG.slides.length,15,'one new coastal use case, no extra section');
const storyPath=root+'/scripts/land-border-story.js';
if(fs.existsSync(storyPath))vm.runInNewContext(fs.readFileSync(storyPath,'utf8'),ctx);
assert.ok(ctx.window.MOD_BORDER_STORY,'the slide must have a deterministic incident story');
const S=ctx.window.MOD_BORDER_STORY;
const a=S.sample(0),d=S.sample(18),i=S.sample(36),r=S.sample(50),h=S.sample(63),e=S.sample(80);
assert.ok(a.people.every(p=>p.z<-5),'people begin outside the illustrative boundary');
assert.equal(a.detected,false);assert.ok(a.drone.y>=8&&a.drone.flying);
assert.equal(d.detected,true);assert.ok(d.people.every(p=>p.z>-1),'the detected crossing is actually visible in scene');
assert.ok(i.drone.y>6&&i.drone.x>-14,'the already-airborne drone repositions to track the incident');
assert.ok(r.vehicle.x>-10,'dispatch moves the patrol toward the incident');
assert.ok(h.responders.every((p,j)=>Math.hypot(p.x-h.people[j%2].x,p.z-h.people[j%2].z)<3),'responders reach the subjects');
assert.equal(e.detained,true);assert.ok(e.people.every(p=>p.pose==='escorted'),'apprehension is followed by escort');
assert.equal(S.sample(S.duration).complete,true,'the story resolves and stops');
assert.equal(S.sample(-9).time,0);assert.equal(S.sample(999).time,S.duration);
assert.deepEqual(JSON.parse(JSON.stringify(S.sample(36))),JSON.parse(JSON.stringify(i)),'seeking never depends on playback history');
assert.ok(S.stages.every(s=>s.title.en&&s.title.ar&&s.role.en&&s.role.ar));
console.log('PASS land-border-contract: replacement routing; coherent incident ordering; deterministic seek; complete EN/AR stage explanations.');
