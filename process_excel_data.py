#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script per processar les dades dels fitxers Excel i generar JSONs per les aplicacions
d'estadístiques de billar.

Processa:
- BILLAR (1).xlsx -> partides_chuecos_updated.json
- Partides.xlsx -> partides_gomez_updated.json

Ús: python process_excel_data.py
"""

import pandas as pd
import json
import sys
from pathlib import Path

# Configurar encoding per evitar errors amb unicode
sys.stdout.reconfigure(encoding='utf-8')


def safe_int(value, default=0):
    """Converteix un valor a int de manera segura."""
    if pd.notna(value) and str(value) != 'nan':
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return default
    return default


def safe_float(value, default=0.0):
    """Converteix un valor a float de manera segura."""
    if pd.notna(value) and str(value) != 'nan':
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    return default


def safe_str(value, default=''):
    """Converteix un valor a string de manera segura."""
    if pd.notna(value) and str(value) != 'nan':
        return str(value)
    return default


def process_chuecos_data(excel_file='BILLAR (1).xlsx'):
    """
    Processa les dades de Chuecos des de BILLAR (1).xlsx.

    Format Excel:
    - Caramboles: format "24-30" (propi-oponent)
    - Entrades: número
    - Mitjana: amb comes decimals
    - Serie M: sèrie major
    - Data, Contrincant, Club, Lloc: metadades
    """
    print(f"📊 Processant {excel_file}...")

    df = pd.read_excel(excel_file)
    print(f"   ✓ {len(df)} files llegides")

    partides = []

    for idx, row in df.iterrows():
        # Parsejar caramboles (format "24-30")
        caramboles_str = str(row.get('Caramboles', '0-0'))
        if '-' in caramboles_str and 'nan' not in caramboles_str.lower():
            try:
                parts = caramboles_str.split('-')
                caramboles = int(parts[0].strip())
                caramboles_oponent = int(parts[1].strip())
            except (ValueError, IndexError):
                caramboles = caramboles_oponent = 0
        else:
            caramboles = caramboles_oponent = 0

        entrades = safe_int(row.get('Entrades'), 1)

        # Parsejar mitjana (pot tenir comes)
        mitjana_str = str(row.get('Mitjana', '0'))
        if 'nan' in mitjana_str.lower():
            mitjana = caramboles / entrades if entrades > 0 else 0
        else:
            mitjana = float(mitjana_str.replace(',', '.'))

        # Data
        data_val = row.get('Data')
        data = str(data_val)[:10] if pd.notna(data_val) else None

        partida = {
            'num': idx + 1,
            'data': data,
            'lloc': safe_str(row.get('Lloc'), None),
            'oponent': safe_str(row.get('Contrincant')),
            'equip': safe_str(row.get('Club'), None),
            'caramboles': caramboles,
            'caramboles_oponent': caramboles_oponent,
            'entrades': entrades,
            'mitjana': mitjana,
            'mitjana_oponent': caramboles_oponent / entrades if entrades > 0 else 0,
            'serie_major': safe_int(row.get('Serie M'), None),
            'url_video': None
        }

        partides.append(partida)

    return partides


def process_gomez_data(excel_file='Partides.xlsx'):
    """
    Processa les dades de Gomez des de Partides.xlsx.

    Format Excel:
    - Jugador 1: Albert Gómez (sempre)
    - Jugador 2: Oponent
    - Caramboles J1/J2: caramboles de cada jugador
    - Entrades: entrades totals
    - Mitjana J1: mitjana calculada
    - Unnamed: 18: URL del vídeo
    """
    print(f"📊 Processant {excel_file}...")

    df = pd.read_excel(excel_file)
    print(f"   ✓ {len(df)} files llegides")

    partides = []

    for idx, row in df.iterrows():
        caramboles = safe_int(row.get('Caramboles J1'))
        caramboles_oponent = safe_int(row.get('Caramboles J2'))
        entrades = safe_int(row.get('Entrades'), 1)

        # Mitjana
        mitjana_j1 = row.get('Mitjana J1')
        mitjana = safe_float(mitjana_j1, caramboles / entrades if entrades > 0 else 0)

        # Data i lloc
        data_val = row.get('Unnamed: 1')
        data = str(data_val)[:10] if pd.notna(data_val) else None
        lloc = safe_str(row.get('Unnamed: 2'), None)

        # URL del vídeo
        url_video = row.get('Unnamed: 18')
        if pd.notna(url_video) and str(url_video).startswith('http'):
            url_video = str(url_video)
        else:
            url_video = None

        partida = {
            'num': idx + 1,
            'data': data,
            'lloc': lloc,
            'oponent': safe_str(row.get('Jugador 2')),
            'equip': safe_str(row.get('Equip'), None),
            'caramboles': caramboles,
            'caramboles_oponent': caramboles_oponent,
            'entrades': entrades,
            'mitjana': mitjana,
            'mitjana_oponent': caramboles_oponent / entrades if entrades > 0 else 0,
            'serie_major': None,  # No disponible a l'Excel de Gomez
            'url_video': url_video
        }

        partides.append(partida)

    return partides


def save_json(data, filename):
    """Guarda les dades en format JSON."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"   ✓ Creat: {filename}")


def main():
    """Funció principal."""
    print("\n" + "="*50)
    print("  PROCESSAMENT DE DADES D'ESTADÍSTIQUES DE BILLAR")
    print("="*50 + "\n")

    # Processar Chuecos
    try:
        partides_chuecos = process_chuecos_data('BILLAR (1).xlsx')
        save_json(partides_chuecos, 'partides_chuecos_updated.json')
        print(f"   ✓ {len(partides_chuecos)} partides de Chuecos processades\n")
    except Exception as e:
        print(f"   ✗ Error processant Chuecos: {e}\n")

    # Processar Gomez
    try:
        partides_gomez = process_gomez_data('Partides.xlsx')
        save_json(partides_gomez, 'partides_gomez_updated.json')
        print(f"   ✓ {len(partides_gomez)} partides de Gomez processades\n")
    except Exception as e:
        print(f"   ✗ Error processant Gomez: {e}\n")

    print("="*50)
    print("  PROCÉS COMPLETAT")
    print("="*50 + "\n")


if __name__ == '__main__':
    main()
