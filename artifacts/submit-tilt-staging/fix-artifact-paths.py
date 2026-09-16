from pathlib import Path
base=Path('artifacts/submit-tilt-staging')
for name in ['quote','tilt','full']:
 nested=base/'artifacts/submit-tilt-staging'/f'{name}-results.json'
 if nested.exists(): nested.replace(base/f'{name}-results-first.json')
 p=base/f'playwright.{name}.config.ts'
 s=p.read_text().replace(f"outputFile:'artifacts/submit-tilt-staging/{name}-results.json'",f"outputFile:'{name}-results.json'")
 p.write_text(s)
