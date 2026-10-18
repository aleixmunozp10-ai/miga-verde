import json,urllib.request
from pathlib import Path
root=Path(__file__).parent
for item in json.loads((root/'generations.json').read_text()):
 if item['status']!='completed': continue
 path=root/'originals'/(item['name']+'.png')
 if path.exists():continue
 urllib.request.urlretrieve(item['result']['images'][0]['url'][0],path)
 print(item['name'],path.stat().st_size,flush=True)
