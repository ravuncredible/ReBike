from pathlib import Path
path = Path('''index.html''')
text = path.read_text(encoding='utf-8')
text = text.replace('onclick="showTab(\'pendingDonations\')"', 'onclick="showTab(\'pendingDonations\', this)"')
text = text.replace('onclick="showTab(\'statusManagement\')"', 'onclick="showTab(\'statusManagement\', this)"')
text = text.replace('onclick="showTab(\'inSystem\')"', 'onclick="showTab(\'inSystem\', this)"')
text = text.replace('onclick="showTab(\'completed\')"', 'onclick="showTab(\'completed\', this)"')
path.write_text(text, encoding='utf-8')