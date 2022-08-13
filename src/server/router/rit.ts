import { createRouter } from "./context";
import { z } from "zod";

export const ritRouter = createRouter()
  .query("get", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.rit.findUnique({ where: { id: input.id } });
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.rit.findMany();
    },
  })
  .mutation("create", {
    input: z.object({
      date: z.date(),
      duration: z.number().int(),
      distance: z.number().int(),
      calories: z.number().int(),
      resistance: z.number().int(),
    }),
    async resolve({ ctx, input }) {
      console.log(input);
      await ctx.prisma.rit.create({ data: input });
    },
  });
