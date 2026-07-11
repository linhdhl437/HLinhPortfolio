content = open('Project/HLinh/index.html', 'r', encoding='utf-8').read()
idx = content.find('id="HanhTrinh"')
if idx == -1:
    idx = content.find("id='HanhTrinh'")
if idx != -1:
    with open('Project/HLinh/scratch/hanhtrinh_info.txt', 'w', encoding='utf-8') as f:
        f.write(content[idx-100:idx+400])
    print("Found HanhTrinh in index.html.")
else:
    print("Not found.")
