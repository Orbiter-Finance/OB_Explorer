import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  label: z.string(),
  CoinType: z.string(),
  Value: z.object({
    Sent: z.string(),
    Received: z.string(),
  }),
  SourceInfo: z.object({
    Source: z.string(),
    address: z.string(),
  }),
  DestInfo: z.object({
    Dest: z.string(),
    address: z.string(),
  }),
  Date: z.string(),
  status: z.string(),
})
export type Task = z.infer<typeof taskSchema>
