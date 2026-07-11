import os

with open('Project/HLinh/scratch/found_pdfs.txt', 'w', encoding='utf-8') as f:
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.pdf'):
                full_path = os.path.join(root, file)
                f.write(full_path + '\n')
print("PDF search completed.")
