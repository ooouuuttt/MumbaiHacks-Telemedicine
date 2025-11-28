'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', consultations: 186 },
  { month: 'February', consultations: 305 },
  { month: 'March', consultations: 237 },
  { month: 'April', consultations: 273 },
  { month: 'May', consultations: 209 },
  { month: 'June', consultations: 214 },
];

const chartConfig = {
  consultations: {
    label: 'Consultations',
    color: 'hsl(var(--primary))',
  },
};

export default function ConsultationTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation Trends</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="consultations"
              fill="var(--color-consultations)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
