import os

# 2. Fix Chặng 6 index.html with newline-agnostic splitter
c6_index_path = "Project/HLinh/PortfolioAssets/CHẶNG 6/index.html"
if os.path.exists(c6_index_path):
    content = open(c6_index_path, "r", encoding="utf-8").read()
    
    # Replace ethics-infographic block with the new PNG image block
    ethics_start = '<div class="ethics-infographic">'
    if ethics_start in content:
        before = content.split(ethics_start)[0]
        # Split on </body> which is newline-safe and always present
        after_parts = content.split(ethics_start)[1].split('</body>')
        if len(after_parts) >= 2:
            after = '</body>' + after_parts[1]
            
            new_block = """<div class="image-group">
        <div class="image-container" style="max-width: 100%; border: none; background: none; padding: 0;">
          <img
            src="./Image/Sản phẩm infographic C6.png"
            alt="Sản phẩm infographic C6"
            style="width: 100%; height: auto; border: 1px solid var(--border-gold); border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);"
          />
          <div class="image-caption">
            Sản phẩm Infographic hoàn thiện của Chặng 6: Sử dụng AI có trách nhiệm trong học thuật
          </div>
        </div>
      </div>\n      </div>\n""" # close the .document-container
            
            new_content = before + new_block + after
            with open(c6_index_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("Successfully updated Chặng 6 index.html with infographic block.")
        else:
            print("Could not find correct closing tags for Chặng 6 ethics block.")
    else:
        print("ethics-infographic not found in Chặng 6 index.html.")
else:
    print("Chặng 6 index.html not found.")
