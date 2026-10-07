const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dom=new JSDOM('<body></body>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(){if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['config/presentation.js','vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/coastal-story.js','scripts/coastal-model.js'])if(fs.existsSync(root+'/'+p))w.eval(fs.readFileSync(root+'/'+p,'utf8'));
try{
 const m=w.MOD_COASTAL_MODEL.create(),T=w.THREE,zone=new T.Box3(new T.Vector3(-29.5,1.11,-10.5),new T.Vector3(-22.5,6,-3.5)),tri=new T.Triangle();let overlaps=0;m.scene.updateMatrixWorld(true);
 m.scene.traverse(o=>{if(!o.isMesh||!o.material.bumpMap)return;const p=o.geometry.attributes.position,ix=o.geometry.index,n=ix?ix.count:p.count;for(let i=0;i<n;i+=3){[tri.a,tri.b,tri.c].forEach((v,j)=>v.fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(o.matrixWorld));if(zone.intersectsTriangle(tri))overlaps++}});
 assert.equal(overlaps,0,'natural rocks must not intersect the tower compound');
 const pad=m.scene.getObjectByName('tower-foundation-pad');assert.ok(pad,'visible engineered foundation required');const bounds=new T.Box3().setFromObject(pad),tower=m.scene.getObjectByName('coastal-tower');assert.ok(Math.abs(tower.position.y-.09-bounds.max.y)<.001,'mast feet rest on the slab');m.dispose();console.log('PASS tower compound: no rock triangles intrude, and mast feet rest on the concrete pad.');
}finally{dom.window.close()}
