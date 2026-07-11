import re

content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()

# Let's extract everything around class="journey-tab-item"
matches = re.findall(r'<div[^>]+journey-tab-item[^>]*>.*?</div>', content, re.DOTALL)
with open('Project/HLinh/scratch/timeline_info.txt', 'w', encoding='utf-8') as f:
    f.write("JOURNEY TAB ITEMS:\n")
    for m in matches:
        f.write(m + '\n')
        
    # Also find targets
    targets = re.findall(r'id=["\']tab-stage-[^"\']+["\']', content)
    f.write("\nJOURNEY TAB PANES:\n")
    for t in targets:
        f.write(t + '\n')
        
print("Timeline info written to scratch/timeline_info.txt.")
