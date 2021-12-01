export class Utils {

  static getNodeName(): string {
    const names = [
      "Storm Cane",
      "Amarant Calarook",
      "Hades Zorander",
      "Zaine Sanguine",
      "Chaos Christanti",
      "Winmore Grimsbane",
      "Redcap Shackleton",
      "Upir Snow",
      "Arch Shadowend",
      "Stone Barkridge",
      "Antone Killoran",
      "Adam Woods",
      "Abraham Addington",
      "Jinx Blackwood",
      "Payne Steros",
      "Rexx Wolf",
      "Sepitus Vixen",
      "Quint Sanguine",
      "Cinder Wood",
      "Grim Razor",
      "Sax Knotley",
      "Cinder Killian",
      "Grumio Le Doux",
      "Law Orlando",
      "Lynk Tempest",
      "Ashen Cloven",
      "Storm Moriarty",
      "Avanth Graeme",
      "Jaymes Graves",
      "Wendell Sangrey"
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

}