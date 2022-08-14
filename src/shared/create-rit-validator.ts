import { z } from "zod";

export const createRitValidator = z.object({
  startTijd: z.date().nullish(),
  duur: z.number().int().positive().nullish(),
  afstand: z.number().int().positive().nullish(),
  calorie: z.number().int().positive().nullish(),
  weerstand: z.number().int().positive().nullish()
});

export type CreateRitInputType = z.infer<typeof createRitValidator>;