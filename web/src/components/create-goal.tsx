import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import {
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator
} from './ui/radio-group';
import { createGoal } from '../http/create-goal'
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

const createGoalForm = z.object({
  title: z.string().min(1, "Informe a atividade que deseja realizar"), desiredWeeklyFrequency: z.coerce.number().min(1).max(7),
})

type CreateGoalForm = z.infer<typeof createGoalForm>

export function CreateGoal() {
  const queryClient = useQueryClient()

  const { register, control, handleSubmit, formState, reset } = useForm<CreateGoalForm>({
    resolver: zodResolver(createGoalForm),
  })

  async function handleCreateGoal(data: CreateGoalForm) {
    await createGoal({
      title: data.title,
      desiredWeeklyFrequency: data.desiredWeeklyFrequency
    })

    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['pending-goals'] });

    reset()
  }

  return (
    <DialogContent>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <DialogTitle>Cadastrar meta</DialogTitle>
            <DialogClose>
              <X className="size-5 text-zinc-600" />
            </DialogClose>
          </div>

          <DialogDescription>
            Adicione atividades que te fazem bem e que você quer continuar praticando toda semana.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(handleCreateGoal)}
          className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Qual a atidade?
              </Label>
              <Input
                id="title"
                autoFocus
                placeholder="Paticar exercicios, meditar, etc..."
                {...register('title')}
              />
            </div>

            {formState.errors.title && (
              <p className="text-red-400 text-sm">{formState.errors.title.message}</p>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Quantas vezes na semana?
              </Label>
              <Controller
                control={control}
                name='desiredWeeklyFrequency'
                defaultValue={3}
                render={({ field }) => {
                  return (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={String(field.value)}
                    >
                      <RadioGroupItem value="1">
                        <RadioGroupIndicator />
                        1x na semana
                        <span>🥱</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="2">
                        <RadioGroupIndicator />
                        2x na semana
                        <span>🙂</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="3">
                        <RadioGroupIndicator />
                        3x na semana
                        <span>😎</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="4">
                        <RadioGroupIndicator />
                        4x na semana
                        <span>😜</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="5">
                        <RadioGroupIndicator />
                        5x na semana
                        <span>🤨</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="6">
                        <RadioGroupIndicator />
                        6x na semana
                        <span>🤯</span>
                      </RadioGroupItem>

                      <RadioGroupItem value="7">
                        <RadioGroupIndicator />
                        Todos dias da semana
                        <span>🔥</span>
                      </RadioGroupItem>
                    </RadioGroup>
                  )
                }
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DialogClose asChild>
              <Button type="button" className="flex-1" variant="secondary">
                Fechar
              </Button>
            </DialogClose>
            <Button className="flex-1">Salvar</Button>
          </div>
        </form>
      </div>
    </DialogContent>
  )
}
