# Requires Python Playwright, Pillow and Chromium. Run against local Pages preview; optional URL argument.
import sys,json,urllib.request,time,tempfile
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
base=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8793').rstrip('/');local=base.startswith('http://127.0.0.1');out=Path(tempfile.mkdtemp(prefix='motion-cosmos-'))
headers={'User-Agent':'Mozilla/5.0','Content-Type':'application/json','Cache-Control':'no-cache'}
def api(path,data=None,method=None):
 h={**headers,**({'Authorization':'Bearer local-development-only'} if local else {})};q=urllib.request.Request(base+path,data=None if data is None else json.dumps(data).encode(),headers=h,method=method)
 with urllib.request.urlopen(q,timeout=40) as r:return json.load(r)
def rpc(name,args):
 r=api('/mcp',{'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':name,'arguments':args}})['result'];assert not r.get('isError'),r;return r['structuredContent']
mode_bodies={'orbit':['gas','sun','moon','earth'],'flyover':['earth','moon','mars','sun'],'earthzoom':['earth']};prefixes={'orbit':'cs','flyover':'fs','earthzoom':'ez'}
catalog_response=api('/api/effects?v='+str(time.time_ns()));catalog=catalog_response['effects'];assert len([x for x in catalog if x['category']=='cosmos'])==3 and len([x for x in catalog if x['category']=='meteor'])==5;assert next(c for c in catalog_response['categories'] if c['id']=='meteor')['sec']=='illus'
for mode,no in [('orbit',169),('flyover',195),('earthzoom',199)]:
 r=rpc('get_effect',{'id':str(no),'format':'code'});assert r['id']=='cosmos-illustrated-'+mode and r['number']==no and not r.get('hidden')
for no in [185,186,187,196,197,198]:assert rpc('get_effect',{'id':str(no),'format':'code'})['hidden'] is True
for mode,bodies in mode_bodies.items():
 for body in bodies:
  r=rpc('build_cosmos_scene',{'mode':mode,'body':body,'speed':.6});assert r['scene']['mode']==mode and r['scene']['body']==body and r['combo_scene']['seconds']==20 and 'edit=cosmos' in r['edit_url']
print('Catalog, legacy nine and MCP nine variants: passed',flush=True)
pids=[]
try:
 if local:
  for mode in mode_bodies:
   r=api('/api/presets',{'kind':'cosmos','name':'Local cosmic regression '+mode,'data':{'mode':mode,'body':mode_bodies[mode][-1]}});pids.append((mode,r['preset']['id']))
  listing=api('/api/presets?kind=cosmos')['presets'];assert all(next(x for x in listing if x['id']==pid)['mode']==mode for mode,pid in pids)
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1380,'height':1040},accept_downloads=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script("try{localStorage.setItem('ma-play',JSON.stringify('hover'))}catch(e){}")
  def ready(prefix):page.wait_for_function('(p)=>document.querySelector("#"+p+"Loading")?.hidden',arg=prefix,timeout=45000)
  def field(prefix,key,v):page.locator('#'+prefix+'Controls [data-k="'+key+'"]').evaluate('(e,v)=>{e.value=String(v);e.dispatchEvent(new Event("input",{bubbles:true}))}',v)
  for mode,bodies in mode_bodies.items():
   prefix=prefixes[mode];fx='cosmos-illustrated-'+mode;page.goto(base+'/?fx='+str({'orbit':169,'flyover':195,'earthzoom':199}[mode]),wait_until='networkidle');page.locator('#dIllustrationStudio').click();ready(prefix);assert page.locator('#cosmic-'+mode+'-studio').is_visible();assert page.locator('#cosmic-'+mode+'-studio .cb-badge').inner_text()==str({'orbit':169,'flyover':195,'earthzoom':199}[mode]);assert page.locator('#dObjStudio').is_hidden();assert page.locator('#'+prefix+'Styles [data-body]').count()==len(bodies)
   for body in bodies:
    if len(bodies)>1:page.locator('#'+prefix+'Styles [data-body="'+body+'"]').click();ready(prefix)
    if mode=='orbit':
     assert page.locator('#'+prefix+'SpecificFields [data-k="rings"]').count()==(1 if body=='gas' else 0);assert page.locator('#'+prefix+'SpecificFields [data-k="clouds"]').count()==(1 if body=='earth' else 0)
    if mode=='flyover':assert page.locator('#'+prefix+'SpecificFields [data-k="altitude"]').is_visible()
    field(prefix,'size',1.1 if body!='sun' else .8);field(prefix,'speed',1.5);page.locator('#'+prefix+'Combo').click();draft=page.evaluate("JSON.parse(localStorage.getItem('ma-draft'))");sc=json.loads(draft['scenes'][-1]['words'][0]);assert sc['mode']==mode and sc['body']==body and draft['scenes'][-1]['effect']==fx and draft['scenes'][-1]['seconds']==8
   if len(bodies)>1:
    page.locator('#'+prefix+'Styles [data-body="'+bodies[0]+'"]').click();ready(prefix);assert float(page.locator('#'+prefix+'Controls [data-k="size"]').input_value())==1.1
   page.locator('#'+prefix+'Transparent').check();ready(prefix)
   with page.expect_download() as d:page.locator('#'+prefix+'Png').click()
   path=out/(mode+'-alpha.png');d.value.save_as(str(path));im=Image.open(path);assert im.size==(1080,1920) and im.mode=='RGBA' and im.getextrema()[3][0]==0 and im.getextrema()[3][1]>200
   page.screenshot(path=str(out/('editor-'+mode+'.png')))
   if mode=='earthzoom':
    field(prefix,'zoomDirection','out');field(prefix,'zoomEnd',4.5)
   page.set_viewport_size({'width':390,'height':844});assert page.locator('#cosmic-'+mode+'-studio').evaluate('(d)=>d.scrollWidth<=d.clientWidth+2');page.set_viewport_size({'width':1380,'height':1040});page.locator('#'+prefix+'Close').click();print('Editor '+mode+' variants, memory, Combo, alpha PNG, mobile: passed',flush=True)
  for mode,pid in pids:
   prefix=prefixes[mode];page.goto(base+'/?edit='+pid,wait_until='networkidle');ready(prefix);assert page.locator('#'+prefix+'Preset .pb-id').inner_text()==pid
   page.locator('#'+prefix+'Preset .pb-load').focus();page.wait_for_function('(p)=>document.querySelector("#"+p+"Preset .pb-load").options.length>1',arg=prefix);ids=page.locator('#'+prefix+'Preset option').evaluate_all('(xs)=>xs.map(x=>x.value).filter(Boolean)');assert pid in ids and all(other not in ids for other_mode,other in pids if other_mode!=mode);page.locator('#'+prefix+'Close').click()
  page.goto(base+'/?ws=illus',wait_until='networkidle');page.locator('.cat[data-cat="meteor"]').click();assert '星空物件' in page.locator('.cat[data-cat="meteor"]').inner_text();cards=page.locator('.ma-card').evaluate_all('(xs)=>xs.map(x=>({id:x.dataset.id,no:x.querySelector(".ma-num").textContent}))');assert [(c['id'],c['no']) for c in cards]==[('cosmos-illustrated-orbit','169'),('cosmos-illustrated-flyover','195'),('cosmos-illustrated-earthzoom','199'),('vehicle-illustrated-rocket','240'),('meteor-illustrated','244')]
  page.screenshot(path=str(out/'space-object-series.png'))
  page.goto(base+'/?ws=object',wait_until='networkidle');page.locator('.cat[data-cat="cosmos"]').click();assert page.locator('.ma-card').count()==3 and page.locator('.ma-card[data-id^="cosmos-illustrated-"]').count()==0
  # The existing draft editor opens the correct specialized editor.
  page.goto(base+'/?view=draft',wait_until='networkidle');page.locator('#drScenes [data-act="studio"]').last.click();ready('ez');assert page.locator('#cosmic-earthzoom-studio').is_visible();page.locator('#ezClose').click()
  page.goto(base+'/?view=cosmic-flyover',wait_until='networkidle');ready('fs');page.locator('#fsStyles [data-body="earth"]').click();ready('fs');field('fs','speed',2.5);page.locator('#fsTransparent').check();ready('fs')
  with page.expect_download(timeout=30000) as d:page.locator('#fsWebm').click()
  d.value.save_as(str(out/'earth-flyover-alpha.webm'))
  assert not errors,errors
  print(json.dumps({'base':base,'preset_mode_lists':'passed' if local else 'not written on public','WebM':'saved','Combo_editor':'passed','pageErrors':errors}),flush=True);b.close()
finally:
 for _,pid in pids:api('/api/presets/'+pid,method='DELETE')
