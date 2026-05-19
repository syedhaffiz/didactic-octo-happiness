import { filtersRepository } from "../repositories/filtersRepository.js";

export const filtersService = {
  ports: () => filtersRepository.getPorts(),
  segments: () => filtersRepository.getSegments(),
  zones: () => filtersRepository.getZones(),
};
