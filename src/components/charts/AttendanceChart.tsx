"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface AttendanceChartProps {
  data?: {
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent", "Late"],
        datasets: [
          {
            data: [
              data?.presentToday || 0,
              data?.absentToday || 0,
              data?.lateToday || 0,
            ],
            backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.raw as number;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0,
                ) as number;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return `${label}: ${value} (${percentage}%)`;
              },
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

  if (
    !data ||
    (data.presentToday === 0 && data.absentToday === 0 && data.lateToday === 0)
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return <canvas ref={chartRef} />;
}
