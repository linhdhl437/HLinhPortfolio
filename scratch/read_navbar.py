content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
idx = content.find('site-header')
with open('Project/HLinh/scratch/navbar_info.txt', 'w', encoding='utf-8') as f:
    f.write(content[idx:idx+600])
print('done')
