<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  CalendarRoot, CalendarHeader, CalendarHeading, CalendarPrev, CalendarNext,
  CalendarGrid, CalendarGridHead, CalendarGridRow, CalendarHeadCell,
  CalendarGridBody, CalendarCell, CalendarCellTrigger,
} from 'reka-ui'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// modelValue = DateValue (@internationalized/date). Diketik longgar di sini agar
// SFC tak butuh TypeScript untuk resolve tipe node_modules; parent form sudah ketat.
const props = defineProps<{
  modelValue?: unknown
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    :model-value="(props.modelValue as any)"
    :class="cn('p-3', props.class)"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <CalendarHeader class="relative flex w-full items-center justify-between pt-1">
      <CalendarPrev :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100')">
        <ChevronLeft class="h-4 w-4" />
      </CalendarPrev>
      <CalendarHeading class="text-sm font-medium" />
      <CalendarNext :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100')">
        <ChevronRight class="h-4 w-4" />
      </CalendarNext>
    </CalendarHeader>
    <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse space-y-1">
        <CalendarGridHead>
          <CalendarGridRow class="flex">
            <CalendarHeadCell v-for="day in weekDays" :key="day" class="w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody class="grid">
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 flex w-full">
            <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate" class="relative h-9 w-9 p-0 text-center text-sm">
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal', 'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[today]:bg-accent data-[today]:text-accent-foreground data-[outside-view]:text-muted-foreground data-[disabled]:text-muted-foreground data-[disabled]:opacity-50')"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
