#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script per actualitzar les dades INITIAL_DATA dins dels fitxers HTML
amb les dades processades dels JSON.
"""

import json
import re

def update_html_initial_data(html_file, json_file):
    """
    Actualitza el INITIAL_DATA dins d'un fitxer HTML amb les dades d'un JSON.
    """
    print(f"Actualitzant {html_file}...")

    # Llegir JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    print(f"   {len(json_data)} partides llegides del JSON")

    # Llegir HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Convertir JSON a format JavaScript
    js_data = json.dumps(json_data, ensure_ascii=False, indent=12)

    # Buscar i reemplaçar INITIAL_DATA
    pattern = r'const INITIAL_DATA = \[[\s\S]*?\];'
    replacement = f'const INITIAL_DATA = {js_data};'

    new_html_content = re.sub(pattern, replacement, html_content, count=1)

    if new_html_content == html_content:
        print(f"   No s'ha trobat INITIAL_DATA al fitxer!")
        return False

    # Guardar HTML actualitzat
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_html_content)

    print(f"   INITIAL_DATA actualitzat amb {len(json_data)} partides")
    return True

def main():
    print("\n" + "="*60)
    print("  ACTUALITZACIO DE DADES INICIAL_DATA ALS FITXERS HTML")
    print("="*60 + "\n")

    # Actualitzar index.html (Gomez)
    success1 = update_html_initial_data(
        'index.html',
        'partides_gomez_updated.json'
    )
    print()

    # Actualitzar chuecos.html
    success2 = update_html_initial_data(
        'chuecos.html',
        'partides_chuecos_updated.json'
    )
    print()

    if success1 and success2:
        print("="*60)
        print("  TOTS ELS FITXERS ACTUALITZATS CORRECTAMENT")
        print("="*60 + "\n")
    else:
        print("="*60)
        print("  ALGUNS FITXERS NO S'HAN POGUT ACTUALITZAR")
        print("="*60 + "\n")

if __name__ == '__main__':
    main()
