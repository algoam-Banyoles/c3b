import pandas as pd
import json
import sys

# Configurar encoding per evitar errors amb unicode
sys.stdout.reconfigure(encoding='utf-8')

print("Llegint fitxers Excel...")

# 1. LLEGIR DADES DE CHUECOS (BILLAR (1).xlsx)
try:
    df_chuecos = pd.read_excel('BILLAR (1).xlsx')
    print(f"\nChuecos - Files llegides: {len(df_chuecos)}")
    print(f"Columnes: {df_chuecos.columns.tolist()}")

    partides_chuecos = []

    for idx, row in df_chuecos.iterrows():
        # Parsejar caramboles (format "24-30")
        caramboles_str = str(row.get('Caramboles', '0-0'))
        if '-' in caramboles_str and 'nan' not in caramboles_str.lower():
            try:
                parts = caramboles_str.split('-')
                caramboles = int(parts[0].strip())
                caramboles_oponent = int(parts[1].strip())
            except (ValueError, IndexError):
                caramboles = 0
                caramboles_oponent = 0
        elif caramboles_str and 'nan' not in caramboles_str.lower():
            try:
                caramboles = int(caramboles_str)
                caramboles_oponent = 0
            except ValueError:
                caramboles = 0
                caramboles_oponent = 0
        else:
            caramboles = 0
            caramboles_oponent = 0

        # Entrades
        entrades_val = row.get('Entrades', 1)
        if pd.notna(entrades_val):
            try:
                entrades = int(float(entrades_val))
            except (ValueError, TypeError):
                entrades = 1
        else:
            entrades = 1

        # Parsejar mitjana (pot tenir comes)
        mitjana_str = str(row.get('Mitjana', '0'))
        if 'nan' in mitjana_str.lower():
            mitjana = caramboles / entrades if entrades > 0 else 0
        else:
            mitjana = float(mitjana_str.replace(',', '.'))

        # Sèrie Major
        serie_major = row.get('Serie M', None)
        if pd.notna(serie_major) and str(serie_major).strip() and str(serie_major) != 'nan':
            try:
                serie_major = int(float(serie_major))
            except (ValueError, TypeError):
                serie_major = None
        else:
            serie_major = None

        partida = {
            'num': idx + 1,
            'data': str(row.get('Data', ''))[:10] if pd.notna(row.get('Data')) else None,
            'lloc': row.get('Lloc', None) if pd.notna(row.get('Lloc')) else None,
            'oponent': row.get('Contrincant', '') if pd.notna(row.get('Contrincant')) else '',
            'equip': row.get('Club', None) if pd.notna(row.get('Club')) else None,
            'caramboles': caramboles,
            'caramboles_oponent': caramboles_oponent,
            'entrades': entrades,
            'mitjana': mitjana,
            'mitjana_oponent': caramboles_oponent / entrades if entrades > 0 else 0,
            'serie_major': serie_major,
            'url_video': None  # De moment null, es pot afegir manualment després
        }

        partides_chuecos.append(partida)

    print(f"\nChuecos - Partides processades: {len(partides_chuecos)}")

    # Guardar JSON de chuecos
    with open('partides_chuecos_updated.json', 'w', encoding='utf-8') as f:
        json.dump(partides_chuecos, f, ensure_ascii=False, indent=2)

    print("Arxiu partides_chuecos_updated.json creat correctament")

except Exception as e:
    print(f"Error processant BILLAR (1).xlsx: {e}")

# 2. LLEGIR DADES DE GOMEZ (Partides.xlsx)
try:
    df_gomez = pd.read_excel('Partides.xlsx')
    print(f"\n\nGomez - Files llegides: {len(df_gomez)}")
    print(f"Columnes: {df_gomez.columns.tolist()}")

    partides_gomez = []

    for idx, row in df_gomez.iterrows():
        # Parsejar caramboles
        caramboles_str = str(row.get('Caramboles', '0-0'))
        if '-' in caramboles_str:
            parts = caramboles_str.split('-')
            caramboles = int(parts[0].strip())
            caramboles_oponent = int(parts[1].strip())
        else:
            caramboles = int(caramboles_str)
            caramboles_oponent = 0

        entrades = int(row.get('Entrades', 1))

        # Parsejar mitjana
        mitjana_str = str(row.get('Mitjana', '0'))
        mitjana = float(mitjana_str.replace(',', '.'))

        # Sèrie Major
        serie_major = row.get('Serie Major', None)
        if serie_major is None:
            serie_major = row.get('Serie M', None)
        if serie_major is None:
            serie_major = row.get('Sèrie Major', None)

        if pd.notna(serie_major):
            serie_major = int(serie_major)
        else:
            serie_major = None

        partida = {
            'num': idx + 1,
            'data': str(row.get('Data', ''))[:10] if pd.notna(row.get('Data')) else None,
            'lloc': row.get('Lloc', None) if pd.notna(row.get('Lloc')) else None,
            'oponent': row.get('Contrincant', '') if pd.notna(row.get('Contrincant')) else '',
            'equip': row.get('Club', None) if pd.notna(row.get('Club')) else None,
            'caramboles': caramboles,
            'caramboles_oponent': caramboles_oponent,
            'entrades': entrades,
            'mitjana': mitjana,
            'mitjana_oponent': caramboles_oponent / entrades if entrades > 0 else 0,
            'serie_major': serie_major,
            'url_video': None  # De moment null, es pot afegir manualment després
        }

        partides_gomez.append(partida)

    print(f"\nGomez - Partides processades: {len(partides_gomez)}")

    # Guardar JSON de gomez
    with open('partides_gomez_updated.json', 'w', encoding='utf-8') as f:
        json.dump(partides_gomez, f, ensure_ascii=False, indent=2)

    print("Arxiu partides_gomez_updated.json creat correctament")

except Exception as e:
    print(f"Error processant Partides.xlsx: {e}")

print("\n\nProces completat!")
