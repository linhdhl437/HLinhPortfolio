import re

content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
sections = re.findall(r'<section[^>]+id=["\']([^"\']+)["\']', content)
with open('Project/HLinh/scratch/index_ids.txt', 'w', encoding='utf-8') as f:
    for s in sections:
        f.write(s + '\n')
print(f"Found {len(sections)} sections.")
