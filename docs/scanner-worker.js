// Pinned runtime. Model inference runs entirely in this worker, never on a server.
import { pipeline, env, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;
let classifier;
const categories = [
 ['a skirt','skirt','Skirt'],['trousers or jeans','pants','Pants'],['a dress','dress','Dress'],
 ['a shirt or blouse','top','Shirt'],['a t-shirt','top','T-shirt'],['a sweater','top','Sweater'],
 ['a coat or jacket','layer','Jacket'],['a blazer','layer','Blazer'],['a cardigan','layer','Cardigan'],
 ['boots','boots','Boots'],['high heel shoes','heels','Heels'],['ballet flats or loafers','flats','Flats'],
 ['sneakers or trainers','sneakers','Sneakers'],['sandals','sandals','Sandals'],['a handbag or tote bag','bag','Bag'],
 ['a wristwatch or watch','jewelry','Watch'],['jewelry, earrings, or a necklace','jewelry','Jewelry'],['an object that is not clothing or an accessory','unknown','Unrecognized item']
];
self.onmessage=async ({data})=>{
 const {id,pixels,width,height}=data;
 try{
  if(!classifier)classifier=await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{
   dtype:'q8',device:'wasm',revision:'4c1807b705b1d015fb032789cc4d221b23025a6f',
   progress_callback:p=>{if(p.status==='progress')self.postMessage({id,event:'progress',file:p.file,loaded:p.loaded,total:p.total});}
  });
  self.postMessage({id,event:'analyzing'});
  const image=new RawImage(new Uint8ClampedArray(pixels),width,height,4);
  const output=await classifier(image,categories.map(c=>c[0]));
  const ranked=output.map(o=>{const c=categories.find(c=>c[0]===o.label);return {type:c[1],name:c[2],score:o.score}});
  self.postMessage({id,event:'result',ranked});
 }catch(error){classifier=null;self.postMessage({id,event:'error',message:String(error.message||error)});}
};
