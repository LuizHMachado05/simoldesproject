import { z } from 'zod';

export const operationValidationSchema = z.object({
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  measurements: z.array(z.object({
    id: z.string(),
    value: z.string().min(1, 'Medição é obrigatória'),
    description: z.string()
  })),
  visualInspection: z.boolean(),
  dimensionalControl: z.boolean(),
  notes: z.string().optional(),
});

export type OperationValidationData = z.infer<typeof operationValidationSchema>;