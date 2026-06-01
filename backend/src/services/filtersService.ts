import { filtersRepository } from "../repositories/filtersRepository.js";

export const filtersService = {
  all: () => filtersRepository.getAll(),
};
