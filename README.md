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
4. Bearbeite dein Dashboard, füge eine **manuelle Karte** hinzu und übernimm [example.yaml](example.yaml). Ersetze die Beispiel-IDs durch deine Entitäts-IDs aus **Entwicklerwerkzeuge → Zustände**.

Für eine erste Anzeige kannst du die primäre Entität zuordnen.

```yaml
type: custom:energie-dashboard-card
entitaeten:
  energie:
    pv_gesamt: sensor.beispiel_energie_pv_gesamt
```

Die übrigen Zuordnungen kannst du nach Bedarf aus [example.yaml](example.yaml) ergänzen. Ohne Zuordnung verwendet die Karte Platzhalter-IDs.

Die Kartenbereiche für Garage, Stockwerke und Geräte verwenden die zugeordneten Schalter, Lichter und Automationen. Der Wetterbereich liest die zugeordnete `weather.*`-Entität. Die Anzeige der Kosten übernimmt das Währungsformat CHF aus der Vorlage.

## GitHub-Repository anlegen

Lege ein öffentliches Repository mit dem Namen `energie-dashboard-card` an. Lade die Dateien aus dem entpackten Einzelarchiv direkt in die Wurzel des Repositorys. HACS lädt die fertige Ressource `energie-dashboard-card.js` aus dem Standardbranch. Ein GitHub-Release ist optional.

Wenn Home Assistant meldet, dass der Kartentyp fehlt, lade die Seite neu und prüfe unter **Einstellungen → Dashboards → ⋮ → Ressourcen**, ob die Ressource als **JavaScript-Modul** eingetragen ist. Bei YAML-verwalteten Dashboard-Ressourcen ergänze die URL aus HACS in deiner YAML-Ressourcenliste.

[HACS-Dokumentation für Dashboard-Repositorys](https://www.hacs.xyz/docs/publish/plugin/) · [Benutzerdefinierte Repositorys](https://www.hacs.xyz/docs/faq/custom_repositories/)
