const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const files=['navigation-typography.cjs','scrollbar-audit.cjs','intro-ambience.cjs','pip-source-alignment.cjs','pip-overlay.cjs','capability-source.cjs','opening-security.cjs','shell-focus.cjs','shell-behavior.cjs','navigation-shell.cjs','land-border-contract.cjs','land-border-sign.cjs','land-border-model.cjs','land-border-runtime.cjs','land-border-sensors.cjs','land-border-choreography.cjs','border-continuity.cjs','coastal-tower-foundation.cjs','coastal-border.cjs','coastal-runtime.cjs','usecases-regressions.cjs','usecases-cinema-regressions.cjs','usecases-matrix.cjs','selection.cjs','deployment-map.cjs','implementation-closing.cjs','usecases-cinema-matrix.cjs'];
const results=[];
for(const file of files){
 const start=Date.now(),r=spawnSync(process.execPath,[path.join(__dirname,file)],{encoding:'utf8',timeout:180000});
 const entry={file,passed:r.status===0,seconds:(Date.now()-start)/1000,stdout:(r.stdout||'').trim(),stderr:((r.stderr||'')+(r.error?'\n'+r.error.message:'')).trim()};
 results.push(entry);console.log((entry.passed?'PASS ':'FAIL ')+file+' '+entry.seconds.toFixed(1)+'s');
 if(!entry.passed)console.log(entry.stdout+'\n'+entry.stderr);
}
const report={passed:results.every(x=>x.passed),completedAt:new Date().toISOString(),scope:'Source PDF alignment, generated asset contracts and automated DOM/controller tests across 15 slides, EN/AR and day/night, plus static CSS coverage. Real GSAP/Three/Leaflet where exercised; substitute WebGL, layout and native modal APIs. No browser/GPU pixel validation.',results};
fs.writeFileSync(path.join(__dirname,'QA_REPORT.json'),JSON.stringify(report,null,2)+'\n');if(!report.passed)process.exitCode=1;
