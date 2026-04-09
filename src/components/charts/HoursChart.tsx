"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { TodaySummary } from "@/types";

Chart.register(...registerables);

interface HoursChartProps {
  data: TodaySummary[];
}

export default function HoursChart({ data }: HoursChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const presentStaff = data.filter((s) => s.status === "Present").slice(0, 5);

    if (presentStaff.length === 0) {
      return;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: presentStaff.map((s) => s.name.split(" ")[0]), // First name only
        datasets: [
          {
            label: "Hours Worked",
            data: presentStaff.map((s) => s.workingHours),
            backgroundColor: "#02404F",
            borderRadius: 8,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.raw} hours`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 9,
            grid: {
              display: true,
              color: "#e5e7eb",
            },
            title: {
              display: true,
              text: "Hours",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  const presentStaff = data.filter((s) => s.status === "Present");

  if (presentStaff.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No present staff today</p>
      </div>
    );
  }

  return <canvas ref={chartRef} />;
}
