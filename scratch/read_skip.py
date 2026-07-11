content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
idx = content.find('btn-skip-intro')
if idx != -1:
    with open('Project/HLinh/scratch/skip_info.txt', 'w', encoding='utf-8') as f:
        f.write(content[idx-200:idx+400])
    print("Found btn-skip-intro in index.html.")
else:
    print("Not found.")
