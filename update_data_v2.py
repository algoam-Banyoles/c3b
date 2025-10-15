import pandas as pd
import json
import sys

# Configurar encoding per evitar errors amb unicode
sys.stdout.reconfigure(encoding='utf-8')

print("=== PROCESSANT DADES DELS EXCELS ===\n")

# 1. LLEGIR DADES DE CHUECOS (BILLAR (1).xlsx)
print("1. PROCESSANT CHUECOS (BILLAR (1).xlsx)...")
try:
    df_chuecos = pd.read_excel('BILLAR (1).xlsx')
    print(f"   Files llegides: {len(df_chuecos)}")

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

        # Parsejar mitjana
        mitjana_str = str(row.get('Mitjana', '0'))
        if 'nan' in mitjana_str.lower():
            mitjana = caramboles / entrades if entrades > 0 else 0
        else:
            mitjana = float(mitjana_str.replace(',', '.'))

        # Sèrie Major
        serie_major = row.get('Serie M', None)
        if pd.notna(serie_major) and str(serie_major) != 'nan':
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
            'url_video': None
        }

        partides_chuecos.append(partida)

    print(f"   Partides processades: {len(partides_chuecos)}")

    # Guardar JSON de chuecos
    with open('partides_chuecos_updated.json', 'w', encoding='utf-8') as f:
        json.dump(partides_chuecos, f, ensure_ascii=False, indent=2)

    print("   Arxiu partides_chuecos_updated.json creat!\n")

except Exception as e:
    print(f"   ERROR: {e}\n")

# 2. LLEGIR DADES DE GOMEZ (Partides.xlsx)
print("2. PROCESSANT GOMEZ (Partides.xlsx)...")
try:
    df_gomez = pd.read_excel('Partides.xlsx')
    print(f"   Files llegides: {len(df_gomez)}")

    partides_gomez = []

    for idx, row in df_gomez.iterrows():
        # Caramboles de Gomez (Jugador 1)
        caramboles_j1 = row.get('Caramboles J1', 0)
        caramboles = int(float(caramboles_j1)) if pd.notna(caramboles_j1) else 0

        # Caramboles oponent (Jugador 2)
        caramboles_j2 = row.get('Caramboles J2', 0)
        caramboles_oponent = int(float(caramboles_j2)) if pd.notna(caramboles_j2) else 0

        # Entrades
        entrades_val = row.get('Entrades', 1)
        entrades = int(float(entrades_val)) if pd.notna(entrades_val) else 1

        # Mitjana de Gomez
        mitjana_j1 = row.get('Mitjana J1', 0)
        mitjana = float(mitjana_j1) if pd.notna(mitjana_j1) else (caramboles / entrades if entrades > 0 else 0)

        # Lloc
        lloc_val = row.get('Unnamed: 2', None)
        lloc = str(lloc_val) if pd.notna(lloc_val) and str(lloc_val) != 'nan' else None

        # Data
        data_val = row.get('Unnamed: 1', None)
        data = str(data_val)[:10] if pd.notna(data_val) else None

        # Oponent (Jugador 2)
        oponent = row.get('Jugador 2', '')
        oponent = str(oponent) if pd.notna(oponent) and str(oponent) != 'nan' else ''

        # Equip
        equip = row.get('Equip', None)
        equip = str(equip) if pd.notna(equip) and str(equip) != 'nan' else None

        # URL Vídeo (Unnamed: 18)
        url_video = row.get('Unnamed: 18', None)
        if pd.notna(url_video) and str(url_video).startswith('http'):
            url_video = str(url_video)
        else:
            url_video = None

        partida = {
            'num': idx + 1,
            'data': data,
            'lloc': lloc,
            'oponent': oponent,
            'equip': equip,
            'caramboles': caramboles,
            'caramboles_oponent': caramboles_oponent,
            'entrades': entrades,
            'mitjana': mitjana,
            'mitjana_oponent': caramboles_oponent / entrades if entrades > 0 else 0,
            'serie_major': None,  # No hi ha sèrie major a l'Excel de Gomez
            'url_video': url_video
        }

        partides_gomez.append(partida)

    print(f"   Partides processades: {len(partides_gomez)}")

    # Guardar JSON de gomez
    with open('partides_gomez_updated.json', 'w', encoding='utf-8') as f:
        json.dump(partides_gomez, f, ensure_ascii=False, indent=2)

    print("   Arxiu partides_gomez_updated.json creat!\n")

except Exception as e:
    print(f"   ERROR: {e}\n")

print("=== PROCES COMPLETAT ===")
