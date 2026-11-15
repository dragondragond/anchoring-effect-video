import sys
from PIL import Image
files = sys.argv[2:]; out = sys.argv[1]
W, H = 960, 540; cols = 2
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, H * rows), 'black')
for i, f in enumerate(files):
    im = Image.open(f).resize((W, H))
    sheet.paste(im, ((i % cols) * W, (i // cols) * H))
sheet.save(out, quality=85)
