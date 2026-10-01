import{E as e,S as t,_ as n,b as r,x as i,y as a}from"./index-BXOfMIk8.js";var o={q:`@group(0) @binding(1) var<storage, read> wc: array<u32>;
@group(0) @binding(2) var<storage, read> wm: array<vec2<f32>>;
fn W(i: u32) -> f32 { let c = f32((wc[i >> 2u] >> ((i & 3u) * 8u)) & 255u); let m = wm[i / 128u]; return m.x + c * m.y; }`,f:`@group(0) @binding(1) var<storage, read> wf: array<f32>;
fn W(i: u32) -> f32 { return wf[i]; }`},s=(e,t,n,r,i,a=1)=>{let s=7*n+(t-1)*a+1,c=s>12?4:8;return`
${o[e]}
struct P { cin: u32, h: u32, w: u32, cout: u32, ho: u32, wo: u32, pad: u32, _p: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(3) var<storage, read> x: array<f32>;
@group(0) @binding(4) var<storage, read> b: array<f32>;
@group(0) @binding(5) var<storage, read_write> y: array<f32>;
${i?`@group(0) @binding(6) var<storage, read> r: array<f32>;`:``}
const K: u32 = ${t}u; const S: u32 = ${n}u; const D: u32 = ${a}u; const T: u32 = ${s}u; const IC: u32 = ${c}u;
var<workgroup> tile: array<f32, ${c*s*s}>;
var<workgroup> ws: array<f32, ${8*c*t*t}>;
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let ox = wg.x * 8u + l.x; let oy = wg.y * 8u + l.y; let oc0 = wg.z * 8u;
  let ix0 = i32(wg.x * 8u * S) - i32(p.pad); let iy0 = i32(wg.y * 8u * S) - i32(p.pad);
  var acc: array<f32, 8>;
  for (var c0 = 0u; c0 < p.cin; c0 += IC) {
    for (var t = li; t < IC * T * T; t += 64u) {
      let c = t / (T * T); let rem = t % (T * T); let ty = rem / T; let tx = rem % T;
      let iy = iy0 + i32(ty); let ix = ix0 + i32(tx);
      var v = 0.0;
      if (c0 + c < p.cin && iy >= 0 && ix >= 0 && iy < i32(p.h) && ix < i32(p.w)) { v = x[((c0 + c) * p.h + u32(iy)) * p.w + u32(ix)]; }
      tile[t] = v;
    }
    for (var t = li; t < 8u * IC * K * K; t += 64u) {
      let o = t / (IC * K * K); let rem = t % (IC * K * K); let c = rem / (K * K); let kk = rem % (K * K);
      var v = 0.0;
      if (oc0 + o < p.cout && c0 + c < p.cin) { v = W(((oc0 + o) * p.cin + c0 + c) * K * K + kk); }
      ws[t] = v;
    }
    workgroupBarrier();
    for (var c = 0u; c < IC; c++) {
      for (var ky = 0u; ky < K; ky++) {
        for (var kx = 0u; kx < K; kx++) {
          let v = tile[(c * T + l.y * S + ky * D) * T + l.x * S + kx * D];
          let wi = (c * K + ky) * K + kx;
          for (var o = 0u; o < 8u; o++) { acc[o] += v * ws[o * IC * K * K + wi]; }
        }
      }
    }
    workgroupBarrier();
  }
  if (ox >= p.wo || oy >= p.ho) { return; }
  for (var o = 0u; o < 8u; o++) {
    let oc = oc0 + o;
    if (oc >= p.cout) { break; }
    let i = (oc * p.ho + oy) * p.wo + ox;
    var v = acc[o] + b[oc];
    ${i?`v += r[i];`:``}
    ${r===`relu`?`v = max(v, 0.0);`:``}
    y[i] = v;
  }
}`},c=(e,t,n)=>`
${o[e]}
struct P { n: u32, k: u32, m: u32, _p: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(3) var<storage, read> x: array<f32>;
${n?`@group(0) @binding(4) var<storage, read> b: array<f32>;`:``}
@group(0) @binding(5) var<storage, read_write> y: array<f32>;
${t?`@group(0) @binding(6) var<storage, read> r: array<f32>;`:``}
var<workgroup> As: array<f32, 512>;
var<workgroup> Bs: array<f32, 512>;
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) l: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let n0 = wg.y * 32u; let m0 = wg.x * 32u;
  var acc: array<f32, 16>;
  for (var k0 = 0u; k0 < p.k; k0 += 16u) {
    for (var t = li; t < 512u; t += 64u) {
      let r = t / 16u; let c = t % 16u;
      var a = 0.0; var bb = 0.0;
      if (n0 + r < p.n && k0 + c < p.k) { a = x[(n0 + r) * p.k + k0 + c]; }
      if (m0 + r < p.m && k0 + c < p.k) { bb = W((m0 + r) * p.k + k0 + c); }
      As[t] = a; Bs[t] = bb;
    }
    workgroupBarrier();
    for (var c = 0u; c < 16u; c++) {
      var av: array<f32, 4>; var bv: array<f32, 4>;
      for (var i = 0u; i < 4u; i++) { av[i] = As[(l.y * 4u + i) * 16u + c]; bv[i] = Bs[(l.x * 4u + i) * 16u + c]; }
      for (var i = 0u; i < 4u; i++) { for (var j = 0u; j < 4u; j++) { acc[i * 4u + j] += av[i] * bv[j]; } }
    }
    workgroupBarrier();
  }
  for (var i = 0u; i < 4u; i++) {
    let n = n0 + l.y * 4u + i;
    if (n >= p.n) { break; }
    for (var j = 0u; j < 4u; j++) {
      let m = m0 + l.x * 4u + j;
      if (m >= p.m) { break; }
      var v = acc[i * 4u + j];
      ${n?`v += b[m];`:``}
      ${t?`v += r[n * p.m + m];`:``}
      y[n * p.m + m] = v;
    }
  }
}`,l=e=>`
struct P { c: u32, hw: u32, groups: u32, eps: f32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read> g: array<f32>;
@group(0) @binding(3) var<storage, read> b: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
var<workgroup> red: array<f32, 256>;
fn reduce(li: u32, v: f32) -> f32 {
  red[li] = v; workgroupBarrier();
  for (var s = 128u; s > 0u; s >>= 1u) { if (li < s) { red[li] += red[li + s]; } workgroupBarrier(); }
  let r = red[0]; workgroupBarrier(); return r;
}
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let cpg = p.c / p.groups; let n = cpg * p.hw; let base = wg.x * n;
  var s = 0.0;
  for (var i = li; i < n; i += 256u) { s += x[base + i]; }
  let mean = reduce(li, s) / f32(n);
  var q = 0.0;
  for (var i = li; i < n; i += 256u) { let d = x[base + i] - mean; q += d * d; }
  let rstd = inverseSqrt(reduce(li, q) / f32(n) + p.eps);
  for (var i = li; i < n; i += 256u) {
    let c = wg.x * cpg + i / p.hw;
    var v = (x[base + i] - mean) * rstd * g[c] + b[c];
    ${e?`v = v / (1.0 + exp(-v));`:``}
    y[base + i] = v;
  }
}`,u=`
struct P { n: u32, c: u32, _a: u32, eps: f32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read> g: array<f32>;
@group(0) @binding(3) var<storage, read> b: array<f32>;
@group(0) @binding(4) var<storage, read_write> y: array<f32>;
var<workgroup> red: array<f32, 64>;
fn reduce(li: u32, v: f32) -> f32 {
  red[li] = v; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (li < s) { red[li] += red[li + s]; } workgroupBarrier(); }
  let r = red[0]; workgroupBarrier(); return r;
}
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let row = wg.x + wg.y * 65535u; if (row >= p.n) { return; }
  let base = row * p.c;
  var s = 0.0; for (var i = li; i < p.c; i += 64u) { s += x[base + i]; }
  let mean = reduce(li, s) / f32(p.c);
  var q = 0.0; for (var i = li; i < p.c; i += 64u) { let d = x[base + i] - mean; q += d * d; }
  let rstd = inverseSqrt(reduce(li, q) / f32(p.c) + p.eps);
  for (var i = li; i < p.c; i += 64u) { y[base + i] = (x[base + i] - mean) * rstd * g[i] + b[i]; }
}`,d=e=>`
struct P { n: u32, m: u32, c: u32, heads: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> q: array<f32>;
@group(0) @binding(2) var<storage, read> k: array<f32>;
@group(0) @binding(3) var<storage, read> v: array<f32>;
@group(0) @binding(4) var<storage, read_write> o: array<f32>;
var<workgroup> sc: array<f32, ${e}>;
var<workgroup> red: array<f32, 64>;
var<workgroup> qs: array<f32, 160>;
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_index) li: u32) {
  let qi = wg.x; let h = wg.y; let d = p.c / p.heads; let off = h * d;
  let scale = inverseSqrt(f32(d));
  for (var j = li; j < d; j += 64u) { qs[j] = q[qi * p.c + off + j] * scale; }
  workgroupBarrier();
  var mx = -1e30;
  for (var j = li; j < p.m; j += 64u) {
    var s = 0.0;
    for (var t = 0u; t < d; t++) { s += qs[t] * k[j * p.c + off + t]; }
    sc[j] = s; mx = max(mx, s);
  }
  red[li] = mx; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (li < s) { red[li] = max(red[li], red[li + s]); } workgroupBarrier(); }
  mx = red[0]; workgroupBarrier();
  var sum = 0.0;
  for (var j = li; j < p.m; j += 64u) { let e = exp(sc[j] - mx); sc[j] = e; sum += e; }
  red[li] = sum; workgroupBarrier();
  for (var s = 32u; s > 0u; s >>= 1u) { if (li < s) { red[li] += red[li + s]; } workgroupBarrier(); }
  let inv = 1.0 / red[0];
  workgroupBarrier();
  for (var t = li; t < d; t += 64u) {
    var a = 0.0;
    for (var j = 0u; j < p.m; j++) { a += sc[j] * v[j * p.c + off + t]; }
    o[qi * p.c + off + t] = a * inv;
  }
}`,f={toTok:`struct P { c: u32, n: u32, _a: u32, _b: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.c * p.n) { return; }
  let c = i / p.n; let n = i % p.n; y[n * p.c + c] = x[i]; }`,fromTok:`struct P { c: u32, n: u32, _a: u32, _b: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read> r: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.c * p.n) { return; }
  let c = i / p.n; let n = i % p.n; y[i] = x[n * p.c + c] + r[i]; }`,geglu:`struct P { n: u32, f: u32, _a: u32, _b: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
fn erf(z: f32) -> f32 { let t = 1.0 / (1.0 + 0.3275911 * abs(z));
  let e = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-z * z);
  return select(-e, e, z >= 0.0); }
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.n * p.f) { return; }
  let n = i / p.f; let f = i % p.f; let a = x[n * 2u * p.f + f]; let gt = x[n * 2u * p.f + p.f + f];
  y[i] = a * 0.5 * gt * (1.0 + erf(gt * 0.70710678)); }`,up2:`struct P { c: u32, h: u32, w: u32, _a: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; let W2 = p.w * 2u; let H2 = p.h * 2u; if (i >= p.c * H2 * W2) { return; }
  let c = i / (H2 * W2); let r = i % (H2 * W2); let yy = r / W2; let xx = r % W2;
  y[i] = x[(c * p.h + yy / 2u) * p.w + xx / 2u]; }`,step:`struct P { n: u32, sa: f32, s1a: f32, _a: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read> e: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x; if (i >= p.n) { return; }
  let x0 = (x[i] - p.s1a * e[i]) / p.sa; y[i] = tanh(x0 / 3.0) * 3.0; }`,rgba:`struct P { hw: u32, _a: u32, _b: u32, _c: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<u32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.hw) { return; }
  let r = u32(round(clamp(x[i], 0.0, 1.0) * 255.0)); let gg = u32(round(clamp(x[p.hw + i], 0.0, 1.0) * 255.0));
  let b = u32(round(clamp(x[2u * p.hw + i], 0.0, 1.0) * 255.0));
  y[i] = r | (gg << 8u) | (b << 16u) | (255u << 24u); }`};f.pool=`struct P { c: u32, h: u32, w: u32, _a: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let ho = (p.h + 1u) / 2u; let wo = (p.w + 1u) / 2u; let i = g.x + g.y * 4194240u; if (i >= p.c * ho * wo) { return; }
  let c = i / (ho * wo); let r = i % (ho * wo); let yy = r / wo * 2u; let xx = r % wo * 2u;
  var m = -1e30;
  for (var dy = 0u; dy < 2u; dy++) { for (var dx = 0u; dx < 2u; dx++) { if (yy + dy < p.h && xx + dx < p.w) { m = max(m, x[(c * p.h + yy + dy) * p.w + xx + dx]); } } }
  y[i] = m; }`,f.resize=`struct P { c: u32, h: u32, w: u32, ho: u32, wo: u32, _a: u32, _b: u32, _c: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.c * p.ho * p.wo) { return; }
  let c = i / (p.ho * p.wo); let r = i % (p.ho * p.wo); let oy = r / p.wo; let ox = r % p.wo;
  let sy = max(0.0, (f32(oy) + 0.5) * f32(p.h) / f32(p.ho) - 0.5); let sx = max(0.0, (f32(ox) + 0.5) * f32(p.w) / f32(p.wo) - 0.5);
  let y0 = min(u32(sy), p.h - 1u); let x0 = min(u32(sx), p.w - 1u); let y1 = min(y0 + 1u, p.h - 1u); let x1 = min(x0 + 1u, p.w - 1u);
  let fy = sy - f32(y0); let fx = sx - f32(x0); let b = c * p.h * p.w;
  y[i] = mix(mix(x[b + y0 * p.w + x0], x[b + y0 * p.w + x1], fx), mix(x[b + y1 * p.w + x0], x[b + y1 * p.w + x1], fx), fy); }`,f.add=`struct P { n: u32, _a: u32, _b: u32, _c: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> a: array<f32>;
@group(0) @binding(2) var<storage, read> b: array<f32>;
@group(0) @binding(3) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.n) { return; } y[i] = a[i] + b[i]; }`,f.sigmoid=`struct P { n: u32, _a: u32, _b: u32, _c: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> x: array<f32>;
@group(0) @binding(2) var<storage, read_write> y: array<f32>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.n) { return; } y[i] = 1.0 / (1.0 + exp(-x[i])); }`;var p=e=>{let t=e&32768?-1:1,n=e>>10&31,r=e&1023;return n===0?t*r*2**-24:n===31?r?NaN:t*(1/0):t*(1+r/1024)*2**(n-15)},m=new Float32Array(65536).map((e,t)=>p(t));async function h({manifest:e,fetchChunk:t,onProgress:n=()=>{},adapter:r,gate:i=null}){if(r||=await navigator.gpu?.requestAdapter({powerPreference:`high-performance`}),!r)throw Error(`WebGPU is not available in this browser.`);let a=r.limits,o=await r.requestDevice({requiredLimits:{maxStorageBufferBindingSize:a.maxStorageBufferBindingSize,maxBufferSize:a.maxBufferSize}});if(a.maxStorageBufferBindingSize<67108864)throw Error(`This GPU allows ${a.maxStorageBufferBindingSize/2**20|0} MB per buffer; the painter needs 64 MB.`);let p=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,h=(e,t=p)=>o.createBuffer({size:Math.max(16,Math.ceil(e/4)*4),usage:t}),g=e=>{let t=h(e.byteLength);return o.queue.writeBuffer(t,0,e),t},_=e.tensors,v=Object.entries(_).sort((e,t)=>e[1].offset-t[1].offset),y={},b={},x=new Uint8Array,S=0,C=0,w=0,T=o.createComputePipeline({layout:`auto`,compute:{entryPoint:`main`,module:o.createShaderModule({code:`
struct P { n8: u32, _a: u32, _b: u32, _c: u32 }
@group(0) @binding(0) var<uniform> p: P;
@group(0) @binding(1) var<storage, read> pk: array<u32>;
@group(0) @binding(2) var<storage, read_write> out: array<u32>;
fn byteAt(k: u32) -> u32 { return (pk[k >> 2u] >> ((k & 3u) * 8u)) & 255u; }
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) g: vec3<u32>) {
  let i = g.x + g.y * 4194240u; if (i >= p.n8) { return; }
  let j = i * 5u;
  let lo = byteAt(j) | (byteAt(j + 1u) << 8u) | (byteAt(j + 2u) << 16u) | (byteAt(j + 3u) << 24u); let hi = byteAt(j + 4u);
  out[2u * i] = (lo & 31u) | (((lo >> 5u) & 31u) << 8u) | (((lo >> 10u) & 31u) << 16u) | (((lo >> 15u) & 31u) << 24u);
  out[2u * i + 1u] = ((lo >> 20u) & 31u) | (((lo >> 25u) & 31u) << 8u) | ((((lo >> 30u) | (hi << 2u)) & 31u) << 16u) | (((hi >> 3u) & 31u) << 24u);
}`})}}),E=[],ee=(e,t)=>{let n=x.subarray(t.offset-S,t.offset-S+t.bytes),r=t.shape.reduce((e,t)=>e*t,1);if(t.kind===`q5`){let i=t.groups,a=new Float32Array(n.slice(0,i*8).buffer),s=new Float32Array(i*2);for(let e=0;e<i;e++)s[2*e]=a[e],s[2*e+1]=a[i+e];let c=Math.ceil(r/8),l=new Uint8Array(Math.ceil(c*5/4)*4);l.set(n.subarray(i*8,i*8+c*5));let u=g(l),d=h(c*8),f=o.createCommandEncoder(),p=f.beginComputePass(),m=o.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});o.queue.writeBuffer(m,0,new Uint32Array([c,0,0,0])),p.setPipeline(T),p.setBindGroup(0,o.createBindGroup({layout:T.getBindGroupLayout(0),entries:[m,u,d].map((e,t)=>({binding:t,resource:{buffer:e}}))})),p.dispatchWorkgroups(Math.min(65535,Math.ceil(c/64)),Math.ceil(c/64/65535)),p.end(),o.queue.submit([f.finish()]),E.push(u,m),y[e]={q:!0,c:d,m:g(s)}}else{let r;if(t.kind===`f32`)r=new Float32Array(n.slice().buffer);else{let e=new Uint16Array(n.slice().buffer);r=new Float32Array(e.length);for(let t=0;t<e.length;t++)r[t]=m[e[t]]}e.startsWith(`emb.`)||e.startsWith(`temb.`)?b[e]={data:r,shape:t.shape}:y[e]={q:!1,f:g(r)}}},D=[],O=e.files,k=0,A=0,j=()=>{for(;k<O.length&&k<A+3;)D[k]=t(O[k]),k++};j();let te=i||(()=>new Promise(e=>setTimeout(e,0)));for(let t=0;t<O.length;t++){let r=new Uint8Array(await D[t]);D[t]=null,A=t+1,j();let i=new Uint8Array(x.length+r.length);for(i.set(x),i.set(r,x.length),x=i;C<v.length;){let[e,t]=v[C];if(t.offset+t.bytes>S+x.length)break;ee(e,t),C++,await te()}let a=C<v.length?v[C][1].offset:S+x.length;x=x.slice(a-S),S=a,w+=r.length,n(w/e.total),await o.queue.onSubmittedWorkDone();for(let e of E)e.destroy();E=[]}let M=new Map,N=(e,t)=>(M.has(e)||M.set(e,o.createComputePipeline({layout:`auto`,compute:{module:o.createShaderModule({code:t}),entryPoint:`main`}})),M.get(e)),P=new Map,F=new Set,I=e=>{let t=e*4,n=P.get(t),r={b:n?.length?n.pop():h(t),n:e,bytes:t};return F.add(r),r},L=(...e)=>{for(let t of e)t&&F.delete(t)&&(P.has(t.bytes)||P.set(t.bytes,[]),P.get(t.bytes).push(t.b))},R,z=e=>{let t=new ArrayBuffer(Math.max(16,e.length*4)),n=new Uint32Array(t),r=new Float32Array(t);e.forEach((e,t)=>Number.isInteger(e)&&!(e instanceof ne)?n[t]=e:r[t]=e.v??e);let i=o.createBuffer({size:t.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});return o.queue.writeBuffer(i,0,t),V.push(i),i};class ne{constructor(e){this.v=e}}let B=e=>new ne(e),V=[],H=(e,t,n,r=1,i=1)=>{let a=o.createBindGroup({layout:e.getBindGroupLayout(0),entries:Object.entries(t).map(([e,t])=>({binding:+e,resource:{buffer:t}}))}),s=R.beginComputePass();s.setPipeline(e),s.setBindGroup(0,a),s.dispatchWorkgroups(n,r,i),s.end()},re=e=>e<=4194240?[Math.ceil(e/64),1]:[65535,Math.ceil(e/4194240)],ie=e=>e.q?{1:e.c,2:e.m}:{1:e.f},U=(e,t,n,r,i,{s:a=1,act:o=``,res:c=null,bias:l=null,d:u=1,w:d=null,sh:f=null}={})=>{d||=y[i+`.weight`],f||=_[i+`.weight`].shape;let p=f[0],m=f[2],h=m===3?u:0,g=Math.floor((n+2*h-u*(m-1)-1)/a)+1,v=Math.floor((r+2*h-u*(m-1)-1)/a)+1,b=I(p*g*v),x=N(`conv${d.q?`q`:`f`}${m}${a}${u}${o}${c?`r`:``}`,s(d.q?`q`:`f`,m,a,o,!!c,u)),S=l||y[i+`.bias`]?.f||ae(p);return H(x,{0:z([f[1],n,r,p,g,v,h,0]),...ie(d),3:e.b,4:S,5:b.b,...c?{6:c.b}:{}},Math.ceil(v/8),Math.ceil(g/8),Math.ceil(p/8)),[b,p,g,v]},W=new Map,ae=e=>(W.has(e)||W.set(e,h(e*4)),W.get(e)),G=(e,t,n,r,i,a)=>{let o=I(t*n);return H(N(`gn`+i,l(i)),{0:z([t,n,32,B(a)]),1:e.b,2:y[r+`.weight`].f,3:y[r+`.bias`].f,4:o.b},32),o},K=(e,t,n,r)=>{let i=I(t*n);return H(N(`ln`,u),{0:z([t,n,0,B(1e-5)]),1:e.b,2:y[r+`.weight`].f,3:y[r+`.bias`].f,4:i.b},Math.min(t,65535),Math.ceil(t/65535)),i},q=(e,t,n,r=null)=>{let i=y[n+`.weight`],a=_[n+`.weight`].shape,o=a[0],s=a[1],l=I(t*o),u=!!y[n+`.bias`],d=N(`lin${i.q?`q`:`f`}${r?`r`:``}${u}`,c(i.q?`q`:`f`,!!r,u));return H(d,{0:z([t,s,o,0]),...ie(i),3:e.b,...u?{4:y[n+`.bias`].f}:{},5:l.b,...r?{6:r.b}:{}},Math.ceil(o/32),Math.ceil(t/32)),[l,o]},J=(e,t,n,r)=>{let[i,a]=re(r);H(N(e,f[e]),{0:z(t),...n},i,a)},oe=(e,t,n,r,i,a)=>{let o=I(r*a),s=i<=256?256:1024;if(i>1024)throw Error(`too many keys`);return H(N(`attn`+s,d(s)),{0:z([r,i,a,8]),1:e.b,2:t.b,3:n.b,4:o.b},r,8),o},Y=(e,t,n,r,i,a)=>{let s=G(e,t,n*r,i+`.norm1`,!0,1e-5),c=_[i+`.conv1.weight`].shape[0],l=b[`temb.${a}.${i.replace(/^unet\./,``)}.time_emb_proj`].data,u=h(c*4);V.push(u);let d=ce(i+`.conv1.bias`,c),f=new Float32Array(c);for(let e=0;e<c;e++)f[e]=d[e]+l[e];o.queue.writeBuffer(u,0,f);let[p]=U(s,t,n,r,i+`.conv1`,{bias:u});L(s);let m=G(p,c,n*r,i+`.norm2`,!0,1e-5);L(p);let g=e;y[i+`.conv_shortcut.weight`]&&([g]=U(e,t,n,r,i+`.conv_shortcut`));let[v]=U(m,c,n,r,i+`.conv2`,{res:g});return L(m),g!==e&&L(g),[v,c]},se={},ce=(e,t)=>se[e],le=(e,t,n,r,i,a,o)=>{let s=n*r,c=i+`.transformer_blocks.0`,l=G(e,t,s,i+`.norm`,!1,1e-6),u=I(s*t);J(`toTok`,[t,s,0,0],{1:l.b,2:u.b},s*t),L(l);let[d]=q(u,s,i+`.proj_in`);L(u);let f=K(d,s,t,c+`.norm1`),[p]=q(f,s,c+`.attn1.to_q`),[m]=q(f,s,c+`.attn1.to_k`),[h]=q(f,s,c+`.attn1.to_v`);L(f);let g=oe(p,m,h,s,s,t);L(p,m,h);let[_]=q(g,s,c+`.attn1.to_out.0`,d);L(g,d),d=_,f=K(d,s,t,c+`.norm2`),[p]=q(f,s,c+`.attn2.to_q`),L(f),[m]=q(a,o,c+`.attn2.to_k`),[h]=q(a,o,c+`.attn2.to_v`),g=oe(p,m,h,s,o,t),L(p,m,h),[_]=q(g,s,c+`.attn2.to_out.0`,d),L(g,d),d=_,f=K(d,s,t,c+`.norm3`);let[v,y]=q(f,s,c+`.ff.net.0.proj`);L(f);let b=I(s*y/2);J(`geglu`,[s,y/2,0,0],{1:v.b,2:b.b},s*y/2),L(v),[_]=q(b,s,c+`.ff.net.2`,d),L(b,d),d=_;let[x]=q(d,s,i+`.proj_out`);L(d);let S=I(t*s);return J(`fromTok`,[t,s,0,0],{1:x.b,2:e.b,3:S.b},t*s),L(x),S};{let e=Object.keys(_).filter(e=>/resnets\.\d+\.conv1\.bias$/.test(e)&&y[e]);R=o.createCommandEncoder();let t=e.map(e=>{let t=_[e].shape[0],n=o.createBuffer({size:t*4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});return R.copyBufferToBuffer(y[e].f,0,n,0,t*4),[e,n]});o.queue.submit([R.finish()]);for(let[e,n]of t)await n.mapAsync(GPUMapMode.READ),se[e.replace(/\.bias$/,`.bias`)]=new Float32Array(n.getMappedRange().slice(0)),n.destroy()}let X=null,Z=async()=>{X&&(o.queue.submit([R.finish()]),await o.queue.onSubmittedWorkDone(),await X(),R=o.createCommandEncoder())},ue=async(e,t,n,r)=>{let i=4,a=64,o=64,[s]=U(e,4,64,64,`unet.conv_in`);i=320;let c=[[s,i,a,o]],l;[l,i]=Y(s,i,a,o,`unet.down_blocks.0.resnets.0`,r),c.push([l,i,a,o]),await Z();let u;[u,i,a,o]=U(l,i,a,o,`unet.down_blocks.0.downsamplers.0.conv`,{s:2}),c.push([u,i,a,o]),s=u;for(let e of[1,2]){[l,i]=Y(s,i,a,o,`unet.down_blocks.${e}.resnets.0`,r),await Z();let d=le(l,i,a,o,`unet.down_blocks.${e}.attentions.0`,t,n);L(l),c.push([d,i,a,o]),s=d,await Z(),e===1&&([u,i,a,o]=U(s,i,a,o,`unet.down_blocks.1.downsamplers.0.conv`,{s:2}),c.push([u,i,a,o]),s=u)}let d=!0;for(let e of[0,1,2]){for(let l of[0,1]){let[u,f]=c.pop(),p=I((i+f)*a*o);R.copyBufferToBuffer(s.b,0,p.b,0,i*a*o*4),R.copyBufferToBuffer(u.b,0,p.b,i*a*o*4,f*a*o*4),d||L(s),d=!1,L(u);let m;[m,i]=Y(p,i+f,a,o,`unet.up_blocks.${e}.resnets.${l}`,r),L(p),await Z(),e<2?(s=le(m,i,a,o,`unet.up_blocks.${e}.attentions.${l}`,t,n),L(m),await Z()):s=m}if(e<2){let t=I(i*a*o*4);J(`up2`,[i,a,o,0],{1:s.b,2:t.b},i*a*o*4),L(s),a*=2,o*=2,[s]=U(t,i,a,o,`unet.up_blocks.${e}.upsamplers.0.conv`),L(t)}}let f=G(s,i,a*o,`unet.conv_norm_out`,!0,1e-5);L(s);let[p]=U(f,i,a,o,`unet.conv_out`);return L(f),p},de=async e=>{let t=4,n=64,r=64,i;[i,t]=U(e,t,n,r,`dec.layers.0`,{act:`relu`});let a=async(e,i)=>{let[a]=U(e,t,n,r,`dec.layers.${i}.conv.0`,{act:`relu`}),[o]=U(a,t,n,r,`dec.layers.${i}.conv.2`,{act:`relu`});L(a);let[s]=U(o,t,n,r,`dec.layers.${i}.conv.4`,{act:`relu`,res:e});return L(o,e),await Z(),s};for(let e of[2,3,4])i=await a(i,e);for(let[e,o,s]of[[5,6,[7,8,9]],[10,11,[12,13,14]],[15,16,[17]]]){let e=I(t*n*r*4);J(`up2`,[t,n,r,0],{1:i.b,2:e.b},t*n*r*4),L(i),n*=2,r*=2,[i]=U(e,t,n,r,`dec.layers.${o}`),L(e);for(let e of s)i=await a(i,e)}let[o]=U(i,t,n,r,`dec.layers.18`);return L(i),o},fe=e=>{let t=e.map(e=>{let t=b[`emb.`+e];if(!t)throw Error(`unknown phrase `+e);return t}),n=t.reduce((e,t)=>e+t.shape[0],0);if(n>1024)throw Error(`too many trait tokens`);let r=new Float32Array(n*768),i=0;for(let e of t)r.set(e.data,i),i+=e.data.length;let a=I(n*768);return o.queue.writeBuffer(a.b,0,r),[a,n]},pe=e=>{let t=e>>>0,n=()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296},r=new Float32Array(16384);for(let e=0;e<r.length;e+=2){let t=Math.max(n(),1e-12),i=n(),a=Math.sqrt(-2*Math.log(t));r[e]=a*Math.cos(2*Math.PI*i),r[e+1]=a*Math.sin(2*Math.PI*i)}return r},Q=async(e,t,n=Float32Array)=>{let r=o.createBuffer({size:t*4,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),i=o.createCommandEncoder();i.copyBufferToBuffer(e.b,0,r,0,t*4),o.queue.submit([i.finish()]),await r.mapAsync(GPUMapMode.READ);let a=new n(r.getMappedRange().slice(0));return r.destroy(),a};async function me({traits:t,seed:n=1,latent:r=null,debug:i=!1,gate:a=null}){X=a;let s=performance.now(),c=e.alphas_cumprod[999];V=[],R=o.createCommandEncoder();let[l,u]=fe(t),d=I(16384);o.queue.writeBuffer(d.b,0,r||pe(n));let f=await ue(d,l,u,999);L(l);let p=I(16384);J(`step`,[16384,B(Math.sqrt(c)),B(Math.sqrt(1-c)),0],{1:d.b,2:f.b,3:p.b},16384),o.queue.submit([R.finish()]);let m=null;i&&(m=await Q(f,16384)),await o.queue.onSubmittedWorkDone();let h=performance.now();L(d,f),R=o.createCommandEncoder();let g=await de(p);L(p);let _=I(262144);J(`rgba`,[262144,0,0,0],{1:g.b,2:_.b},262144),o.queue.submit([R.finish()]);let v=null;i&&(v=await Q(g,786432)),L(g);let y=new Uint8ClampedArray((await Q(_,262144,Uint32Array)).buffer);L(_);for(let e of V)e.destroy();let b=performance.now();return{rgba:y,ms:{unet:h-s,decode:b-h,total:b-s},eps:m,img:v}}let $=null;if(e.matte){let n=JSON.parse(new TextDecoder().decode(await t(e.matte.json))),r=new Uint8Array(await t(e.matte.bin)),i={};for(let[e,t]of Object.entries(n.weights)){let n=t.shape.reduce((e,t)=>e*t,1),a=new Uint16Array(r.slice(t.offset,t.offset+n*2).buffer),o=new Float32Array(n);for(let e=0;e<n;e++)o[e]=m[a[e]];i[e]={w:{q:!1,f:g(o)},shape:t.shape,f:o}}$={spec:n,ws:i}}async function he(e){if(!$)return null;let t=new OffscreenCanvas(320,320).getContext(`2d`),n=new OffscreenCanvas(512,512);n.getContext(`2d`).putImageData(new ImageData(new Uint8ClampedArray(e),512,512),0,0),t.drawImage(n,0,0,320,320);let r=t.getImageData(0,0,320,320).data,i=1;for(let e=0;e<r.length;e+=4)i=Math.max(i,r[e],r[e+1],r[e+2]);let a=[.485,.456,.406],s=[.229,.224,.225],c=new Float32Array(307200);for(let e=0;e<3;e++)for(let t=0;t<102400;t++)c[e*320*320+t]=(r[t*4+e]/i-a[e])/s[e];V=[],R=o.createCommandEncoder();let l=new Map,u=new Map,d=I(307200);o.queue.writeBuffer(d.b,0,c),l.set($.spec.input,d),u.set($.spec.input,[3,320,320]);let f=new Map;for(let e of $.spec.layers)for(let t of e.op===`concat`?e.xs:e.op===`add`?[e.a,e.b]:[e.x])f.set(t,(f.get(t)||0)+1);let p=e=>{let t=f.get(e)-1;f.set(e,t),t===0&&e!==$.spec.output&&L(l.get(e))},m=$.spec.layers;for(let e=0;e<m.length;e++){let t=m[e],n;if(t.op===`conv`){let[r,i,a]=u.get(t.x),o=$.ws[t.w],s=m[e+1]?.op===`relu`&&m[e+1].x===t.y&&f.get(t.y)===1;if([n]=U(l.get(t.x),r,i,a,``,{w:o.w,sh:o.shape,bias:t.b?$.ws[t.b].w.f:null,d:t.d,act:s?`relu`:``}),p(t.x),s){e++,l.set(m[e].y,n),u.set(m[e].y,t.shape.slice(1));continue}}else if(t.op===`relu`||t.op===`sigmoid`){let e=u.get(t.x).reduce((e,t)=>e*t,1);if(n=I(e),t.op===`sigmoid`)J(`sigmoid`,[e,0,0,0],{1:l.get(t.x).b,2:n.b},e);else throw Error(`unfused relu`);p(t.x)}else if(t.op===`pool`){let[e,r,i]=u.get(t.x),a=e*Math.ceil(r/2)*Math.ceil(i/2);n=I(a),J(`pool`,[e,r,i,0],{1:l.get(t.x).b,2:n.b},a),p(t.x)}else if(t.op===`resize`){let[e,r,i]=u.get(t.x),[a,o]=t.to,s=e*a*o;n=I(s),J(`resize`,[e,r,i,a,o,0,0,0],{1:l.get(t.x).b,2:n.b},s),p(t.x)}else if(t.op===`add`){let e=u.get(t.a).reduce((e,t)=>e*t,1);n=I(e),J(`add`,[e,0,0,0],{1:l.get(t.a).b,2:l.get(t.b).b,3:n.b},e),p(t.a),p(t.b)}else if(t.op===`concat`){let e=t.shape.slice(1).reduce((e,t)=>e*t,1);n=I(e);let r=0;for(let e of t.xs){let t=u.get(e).reduce((e,t)=>e*t,1);R.copyBufferToBuffer(l.get(e).b,0,n.b,r,t*4),r+=t*4}for(let e of t.xs)p(e)}l.set(t.y,n),u.set(t.y,t.shape.slice(1))}o.queue.submit([R.finish()]);let h=l.get($.spec.output),g=await Q(h,102400);for(let[e,t]of l)F.has(t)&&L(t);for(let e of V)e.destroy();let _=1/0,v=-1/0;for(let e of g)_=Math.min(_,e),v=Math.max(v,e);for(let e=0;e<g.length;e++)g[e]=(g[e]-_)/Math.max(1e-6,v-_);return g}let ge=r.info||{};return{paint:me,matte:he,device:o,lost:o.lost,phrases:e.phrases,gpuName:[ge.vendor,ge.architecture,ge.description].filter(Boolean).join(` `)}}var g=`ender-painter-v1`,_=null,v=!1,y={paints:[]},b={hold:!1};window.__enderArt={stats:y,queue:t,ctl:b};var x=0;addEventListener(`pointerdown`,()=>x=performance.now(),{capture:!0,passive:!0}),addEventListener(`keydown`,()=>x=performance.now(),{capture:!0,passive:!0});var S=()=>b.hold||e().screen===`battle`||document.hidden||performance.now()-x<700,C=e=>new Promise(t=>setTimeout(t,e)),w=()=>new Promise(e=>`requestIdleCallback`in window?requestIdleCallback(()=>e(),{timeout:250}):setTimeout(e,16));async function T(){for(;S();)await C(200);await w()}async function E(e){let t=null;try{t=await caches.open(g);let n=await t.match(e);if(n)return n.arrayBuffer()}catch{}let n=await fetch(e);if(!n.ok)throw Error(`painter download failed (${n.status}) for ${e}`);return t&&await t.put(e,n.clone()).catch(()=>void 0),n.arrayBuffer()}async function ee(e){try{let t=await caches.open(g);for(let n of await t.keys())e.has(n.url)||await t.delete(n)}catch{}}var D=60,O=null;function k(){return O??=new Promise(e=>{try{let t=indexedDB.open(`ender-art`,1);t.onupgradeneeded=()=>t.result.createObjectStore(`paints`,{keyPath:`key`}),t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}catch{e(null)}}),O}async function A(e){let t=await k();if(t)return new Promise(n=>{let r=t.transaction(`paints`).objectStore(`paints`).get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>n(void 0)})}async function j(e){let t=await k();if(!t)return;let n=t.transaction(`paints`,`readwrite`).objectStore(`paints`);n.put(e);let r=n.getAll();r.onsuccess=()=>{let e=r.result.sort((e,t)=>t.at-e.at);for(let t of e.slice(D))n.delete(t.key)}}function te(e,t){let n=new Uint8ClampedArray(e),r=512,i=512,a=-1,o=-1;for(let e=0;e<512;e++){let s=Math.max(0,(e+.5)*320/512-.5),c=Math.min(319,s|0),l=Math.min(319,c+1),u=s-c;for(let s=0;s<512;s++){let d=255;if(t){let e=Math.max(0,(s+.5)*320/512-.5),n=Math.min(319,e|0),r=Math.min(319,n+1),i=e-n,a=(t[c*320+n]*(1-i)+t[c*320+r]*i)*(1-u)+(t[l*320+n]*(1-i)+t[l*320+r]*i)*u;d=Math.min(1,Math.max(0,(a-.08)/.84))*255}n[(e*512+s)*4+3]=d,d>40&&(s<r&&(r=s),s>a&&(a=s),e<i&&(i=e),e>o&&(o=e))}}if(a<0)return{w:512,h:512,px:n};let s=a-r+1,c=o-i+1,l=new Uint8ClampedArray(s*c*4);for(let e=0;e<c;e++)l.set(n.subarray(((e+i)*512+r)*4,((e+i)*512+a+1)*4),e*s*4);return{w:s,h:c,px:l}}async function M(e){return{bmp:await createImageBitmap(new ImageData(new Uint8ClampedArray(e.px),e.w,e.h)),w:e.w,h:e.h}}async function N({spec:e,cacheOnly:t}){let r=await A(e.key);if(r){i(e.key,await M(r));return}if(t||!_)return;let a=e.traits.filter(e=>!(e in _.phrases));if(a.length){console.warn(`painter: unknown phrases`,a);return}let o=performance.now(),{rgba:s}=await _.paint({traits:e.traits,seed:e.seed,gate:T});await T();let c=te(s,await _.matte(s));y.paints.push({key:e.key,ms:Math.round(performance.now()-o)}),await j({key:e.key,...c,at:Date.now()}),i(e.key,await M(c)),e.group&&n(e.group,e.key)}async function P(){if(!v){v=!0;try{for(;t.length;){t.sort((e,t)=>e.pri-t.pri);let e=t.shift();if(!_&&!e.cacheOnly&&!await A(e.spec.key)){t.unshift(e);break}await T(),await N(e).catch(t=>console.warn(`painter job failed`,e.spec.key,t))}}finally{v=!1}}}var F=null;function I(){return F??=(async()=>{a(()=>void P()),P();let e=performance.now(),t=new URL(r(),location.href),n=await(await fetch(new URL(`manifest.json`,t),{cache:`no-cache`})).json(),i=[...n.files,n.matte?.json,n.matte?.bin].filter(Boolean).map(e=>new URL(e,t).href);ee(new Set(i)),_=await h({manifest:n,fetchChunk:e=>E(new URL(e,t).href),gate:T}),y.loadS=Math.round((performance.now()-e)/100)/10,_.lost.then(()=>{_=null,y.error=`GPU device lost`}),P()})().catch(e=>{y.error=e.message,console.warn(`painter unavailable:`,e)}),F}export{I as start};