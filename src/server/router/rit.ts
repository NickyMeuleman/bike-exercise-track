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
  })
  .query("getById", {
    input: z.object({
      id: z.string().cuid(),
    }),
    async resolve({ input, ctx }) {
      const rit = await ctx.prisma.rit.findUnique({ where: { id: input.id } });
      return rit;
    },
  })
  .mutation("updateCompletely", {
    input: z.object({
      id: z.string().cuid(),
      date: z.date(),
      duration: z.number().int(),
      distance: z.number().int(),
      calories: z.number().int(),
      resistance: z.number().int(),
    }),
    async resolve({ ctx, input }) {
      const { id, ...rest } = input;
      await ctx.prisma.rit.update({
        where: {
          id,
        },
        data: rest,
      });
    },
  });
