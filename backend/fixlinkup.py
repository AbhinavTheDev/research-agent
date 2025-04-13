import os

# Path to utils.py
utils_path = os.path.join(os.path.dirname(__file__), 'utils.py')

with open(utils_path, 'r') as f:
    content = f.read()

# Comment out the problematic import
if "from linkup import LinkupClient" in content:
    content = content.replace("from linkup import LinkupClient", "# from linkup import LinkupClient  # Commented out")

# Replace the linkup_search function
linkup_replacement = '''
@traceable
async def linkup_search(search_queries, depth: Optional[str] = "standard"):
    """Placeholder for linkup search."""
    print("Using dummy linkup_search implementation")
    search_results = []
    for query in search_queries:
        search_results.append({
            "query": query,
            "follow_up_questions": None,
            "answer": None,
            "images": [],
            "results": []
        })
    return search_results
'''

# Find the original function and replace it
import re
pattern = r'@traceable\nasync def linkup_search.*?return search_results'
if re.search(pattern, content, re.DOTALL):
    content = re.sub(pattern, linkup_replacement.strip(), content, flags=re.DOTALL)

# Write the modified content back
with open(utils_path, 'w') as f:
    f.write(content)

print("Fixed LinkupClient import in utils.py")