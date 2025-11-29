import z from "zod";

// Zod is a different tool - it's a schema validation library.
export const AcceptMessageSchema = z.object({
    acceptMessages: z.boolean(),
})