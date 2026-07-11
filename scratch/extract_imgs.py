import re

content = open('Project/HLinh/js/stage-content.js', 'r', encoding='utf-8').read()
imgs = re.findall(r'src=["\']([^"\']+)["\']', content)
with open('Project/HLinh/scratch/stage_content_imgs.txt', 'w', encoding='utf-8') as f:
    for img in imgs:
        f.write(img + '\n')
print(f"Extracted {len(imgs)} image sources.")
