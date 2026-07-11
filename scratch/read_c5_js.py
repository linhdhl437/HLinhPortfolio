# Read stage-content.js using simple string splitting with correct key stage5
content = open('Project/HLinh/js/stage-content.js', 'r', encoding='utf-8').read()
start_marker = 'stage5: `'
end_marker = '`,\n  stage6: `'
if start_marker in content:
    stage5_html = content.split(start_marker)[1].split(end_marker)[0]
    with open('Project/HLinh/scratch/c5_js_content.html', 'w', encoding='utf-8') as f:
        f.write(stage5_html)
    print("Stage 5 HTML written to scratch/c5_js_content.html.")
else:
    print("Stage 5 marker not found.")
