/* Independent PDF transcription + raster intervals, not a prior-build snapshot.
   No browser, rendering engine, network, or local server is required. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),build=process.env.BUILD||root;
const fixture=require('./pip-source-reference.json');
const contentText=fs.readFileSync(path.join(build,'content/implementation.js'),'utf8'),controller=fs.readFileSync(path.join(build,'scripts/implementation.js'),'utf8');
const context={window:{}};vm.runInNewContext(contentText,context);
const content=JSON.parse(JSON.stringify(context.window.MOD_IMPLEMENTATION_CONTENT));
const checks=[];
function check(name,fn){try{fn();checks.push({name,pass:true});console.log('PASS:',name)}catch(error){checks.push({name,pass:false});console.error('FAIL:',name,'—',error.message.split('\n')[0])}}
check('fixture provenance identifies uploaded PDF page 14',()=>{
 assert.equal(fixture.provenance.page,14);assert.match(contentText,/02-10-2026\.pdf, page 14/);
 for(const [file,hash]of [[path.join(root,'upload',fixture.provenance.document),fixture.provenance.pdfSha256],[path.join(__dirname,fixture.provenance.render),fixture.provenance.renderSha256]]){
  if(fs.existsSync(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,'fixture evidence must match the audited source');
 }
});
check('all eight ticks match the PDF, including 05 Oct 2025',()=>{
 assert.deepEqual(content.dates.map(d=>d.slice(0,2)),fixture.ticks);
 assert.deepEqual(content.dates.map(d=>d[2]),['سبتمبر','أكتوبر','أكتوبر','أكتوبر','أكتوبر','نوفمبر','نوفمبر','نوفمبر']);
 assert.equal(fixture.sourceYear,2025);
});
check('four workstreams and twenty source task labels match the PDF',()=>{
 assert.equal(content.workstreams.length,4);
 for(const [i,source]of fixture.workstreams.entries()){
  const stream=content.workstreams[i];assert.equal(stream.id,source.id);assert.equal(stream.name.en,source.name);
  if(source.subtitle!==null)assert.equal(stream.place.en,source.subtitle);
  assert.deepEqual(stream.tasks.map(task=>[task[0],task[1]]),source.tasks.map(task=>[task.id,task.label]));
  for(const task of stream.tasks)assert.match(task[2],/[\u0600-\u06ff]/,'Arabic task remains available');
 }
 assert.equal(content.workstreams.reduce((sum,stream)=>sum+stream.tasks.length,0),20);
});
let maximumEdgeErrorPx=0;
check('all twenty-one bars follow independently measured raster intervals',()=>{
 const {leftPx,rightPx,units,edgeTolerancePx}=fixture.timeline,width=rightPx-leftPx;
 let count=0;
 for(const [i,stream]of content.workstreams.entries())for(const [j,task]of stream.tasks.entries()){
  const source=fixture.workstreams[i].tasks[j],bars=[];
  for(let k=3;k<task.length;k+=2)bars.push([leftPx+task[k]/units*width,leftPx+(task[k]+task[k+1])/units*width]);
  assert.equal(bars.length,source.barsPx.length,`${task[0]} bar count`);
  bars.forEach((bar,k)=>bar.forEach((edge,end)=>{
   const error=Math.abs(edge-source.barsPx[k][end]);maximumEdgeErrorPx=Math.max(maximumEdgeErrorPx,error);
   assert.ok(error<=edgeTolerancePx,`${task[0]} bar ${k+1} ${end?'end':'start'} differs ${error.toFixed(2)} px from PDF`);
  }));
  count+=bars.length;
 }
 assert.equal(count,21);
});
check('historical source marker has no live-today or false-weekday claim',()=>{
 assert.equal(new Date(fixture.sourceMarker.date+'T00:00:00Z').getUTCDay(),2);
 assert.match(controller,/Source marker: 30 Sep 2025/);assert.match(controller,/علامة المرجع: 30 سبتمبر 2025/);
 assert.doesNotMatch(controller,/TODAY|\(Wed\)/);assert.match(controller,/sourceYear:2025/);
 assert.match(controller,/exact task dates and durations are unconfirmed/);
});
check('implementation lifecycle and modal gates use inserted-slide index 13',()=>{
 assert.doesNotMatch(controller,/state\.index[!=]==11/);
 assert.ok((controller.match(/state\.index[!=]==13/g)||[]).length>=10);
});
console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.pass).length,maximumEdgeErrorPx:Number(maximumEdgeErrorPx.toFixed(3)),limitations:['Raster extents are visual approximations, not approved dates or durations.','CSS grid columns are evenly spaced; source artwork has unequal column widths and an inconsistent weekday marker.','Native layout and GPU behavior require an authorized browser/device run.']}));
if(checks.some(check=>!check.pass))process.exitCode=1;
