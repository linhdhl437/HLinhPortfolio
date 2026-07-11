import re

content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
lines = content.split('\n')
with open('Project/HLinh/scratch/balance_output.txt', 'w', encoding='utf-8') as f:
    for idx in range(590, 875):
        line = lines[idx]
        if '<section' in line or '</section>' in line or '<main' in line or '</main>' in line or '<div' in line or '</div' in line:
            f.write(f"{idx+1}: {line.strip()}\n")
print('done')
