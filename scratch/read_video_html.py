content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
idx = content.find('intro-video')
if idx != -1:
    with open('Project/HLinh/scratch/video_html_info.txt', 'w', encoding='utf-8') as f:
        f.write(content[idx-150:idx+400])
    print("Found video in index.html.")
else:
    print("Not found.")
