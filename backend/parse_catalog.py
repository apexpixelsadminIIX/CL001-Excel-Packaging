import openpyxl, json, re
from collections import OrderedDict

wb = openpyxl.load_workbook('catalog_src.xlsx', data_only=True)

CATS = {
    'Plastic Containers': 'plastic-containers',
    'Eco-Friendly Range': 'eco-friendly',
    'Disposable Cutlery': 'cutlery',
    'General Supplies': 'general-supplies',
    'Hospitality Amenities': 'hospitality-amenities',
    'Beverage Packaging (Chai-Coffee': 'beverage',
    'Napkins': 'napkins',
    'Custom Branding': 'custom-branding',
    'Excel EliteClean': 'eliteclean',
}

def clean(v):
    if v is None: return ''
    s = str(v).strip()
    return s

catalog = []
total = 0
for ws in wb.worksheets:
    rows = [r for r in ws.iter_rows(values_only=True) if r and any(c not in (None,'') for c in r)]
    desc = clean(rows[0][0]).split('—')[-1].strip() if rows else ''
    if len(rows) > 1 and clean(rows[1][0]).lower().startswith('s.no'):
        header = [clean(c) for c in rows[1]]; data = rows[2:]
    else:
        desc = clean(rows[1][0]) if len(rows) > 1 else desc
        header = [clean(c) for c in rows[2]]; data = rows[3:]
    # column indices
    def idx(name):
        for i,h in enumerate(header):
            if h.lower().startswith(name): return i
        return None
    i_item = idx('item'); i_sub = idx('sub'); i_shape = idx('shape')
    i_qty = idx('qty')
    subs = OrderedDict()
    for r in data:
        item = clean(r[i_item]) if i_item is not None and i_item < len(r) else ''
        sub = clean(r[i_sub]) if i_sub is not None and i_sub < len(r) else 'General'
        shape = clean(r[i_shape]) if i_shape is not None and i_shape < len(r) else ''
        qty = clean(r[i_qty]) if i_qty is not None and i_qty < len(r) else ''
        if not item: continue
        total += 1
        if sub not in subs:
            subs[sub] = {'sizes': [], 'types': [], 'moq': []}
        if item and item not in subs[sub]['sizes']:
            subs[sub]['sizes'].append(item)
        if shape and shape not in subs[sub]['types']:
            subs[sub]['types'].append(shape)
        if qty and qty not in subs[sub]['moq']:
            subs[sub]['moq'].append(qty)
    cat_id = CATS.get(ws.title, re.sub(r'[^a-z]+','-',ws.title.lower()))
    products = []
    for sub, v in subs.items():
        products.append({
            'id': cat_id + '-' + re.sub(r'[^a-z0-9]+','-', sub.lower()).strip('-'),
            'sub_category': sub,
            'name': sub,
            'sizes': v['sizes'],
            'types': v['types'],
            'moq': v['moq'],
            'image': '', 'images': [], 'desc': ''
        })
    catalog.append({'id': cat_id, 'name': ws.title.replace('(Chai-Coffee','(Chai/Coffee)'),
                    'desc': desc, 'products': products})

json.dump(catalog, open('catalog_source.json','w'), indent=1, ensure_ascii=False)
print('TOTAL ITEMS:', total)
for c in catalog:
    nsub = len(c['products'])
    nvar = sum(len(p['sizes']) for p in c['products'])
    print(f"- {c['name']}: {nsub} sub-cats, {nvar} size-variants")
    for p in c['products']:
        extra = (' | types:'+str(len(p['types']))) if p['types'] else ''
        extra += (' | moq:'+str(len(p['moq']))) if p['moq'] else ''
        print(f"     · {p['sub_category']}: {len(p['sizes'])} sizes{extra}")
