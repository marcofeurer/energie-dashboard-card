class DashboardCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; min-width: 0; }
      ::slotted(.dependency-message) { padding: 16px; }
    `;
    root.append(style, document.createElement("slot"));
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    const buttonConfig = structuredClone(BUTTON_CONFIG);
    applyEntityOverrides(buttonConfig.variables.entitaeten, config.entitaeten);
    this._buttonConfig = buttonConfig;
    this._configureButtonCard();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._buttonCard) {
      this._buttonCard.hass = hass;
    }
  }

  set preview(preview) {
    this._preview = preview;
    if (this._buttonCard) {
      this._buttonCard.preview = preview;
    }
  }

  getCardSize() {
    return this._buttonCard?.getCardSize() ?? 3;
  }

  getGridOptions() {
    return { ...BUTTON_CONFIG.grid_options };
  }

  _configureButtonCard() {
    if (!customElements.get("button-card")) {
      if (!this._waitingForButtonCard) {
        this._waitingForButtonCard = true;
        this._showMessage("Installiere „Button Card“ in HACS und lade das Dashboard neu.");
        customElements.whenDefined("button-card").then(() => {
          try {
            this._configureButtonCard();
          } catch (error) {
            this._showMessage(error.message);
          }
        });
      }
      return;
    }

    const buttonCard = this._buttonCard ?? document.createElement("button-card");
    buttonCard.setConfig(this._buttonConfig);
    buttonCard.preview = this._preview ?? false;
    if (this._hass) {
      buttonCard.hass = this._hass;
    }
    if (!this._buttonCard) {
      this._buttonCard = buttonCard;
      this.replaceChildren(buttonCard);
    }
  }

  _showMessage(message) {
    const card = document.createElement("ha-card");
    card.className = "dependency-message";
    card.setAttribute("role", "status");
    card.textContent = message;
    this.replaceChildren(card);
  }
}

function isMapping(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function applyEntityOverrides(entities, overrides) {
  if (overrides == null) {
    return;
  }
  if (!isMapping(overrides)) {
    throw new Error("„entitaeten“ muss eine Zuordnung aus Gruppen und Entitäts-IDs sein.");
  }

  for (const [group, values] of Object.entries(overrides)) {
    if (!Object.hasOwn(entities, group)) {
      throw new Error(`Unbekannte Entitätsgruppe „${group}“.`);
    }
    if (!isMapping(values)) {
      throw new Error(`Die Entitätsgruppe „${group}“ muss eine Zuordnung sein.`);
    }
    for (const [key, entityId] of Object.entries(values)) {
      if (!Object.hasOwn(entities[group], key)) {
        throw new Error(`Unbekannte Entitätszuordnung „${group}.${key}“.`);
      }
      if (typeof entityId !== "string" || !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(entityId)) {
        throw new Error(`Ungültige Entitäts-ID für „${group}.${key}“.`);
      }
      entities[group][key] = entityId;
    }
  }
}

// Lovelace-Konfiguration der zugrunde liegenden Button Card.
const BUTTON_CONFIG = {
  "type": "custom:button-card",
  "variables": {
    "entitaeten": {
      "energie": {
        "pv_gesamt": "sensor.beispiel_energie_pv_gesamt",
        "pv_e3dc": "sensor.beispiel_energie_pv_e3dc",
        "pv_fronius": "sensor.beispiel_energie_pv_fronius",
        "hausverbrauch": "sensor.beispiel_energie_hausverbrauch",
        "netzbezug": "sensor.beispiel_energie_netzbezug",
        "netzeinspeisung": "sensor.beispiel_energie_netzeinspeisung",
        "batterie_leistung": "sensor.beispiel_energie_batterie_leistung",
        "batterie_ladestand": "sensor.beispiel_energie_batterie_ladestand",
        "sauna_leistung": "sensor.beispiel_energie_sauna_leistung",
        "waermepumpe_leistung": "sensor.beispiel_energie_waermepumpe_leistung",
        "heizstab_leistung": "sensor.beispiel_energie_heizstab_leistung",
        "wallbox_leistung": "sensor.beispiel_energie_wallbox_leistung",
        "wallbox_laedt": "binary_sensor.beispiel_energie_wallbox_laedt",
        "autarkie": "sensor.beispiel_energie_autarkie",
        "eigenverbrauch": "sensor.beispiel_energie_eigenverbrauch",
        "stromkosten_heute": "sensor.beispiel_energie_stromkosten_heute",
        "einspeiseverguetung_heute": "sensor.beispiel_energie_einspeiseverguetung_heute"
      },
      "garage": {
        "tor_status": "sensor.beispiel_garage_tor_status",
        "tor_lueften": "switch.beispiel_garage_tor_lueften",
        "tor_auf_zu": "switch.beispiel_garage_tor_auf_zu"
      },
      "untergeschoss": {
        "treppe": "light.beispiel_untergeschoss_treppe",
        "waschkueche": "light.beispiel_untergeschoss_waschkueche",
        "luftschutzraum": "light.beispiel_untergeschoss_luftschutzraum",
        "technikraum": "light.beispiel_untergeschoss_technikraum",
        "sauna": "light.beispiel_untergeschoss_sauna",
        "safe": "light.beispiel_untergeschoss_safe"
      },
      "erdgeschoss": {
        "hauseingang": "light.beispiel_erdgeschoss_hauseingang",
        "kueche": "light.beispiel_erdgeschoss_kueche",
        "esszimmer_deckenleuchte": "light.beispiel_erdgeschoss_esszimmer_deckenleuchte",
        "esszimmer_bodenleuchte": "switch.beispiel_erdgeschoss_esszimmer_bodenleuchte",
        "wohnzimmer_stehlampe": "light.beispiel_erdgeschoss_wohnzimmer_stehlampe",
        "wohnzimmer_tischleuchte": "switch.beispiel_erdgeschoss_wohnzimmer_tischleuchte",
        "wohnzimmer_bodenleuchte": "switch.beispiel_erdgeschoss_wohnzimmer_bodenleuchte"
      },
      "obergeschoss": {
        "treppe_flur": "light.beispiel_obergeschoss_treppe_flur",
        "buero_deckenleuchte": "light.beispiel_obergeschoss_buero_deckenleuchte",
        "buero_fensterleuchte": "switch.beispiel_obergeschoss_buero_fensterleuchte",
        "buero_tischleuchte": "switch.beispiel_obergeschoss_buero_tischleuchte",
        "bad": "light.beispiel_obergeschoss_bad",
        "dusche_licht": "light.beispiel_obergeschoss_dusche_licht",
        "dusche_lueftung": "switch.beispiel_obergeschoss_dusche_lueftung",
        "schlafzimmer_fensterleuchte": "switch.beispiel_obergeschoss_schlafzimmer_fensterleuchte",
        "schlafzimmer_tischleuchte": "switch.beispiel_obergeschoss_schlafzimmer_tischleuchte",
        "gaestezimmer_fensterleuchte": "light.beispiel_obergeschoss_gaestezimmer_fensterleuchte",
        "gaestezimmer_tischleuchte": "light.beispiel_obergeschoss_gaestezimmer_tischleuchte",
        "terrassenzimmer_stehlampe": "light.beispiel_obergeschoss_terrassenzimmer_stehlampe",
        "terrassenzimmer_tischleuchte": "light.beispiel_obergeschoss_terrassenzimmer_tischleuchte"
      },
      "anbau": {
        "wintergarten_tischleuchte": "switch.beispiel_anbau_wintergarten_tischleuchte",
        "wintergarten_licht": "light.beispiel_anbau_wintergarten_licht",
        "garage_deckenleuchte": "light.beispiel_anbau_garage_deckenleuchte",
        "garage_licht": "light.beispiel_anbau_garage_licht"
      },
      "geraete": {
        "bewegungsmelder_treppe_flur": "automation.beispiel_geraete_bewegungsmelder_treppe_flur",
        "bewegungsmelder_kueche": "automation.beispiel_geraete_bewegungsmelder_kueche",
        "bewegungsmelder_buero": "automation.beispiel_geraete_bewegungsmelder_buero",
        "bewegungsmelder_gaestezimmer": "automation.beispiel_geraete_bewegungsmelder_gaestezimmer",
        "bewegungsmelder_terrassenzimmer": "automation.beispiel_geraete_bewegungsmelder_terrassenzimmer",
        "garage_entfeuchter": "switch.beispiel_geraete_garage_entfeuchter",
        "garage_lueftung": "switch.beispiel_geraete_garage_lueftung",
        "wintergarten_heizung": "switch.beispiel_geraete_wintergarten_heizung",
        "wintergarten_klimaanlage": "switch.beispiel_geraete_wintergarten_klimaanlage",
        "garage_durchgang_heizung": "switch.beispiel_geraete_garage_durchgang_heizung"
      },
      "wetter": {
        "vorhersage": "weather.beispiel_wetter_vorhersage"
      }
    }
  },
  "entity": "[[[ return variables.entitaeten.energie.pv_gesamt; ]]]",
  "update_timer": "1s",
  "triggers_update": [
    "[[[ return variables.entitaeten.energie.pv_gesamt; ]]]",
    "[[[ return variables.entitaeten.energie.pv_e3dc; ]]]",
    "[[[ return variables.entitaeten.energie.pv_fronius; ]]]",
    "[[[ return variables.entitaeten.energie.hausverbrauch; ]]]",
    "[[[ return variables.entitaeten.energie.netzbezug; ]]]",
    "[[[ return variables.entitaeten.energie.netzeinspeisung; ]]]",
    "[[[ return variables.entitaeten.energie.batterie_leistung; ]]]",
    "[[[ return variables.entitaeten.energie.batterie_ladestand; ]]]",
    "[[[ return variables.entitaeten.energie.sauna_leistung; ]]]",
    "[[[ return variables.entitaeten.energie.waermepumpe_leistung; ]]]",
    "[[[ return variables.entitaeten.energie.heizstab_leistung; ]]]",
    "[[[ return variables.entitaeten.energie.wallbox_leistung; ]]]",
    "[[[ return variables.entitaeten.energie.wallbox_laedt; ]]]",
    "[[[ return variables.entitaeten.energie.autarkie; ]]]",
    "[[[ return variables.entitaeten.energie.eigenverbrauch; ]]]",
    "[[[ return variables.entitaeten.energie.stromkosten_heute; ]]]",
    "[[[ return variables.entitaeten.energie.einspeiseverguetung_heute; ]]]",
    "[[[ return variables.entitaeten.garage.tor_status; ]]]",
    "[[[ return variables.entitaeten.garage.tor_lueften; ]]]",
    "[[[ return variables.entitaeten.garage.tor_auf_zu; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.treppe; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.waschkueche; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.luftschutzraum; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.technikraum; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.sauna; ]]]",
    "[[[ return variables.entitaeten.untergeschoss.safe; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.hauseingang; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.kueche; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.esszimmer_deckenleuchte; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.esszimmer_bodenleuchte; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_stehlampe; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_bodenleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.treppe_flur; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.buero_deckenleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.buero_fensterleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.buero_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.bad; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.dusche_licht; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.dusche_lueftung; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.schlafzimmer_fensterleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.schlafzimmer_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.gaestezimmer_fensterleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.gaestezimmer_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.terrassenzimmer_stehlampe; ]]]",
    "[[[ return variables.entitaeten.obergeschoss.terrassenzimmer_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.anbau.wintergarten_tischleuchte; ]]]",
    "[[[ return variables.entitaeten.anbau.wintergarten_licht; ]]]",
    "[[[ return variables.entitaeten.anbau.garage_deckenleuchte; ]]]",
    "[[[ return variables.entitaeten.anbau.garage_licht; ]]]",
    "[[[ return variables.entitaeten.geraete.bewegungsmelder_treppe_flur; ]]]",
    "[[[ return variables.entitaeten.geraete.bewegungsmelder_kueche; ]]]",
    "[[[ return variables.entitaeten.geraete.bewegungsmelder_buero; ]]]",
    "[[[ return variables.entitaeten.geraete.bewegungsmelder_gaestezimmer; ]]]",
    "[[[ return variables.entitaeten.geraete.bewegungsmelder_terrassenzimmer; ]]]",
    "[[[ return variables.entitaeten.geraete.garage_entfeuchter; ]]]",
    "[[[ return variables.entitaeten.geraete.garage_lueftung; ]]]",
    "[[[ return variables.entitaeten.geraete.wintergarten_heizung; ]]]",
    "[[[ return variables.entitaeten.geraete.wintergarten_klimaanlage; ]]]",
    "[[[ return variables.entitaeten.geraete.garage_durchgang_heizung; ]]]",
    "[[[ return variables.entitaeten.wetter.vorhersage; ]]]"
  ],
  "show_icon": false,
  "show_name": false,
  "show_state": false,
  "tap_action": {
    "action": "none"
  },
  "hold_action": {
    "action": "none"
  },
  "styles": {
    "card": [
      {
        "background": "none"
      },
      {
        "border": "none"
      },
      {
        "box-shadow": "none"
      },
      {
        "padding": 0
      },
      {
        "overflow": "hidden"
      },
      {
        "width": "100%"
      },
      {
        "max-width": "none"
      },
      {
        "display": "block"
      },
      {
        "height": "auto"
      },
      {
        "min-width": 0
      }
    ],
    "grid": [
      {
        "display": "block"
      },
      {
        "width": "100%"
      },
      {
        "height": "auto"
      },
      {
        "min-width": 0
      },
      {
        "position": "relative"
      }
    ],
    "custom_fields": {
      "dashboard": [
        {
          "display": "block"
        },
        {
          "position": "relative"
        },
        {
          "width": "100%"
        },
        {
          "min-width": 0
        },
        {
          "max-width": "none"
        },
        {
          "line-height": 0
        },
        {
          "justify-self": "stretch"
        },
        {
          "pointer-events": "none"
        }
      ],
      "tap_pv": [
        {
          "position": "absolute"
        },
        {
          "left": "5.5%"
        },
        {
          "top": "13.657407407407407%"
        },
        {
          "width": "27%"
        },
        {
          "height": "9.953703703703702%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_grid": [
        {
          "position": "absolute"
        },
        {
          "left": "5.5%"
        },
        {
          "top": "28.009259259259256%"
        },
        {
          "width": "27%"
        },
        {
          "height": "9.953703703703702%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_battery": [
        {
          "position": "absolute"
        },
        {
          "left": "67.5%"
        },
        {
          "top": "13.657407407407407%"
        },
        {
          "width": "27%"
        },
        {
          "height": "9.953703703703702%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_home": [
        {
          "position": "absolute"
        },
        {
          "left": "67.5%"
        },
        {
          "top": "28.009259259259256%"
        },
        {
          "width": "27%"
        },
        {
          "height": "9.953703703703702%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_solar": [
        {
          "position": "absolute"
        },
        {
          "left": "3%"
        },
        {
          "top": "55.32407407407407%"
        },
        {
          "width": "45.75%"
        },
        {
          "height": "7.4074074074074066%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_fronius": [
        {
          "position": "absolute"
        },
        {
          "left": "51.25%"
        },
        {
          "top": "55.32407407407407%"
        },
        {
          "width": "45.75%"
        },
        {
          "height": "7.4074074074074066%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_sauna": [
        {
          "position": "absolute"
        },
        {
          "left": "5.5%"
        },
        {
          "top": "43.28703703703704%"
        },
        {
          "width": "21.5%"
        },
        {
          "height": "8.796296296296296%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_wp": [
        {
          "position": "absolute"
        },
        {
          "left": "28.000000000000004%"
        },
        {
          "top": "43.28703703703704%"
        },
        {
          "width": "21.5%"
        },
        {
          "height": "8.796296296296296%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_eh": [
        {
          "position": "absolute"
        },
        {
          "left": "50.5%"
        },
        {
          "top": "43.28703703703704%"
        },
        {
          "width": "21.5%"
        },
        {
          "height": "8.796296296296296%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_car": [
        {
          "position": "absolute"
        },
        {
          "left": "73%"
        },
        {
          "top": "43.28703703703704%"
        },
        {
          "width": "21.5%"
        },
        {
          "height": "8.796296296296296%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_autarky": [
        {
          "position": "absolute"
        },
        {
          "left": "3%"
        },
        {
          "top": "64.35185185185185%"
        },
        {
          "width": "46%"
        },
        {
          "height": "6.712962962962963%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "tap_ratio": [
        {
          "position": "absolute"
        },
        {
          "left": "51%"
        },
        {
          "top": "64.35185185185185%"
        },
        {
          "width": "46%"
        },
        {
          "height": "6.712962962962963%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "garage_status": [
        {
          "position": "absolute"
        },
        {
          "left": "3%"
        },
        {
          "top": "79.39814814814814%"
        },
        {
          "width": "42%"
        },
        {
          "height": "7.4074074074074066%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "garage_vent": [
        {
          "position": "absolute"
        },
        {
          "left": "5%"
        },
        {
          "top": "87.5%"
        },
        {
          "width": "18%"
        },
        {
          "height": "7.87037037037037%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "garage_door": [
        {
          "position": "absolute"
        },
        {
          "left": "25%"
        },
        {
          "top": "87.5%"
        },
        {
          "width": "18%"
        },
        {
          "height": "7.87037037037037%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "building_0": [
        {
          "position": "absolute"
        },
        {
          "left": "47.5%"
        },
        {
          "top": "79.39814814814814%"
        },
        {
          "width": "15.5%"
        },
        {
          "height": "8.333333333333332%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "building_1": [
        {
          "position": "absolute"
        },
        {
          "left": "64.5%"
        },
        {
          "top": "79.39814814814814%"
        },
        {
          "width": "15.5%"
        },
        {
          "height": "8.333333333333332%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "building_2": [
        {
          "position": "absolute"
        },
        {
          "left": "81.5%"
        },
        {
          "top": "79.39814814814814%"
        },
        {
          "width": "15.5%"
        },
        {
          "height": "8.333333333333332%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "building_3": [
        {
          "position": "absolute"
        },
        {
          "left": "47.5%"
        },
        {
          "top": "88.88888888888889%"
        },
        {
          "width": "15.5%"
        },
        {
          "height": "8.333333333333332%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "building_4": [
        {
          "position": "absolute"
        },
        {
          "left": "64.5%"
        },
        {
          "top": "88.88888888888889%"
        },
        {
          "width": "15.5%"
        },
        {
          "height": "8.333333333333332%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ],
      "flow_animation": [
        {
          "position": "absolute"
        },
        {
          "left": 0
        },
        {
          "top": 0
        },
        {
          "width": "100%"
        },
        {
          "height": "100%"
        },
        {
          "pointer-events": "none"
        },
        {
          "z-index": 3
        }
      ],
      "weather": [
        {
          "position": "absolute"
        },
        {
          "left": "52%"
        },
        {
          "top": "0.5787037037037037%"
        },
        {
          "width": "45%"
        },
        {
          "height": "5.555555555555555%"
        },
        {
          "z-index": 5
        },
        {
          "pointer-events": "auto"
        }
      ]
    }
  },
  "custom_fields": {
    "dashboard": [
      "[[[",
      "const entitaeten = variables.entitaeten;",
      "return (function dashboard(states, hass, ids) {",
      "  const dark = !!hass.themes?.darkMode;",
      "  const c = dark ? {bg:'#111820',card:'#1C2732',surface:'#253341',border:'#3B4B58',text:'#E6EDF3',muted:'#A4B5C4'} : {bg:'#EEF4F7',card:'#FFFFFF',surface:'#F6FAFD',border:'#DAE5ED',text:'#19384A',muted:'#678399'};",
      "  const green='#00B894', blue='#00A9D5', amber=dark?'#FFD166':'#B77900', red=dark?'#FF9299':'#D65C68';",
      "  const rawRead = k => { const entity=states[ids[k]], s=entity?.state; if(s == null || String(s).trim()==='' || !Number.isFinite(Number(s))) return null; const value=Number(s); return entity?.attributes?.unit_of_measurement==='kW' ? value*1000 : value; };",
      "  const read = k => {",
      "    if(k==='grid'){const a=rawRead('gridImport'),b=rawRead('gridExport');return a===null&&b===null?null:(a||0)-(b||0);}",
      "    return rawRead(k);",
      "  };",
      "  const fmt = (v,d=0) => v===null?'—':v.toLocaleString('de-CH',{minimumFractionDigits:d,maximumFractionDigits:d});",
      "  const power = k => { const raw=read(k); if(raw===null)return '—'; const sign=k==='grid' && raw<0 ? '-' : ''; const v=Math.abs(raw); return sign+(v>=1000?fmt(v/1000,2)+' kW':fmt(v)+' W'); };",
      "  const pct = k => read(k)===null?'—':fmt(read(k))+' %';",
      "  const esc = s => String(s).replace(/[&<>\"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&apos;'}[x]));",
      "  const text=(x,y,s,size=14,color=c.text,weight=400,anchor='start')=>`<text x=\"${x}\" y=\"${y}\" font-size=\"${size}\" fill=\"${color}\" font-weight=\"${weight}\" text-anchor=\"${anchor}\">${esc(s)}</text>`;",
      "  const box=(x,y,w,h,fill=c.card,r=18)=>`<rect x=\"${x}\" y=\"${y}\" width=\"${w}\" height=\"${h}\" rx=\"${r}\" fill=\"${fill}\" stroke=\"${c.border}\"/>`;",
      "  const icons={solar:'M4 14 L7 7 H21 L24 14 Z M6 11 H22 M12 7 L11 14 M17 7 L18 14 M14 14 V19 M9 19 H19 M14 1 V3 M4 3 L6 5 M24 3 L22 5',home:'M3 12 L14 3 L25 12 M6 10 V24 H22 V10 M11 24 V16 H17 V24',grid:'M10 3 H18 L22 25 M10 3 L6 25 M8 9 H20 M5 15 H23 M7 21 H21 M10 3 L20 15 M18 3 L8 15 M8 15 L21 25 M20 15 L7 25',battery:'M10 3 V1 H18 V3 M7 4 H21 V25 H7 Z M10 10 H18 M10 15 H18 M10 20 H18',sauna:'M4 13 H24 V24 H4 Z M9 13 V24 M14 13 V24 M19 13 V24 M8 9 C3 6 13 5 8 1 M15 9 C10 6 20 5 15 1 M22 9 C17 6 27 5 22 1',wp:'M4 3 H24 V25 H4 Z M9 21 H19 M14 7 V17 M9 12 H19 M10 8 L18 16 M18 8 L10 16',eh:'M6 3 V24 M11 3 V24 M17 3 V24 M22 3 V24 M4 8 H24 M4 19 H24',car:'M5 11 L8 4 H20 L23 11 M3 12 H25 V22 H3 Z M7 22 V25 M21 22 V25 M7 16 H10 M18 16 H21'};",
      "  const icon=(name,x,y,color,scale=1)=>`<g transform=\"translate(${x} ${y}) scale(${scale})\" fill=\"none\" stroke=\"${color}\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">${icons[name]?`<path d=\"${icons[name]}\"/>`:''}</g>`;",
      "  const grid=read('grid'), bat=read('battery');",
      "  // Original card: grid unchanged, battery invert_value=true.",
      "  const gridLabel=grid===null?'Keine Daten':grid>0?'Netzbezug':grid<0?'Einspeisung':'Kein Austausch';",
      "  const batLabel=bat===null?'Keine Daten':bat>0?'Lädt':bat<0?'Entlädt':'Bereit';",
      "  const node=(x,y,key,title,sub,kind,color)=>box(x,y,216,86)+icon(kind,x+16,y+8,color,.8)+text(x+54,y+24,title,16,c.muted,600)+text(x+18,y+58,power(key),28,c.text,700)+text(x+18,y+78,sub,15,c.muted,500);",
      "  let s=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" viewBox=\"0 0 800 864\" style=\"display:block;width:100%;height:auto;font-family:Arial,sans-serif\"><style>@media(prefers-reduced-motion:reduce){.battery-arrow-motion{display:none}}.flow{stroke-dasharray:5 11;animation:e3-flow 1.6s linear infinite}@keyframes e3-flow{to{stroke-dashoffset:-32}}@media(prefers-reduced-motion:reduce){.flow{animation:none}.flow-dot{display:none}}</style>`;",
      "  s+=box(1,1,798,862,c.bg,26)+text(20.8,31.2,'E3-DC · ENERGIE',21,c.text,700)+text(20.8,48,'Solar · Speicher · Verbrauch',10.5,c.muted);",
      "        const weather=states[entitaeten.wetter.vorhersage];",
      "      const wa=weather?.attributes || {};",
      "const weatherArtwork=function weatherArtwork(condition,dark){",
      "  const sun='<circle cx=\"39\" cy=\"18\" r=\"12\" fill=\"#FFDA3E\"/>';",
      "  const moon='<path d=\"M45 5 A15 15 0 1 0 55 29 A16 16 0 0 1 45 5\" fill=\"#FFE69A\"/>';",
      "  const cloud='<path d=\"M14 47 C-2 47 -1 26 13 24 C14 9 36 9 40 23 C57 20 65 47 47 47 Z\" fill=\"#CFD3D8\"/><path d=\"M13 47 C3 47 4 34 13 33 C16 23 30 25 32 34 C44 32 48 47 36 47 Z\" fill=\"#F7F9FC\"/>';",
      "  const drops='<path d=\"M18 51 l-3 6 M31 51 l-3 6 M44 51 l-3 6\" stroke=\"#52BAEF\" stroke-width=\"4\" stroke-linecap=\"round\"/>';",
      "  const snow='<g stroke=\"#9CDEFA\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M16 51 v10 M12 53 l8 6 M12 59 l8 -6 M40 51 v10 M36 53 l8 6 M36 59 l8 -6\"/></g>';",
      "  const wind='<g fill=\"none\" stroke=\"#A9CBDC\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M7 23 H40 C53 23 51 8 42 12 M3 33 H50 C61 33 59 47 51 43 M11 43 H29\"/></g>';",
      "  const lightning='<path d=\"M31 37 L21 52 H30 L26 63 L44 46 H34 L39 37 Z\" fill=\"#FFCF38\"/>';",
      "  switch(condition){",
      "    case 'sunny':return '<g stroke=\"#FFCE32\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M32 3 V8 M32 52 V57 M5 30 H10 M54 30 H59 M13 11 L17 15 M47 45 L51 49 M13 49 L17 45 M47 15 L51 11\"/></g><circle cx=\"32\" cy=\"30\" r=\"17\" fill=\"#FFDA3E\"/>';",
      "    case 'clear-night':return moon+'<path d=\"M16 8 v6 M13 11 h6 M53 45 v6 M50 48 h6\" stroke=\"#D8E6FF\" stroke-width=\"2\"/>';",
      "    case 'partlycloudy':return sun+cloud;",
      "    case 'cloudy':return cloud;",
      "    case 'rainy':return cloud+drops;",
      "    case 'pouring':return cloud+drops+'<path d=\"M12 52 l-2 5 M50 52 l-2 5\" stroke=\"#52BAEF\" stroke-width=\"3\" stroke-linecap=\"round\"/>';",
      "    case 'snowy':return cloud+snow;",
      "    case 'snowy-rainy':return cloud+snow+'<path d=\"M28 53 l-2 6\" stroke=\"#52BAEF\" stroke-width=\"3\" stroke-linecap=\"round\"/>';",
      "    case 'hail':return cloud+'<g fill=\"#9CDEFA\"><circle cx=\"17\" cy=\"54\" r=\"3\"/><circle cx=\"30\" cy=\"59\" r=\"3\"/><circle cx=\"43\" cy=\"54\" r=\"3\"/></g>';",
      "    case 'lightning':return cloud+lightning;",
      "    case 'lightning-rainy':return cloud+drops+lightning;",
      "    case 'fog':return cloud+'<path d=\"M5 51 H52 M11 58 H46\" stroke=\"#A9BBC7\" stroke-width=\"3\" stroke-linecap=\"round\"/>';",
      "    case 'windy':return wind;",
      "    case 'windy-variant':return '<g transform=\"translate(0 -4) scale(.8)\">'+cloud+'</g><g transform=\"translate(8 20) scale(.65)\">'+wind+'</g>';",
      "    case 'exceptional':return '<path d=\"M32 5 L60 55 H4 Z\" fill=\"#FFCE54\"/><path d=\"M32 21 V37 M32 45 V46\" stroke=\"#655025\" stroke-width=\"4\" stroke-linecap=\"round\"/>';",
      "    default:return '<circle cx=\"32\" cy=\"30\" r=\"21\" fill=\"'+(dark?'#253341':'#DAE5ED')+'\"/><path d=\"M23 30 H41\" stroke=\"#8CA2B2\" stroke-width=\"3\" stroke-linecap=\"round\"/>';",
      "  }",
      "};",
      "s+=`<g transform=\"translate(416 12) scale(.65)\">${weatherArtwork(weather?.state,dark)}</g>`;",
      "      const weatherValue=(key,unit)=>{",
      "        const value=wa[key];",
      "        if(!weather || ['unavailable','unknown'].includes(weather.state) || value==null || value==='' || !Number.isFinite(Number(value)))return '—';",
      "        return fmt(Number(value),key==='humidity'?0:1)+' '+unit;",
      "      };",
      "      s+=text(540,31.2,weatherValue('temperature',wa.temperature_unit || '°C'),14.4,c.text,600,'end');",
      "      s+=text(650,31.2,weatherValue('humidity','%'),14.4,c.text,600,'end');",
      "      s+=text(776,31.2,weatherValue('wind_speed',wa.wind_speed_unit || ''),14.4,c.text,600,'end');",
      "      s+=text(540,48,'Temperatur',9.6,c.muted,400,'end')+text(650,48,'Feuchte',9.6,c.muted,400,'end')+text(776,48,'Wind',9.6,c.muted,400,'end');",
      "",
      "s+=box(24,64,752,402)+text(44,85,'ENERGIEFLUSS',15,c.muted,600);",
      "",
      "  // Long, separate routes leave visible space around the central distribution point.",
      "  const flow=(path,value,color,arrowX,arrowY,right)=>{",
      "    const active=value!==null&&Math.abs(value)>0;",
      "    let out='<path d=\"'+path+'\" fill=\"none\" stroke=\"'+c.border+'\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>';",
      "    if(!active)return out;",
      "    out+='<path d=\"'+path+'\" fill=\"none\" stroke=\"'+color+'\" stroke-opacity=\"0.55\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>';",
      "    out+='<path d=\"M-6 -6 L1 0 L-6 6 M3 -6 L10 0 L3 6\" transform=\"translate('+arrowX+' '+arrowY+') rotate('+(right?0:180)+')\" fill=\"none\" stroke=\"'+color+'\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>';",
      "    return out;",
      "  };",
      "  s+=flow('M260 160 H400 V201',read('pv'),green,319,160,true);",
      "  s+=flow(grid!==null&&grid<0?'M378 223 H360 V285 H260':'M260 285 H360 V223 H378',grid,grid>0?red:green,307,285,grid>0);",
      "  s+=flow(bat!==null&&bat<0?'M540 160 H440 V223 H422':'M422 223 H440 V160 H540',bat,blue,490,160,!(bat<0));",
      "  s+=flow('M400 245 V285 H540',read('home'),blue,478,285,true);",
      "  s+='<circle cx=\"400\" cy=\"223\" r=\"23\" fill=\"'+c.surface+'\" stroke=\"'+c.border+'\" stroke-width=\"2\"/>';",
      "  s+='<path d=\"M403 209 L391 225 H399 L397 237 L409 220 H401 Z\" fill=\"'+amber+'\"/>';",
      "  s+=node(44,118,'pv','SOLAR GESAMT','E3-DC + Fronius','solar',green);",
      "  s+=node(44,242,'grid','NETZ',gridLabel,'grid',grid>0?red:green);",
      "  s+=node(540,118,'battery','BATTERIE',batLabel+' · '+pct('soc'),'battery',blue);",
      "  const batterySoc=read('soc');",
      "  const batteryLevel=batterySoc===null?null:Math.min(100,Math.max(0,batterySoc));",
      "  const batteryColor=batteryLevel===null?c.muted:batteryLevel<10?'#FF4545':batteryLevel<20?'#FFD43B':green;",
      "  const batteryFillHeight=batteryLevel===null?0:15*batteryLevel/100;",
      "  const batteryTitle=batteryLevel===null?'Batterieladung unbekannt':'Batterieladung: '+fmt(batteryLevel)+' %';",
      "  // Pfeil ueber die ganze Batteriehoehe: Laden hoch, Entladen runter.",
      "  const batteryArrowPath=bat===null||bat===0?'':bat>0?'M0 28.8 V-31.2 M-7 -24.2 L0 -31.2 L7 -24.2':'M0 -31.2 V28.8 M-7 21.8 L0 28.8 L7 21.8';",
      "  const batteryArrowColor=bat>0?green:'#FF4545';",
      "  const batteryArrow=batteryArrowPath?`<g class=\"battery-direction\" transform=\"translate(687 163)\" fill=\"none\" stroke=\"${batteryArrowColor}\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" role=\"img\" aria-label=\"${esc(batLabel)}\"><title>${esc(batLabel)}</title><path d=\"${batteryArrowPath}\"/></g>`:'';",
      "  s+=batteryArrow;",
      "  s+=`<g class=\"battery-soc-level\" transform=\"translate(688 127.4) scale(2.4)\" role=\"img\" aria-label=\"${esc(batteryTitle)}\"><title>${esc(batteryTitle)}</title><rect x=\"10\" y=\"1\" width=\"6\" height=\"4\" rx=\"1\" fill=\"${batteryColor}\"/><rect x=\"5\" y=\"5\" width=\"16\" height=\"21\" rx=\"2\" fill=\"none\" stroke=\"${batteryColor}\" stroke-width=\"2\"/><rect x=\"8\" y=\"8\" width=\"10\" height=\"15\" rx=\"1\" fill=\"${c.surface}\"/><rect x=\"8\" y=\"${23-batteryFillHeight}\" width=\"10\" height=\"${batteryFillHeight}\" rx=\"1\" fill=\"${batteryColor}\"/>${batteryLevel===null?'<path d=\"M10 15.5 H16\" stroke=\"'+batteryColor+'\" stroke-width=\"2\" stroke-linecap=\"round\"/>':''}</g>`;",
      "",
      "  s+=node(540,242,'home','HAUS','Gesamter Hausverbrauch','home',blue);",
      "  s+=box(24,478,366,64)+icon('solar',43,496,amber)+text(84,500,'E3-DC',15,c.muted,600)+text(84,527,power('solar'),24,c.text,700);",
      "  s+=box(410,478,366,64)+icon('solar',429,496,amber)+text(470,500,'FRONIUS',15,c.muted,600)+text(470,527,power('fronius'),24,c.text,700);",
      "",
      "  [['sauna','Sauna'],['wp','Wärmepumpe'],['eh','Heizstab'],['car','Wallbox']].forEach(([key,title],i)=>{const x=44+i*180;s+=box(x,374,172,76)+icon(key,x+12,384,blue,.85)+text(x+41,402,title,16,c.text,600)+text(x+12,430,power(key),23,c.text,700);if(key==='car')s+=text(x+12,446,'Status: '+(states[ids.carCharging]?.state==='on'?'Lädt':'Bereit'),15,c.muted);});",
      "  [['autarky','AUTARKIE',green],['ratio','EIGENVERBRAUCH',blue]].forEach(([key,title,color],i)=>{const x=24+i*384;const v=read(key);s+=box(x,556,368,58)+text(x+16,579,title,11,c.muted,600)+text(x+350,579,pct(key),15,c.text,700,'end')+`<rect x=\"${x+16}\" y=\"594\" width=\"336\" height=\"7\" rx=\"3.5\" fill=\"${c.border}\"/>`;if(v!==null)s+=`<rect x=\"${x+16}\" y=\"594\" width=\"${336*Math.min(100,Math.max(0,v))/100}\" height=\"7\" rx=\"3.5\" fill=\"${color}\"/>`;});",
      "  s+=text(24,638,'KOSTEN HEUTE',15,c.muted,600)+text(175,638,'Bezug: '+fmt(read('buy'),2)+' CHF',15,red,c.text)+text(776,638,'Vergütung: '+fmt(read('sell'),2)+' CHF',15,green,500,'end');",
      "  ",
      "  const groupData = [",
      "    {name: 'UG', entities: Object.values(entitaeten.untergeschoss)},",
      "    {name: 'EG', entities: Object.values(entitaeten.erdgeschoss)},",
      "    {name: 'OG', entities: Object.values(entitaeten.obergeschoss)},",
      "    {name: 'Anbau', entities: Object.values(entitaeten.anbau)},",
      "    {name: 'Geräte', entities: Object.values(entitaeten.geraete)}",
      "  ];",
      "  s+=text(24,670,'GARAGE & GEBÄUDE',15,c.muted,600);",
      "  const garageState=states[entitaeten.garage.tor_status]?.state;",
      "  const garageKnown=garageState && !['unknown','unavailable'].includes(garageState);",
      "  const garageLabel=garageKnown?garageState:'Nicht verfügbar';",
      "  const garageColor=garageState==='Geschlossen'?green:garageState==='Geöffnet'?amber:garageKnown?red:c.muted;",
      "  s+=box(24,686,336,154);",
      "  s+='<rect x=\"24\" y=\"686\" width=\"336\" height=\"154\" rx=\"18\" fill=\"none\" stroke=\"'+garageColor+'\" stroke-opacity=\"0.55\"/>';",
      "  s+='<circle cx=\"66\" cy=\"721\" r=\"24\" fill=\"'+garageColor+'\" fill-opacity=\"0.12\"/>';",
      "  s+='<g transform=\"translate(52 707)\" fill=\"none\" stroke=\"'+garageColor+'\" stroke-width=\"1.8\" stroke-linejoin=\"round\"><path d=\"M2 12 L14 3 L26 12 V26 H2 Z M6 26 V13 H22 V26 M7 17 H21 M7 21 H21\"/></g>';",
      "  s+=text(104,712,'GARAGENTOR',12,c.muted,600)+text(104,735,garageLabel,garageLabel.length>17?17:22,garageColor,700);",
      "  const ventOn=states[entitaeten.garage.tor_lueften]?.state==='on';",
      "  s+=box(40,756,144,68,c.surface,14)+box(200,756,144,68,c.surface,14);",
      "  s+='<g transform=\"translate(99 767)\" fill=\"none\" stroke=\"'+(ventOn?blue:c.muted)+'\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M1 7 H20 C28 7 28 -2 22 -2 M1 13 H25 C33 13 33 24 25 22 M1 19 H13\"/></g>';",
      "  s+=text(112,812,'Lüften',15,c.text,600,'middle');",
      "  s+='<g transform=\"translate(258 767)\" fill=\"none\" stroke=\"'+blue+'\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 23 V0 M0 6 L6 0 L12 6 M22 0 V23 M16 17 L22 23 L28 17\"/></g>';",
      "  s+=text(272,812,'Auf / Zu',15,c.text,600,'middle');",
      "  groupData.forEach((group,i)=>{",
      "    const x=380+(i%3)*136,y=686+Math.floor(i/3)*82;",
      "    const count=group.entities.filter(id=>states[id]?.state==='on').length;",
      "    s+=box(x,y,124,72,count>0?(dark?'#403824':'#FFF3D4'):c.card,15);",
      "    const iconColor=count>0?amber:c.muted;",
      "    if(i<3){s+=icon('home',x+51,y+5,iconColor,.8);s+=text(x+62,y+23,['−1','0','1'][i],12,iconColor,700,'middle');}",
      "    else if(i===3){s+='<g transform=\"translate('+(x+51)+' '+(y+3)+') scale(.8)\" fill=\"none\" stroke=\"'+iconColor+'\" stroke-width=\"1.8\"><path d=\"M2 12 L14 3 L26 12 V26 H2 Z M6 26 V13 H22 V26 M7 17 H21 M7 21 H21\"/></g>';}",
      "    else{for(let r=0;r<3;r++)for(let j=0;j<3;j++)s+='<circle cx=\"'+(x+54+j*8)+'\" cy=\"'+(y+9+r*8)+'\" r=\"3\" fill=\"'+iconColor+'\"/>';}",
      "    s+=text(x+62,y+49,group.name,16,c.text,700,'middle')+text(x+62,y+65,count+' an',13,count>0?amber:c.muted,600,'middle');",
      "  });",
      "return s+'</svg>';",
      "})(states, hass, {\"pv\":entitaeten.energie.pv_gesamt,\"solar\":entitaeten.energie.pv_e3dc,\"fronius\":entitaeten.energie.pv_fronius,\"home\":entitaeten.energie.hausverbrauch,\"gridImport\":entitaeten.energie.netzbezug,\"gridExport\":entitaeten.energie.netzeinspeisung,\"battery\":entitaeten.energie.batterie_leistung,\"soc\":entitaeten.energie.batterie_ladestand,\"sauna\":entitaeten.energie.sauna_leistung,\"wp\":entitaeten.energie.waermepumpe_leistung,\"eh\":entitaeten.energie.heizstab_leistung,\"car\":entitaeten.energie.wallbox_leistung,\"carCharging\":entitaeten.energie.wallbox_laedt,\"autarky\":entitaeten.energie.autarkie,\"ratio\":entitaeten.energie.eigenverbrauch,\"buy\":entitaeten.energie.stromkosten_heute,\"sell\":entitaeten.energie.einspeiseverguetung_heute});",
      "]]]"
    ].join("\n"),
    "tap_pv": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.pv_gesamt; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_grid": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.netzbezug; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_battery": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.batterie_leistung; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_home": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.hausverbrauch; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_solar": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.pv_e3dc; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_fronius": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.pv_fronius; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_sauna": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.sauna_leistung; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_wp": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.waermepumpe_leistung; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_eh": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.heizstab_leistung; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_car": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.wallbox_leistung; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_autarky": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.autarkie; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "tap_ratio": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.energie.eigenverbrauch; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "garage_status": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.garage.tor_status; ]]]",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "garage_vent": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.garage.tor_lueften; ]]]",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "toggle"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "garage_door": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.garage.tor_auf_zu; ]]]",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "toggle"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "building_0": {
      "card": {
        "type": "custom:button-card",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "fire-dom-event",
          "browser_mod": {
            "service": "browser_mod.popup",
            "data": {
              "browser_id": "THIS",
              "title": "Licht UG",
              "content": {
                "type": "entities",
                "title": "Licht UG",
                "show_header_toggle": true,
                "entities": [
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.treppe; ]]]",
                    "name": "Licht Treppe UG",
                    "icon": "mdi:stairs"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.waschkueche; ]]]",
                    "name": "Licht Waschküche",
                    "icon": "mdi:washing-machine"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.luftschutzraum; ]]]",
                    "name": "Licht Luftschutzraum",
                    "icon": "mdi:shield-home"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.technikraum; ]]]",
                    "name": "Licht Technikraum",
                    "icon": "mdi:server"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.sauna; ]]]",
                    "name": "Licht Sauna",
                    "icon": "mdi:heat-wave"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.untergeschoss.safe; ]]]",
                    "name": "Licht Safe",
                    "icon": "mdi:safe"
                  }
                ]
              }
            }
          }
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "building_1": {
      "card": {
        "type": "custom:button-card",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "fire-dom-event",
          "browser_mod": {
            "service": "browser_mod.popup",
            "data": {
              "browser_id": "THIS",
              "title": "Licht EG",
              "content": {
                "type": "entities",
                "title": "Licht EG",
                "show_header_toggle": true,
                "entities": [
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.hauseingang; ]]]",
                    "name": "Licht Hauseingang",
                    "icon": "mdi:outdoor-lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.kueche; ]]]",
                    "name": "Licht Küche",
                    "icon": "mdi:ceiling-light"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.esszimmer_deckenleuchte; ]]]",
                    "name": "Licht Esszimmer",
                    "icon": "mdi:chandelier"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.esszimmer_bodenleuchte; ]]]",
                    "name": "Esszimmer Bodenleuchte",
                    "icon": "mdi:floor-lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_stehlampe; ]]]",
                    "name": "Wohnzimmer Stehlampe",
                    "icon": "mdi:floor-lamp-torchiere"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_tischleuchte; ]]]",
                    "name": "Tischleuchte Wohnzimmer",
                    "icon": "mdi:lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.erdgeschoss.wohnzimmer_bodenleuchte; ]]]",
                    "name": "Bodenleuchte Wohnzimmer",
                    "icon": "mdi:floor-lamp"
                  }
                ]
              }
            }
          }
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "building_2": {
      "card": {
        "type": "custom:button-card",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "fire-dom-event",
          "browser_mod": {
            "service": "browser_mod.popup",
            "data": {
              "browser_id": "THIS",
              "title": "Licht OG",
              "content": {
                "type": "entities",
                "title": "Licht OG",
                "show_header_toggle": true,
                "entities": [
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.treppe_flur; ]]]",
                    "name": "Licht Treppe/Flur OG",
                    "icon": "mdi:stairs-up"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.buero_deckenleuchte; ]]]",
                    "name": "Büro Deckenleuchte",
                    "icon": "mdi:ceiling-light"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.buero_fensterleuchte; ]]]",
                    "name": "Büro Fensterleuchte",
                    "icon": "mdi:lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.buero_tischleuchte; ]]]",
                    "name": "Büro Tischleuchte",
                    "icon": "mdi:lamp-outline"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.bad; ]]]",
                    "name": "Licht Bad",
                    "icon": "mdi:bathtub"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.dusche_licht; ]]]",
                    "name": "Dusche Licht",
                    "icon": "mdi:shower-head"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.dusche_lueftung; ]]]",
                    "name": "Dusche Lüftung",
                    "icon": "mdi:fan"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.schlafzimmer_fensterleuchte; ]]]",
                    "name": "Schlafzimmer Fensterleuchte",
                    "icon": "mdi:lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.schlafzimmer_tischleuchte; ]]]",
                    "name": "Schlafzimmer Tischleuchte",
                    "icon": "mdi:lamp-outline"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.gaestezimmer_fensterleuchte; ]]]",
                    "name": "Gästezimmer Fensterleuchte",
                    "icon": "mdi:lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.gaestezimmer_tischleuchte; ]]]",
                    "name": "Gästezimmer Tischleuchte",
                    "icon": "mdi:lamp-outline"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.terrassenzimmer_stehlampe; ]]]",
                    "name": "Terrassenzimmer Stehlampe",
                    "icon": "mdi:floor-lamp-torchiere"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.obergeschoss.terrassenzimmer_tischleuchte; ]]]",
                    "name": "Terrassenzimmer Tischleuchte",
                    "icon": "mdi:lamp-outline"
                  }
                ]
              }
            }
          }
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "building_3": {
      "card": {
        "type": "custom:button-card",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "fire-dom-event",
          "browser_mod": {
            "service": "browser_mod.popup",
            "data": {
              "browser_id": "THIS",
              "title": "Licht Anbau",
              "content": {
                "type": "entities",
                "title": "Licht Anbau",
                "show_header_toggle": true,
                "entities": [
                  {
                    "entity": "[[[ return variables.entitaeten.anbau.wintergarten_tischleuchte; ]]]",
                    "name": "Tischleuchte Wintergarten",
                    "icon": "mdi:lamp"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.anbau.wintergarten_licht; ]]]",
                    "name": "Licht Wintergarten",
                    "icon": "mdi:greenhouse"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.anbau.garage_deckenleuchte; ]]]",
                    "name": "Garage Deckenleuchte",
                    "icon": "mdi:ceiling-light"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.anbau.garage_licht; ]]]",
                    "name": "Licht Garage",
                    "icon": "mdi:garage"
                  }
                ]
              }
            }
          }
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "building_4": {
      "card": {
        "type": "custom:button-card",
        "show_name": false,
        "show_icon": false,
        "show_state": false,
        "tap_action": {
          "action": "fire-dom-event",
          "browser_mod": {
            "service": "browser_mod.popup",
            "data": {
              "browser_id": "THIS",
              "title": "Geräte",
              "content": {
                "type": "entities",
                "title": "Geräte",
                "show_header_toggle": false,
                "entities": [
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.bewegungsmelder_treppe_flur; ]]]",
                    "name": "Bewegungsmelder Treppe/Flur OG Ein/Aus",
                    "icon": "mdi:motion-sensor"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.bewegungsmelder_kueche; ]]]",
                    "name": "Bewegungsmelder Küche Ein/Aus",
                    "icon": "mdi:motion-sensor"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.bewegungsmelder_buero; ]]]",
                    "name": "Bewegungsmelder Büro Ein/Aus",
                    "icon": "mdi:motion-sensor"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.bewegungsmelder_gaestezimmer; ]]]",
                    "name": "Bewegungsmelder Gästezimmer",
                    "icon": "mdi:motion-sensor"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.bewegungsmelder_terrassenzimmer; ]]]",
                    "name": "Bewegungsmelder Terrassenzimmer",
                    "icon": "mdi:motion-sensor"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.garage_entfeuchter; ]]]",
                    "name": "Entfeuchter Garage",
                    "icon": "mdi:air-humidifier"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.garage_lueftung; ]]]",
                    "name": "Lüftung Garage",
                    "icon": "mdi:fan"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.wintergarten_heizung; ]]]",
                    "name": "Heizung Wintergarten",
                    "icon": "mdi:heat-wave"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.wintergarten_klimaanlage; ]]]",
                    "name": "Klimaanlage Wintergarten",
                    "icon": "mdi:air-conditioner"
                  },
                  {
                    "entity": "[[[ return variables.entitaeten.geraete.garage_durchgang_heizung; ]]]",
                    "name": "Heizung Durchgang Garage",
                    "icon": "mdi:heat-wave"
                  }
                ]
              }
            }
          }
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n")
      }
    },
    "flow_animation": {
      "card": {
        "type": "custom:button-card",
        "variables": {
          "energie": "[[[ return variables.entitaeten.energie; ]]]"
        },
        "show_icon": false,
        "show_name": false,
        "show_state": false,
        "update_timer": "1s",
        "triggers_update": [
          "[[[ return variables.entitaeten.energie.pv_gesamt; ]]]",
          "[[[ return variables.entitaeten.energie.pv_e3dc; ]]]",
          "[[[ return variables.entitaeten.energie.pv_fronius; ]]]",
          "[[[ return variables.entitaeten.energie.netzbezug; ]]]",
          "[[[ return variables.entitaeten.energie.netzeinspeisung; ]]]",
          "[[[ return variables.entitaeten.energie.batterie_leistung; ]]]",
          "[[[ return variables.entitaeten.energie.hausverbrauch; ]]]",
          "[[[ return variables.entitaeten.energie.sauna_leistung; ]]]",
          "[[[ return variables.entitaeten.energie.waermepumpe_leistung; ]]]",
          "[[[ return variables.entitaeten.energie.heizstab_leistung; ]]]",
          "[[[ return variables.entitaeten.energie.wallbox_leistung; ]]]",
          "[[[ return variables.entitaeten.energie.wallbox_laedt; ]]]"
        ],
        "tap_action": {
          "action": "none"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "pointer-events": "none"
            },
            {
              "display": "block"
            }
          ],
          "grid": [
            {
              "display": "block"
            },
            {
              "width": "100%"
            },
            {
              "height": "auto"
            }
          ],
          "custom_fields": {
            "motion": [
              {
                "display": "block"
              },
              {
                "width": "100%"
              },
              {
                "line-height": 0
              },
              {
                "pointer-events": "none"
              }
            ]
          }
        },
        "custom_fields": {
          "motion": [
            "[[[[",
            "  const read = id => {",
            "    const entity=states[id], raw=entity?.state;",
            "    if(raw == null || String(raw).trim() === '' || !Number.isFinite(Number(raw))) return 0;",
            "    const value=Number(raw);",
            "    return entity?.attributes?.unit_of_measurement === 'kW' ? value*1000 : value;",
            "  };",
            "  const get = read;",
            "  const pv = get(variables.energie.pv_gesamt);",
            "  const grid = get(variables.energie.netzbezug) - get(variables.energie.netzeinspeisung);",
            "  const battery = get(variables.energie.batterie_leistung);",
            "  const home = get(variables.energie.hausverbrauch);",
            "  // A stable Lit template updates attributes only. Animated paths remain in the DOM.",
            "  // Do not convert this template into a string: that would recreate the animation.",
            "",
            "  // A single frame loop retains position across every sensor/template update.",
            "  const speed = watts => {",
            "    const w = Math.abs(watts);",
            "    if (w === 0) return 0;",
            "",
            "    const minSpeed = 1;    // ganz langsam bei 1 W",
            "    const maxSpeed = 250;  // ganz schnell bei 14000 W",
            "    const factor = Math.max(0, Math.min(1, (w - 1) / 13999));",
            "",
            "    return minSpeed + factor * (maxSpeed - minSpeed);",
            "  };",
            "",
            "  const consumerIds=[variables.energie.sauna_leistung,variables.energie.waermepumpe_leistung,variables.energie.heizstab_leistung,variables.energie.wallbox_leistung];",
            "            const consumers=consumerIds.map(id=>{",
            "              const isWallbox=id===variables.energie.wallbox_leistung;",
            "              const charging=states[variables.energie.wallbox_laedt]?.state==='on';",
            "              const measured=read(id);",
            "              const watts=isWallbox?(charging?(measured>0?measured:1000):0):measured;",
            "              return Math.max(0,watts);",
            "            });",
            "            const houseConsumers=consumers[0]+consumers[1]+consumers[2];",
            "            const target = [pv, grid, battery, home, houseConsumers, consumers[0]+consumers[1], consumers[0], ...consumers].map(speed);",
            "  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;",
            "  const motion = this._e3SmoothFlowState || (this._e3SmoothFlowState = {",
            "    offset: target.map(()=>0), velocity: target.slice(), target, last: null, frame: null",
            "  });",
            "  while(motion.offset.length<target.length){motion.offset.push(0);motion.velocity.push(0);}",
            "            motion.target = target;",
            "  motion.reduced = reduced;",
            "  if (motion.frame === null && !reduced) {",
            "    const step = time => {",
            "      if (!this.isConnected || motion.reduced) {",
            "        motion.frame = null;",
            "        motion.last = null;",
            "        return;",
            "      }",
            "      const dt = motion.last === null ? 0 : Math.min(0.1, Math.max(0, (time - motion.last) / 1000));",
            "      motion.last = time;",
            "      const tau = 0.8;",
            "      const decay = Math.exp(-dt / tau);",
            "      const paths = this.shadowRoot?.querySelectorAll('#motion .e3-moving-flow');",
            "      paths?.forEach((path, i) => {",
            "        const previous = motion.velocity[i];",
            "        const desired = motion.target[i];",
            "        const distance = desired * dt + (previous - desired) * tau * (1 - decay);",
            "        motion.velocity[i] = desired + (previous - desired) * decay;",
            "        motion.offset[i] = (motion.offset[i] + distance) % 36;",
            "        path.style.strokeDashoffset = String(-motion.offset[i]);",
            "      });",
            "      motion.frame = requestAnimationFrame(step);",
            "    };",
            "    motion.frame = requestAnimationFrame(step);",
            "  }",
            "  return html`",
            "    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" viewBox=\"0 0 800 864\"",
            "         style=\"display:block;width:100%;height:auto;pointer-events:none\">",
            "      <style>",
            "        .e3-battery-arrow-motion {",
            "          animation: e3-battery-arrow-travel 1.2s linear infinite;",
            "        }",
            "        @keyframes e3-battery-arrow-travel {",
            "          0% { transform: translateY(-20px); opacity: 0; }",
            "          15% { opacity: 1; }",
            "          85% { opacity: 1; }",
            "          100% { transform: translateY(20px); opacity: 0; }",
            "        }",
            "        @media (prefers-reduced-motion: reduce) {",
            "          .e3-battery-arrow-motion { display: none; }",
            "        }",
            "        .e3-moving-flow {",
            "          fill: none;",
            "          stroke-width: 7;",
            "          stroke-linecap: round;",
            "          stroke-linejoin: round;",
            "          stroke-dasharray: 0.1 35.9;",
            "          /* Position is updated by the persistent frame loop. */",
            "        }",
            "        @media (prefers-reduced-motion: reduce) {",
            "          .e3-moving-flow { animation: none; opacity: 0; }",
            "        }",
            "      </style>",
            "      <g transform=\"translate(687 163)\" opacity=${battery !== 0 ? 1 : 0}",
            "         fill=\"none\" stroke=${battery > 0 ? '#00B894' : '#FF4545'}",
            "         stroke-width=\"3.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">",
            "        <g class=\"e3-battery-arrow-motion\"",
            "           style=${battery > 0 ? 'animation-direction:reverse' : 'animation-direction:normal'}>",
            "          <path d=${battery > 0 ? 'M-5 5 L0 0 L5 5' : 'M-5 -5 L0 0 L5 -5'}></path>",
            "        </g>",
            "      </g>",
            "      <path class=\"e3-moving-flow\" d=\"M260 160 H400 V201\"",
            "            stroke=\"#00B894\" opacity=${pv !== 0 ? 1 : 0}></path>",
            "      <path class=\"e3-moving-flow\"",
            "            d=${grid < 0 ? 'M378 223 H360 V285 H260' : 'M260 285 H360 V223 H378'}",
            "            stroke=${grid > 0 ? (hass.themes?.darkMode ? '#FF9299' : '#D65C68') : '#00B894'}",
            "            opacity=${grid !== 0 ? 1 : 0}></path>",
            "      <path class=\"e3-moving-flow\"",
            "            d=${battery < 0 ? 'M540 160 H440 V223 H422' : 'M422 223 H440 V160 H540'}",
            "            stroke=\"#00A9D5\" opacity=${battery !== 0 ? 1 : 0}></path>",
            "      <path class=\"e3-moving-flow\" d=\"M400 245 V285 H540\"",
            "            stroke=\"#00A9D5\" opacity=${home !== 0 ? 1 : 0}></path>",
            "    ",
            "<g>",
            " <path d=\"M648 328 V344 H490\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M648 328 V344 H490\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${houseConsumers>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M648 328 V344 H490\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${houseConsumers>0 ? 1 : 0}></path>",
            "</g>",
            "<g>",
            " <path d=\"M490 344 H310\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M490 344 H310\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[0]+consumers[1]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M490 344 H310\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[0]+consumers[1]>0 ? 1 : 0}></path>",
            "</g>",
            "<g>",
            " <path d=\"M310 344 H130\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M310 344 H130\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[0]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M310 344 H130\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[0]>0 ? 1 : 0}></path>",
            "</g>",
            "<g>",
            " <path d=\"M130 344 V374\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M130 344 V374\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[0]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M130 344 V374\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[0]>0 ? 1 : 0}></path>",
            " <path d=\"M126 367 L130 372 L134 367\" fill=\"none\" stroke=${consumers[0]>0 ? '#00A9D5' : (hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB')} stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>",
            "</g>",
            "<g>",
            " <path d=\"M310 344 V374\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M310 344 V374\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[1]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M310 344 V374\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[1]>0 ? 1 : 0}></path>",
            " <path d=\"M306 367 L310 372 L314 367\" fill=\"none\" stroke=${consumers[1]>0 ? '#00A9D5' : (hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB')} stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>",
            "</g>",
            "<g>",
            " <path d=\"M490 344 V374\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M490 344 V374\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[2]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M490 344 V374\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[2]>0 ? 1 : 0}></path>",
            " <path d=\"M486 367 L490 372 L494 367\" fill=\"none\" stroke=${consumers[2]>0 ? '#00A9D5' : (hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB')} stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>",
            "</g>",
            "<g>",
            " <path d=\"M416 239 L431 254 H510 V223 H768 V344 H670 V374\" fill=\"none\" stroke=${hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB'} stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"></path>",
            " <path d=\"M416 239 L431 254 H510 V223 H768 V344 H670 V374\" fill=\"none\" stroke=\"#00A9D5\" stroke-width=\"2\" opacity=${consumers[3]>0 ? 0.55 : 0} stroke-linejoin=\"round\"></path>",
            " <path class=\"e3-moving-flow\" d=\"M416 239 L431 254 H510 V223 H768 V344 H670 V374\" stroke=\"#00A9D5\" style=\"stroke-width:4\" opacity=${consumers[3]>0 ? 1 : 0}></path>",
            " <path d=\"M666 367 L670 372 L674 367\" fill=\"none\" stroke=${consumers[3]>0 ? '#00A9D5' : (hass.themes?.darkMode ? '#3B4B58' : '#DCE5EB')} stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>",
            "</g>",
            "</svg>",
            "  `;",
            "]]]]"
          ].join("\n")
        },
        "extra_styles": ":host { display:block !important; width:100% !important; max-width:none !important; pointer-events:none !important; } #aspect-ratio { display:block !important; width:100%; } #card, #container, #motion { display:block !important; width:100% !important; height:auto !important; pointer-events:none !important; } #motion > svg { display:block; width:100% !important; height:auto !important; }"
      }
    },
    "weather": {
      "card": {
        "type": "custom:button-card",
        "entity": "[[[ return variables.entitaeten.wetter.vorhersage; ]]]",
        "show_name": false,
        "show_icon": false,
        "tap_action": {
          "action": "more-info"
        },
        "hold_action": {
          "action": "none"
        },
        "styles": {
          "card": [
            {
              "height": "100%"
            },
            {
              "width": "100%"
            },
            {
              "background": "transparent"
            },
            {
              "border": "none"
            },
            {
              "box-shadow": "none"
            },
            {
              "padding": 0
            },
            {
              "position": "absolute"
            },
            {
              "inset": 0
            },
            {
              "pointer-events": "auto"
            },
            {
              "cursor": "pointer"
            }
          ],
          "grid": [
            {
              "display": "block"
            }
          ],
          "img_cell": [
            {
              "position": "absolute"
            },
            {
              "left": 0
            },
            {
              "top": "10%"
            },
            {
              "width": "9%"
            },
            {
              "height": "65%"
            }
          ],
          "icon": [
            {
              "width": "100%"
            },
            {
              "height": "100%"
            },
            {
              "color": "#00A9D5"
            }
          ]
        },
        "extra_styles": [
          ":host { display:block !important; position:relative; width:100% !important; max-width:none !important; height:100% !important; pointer-events:auto !important; }",
          " #aspect-ratio { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; }",
          " #card { display:block !important; position:absolute !important; inset:0; width:100% !important; height:100% !important; padding:0 !important; pointer-events:auto !important; }",
          " #container { width:100%; height:100%; }"
        ].join("\n"),
        "show_state": false
      }
    }
  },
  "extra_styles": [
    "",
    ":host { display: block !important; width: 100% !important; max-width: none !important; min-width: 0; }",
    "#card { display: block; width: 100%; height: auto; max-width: none; }",
    "#container { display: block !important; position: relative; width: 100% !important; height: auto !important; min-width: 0; }",
    "#dashboard { display: block !important; position: relative; width: 100% !important; max-width: none; min-width: 0; line-height: 0; }",
    "#dashboard > svg { display: block; width: 100% !important; height: auto !important; max-width: none !important; }",
    "#container > div:not(#dashboard) > button-card { display: block; height: 100%; width: 100%; }",
    ""
  ].join("\n"),
  "grid_options": {
    "columns": "full",
    "rows": "auto"
  }
};

const CARD_TYPE = "energie-dashboard-card";

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, DashboardCard);
  window.customCards ??= [];
  window.customCards.push({
    type: CARD_TYPE,
    name: "Energie- und Hausübersicht",
    description: "PV, Netz, Batterie, Hausverbrauch, Wetter und Haussteuerung in einer Lovelace-Karte.",
  });
}
