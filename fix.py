import io
filepath = r'C:/Users/cdmar/.gemini/antigravity/scratch/overwatch-stadium/index.html'
with io.open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('\\`', '`').replace('\\${', '${')
with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed syntax")
