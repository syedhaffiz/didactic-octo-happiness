import { filtersRepository } from "../repositories/filtersRepository.js";

export const filtersService = {
  all: () => filtersRepository.getAll(),
  // "all" (or missing) means no concrete zone, so no dependent ports to return.
  portsByZone: (zone: string | undefined) =>
    filtersRepository.getPortsByZone(zone && zone !== "all" ? zone : undefined),
};
