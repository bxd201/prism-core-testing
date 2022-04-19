declare type LabColor = {
  L: number,
  A: number,
  B: number
}

declare class DeltaE {
  getDeltaE76(lab1: LabColor, lab2: LabColor): number;
  getDeltaE94(lab1: LabColor, lab2: LabColor): number;
  getDeltaE00(lab1: LabColor, lab2: LabColor): number;
}

declare module "delta-e" {
  declare module.exports: DeltaE;
}