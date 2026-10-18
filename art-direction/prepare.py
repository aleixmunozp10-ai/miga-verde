from PIL import Image,ImageDraw
import numpy as np
from pathlib import Path
root=Path(__file__).parent
out=root.parent/'dist/assets'
previews=[]
for path in sorted((root/'originals').glob('*.png')):
 im=Image.open(path).convert('RGBA'); a=np.array(im);name=path.stem
 print(name,im.size,'alpha',int(a[:,:,3].min()),'corner',a[0,0].tolist())
 if name.startswith('bg'):
  im.convert('RGB').resize((2048,1152),Image.Resampling.LANCZOS).save(out/(name+'.webp'),'WEBP',quality=82,method=6)
 else:
  if a[:,:,3].min()==255:
   from scipy import ndimage
   rgb=a[:,:,:3].astype(float)
   neutral=(rgb.max(axis=2)-rgb.min(axis=2)<19)&(rgb.min(axis=2)>177)
   labels,n=ndimage.label(neutral)
   border=np.unique(np.concatenate((labels[0],labels[-1],labels[:,0],labels[:,-1])))
   border=border[border!=0]
   background=np.isin(labels,border)
   # The generated checkerboard is opaque: remove only neutral exterior regions.
   mask=~background
   components,count=ndimage.label(mask)
   sizes=np.bincount(components.ravel());sizes[0]=0
   if name.startswith('cookie'):
    mask=components==sizes.argmax()
    mask=ndimage.binary_fill_holes(mask)
   else:
    edge_ids=np.unique(np.concatenate((components[:5].ravel(),components[-5:].ravel(),components[:,:5].ravel(),components[:,-5:].ravel())))
    mask=(sizes[components]>35)&~np.isin(components,edge_ids)
    mask=ndimage.binary_fill_holes(mask)
   alpha=ndimage.gaussian_filter(mask.astype(float),.6)
   a[:,:,3]=(alpha*255).astype('uint8')
   im=Image.fromarray(a)
  if name.startswith('deco'):
   im=im.resize((2048,1152),Image.Resampling.LANCZOS)
   # Reserve a safe margin even when generation placed a fragment near the edge.
   canvas=Image.new('RGBA',(2048,1152));small=im.resize((1844,1038),Image.Resampling.LANCZOS);canvas.alpha_composite(small,(102,57));im=canvas
  else:
   bbox=im.getbbox()
   if bbox:
    crop=im.crop(bbox);crop.thumbnail((1884,1884),Image.Resampling.LANCZOS);im=Image.new('RGBA',(2048,2048));im.alpha_composite(crop,((2048-crop.width)//2,(2048-crop.height)//2))
  im.save(out/(name+'.webp'),'WEBP',quality=85 if name.startswith('cookie') else 82,method=6,exact=True)
 thumb=im.copy();thumb.thumbnail((480,270));tile=Image.new('RGB',(500,310),'#bac4aa');tile.paste(thumb,((500-thumb.width)//2,25),thumb if thumb.mode=='RGBA' else None);ImageDraw.Draw(tile).text((10,5),name,fill='black');previews.append(tile)
board=Image.new('RGB',(1500,310*((len(previews)+2)//3)),'white')
for i,tile in enumerate(previews):board.paste(tile,((i%3)*500,(i//3)*310))
board.save(root/'preview.jpg')
