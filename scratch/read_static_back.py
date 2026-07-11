content = open('Project/HLinh/stage_details.html', 'r', encoding='utf-8').read()
idx = content.find('btn-back-to-timeline')
if idx != -1:
    with open('Project/HLinh/scratch/back_static_info.txt', 'w', encoding='utf-8') as f:
        f.write(content[idx-100:idx+250])
    print("Found back button static HTML in stage_details.html.")
else:
    print("Not found.")
