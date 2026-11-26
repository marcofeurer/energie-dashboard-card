# Energie- und Hausübersicht

PV, Netz, Batterie, Hausverbrauch, Wetter und Haussteuerung in einer Lovelace-Karte. Die Karte erscheint in HACS als **Dashboard**.

## Voraussetzungen

- **Button Card** für die Darstellung und Bedienung, geprüft mit Version 7.0.1. [custom-cards/button-card](https://github.com/custom-cards/button-card)
- **Browser Mod 2** für die Pop-ups. Nach der Installation muss die Integration in Home Assistant eingerichtet sein. [thomasloven/hass-browser_mod](https://github.com/thomasloven/hass-browser_mod)

Die Karte verwendet bereits vorhandene Home-Assistant-Entitäten. Übersicht und Messwerte werden im Dashboard angezeigt, sobald die Entitäten zugeordnet sind.

## Über HACS installieren

1. Öffne **HACS → ⋮ → Benutzerdefinierte Repositorys**.
2. Füge die GitHub-Adresse dieses Repositorys hinzu und wähle **Dashboard**.
3. Öffne **Energie- und Hausübersicht** in HACS und wähle **Herunterladen**. Lade das Dashboard anschließend neu.
4. Öffne **Dashboard bearbeiten → Karte hinzufügen** und wähle **Energie- und Hausübersicht**.

## Entitäten visuell zuordnen

Öffne **Dashboard bearbeiten → Karte bearbeiten** und klappe die gewünschte Gruppe auf. Die Entitäten sind in **Energie**, **Wetter**, **Garagentor**, **Untergeschoss**, **Erdgeschoss**, **Obergeschoss**, **Anbau** sowie **Geräte und Automationen** gegliedert.

Suche in den Feldern nach Anzeigenamen oder Entitäts-ID. Bereits gespeicherte Zuordnungen erscheinen im Editor. Wenn du ein Feld leerst, verwendet die Karte dort wieder ihre Platzhalter-ID. Du kannst dieselben Zuordnungen auch im YAML-Editor bearbeiten. [Beispielkonfiguration](example.yaml)

Die Kartenbereiche für Garage, Stockwerke und Geräte verwenden die zugeordneten Schalter, Lichter und Automationen. Der Wetterbereich liest die zugeordnete `weather.*`-Entität. Die Anzeige der Kosten übernimmt das Währungsformat CHF aus der Vorlage.

## GitHub-Repository anlegen

Lege ein öffentliches Repository mit dem Namen `energie-dashboard-card` an. Lade die Dateien aus dem entpackten Einzelarchiv direkt in die Wurzel des Repositorys. HACS lädt die fertige Ressource `energie-dashboard-card.js` aus dem Standardbranch. Ein GitHub-Release ist optional.

Wenn Home Assistant meldet, dass der Kartentyp fehlt, lade die Seite neu und prüfe unter **Einstellungen → Dashboards → ⋮ → Ressourcen**, ob die Ressource als **JavaScript-Modul** eingetragen ist. Bei YAML-verwalteten Dashboard-Ressourcen ergänze die URL aus HACS in deiner YAML-Ressourcenliste.

[HACS-Dokumentation für Dashboard-Repositorys](https://www.hacs.xyz/docs/publish/plugin/) · [Benutzerdefinierte Repositorys](https://www.hacs.xyz/docs/faq/custom_repositories/)
