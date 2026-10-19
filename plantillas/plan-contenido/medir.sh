#!/bin/bash
# uso: medir.sh <carpeta project>  -> holgura sobre el pie de cada página
P="$1"; M=$(mktemp -d)
python3 - "$P" "$M" <<'PY'
import re,glob,os,sys
P,M=sys.argv[1],sys.argv[2]
for f in glob.glob(P+'/*.dc.html'):
    s=open(f).read()
    s=re.sub(r'<script.*?</script>','',s,flags=re.S)
    s=re.sub(r'<helmet>.*?</helmet>','<style>body{margin:0;font-family:sans-serif}</style>',s,flags=re.S)
    s=s.replace('<x-dc>','').replace('</x-dc>','')
    s=s.replace('</body>','<script>const r=document.body.querySelector("div");const k=[...r.children];const ft=k[k.length-1],pv=k[k.length-2];document.title="GAP="+Math.round(ft.getBoundingClientRect().top-pv.getBoundingClientRect().bottom)+" H="+r.scrollHeight;</script></body>')
    open(M+'/'+os.path.basename(f).replace('.dc',''),'w').write(s)
PY
for f in $M/*.html; do printf "%-18s " $(basename $f); /opt/pw-browsers/chromium --headless --disable-gpu --no-sandbox --window-size=794,1123 --dump-dom "file://$f" 2>/dev/null | grep -o 'GAP=[0-9-]* H=[0-9]*'; done
rm -rf $M
