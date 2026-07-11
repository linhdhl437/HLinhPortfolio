content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
idx = content.find('id="intro-video"')
if idx != -1:
    with open('Project/HLinh/scratch/video_tag_info.txt', 'w', encoding='utf-8') as f:
        f.write(content[idx-50:idx+350])
    print("Found video tag in index.html.")
else:
    print("Not found.")
